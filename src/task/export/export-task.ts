import { UIConnector } from '../../bridge/ui/ui-connector';
import { ExportElement } from './model/export-element';
import { ExportElementConfig } from './model/export-element-config';
import { ExportOption } from './model/export-option';
import { ExportTaskPercentage } from './model/export-task-percentage';

export namespace ExportTask {
  async function generateExportAssetDetail(exportElement: ExportElement): Promise<ExportAssetDetail> {
    let uintArray;

    const element = exportElement.element;

    if (exportElement.type === 'SVG') {
      uintArray = await element.exportAsync({
        format: 'SVG',
      });
    } else if (exportElement.type === 'PNG') {
      uintArray = await element.exportAsync({
        format: 'PNG',
      });
    }

    if (!uintArray) {
      return null;
    }

    return {
      name: exportElement.name,
      path: exportElement.path,
      format: exportElement.type,
      uintArray: uintArray,
    } as ExportAssetDetail;
  }

  async function scanExportAssets(
    exportElementConfig: ExportElementConfig,
    option: ExportOption
  ): Promise<ExportAssetDetail[]> {
    const exportDetailList = [];

    console.log(`Generate meta data for element name : [${exportElementConfig.name}]`);

    const exportElements = exportElementConfig.toExportElements(option);

    for (const exportElement of exportElements) {
      const exportDetail = await generateExportAssetDetail(exportElement);

      if (exportDetail) {
        exportDetailList.push(exportDetail);
      }
    }

    return exportDetailList;
  }

  async function scanAssetFromFrame(frame: FrameNode): Promise<ExportAssetDetail[]> {
    const assets: ExportAssetDetail[] = [];
    const frameName = frame.name;
    const children = frame.children;

    let exportOptionTemp: ExportOption;
    const exportElementTempList: ExportElementConfig[] = [];

    if (children != null && children.length) {
      for (const child of children) {
        const element = child as any;
        const exportOption = ExportOption.tryCreate(frameName, element);

        if (exportOption) {
          exportOptionTemp = exportOption;
          continue;
        }

        const exportElementConfig = ExportElementConfig.tryCreate(element);

        if (exportElementConfig) {
          exportElementTempList.push(exportElementConfig);
        }
      }
    }

    if (exportOptionTemp && exportElementTempList.length) {
      console.log(`Found assets in frame : [${frameName}]`);

      console.log(exportOptionTemp.toString());

      for (const exportElementTemp of exportElementTempList) {
        const exportAssets = await scanExportAssets(exportElementTemp, exportOptionTemp);

        if (exportAssets.length) {
          assets.push(...exportAssets);
        }
      }
    }
    return assets;
  }

  export async function excute() {
    UIConnector.updateWorkProgress(ExportTaskPercentage.start);
    console.log('Start export...');
    const currentPage = figma.currentPage;

    UIConnector.updateWorkProgress(ExportTaskPercentage.findExportFrame);

    const frames = currentPage.children
      .filter(child => child && child.type == 'FRAME')
      .map(child => child as FrameNode);

    if (!frames.length) {
      figma.notify('No one frame in this page!');
    }

    UIConnector.updateWorkProgress(ExportTaskPercentage.findExportElement);

    const assets: ExportAssetDetail[] = [];

    for (const frame of frames) {
      const assetsFromFrame = await scanAssetFromFrame(frame);

      if (assetsFromFrame.length) {
        assets.push(...assetsFromFrame);
      }
    }

    UIConnector.updateWorkProgress(ExportTaskPercentage.generate);

    if (!assets.length) {
      figma.notify('No assets found!');
      UIConnector.updateWorkProgress(ExportTaskPercentage.start);
    } else {
      figma.notify(`Found assets: ${assets.length} files`);
      UIConnector.showDownloadBtn(assets);
    }
  }
}
