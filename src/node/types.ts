export interface INode {
  get name(): string;
}

export interface INodeSettings {
  name: string;
  value?: unknown;
}
