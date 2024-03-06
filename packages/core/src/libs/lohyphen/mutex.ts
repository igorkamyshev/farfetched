/*
 * Inspired by https://github.com/DirtyHairy/async-mutex
 */

export class Mutex {
  private _resolve: (() => void) | null = null;
  private _promise = Promise.resolve();

  constructor(locked: boolean = false) {
    if (locked) {
      this.acquire();
    }
  }

  get isLocked(): boolean {
    return !!this._resolve;
  }

  acquire() {
    if (this.isLocked) {
      return;
    }

    this._promise = new Promise<void>((res) => {
      this._resolve = res;
    });
  }

  waitForUnlock(): Promise<void> {
    return this._promise;
  }

  release(): void {
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }
}
