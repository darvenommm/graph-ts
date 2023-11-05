import { ErrorNodeTransformToPrimitive } from './errors.js';

import type { INodeSettings } from './types';

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
