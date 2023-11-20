import { ErrorNodeTransformToPrimitive, ErrorEmptyNodeName } from './errors';

import type { INodeSettings, INode } from './types';

export class Node implements INode {
  private readonly _name: string;
  public value: unknown;

  constructor(nodeSettings: INodeSettings) {
    const { name, value = null } = nodeSettings;
    this.checkNodeNameValue(name);

    this._name = name;
    this.value = value;
  }

  get name(): string {
    return this._name;
  }

  private checkNodeNameValue(newName: string): never | void {
    if (!newName) {
      throw new ErrorEmptyNodeName();
    }
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | never {
    if (hint === 'number') {
      throw new ErrorNodeTransformToPrimitive();
    }

    return this.name;
  }
}
