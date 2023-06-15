import { ExportElement } from './export-element';
import { ExportOption } from './export-option';

export class ExportElementConfig {
  element: InstanceNode | ComponentNode | GroupNode | FrameNode;
  types: string[];
  name: string;

  private constructor(element: InstanceNode | ComponentNode | GroupNode | FrameNode, types: string[], name: string) {
    this.element = element;
    this.types = types;
    this.name = name;
  }

  static checkIsHaveFlag(elementName: string): boolean {
    const parts = elementName.split(':');

    if (!parts.length) {
      return false;
    }

    const [prefix] = parts;

    if (prefix != '$EXPORT') {
      return false;
    }

    return true;
  }

  toExportElements(option: ExportOption): ExportElement[] {
    return this.types.map(type => new ExportElement(this.element, this.name, type, option));
  }

  static tryCreate(element: any): ExportElementConfig {
    if (
      element.type !== 'INSTANCE' &&
      element.type !== 'COMPONENT' &&
      element.type !== 'GROUP' &&
      element.type !== 'FRAME'
    ) {
      return null;
    }

    if (!element.children) {
      return null;
    }

    if (!element.children.length) {
      return null;
    }

    const elementName = element.name;

    const exportConfigElement = element.children.find(child => ExportElementConfig.checkIsHaveFlag(child.name));

    if (exportConfigElement == null) {
      return null;
    }

    const exportConfigElementName = exportConfigElement.name;

    const [prefix, types] = exportConfigElementName.split(':');

    return new ExportElementConfig(element, JSON.parse(types), elementName);
  }
}
