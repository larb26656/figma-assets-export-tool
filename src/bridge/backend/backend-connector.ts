import { BackendConnectorEvent } from './backend-connector.event';

export namespace BackendConnector {
  export function excuteExport() {
    parent.postMessage({ pluginMessage: { type: BackendConnectorEvent.excuteExport } }, '*');
  }
}
