export class ExportOption {
  path: string;
  suffix: string;

  private constructor() {}

  toString(): string {
    return `[path=${this.path}, suffix=${this.suffix}]`;
  }

  static checkIsHaveFlag(elementName: string): boolean {
    return elementName === '$EXPORT_OPTION';
  }

  static isProperty(option: string) {
    const parts = option.split(':');

    if (parts.length != 2) {
      return false;
    }

    return true;
  }

  static parseProperty(option: string): string[] {
    return option.split(':');
  }

  static appendOption(instance: ExportOption, option: string) {
    if (this.isProperty(option)) {
      const [key, value] = this.parseProperty(option);

      if (key === '$PATH') {
        instance.path = value;
      } else if (key === '$SUFFIX') {
        instance.suffix = value;
      }
    }
  }

  static tryCreate(frameName: string, element: InstanceNode | ComponentNode | GroupNode | FrameNode): ExportOption {
    const instance = new ExportOption();
    const elementName = element.name;

    if (!this.checkIsHaveFlag(elementName)) {
      return null;
    }

    instance.path = frameName;

    if (!element.children) {
      return null;
    }

    if (!element.children.length) {
      return null;
    }

    element.children.forEach(child => {
      if (child.type === 'TEXT') {
        const text = child as TextNode;
        const textContent = text.characters;

        this.appendOption(instance, textContent);
      }
    });

    return instance;
  }
}
