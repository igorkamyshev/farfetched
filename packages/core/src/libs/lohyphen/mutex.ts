/*
 * Inspired by https://github.com/DirtyHairy/async-mutex
 */

export class Mutex {
  private _acquired = false;

  get isLocked(): boolean {
    return this._acquired;
  }

  private get isUnlocked(): boolean {
    return !this.isLocked;
  }

  acquire() {
    this._acquired = true;

    this._dispatch();
  }

  waitForUnlock(): Promise<void> {
    return new Promise((resolve) => {
      this._waiters.push(resolve);

      this._dispatch();
    });
  }

  release(): void {
    this._acquired = false;
    this._dispatch();
  }

  private _dispatch(): void {
    if (this.isUnlocked) {
      this._waiters.forEach((waiter) => waiter());
      this._waiters = [];
    }
  }

  private _waiters: Array<() => void> = [];
}
