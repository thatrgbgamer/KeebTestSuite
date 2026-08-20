/* Keyboard layout definitions (ANSI) for every common form factor.
 * Widths are in "u" units (1u = one standard keycap width).
 * Every key references its physical KeyboardEvent.code so detection
 * is layout/language independent.
 */
(function (global) {
  const K = (c, l, w) => ({ c, l, w: w || 1 });
  const SP = (w) => ({ spacer: true, w });

  // ---- reusable row fragments (15u main cluster, shared by every size) ----
  const numRow = () => [
    K('Backquote', '`'), K('Digit1', '1'), K('Digit2', '2'), K('Digit3', '3'),
    K('Digit4', '4'), K('Digit5', '5'), K('Digit6', '6'), K('Digit7', '7'),
    K('Digit8', '8'), K('Digit9', '9'), K('Digit0', '0'), K('Minus', '-'),
    K('Equal', '='), K('Backspace', 'Backspace', 2)
  ];
  const qwertyRow = () => [
    K('Tab', 'Tab', 1.5), K('KeyQ', 'Q'), K('KeyW', 'W'), K('KeyE', 'E'),
    K('KeyR', 'R'), K('KeyT', 'T'), K('KeyY', 'Y'), K('KeyU', 'U'),
    K('KeyI', 'I'), K('KeyO', 'O'), K('KeyP', 'P'), K('BracketLeft', '['),
    K('BracketRight', ']'), K('Backslash', '\\', 1.5)
  ];
  const homeRow = () => [
    K('CapsLock', 'Caps', 1.75), K('KeyA', 'A'), K('KeyS', 'S'), K('KeyD', 'D'),
    K('KeyF', 'F'), K('KeyG', 'G'), K('KeyH', 'H'), K('KeyJ', 'J'),
    K('KeyK', 'K'), K('KeyL', 'L'), K('Semicolon', ';'), K('Quote', "'"),
    K('Enter', 'Enter', 2.25)
  ];
  const bottomRow = (rightW) => [
    K('ShiftLeft', 'Shift', 2.25), K('KeyZ', 'Z'), K('KeyX', 'X'), K('KeyC', 'C'),
    K('KeyV', 'V'), K('KeyB', 'B'), K('KeyN', 'N'), K('KeyM', 'M'),
    K('Comma', ','), K('Period', '.'), K('Slash', '/'),
    K('ShiftRight', 'Shift', rightW == null ? 2.75 : rightW)
  ];
  const modRow = (opts) => {
    opts = opts || {};
    const row = [
      K('ControlLeft', 'Ctrl', 1.25), K('MetaLeft', 'Win', 1.25),
      K('AltLeft', 'Alt', 1.25), K('Space', '', opts.spaceW || 6.25),
      K('AltRight', 'Alt', 1.25)
    ];
    if (opts.fn) row.push(K('Fn', 'Fn', 1.25));
    else row.push(K('MetaRight', 'Win', 1.25));
    if (!opts.noMenu) row.push(K('ContextMenu', 'Menu', 1.25));
    row.push(K('ControlRight', 'Ctrl', opts.rightCtrlW || 1.25));
    return row;
  };
  const funcRowWide = () => [
    K('Escape', 'Esc'), SP(1),
    K('F1', 'F1'), K('F2', 'F2'), K('F3', 'F3'), K('F4', 'F4'), SP(0.5),
    K('F5', 'F5'), K('F6', 'F6'), K('F7', 'F7'), K('F8', 'F8'), SP(0.5),
    K('F9', 'F9'), K('F10', 'F10'), K('F11', 'F11'), K('F12', 'F12')
  ];
  const funcRowTight = () => [
    K('Escape', 'Esc'), SP(0.25),
    K('F1', 'F1'), K('F2', 'F2'), K('F3', 'F3'), K('F4', 'F4'),
    K('F5', 'F5'), K('F6', 'F6'), K('F7', 'F7'), K('F8', 'F8'),
    K('F9', 'F9'), K('F10', 'F10'), K('F11', 'F11'), K('F12', 'F12')
  ];

  const navBlock6 = () => [
    [K('Insert', 'Ins'), K('Home', 'Home'), K('PageUp', 'PgUp')],
    [K('Delete', 'Del'), K('End', 'End'), K('PageDown', 'PgDn')]
  ];
  const arrowBlock = () => [
    [SP(1), K('ArrowUp', '↑'), SP(1)],
    [K('ArrowLeft', '←'), K('ArrowDown', '↓'), K('ArrowRight', '→')]
  ];

  const numpadBlock = (topSpacerRows) => {
    const rows = [];
    for (let i = 0; i < (topSpacerRows || 0); i++) rows.push([SP(4)]);
    rows.push([K('NumLock', 'Num'), K('NumpadDivide', '/'), K('NumpadMultiply', '*'), K('NumpadSubtract', '-')]);
    rows.push([K('Numpad7', '7'), K('Numpad8', '8'), K('Numpad9', '9'), K('NumpadAdd', '+', 1, 2)]);
    rows.push([K('Numpad4', '4'), K('Numpad5', '5'), K('Numpad6', '6')]);
    rows.push([K('Numpad1', '1'), K('Numpad2', '2'), K('Numpad3', '3'), K('NumpadEnter', 'Enter', 1, 2)]);
    rows.push([K('Numpad0', '0', 2), K('NumpadDecimal', '.')]);
    return rows;
  };

  function block(rows) {
    return { rows };
  }

  const LAYOUTS = {
    full: {
      id: 'full', label: 'Full-Size (100%)', totalKeys: 104,
      blurb: 'Function row, main cluster, navigation cluster and numpad.',
      main: block([funcRowWide(), numRow(), qwertyRow(), homeRow(), bottomRow(), modRow()]),
      nav: block([[SP(3)], ...navBlock6(), [SP(3)], ...arrowBlock()]),
      numpad: block(numpadBlock(1))
    },
    tkl: {
      id: 'tkl', label: 'Tenkeyless (80%/TKL)', totalKeys: 87,
      blurb: 'Full-size minus the numpad — same function & nav clusters.',
      main: block([funcRowWide(), numRow(), qwertyRow(), homeRow(), bottomRow(), modRow()]),
      nav: block([[SP(3)], ...navBlock6(), [SP(3)], ...arrowBlock()]),
      numpad: null
    },
    e1800: {
      id: 'e1800', label: '96% (1800-Compact)', totalKeys: 100,
      blurb: 'TKL density with the numpad pulled flush against the main cluster.',
      main: block([funcRowTight(), numRow(), qwertyRow(), homeRow(), bottomRow(1.75), modRow({ rightCtrlW: 1 })]),
      nav: block([
        [K('Insert', 'Ins'), K('Home', 'Home'), K('PageUp', 'PgUp')],
        [SP(3)],
        [SP(3)],
        [K('Delete', 'Del'), K('End', 'End'), K('PageDown', 'PgDn')],
        [SP(1), K('ArrowUp', '↑'), SP(1)]
      ].concat([[K('ArrowLeft', '←'), K('ArrowDown', '↓'), K('ArrowRight', '→')]])),
      numpad: block(numpadBlock(1))
    },
    seventyfive: {
      id: 'seventyfive', label: '75%', totalKeys: 84,
      blurb: 'TKL layout compressed tight, nav keys pulled into a single column.',
      main: block([funcRowTight(), numRow(), qwertyRow(), homeRow(), bottomRow(1.75), modRow({ rightCtrlW: 1.25 })]),
      nav: block([
        [K('PrintScreen', 'Prt')], [K('Insert', 'Ins')], [K('Delete', 'Del')],
        [SP(1)],
        [K('Home', 'Home')], [K('End', 'End')],
        [SP(1)],
        [K('PageUp', 'PgUp')],
        [K('PageDown', 'PgDn')]
      ]),
      navArrows: block([[K('ArrowUp', '↑')], [K('ArrowLeft', '←')], [K('ArrowDown', '↓')], [K('ArrowRight', '→')]]),
      numpad: null
    },
    sixtyfive: {
      id: 'sixtyfive', label: '65%', totalKeys: 68,
      blurb: 'No function row, but keeps a compact arrow cluster and a couple of nav keys.',
      main: block([numRow(), qwertyRow(), homeRow(), bottomRow(1.75), modRow({ rightCtrlW: 1.25, noMenu: true })]),
      nav: block([[K('Delete', 'Del')], [K('Home', 'Home')], [K('End', 'End')]]),
      navArrows: block([[SP(1)], [K('ArrowUp', '↑')], [K('ArrowLeft', '←'), K('ArrowDown', '↓'), K('ArrowRight', '→')]]),
      numpad: null
    },
    sixty: {
      id: 'sixty', label: '60%', totalKeys: 61,
      blurb: 'No function row, no nav cluster, no arrows or numpad — pure typing core.',
      main: block([numRow(), qwertyRow(), homeRow(), bottomRow(), modRow()]),
      nav: null,
      numpad: null
    },
    forty: {
      id: 'forty', label: '40%', totalKeys: 47,
      blurb: 'Minimalist core — letters, a few mods, everything else lives on a Fn layer.',
      main: block([
        [K('Tab', 'Tab', 1.5), K('KeyQ', 'Q'), K('KeyW', 'W'), K('KeyE', 'E'), K('KeyR', 'R'), K('KeyT', 'T'),
          K('KeyY', 'Y'), K('KeyU', 'U'), K('KeyI', 'I'), K('KeyO', 'O'), K('KeyP', 'P'), K('Backspace', 'Bksp', 1.5)],
        [K('Escape', 'Esc', 1.75), K('KeyA', 'A'), K('KeyS', 'S'), K('KeyD', 'D'), K('KeyF', 'F'), K('KeyG', 'G'),
          K('KeyH', 'H'), K('KeyJ', 'J'), K('KeyK', 'K'), K('KeyL', 'L'), K('Enter', 'Enter', 2.25)],
        [K('ShiftLeft', 'Shift', 2.25), K('KeyZ', 'Z'), K('KeyX', 'X'), K('KeyC', 'C'), K('KeyV', 'V'), K('KeyB', 'B'),
          K('KeyN', 'N'), K('KeyM', 'M'), K('Comma', ','), K('Period', '.'), K('ShiftRight', 'Shift', 2.5)],
        [K('ControlLeft', 'Ctrl', 1.5), K('MetaLeft', 'Win', 1.5), K('AltLeft', 'Alt', 1.5),
          K('Fn', 'Fn', 1.5), K('Space', '', 4), K('AltRight', 'Alt', 1.5), K('ControlRight', 'Ctrl', 1.5)]
      ]),
      nav: null,
      numpad: null
    }
  };

  global.KTS = global.KTS || {};
  global.KTS.LAYOUTS = LAYOUTS;
  global.KTS.LAYOUT_ORDER = ['full', 'tkl', 'e1800', 'seventyfive', 'sixtyfive', 'sixty', 'forty'];
})(window);
