import { ExportOption } from './export-option';

export class ExportElement {
  element: InstanceNode | ComponentNode | GroupNode | FrameNode;
  name: string;
  type: string;
  extension: string;
  fullName: string;
  path: string;

  private generateExtension(type: string): string {
    if (type === 'SVG') {
      return 'svg';
    } else if (type === 'PNG') {
      return 'png';
    }

    return '';
  }

  constructor(
    element: InstanceNode | ComponentNode | GroupNode | FrameNode,
    name: string,
    type: string,
    option: ExportOption
  ) {
    const fileNameBuilder = [name];

    const suffix = option.suffix;

    if (suffix) {
      fileNameBuilder.push(suffix);
    }

    this.element = element;
    this.name = fileNameBuilder.join('');
    this.type = type;
    this.extension = this.generateExtension(this.type);
    this.fullName = `${this.name}.${this.extension}`;

    const pathBuilder = [];

    const path = option.path;

    if (path) {
      pathBuilder.push(path);
    }

    pathBuilder.push(this.fullName);

    this.path = pathBuilder.join('/');
  }
}
