export interface IEdgeSettings {
  weight: number;
  isBidirectional?: boolean;
}

const DEFAULT_EDGE_SETTINGS: IEdgeSettings = {
  weight: 0,
  isBidirectional: true,
};

class ErrorEdgeTransformToPrimitive extends Error {
  message: string = 'Edge can be transformed only to number!';
}

export class Edge {
  public weight: number;
  #isBidirectional: boolean;

  constructor(edgeSettings: IEdgeSettings = DEFAULT_EDGE_SETTINGS) {
    const { weight, isBidirectional = true } = edgeSettings;

    this.weight = weight;
    this.#isBidirectional = isBidirectional;
  }

  get isBidirectional(): boolean {
    return this.#isBidirectional;
  }

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): number | never {
    if (hint !== 'number') {
      throw new ErrorEdgeTransformToPrimitive();
    }

    return this.weight;
  }
}
