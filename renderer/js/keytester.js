/* Key tester: pass/fail tracking, rollover measurement, chatter & stuck-key detection. */
(function (global) {
  const CHATTER_MS = 45;
  const STUCK_MS = 12000;

  function KeyTester(container, layoutId, onChange) {
    this.container = container;
    this.onChange = onChange || function () {};
    this.pressed = new Map(); // code -> { since }
    this.tested = new Set();
    this.chatter = new Map(); // code -> count
    this.lastUp = new Map(); // code -> timestamp
    this.maxRollover = 0;
    this.totalPresses = 0;
    this.setLayout(layoutId);
    this._stuckTimer = setInterval(() => this._checkStuck(), 500);
  }

  KeyTester.prototype.setLayout = function (layoutId) {
    const built = global.KTS.buildKeyboard(this.container, layoutId);
    this.map = built.map;
    this.layout = built.layout;
    this.total = built.total;
    this.pressed.clear();
    this.tested.clear();
    this.chatter.clear();
    this.lastUp.clear();
    this.maxRollover = 0;
    this._emit();
  };

  KeyTester.prototype.reset = function () {
    this.pressed.clear();
    this.tested.clear();
    this.chatter.clear();
    this.lastUp.clear();
    this.maxRollover = 0;
    this.totalPresses = 0;
    Object.keys(this.map).forEach((code) => {
      const el = this.map[code];
      el.classList.remove('is-pressed', 'is-tested', 'is-chatter', 'is-stuck');
    });
    this._emit();
  };

  KeyTester.prototype.handleKeyDown = function (e) {
    const code = e.code;
    const el = this.map[code];
    if (!el) return false;

    if (!this.pressed.has(code)) {
      const last = this.lastUp.get(code);
      if (last != null && performance.now() - last < CHATTER_MS) {
        this.chatter.set(code, (this.chatter.get(code) || 0) + 1);
        el.classList.add('is-chatter');
      }
      this.pressed.set(code, { since: performance.now() });
      this.totalPresses += 1;
      if (this.pressed.size > this.maxRollover) this.maxRollover = this.pressed.size;
    }

    el.classList.add('is-pressed');
    if (!this.tested.has(code)) {
      this.tested.add(code);
      el.classList.add('is-tested');
    }
    this._emit();
    return true;
  };

  KeyTester.prototype.handleKeyUp = function (e) {
    const code = e.code;
    const el = this.map[code];
    if (!el) return false;
    this.pressed.delete(code);
    this.lastUp.set(code, performance.now());
    el.classList.remove('is-pressed', 'is-stuck');
    this._emit();
    return true;
  };

  KeyTester.prototype._checkStuck = function () {
    const now = performance.now();
    let changed = false;
    this.pressed.forEach((info, code) => {
      const el = this.map[code];
      if (!el) return;
      if (now - info.since > STUCK_MS && !el.classList.contains('is-stuck')) {
        el.classList.add('is-stuck');
        changed = true;
      }
    });
    if (changed) this._emit();
  };

  KeyTester.prototype.getUntested = function () {
    return Object.keys(this.map).filter((c) => !this.tested.has(c));
  };

  KeyTester.prototype.getStats = function () {
    let chatterTotal = 0;
    this.chatter.forEach((v) => (chatterTotal += v));
    return {
      total: this.total,
      tested: this.tested.size,
      percent: this.total ? Math.round((this.tested.size / this.total) * 100) : 0,
      currentRollover: this.pressed.size,
      maxRollover: this.maxRollover,
      chatterKeys: this.chatter.size,
      chatterEvents: chatterTotal,
      totalPresses: this.totalPresses,
      untested: this.getUntested()
    };
  };

  KeyTester.prototype._emit = function () {
    this.onChange(this.getStats());
  };

  KeyTester.prototype.destroy = function () {
    clearInterval(this._stuckTimer);
  };

  global.KTS = global.KTS || {};
  global.KTS.KeyTester = KeyTester;
})(window);
