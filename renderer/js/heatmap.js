/* Interactive press-frequency heatmap rendered over a keyboard graphic. */
(function (global) {
  function colorFor(intensity) {
    // 0 -> cool violet/blue, 1 -> hot red/orange
    const hue = 255 - intensity * 255; // 255 (violet) -> 0 (red)
    const sat = 70 + intensity * 20;
    const light = 22 + intensity * 30;
    return `hsl(${Math.max(0, hue)}, ${sat}%, ${light}%)`;
  }

  function Heatmap(container, layoutId) {
    this.container = container;
    this.setLayout(layoutId);
    this._unsub = global.KTS.Stats.onChange(() => this.repaint());
  }

  Heatmap.prototype.setLayout = function (layoutId) {
    const built = global.KTS.buildKeyboard(this.container, layoutId);
    this.map = built.map;
    this.repaint();
  };

  Heatmap.prototype.repaint = function () {
    const counts = global.KTS.Stats.getCounts();
    let max = 1;
    Object.keys(this.map).forEach((code) => {
      if (counts[code] && counts[code] > max) max = counts[code];
    });
    Object.keys(this.map).forEach((code) => {
      const el = this.map[code];
      const n = counts[code] || 0;
      if (n === 0) {
        el.style.background = '';
        el.classList.remove('kb-key--heat');
        el.title = '';
        return;
      }
      el.classList.add('kb-key--heat');
      const intensity = Math.min(1, n / max);
      el.style.background = colorFor(intensity);
      el.title = `${code}: ${n} press${n === 1 ? '' : 'es'}`;
    });
  };

  Heatmap.prototype.destroy = function () {
    if (this._unsub) this._unsub();
  };

  global.KTS = global.KTS || {};
  global.KTS.Heatmap = Heatmap;
})(window);
