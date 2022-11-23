/**
 * Inlined library
 * https://github.com/jacobheun/timeout-abort-controller/
 */
export class TimeoutController extends AbortController {
  private readonly timer: ReturnType<typeof setTimeout>;

  constructor(readonly timeout: number) {
    super();

    this.timer = setTimeout(() => this.abort(), timeout);

    // Patch for safari not supported extending built in classes
    Object.setPrototypeOf(this, TimeoutController.prototype);
  }

  override abort() {
    this.clear();

    return super.abort();
  }

  clear() {
    clearTimeout(this.timer);
  }
}
