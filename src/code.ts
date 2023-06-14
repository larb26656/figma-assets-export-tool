import { ExportElement } from './export-element';
import { ExportElementConfig } from './export-element-config';
import { ExportOption } from './export-option';

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

    console.log(exportOptionTemp.path);
    console.log(exportOptionTemp.suffix);

    for (const exportElementTemp of exportElementTempList) {
      const exportAssets = await scanExportAssets(exportElementTemp, exportOptionTemp);

      if (exportAssets.length) {
        assets.push(...exportAssets);
      }
    }
  }
  return assets;
}

// task
async function exportAssets() {
  try {
    console.log('Start export...');
    const currentPage = figma.currentPage;

    const frames = currentPage.children
      .filter(child => child && child.type == 'FRAME')
      .map(child => child as FrameNode);

    if (!frames.length) {
      figma.closePlugin('No one frame in this page!');
    }

    const assets: ExportAssetDetail[] = [];

    for (const frame of frames) {
      const assetsFromFrame = await scanAssetFromFrame(frame);

      if (assetsFromFrame.length) {
        assets.push(...assetsFromFrame);
      }
    }

    if (!assets.length) {
      figma.closePlugin('No assets found!');
    } else {
      figma.notify(`Found assets: ${assets.length} files`);
      figma.ui.postMessage({
        type: 'showDownloadBtn',
        assets: assets,
      });
    }
  } catch (err) {
    console.log(err.stack);
    figma.closePlugin(`Error cause ${err.stack}`);
  }
}

figma.showUI(__html__, { width: 256, height: 256 });

figma.ui.onmessage = async msg => {
  if (msg.type === 'export') {
    await exportAssets();
  }
};
