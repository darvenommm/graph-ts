import type { DequeNode } from './deque-node';

export interface IDequeNode {
  setNewNext(newNext: DequeNode): void;
  removeNext(): void;

  get next(): DequeNode | null;
  get value(): unknown;
}

export type TDequeType = 'stack' | 'queue';

export interface IDeque {
  add(newValue: unknown): void;
  pop(): unknown;
  isEmpty(): boolean;
  show(): void;

  get type(): TDequeType;
  get size(): number;
}
