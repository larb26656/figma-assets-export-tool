import { BackendConnectorEvent } from './bridge/backend/backend-connector.event';
import { ExportTask } from './task/export/export-task';

figma.showUI(__html__, { width: 256, height: 256 });

figma.ui.onmessage = async msg => {
  try {
    if (msg.type === BackendConnectorEvent.excuteExport) {
      await ExportTask.excute();
    }
  } catch (err) {
    console.error(err);
    figma.closePlugin(`Error cause ${err.stack}`);
  }
};
