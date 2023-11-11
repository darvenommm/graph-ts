import type { DequeNode } from './deque-node';

export interface IDequeNode {
  setNewNext(newNext: DequeNode): void;
  removeNext(): void;

  get next(): DequeNode | null;
  get value(): any;
}

export type TDequeType = 'stack' | 'queue';

export interface IDeque {
  add(newValue: any): void;
  pop<T>(): T | never;
  isEmpty(): boolean;
  show(): void;

  get type(): TDequeType;
  get size(): number;
}
