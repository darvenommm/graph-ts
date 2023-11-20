import { ErrorEdgeTransformToPrimitive } from './errors';

import type { IEdgeSettings, IEdge } from './types';

const DEFAULT_EDGE_SETTINGS: IEdgeSettings = {
  weight: 0,
  isBidirectional: true,
};

export class Edge implements IEdge {
  private readonly _isBidirectional: boolean;
  public weight: number;

  constructor(edgeSettings: IEdgeSettings = DEFAULT_EDGE_SETTINGS) {
    const { weight, isBidirectional = true } = edgeSettings;

    this.weight = weight;
    this._isBidirectional = isBidirectional;
  }

  get isBidirectional(): boolean {
    return this._isBidirectional;
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): number | never {
    if (hint !== 'number') {
      throw new ErrorEdgeTransformToPrimitive();
    }

    return this.weight;
  }
}
