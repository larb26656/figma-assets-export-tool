import { UIConnectorEvent } from './ui-connector.event';

export namespace UIConnector {
  export function updateWorkProgress(percent: number) {
    figma.ui.postMessage({
      type: UIConnectorEvent.updateWorkProgress,
      percent: percent,
    });
  }

  export function showDownloadBtn(assets: ExportAssetDetail[]) {
    figma.ui.postMessage({
      type: UIConnectorEvent.showDownloadBtn,
      assets: assets,
    });
  }
}
