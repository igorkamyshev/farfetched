/*
 * Inspired by https://github.com/DirtyHairy/async-mutex
 */

type QueueEntry = {
  resolve(result: () => void): void;
  reject(error: unknown): void;
};

export class Mutex {
  private _value = 1;

  get isLocked(): boolean {
    return this._value <= 0;
  }

  private get isUnlocked(): boolean {
    return !this.isLocked;
  }

  acquire(): Promise<() => void> {
    return new Promise((resolve, reject) => {
      this._queue.push({ resolve, reject });

      this._dispatch();
    });
  }

  waitForUnlock(): Promise<void> {
    return new Promise((resolve) => {
      this._waiters.push(resolve);

      this._dispatch();
    });
  }

  release(): void {
    this._value += 1;
    this._dispatch();
  }

  private _dispatch(): void {
    if (this.isUnlocked) {
      const queueEntry = this._queue.shift();

      if (queueEntry) {
        this._value -= 1;
        // 👆 we change the value here, so we need to check isUnlicked again later

        queueEntry.resolve(this._newReleaser());
      }
    }

    // re-check isUnlocked because it might have changed after above this._value change
    if (this.isUnlocked) {
      this._waiters.forEach((waiter) => waiter());
      this._waiters = [];
    }
  }

  private _newReleaser() {
    let called = false;

    return () => {
      if (called) return;
      called = true;

      this.release();
    };
  }

  private _queue: Array<QueueEntry> = [];
  private _waiters: Array<() => void> = [];
}
