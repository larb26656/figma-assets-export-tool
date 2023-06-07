import JSZip from 'jszip';
import './style/base.css';

function uintArrayToBlob(uintArray: Uint8Array, format: string) {
  let contentType;
  if (format === 'SVG') {
    contentType = 'image/svg+xml';
  } else if (format === 'PNG') {
    contentType = 'image/png';
  }

  console.log(contentType);
  return new Blob([uintArray], { type: contentType });
}

function showDownloadButton(assets: any[], name: string): Promise<null> {
  return new Promise((resolve, reject) => {
    let zip = new JSZip();

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

document.getElementById('export').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'export' } }, '*');
};

window.onmessage = async event => {
  const eventData = event.data.pluginMessage;

  if (eventData?.type === 'showDownloadBtn') {
    const assets = eventData.assets;
    await showDownloadButton(assets, 'assets');
  }
};
