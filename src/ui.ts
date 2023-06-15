import JSZip from 'jszip';
import { BackendConnector } from './bridge/backend/backend-connector';
import { UIConnectorEvent } from './bridge/ui/ui-connector.event';
import './style/base.css';
import { ExportTaskPercentage } from './task/export/export-task-percentage';

function setVisibleWorkProgressBar(show: boolean) {
  const progress = document.getElementById('work-progress-bar');
  progress.hidden = !show;
}

function updateWorkProgress(percent: number) {
  const progress = document.getElementById('work-progress');

  progress.style.width = `${percent}%`;
}

function setEnableExportBtn(enable: boolean) {
  const btn = document.getElementById('export-btn') as HTMLInputElement;

  btn.disabled = !enable;
}

function uintArrayToBlob(uintArray: Uint8Array, format: string) {
  let contentType;
  if (format === 'SVG') {
    contentType = 'image/svg+xml';
  } else if (format === 'PNG') {
    contentType = 'image/png';
  }

  return new Blob([uintArray], { type: contentType });
}

function showDownloadButton(assets: any[], name: string): Promise<null> {
  return new Promise((resolve, reject) => {
    setVisibleWorkProgressBar(true);

    const zip = new JSZip();

    for (let file of assets) {
      const blob = uintArrayToBlob(file.uintArray, file.format);
      zip.file(file.path, blob, { binary: true });
    }

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const blobURL = window.URL.createObjectURL(content);

      const link = document.createElement('a');
      link.className = 'btn';
      link.href = blobURL;
      link.text = 'Save';
      link.setAttribute('download', name + '.zip');

      const renderDownloadBtn = document.getElementById('download');

      // HOTFIX remove child before append new child
      renderDownloadBtn.innerHTML = '';
      renderDownloadBtn.appendChild(link);
    });

    resolve(null);
  });
}

// setup
setVisibleWorkProgressBar(false);

// binding events
document.getElementById('export-btn').onclick = () => {
  setEnableExportBtn(false);

  BackendConnector.excuteExport();
};

// figma event receivers
window.onmessage = async event => {
  const eventData = event.data.pluginMessage;

  if (eventData?.type === UIConnectorEvent.updateWorkProgress) {
    const progress = eventData.progress;
    updateWorkProgress(progress);
  }

  if (eventData?.type === UIConnectorEvent.showDownloadBtn) {
    const assets = eventData.assets;

    updateWorkProgress(ExportTaskPercentage.compress);

    await showDownloadButton(assets, 'assets');

    updateWorkProgress(ExportTaskPercentage.success);

    setEnableExportBtn(true);
  }
};
