import { DequeNode } from './deque-node.js';
import { ErrorDequeIsEmpty } from './errors.js';

import type { IDeque, TDequeType } from './types';

export class Deque implements IDeque {
  private readonly _type: TDequeType;
  private _size: number;
  private head: DequeNode | null;
  private tail: DequeNode | null;

  constructor(type: TDequeType) {
    this._type = type;
    this._size = 0;
    this.head = null;
    this.tail = null;
  }

  public add(newValue: any): void {
    if (this.type === 'queue') {
      this.addToQueue(newValue);
    } else {
      this.addToStack(newValue);
    }
  }

  public pop<T>(): T {
    if (this.isEmpty()) {
      throw new ErrorDequeIsEmpty();
    }

    const result = this.head!.value;
    this.head = this.head!.next;
    this.decrementSize();

    return result;
  }

  public isEmpty(): boolean {
    return this.size === 0;
  }

  public show(): void {
    console.log(this.transformToString());
  }

  private addToStack(newValue: any): void {
    const newNode = new DequeNode(newValue);

    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.setNewNext(newNode);
      this.tail = newNode;
    }

    this.incrementSize();
  }

  private addToQueue(newValue: any): void {
    const newNode = new DequeNode(newValue);

    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.setNewNext(this.head!);
      this.head = newNode;
    }

    this.incrementSize();
  }

  private incrementSize(): void {
    ++this._size;
  }

  private decrementSize(): void {
    --this._size;
  }

  private transformToString(): string {
    const elements: DequeNode[] = [];
    let currentElement: DequeNode | null = this.head;

    while (currentElement) {
      elements.push(currentElement.value);
      currentElement = currentElement.next;
    }

    return elements.join(' => ');
  }

  get type(): TDequeType {
    return this._type;
  }

  get size(): number {
    return this._size;
  }
}
