import { ExportElement } from './export-element';

function generateFile(child: SceneNode, exportElement: ExportElement) {
  if (exportElement.type === 'SVG') {
    return child.exportAsync({
      format: 'SVG',
    });
  } else if (exportElement.type === 'PNG') {
    return child.exportAsync({
      format: 'PNG',
    });
  }
}

figma.showUI(__html__, { width: 256, height: 256 });

figma.ui.onmessage = async msg => {
  if (msg.type === 'export') {
    const currentPage = figma.currentPage;

    const frames = currentPage.children
      .filter(child => child && child.type == 'FRAME')
      .map(child => child as FrameNode);

    if (!frames.length) {
      figma.closePlugin('No one frame in this page!');
    }

    const assets: any[] = [];

    for (const frame of frames) {
      const frameName = frame.name;

      const children = frame.children;
      for (const child of children) {
        if (child.type === 'COMPONENT' || 'INSTANCE') {
          const childName = child.name;

          if (ExportElement.checkPattern(childName)) {
            const element = new ExportElement(childName);

            console.log(element);

            let uintArray;

            if (element.type === 'SVG') {
              uintArray = await child.exportAsync({
                format: 'SVG',
              });
            } else if (element.type === 'PNG') {
              uintArray = await child.exportAsync({
                format: 'PNG',
              });
            }

            if (uintArray) {
              assets.push({
                name: element.name,
                path: `${frameName}/${element.fullName}`,
                format: element.type,
                uintArray: uintArray,
              });
            }
          }
        }
      }
    }

    // figma.ui.postMessage({
    //   type: 'showDownloadBtn',
    //   assets: assets,
    // });
    // if (!selectionFrame || selectionFrame.type != 'FRAME') {
    //   figma.closePlugin('Please select an frame to export.');
    // } else {
    //   const assets: any[] = [];

    //   const children = selectionFrame.children;
    //   for (const child of children) {
    //     if (child.type === 'COMPONENT') {
    //       const uintArray = await child.exportAsync({
    //         format: 'SVG',
    //       });

    //       assets.push({
    //         name: child.name,
    //         path: `${child.name}.svg`,
    //         uintArray: uintArray,
    //       });
    //     }
    //   }

    if (assets.length) {
      figma.ui.postMessage({
        type: 'showDownloadBtn',
        assets: assets,
      });
    }
  }
};
