/* Renders a KTS layout definition into DOM and hands back a code -> element map. */
(function (global) {
  const UNIT = 52; // px per 1u, overridden responsively via CSS var

  function buildRow(rowDef) {
    const row = document.createElement('div');
    row.className = 'kb-row';
    rowDef.forEach((item) => {
      if (item.spacer) {
        const sp = document.createElement('div');
        sp.className = 'kb-spacer';
        sp.style.setProperty('--kw', item.w);
        row.appendChild(sp);
        return;
      }
      const key = document.createElement('div');
      key.className = 'kb-key';
      key.dataset.code = item.c;
      key.style.setProperty('--kw', item.w);
      if (item.h && item.h > 1) {
        key.style.setProperty('--kh', item.h);
        key.classList.add('kb-key--tall');
      }
      const label = document.createElement('span');
      label.className = 'kb-key__label';
      label.textContent = item.l;
      key.appendChild(label);
      row.appendChild(key);
    });
    return row;
  }

  function buildBlock(blockDef, extraClass) {
    const wrap = document.createElement('div');
    wrap.className = 'kb-block' + (extraClass ? ' ' + extraClass : '');
    blockDef.rows.forEach((r) => wrap.appendChild(buildRow(r)));
    return wrap;
  }

  function build(container, layoutId) {
    const layout = global.KTS.LAYOUTS[layoutId];
    container.innerHTML = '';
    container.className = 'kb kb--' + layoutId;
    if (!layout) return { map: {}, layout: null, total: 0 };

    const cluster = document.createElement('div');
    cluster.className = 'kb-cluster';
    cluster.appendChild(buildBlock(layout.main, 'kb-block--main'));
    container.appendChild(cluster);

    if (layout.nav) cluster.appendChild(buildBlock(layout.nav, 'kb-block--nav'));
    if (layout.navArrows) cluster.appendChild(buildBlock(layout.navArrows, 'kb-block--navarrows'));
    if (layout.numpad) cluster.appendChild(buildBlock(layout.numpad, 'kb-block--numpad'));

    const map = {};
    let total = 0;
    container.querySelectorAll('.kb-key').forEach((el) => {
      map[el.dataset.code] = el;
      total += 1;
    });

    return { map, layout, total };
  }

  global.KTS = global.KTS || {};
  global.KTS.buildKeyboard = build;
})(window);
