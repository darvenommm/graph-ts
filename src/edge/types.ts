export interface IEdge {
  get isBidirectional(): boolean;
}

export interface IEdgeSettings {
  weight: number;
  isBidirectional?: boolean;
}
