export interface INodeSettings {
  name: string;
  value?: unknown;
}

class ErrorNodeTransformToPrimitive extends Error {
  message: string = 'Node can be transformed only to string!';
}

export class Node {
  #name: string;
  public value: unknown;

  constructor(nodeSettings: INodeSettings) {
    const { name, value = null } = nodeSettings;

    this.#name = name;
    this.value = value;
  }

  get name(): string {
    return this.#name;
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | never {
    if (hint === 'number') {
      throw new ErrorNodeTransformToPrimitive();
    }

    return this.name;
  }
}
