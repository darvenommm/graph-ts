import type { IDequeNode } from './types';

export class DequeNode implements IDequeNode {
  private readonly _value: any;
  private _next: DequeNode | null;

  constructor(value: any, next: DequeNode | null = null) {
    this._value = value;
    this._next = next;
  }

  public setNewNext(newNext: DequeNode): void {
    this._next = newNext;
  }

  public removeNext(): void {
    this._next = null;
  }

  get next(): DequeNode | null {
    return this._next;
  }

  get value(): any {
    return this._value;
  }
}
