/* Renders a KTS layout definition into DOM and hands back a code -> element map.
 * Keys are placed by absolute x/y/w/h coordinates (in "u" units), the same
 * scheme keyboard-layout-editor uses, so tall keys (numpad + and Enter) and
 * cross-cluster alignment (nav column vs. main block) just work.
 */
(function (global) {
  function build(container, layoutId) {
    const layout = global.KTS.LAYOUTS[layoutId];
    container.innerHTML = '';
    container.className = 'kb kb--' + layoutId;
    if (!layout) return { map: {}, layout: null, total: 0 };

    container.style.setProperty('--kb-w', layout.width);
    container.style.setProperty('--kb-h', layout.rows);

    const map = {};
    layout.keys.forEach((item) => {
      const key = document.createElement('div');
      key.className = 'kb-key';
      key.dataset.code = item.c;
      key.style.setProperty('--x', item.x);
      key.style.setProperty('--y', item.y);
      key.style.setProperty('--w', item.w);
      key.style.setProperty('--h', item.h);
      if (item.h > 1) key.classList.add('kb-key--tall');

      const label = document.createElement('span');
      label.className = 'kb-key__label';
      label.textContent = item.l;
      key.appendChild(label);

      container.appendChild(key);
      map[item.c] = key;
    });

    return { map, layout, total: layout.keys.length };
  }

  global.KTS = global.KTS || {};
  global.KTS.buildKeyboard = build;
})(window);
