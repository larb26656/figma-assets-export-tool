export class ExportElement {
  type: string | 'SVG' | 'PNG';
  name: string;
  extension: string;
  fullName: string;

  static checkPattern(fullName: string): boolean {
    const parts = fullName.split(':');
    return parts.length == 2;
  }

  private generateExtension(type: string): string {
    if (type === 'SVG') {
      return 'svg';
    } else if (type === 'PNG') {
      return 'png';
    }

    return '';
  }

  constructor(fullName: string) {
    const parts = fullName.split(':');
    if (parts.length != 2) {
      throw new Error('invalid format!');
    }

    this.type = parts[0];
    this.name = parts[1];
    this.extension = this.generateExtension(this.type);
    this.fullName = `${this.name}.${this.extension}`;
  }
}
