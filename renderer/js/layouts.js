/* Keyboard layout definitions (ANSI) for every common form factor.
 * Every key is placed with real keyboard-layout-editor-style coordinates:
 * {c: KeyboardEvent.code, l: label, x, y: position in "u" units, w, h: size in u}.
 * Physical codes (not characters) drive detection, so it works regardless
 * of OS keyboard layout/language. No "Menu" key anywhere — vanishingly few
 * boards still ship one, so it's left out in favor of a wider right Ctrl.
 */
(function (global) {
  const K = (c, l, x, y, w, h) => ({ c, l, x, y, w: w || 1, h: h || 1 });

  // ---- reusable row builders (shared column math across every size) ----
  function numberRow(y) {
    const digits = ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'];
    const labels = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
    const keys = digits.map((c, i) => K(c, labels[i], i, y));
    keys.push(K('Backspace', 'Backspace', 13, y, 2));
    return keys;
  }
  function qwertyRow(y) {
    const codes = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'];
    const keys = [K('Tab', 'Tab', 0, y, 1.5)];
    codes.forEach((c, i) => keys.push(K(c, c.slice(3), 1.5 + i, y)));
    keys.push(K('BracketLeft', '[', 11.5, y));
    keys.push(K('BracketRight', ']', 12.5, y));
    keys.push(K('Backslash', '\\', 13.5, y, 1.5));
    return keys;
  }
  function homeRow(y) {
    const codes = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'];
    const keys = [K('CapsLock', 'Caps', 0, y, 1.75)];
    codes.forEach((c, i) => keys.push(K(c, c.slice(3), 1.75 + i, y)));
    keys.push(K('Semicolon', ';', 10.75, y));
    keys.push(K('Quote', "'", 11.75, y));
    keys.push(K('Enter', 'Enter', 12.75, y, 2.25));
    return keys;
  }
  function bottomRow(y, rightShiftW) {
    const codes = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'];
    const keys = [K('ShiftLeft', 'Shift', 0, y, 2.25)];
    codes.forEach((c, i) => keys.push(K(c, c.slice(3), 2.25 + i, y)));
    keys.push(K('Comma', ',', 9.25, y));
    keys.push(K('Period', '.', 10.25, y));
    keys.push(K('Slash', '/', 11.25, y));
    const rw = rightShiftW || 2.75;
    keys.push(K('ShiftRight', 'Shift', 12.25, y, rw));
    return keys;
  }
  // Bottom-row mod cluster. No Menu key — vanishingly few boards still ship one, so
  // right Ctrl just fills the space out to the row's normal 15u edge instead.
  function modRow(y, opts) {
    opts = opts || {};
    const spaceW = opts.spaceW || 6.25;
    const keys = [
      K('ControlLeft', 'Ctrl', 0, y, 1.25),
      K('MetaLeft', 'Win', 1.25, y, 1.25),
      K('AltLeft', 'Alt', 2.5, y, 1.25),
      K('Space', '', 3.75, y, spaceW),
      K('AltRight', 'Alt', 3.75 + spaceW, y, 1.25)
    ];
    let x = 3.75 + spaceW + 1.25;
    if (!opts.noRightWin) {
      keys.push(K('MetaRight', 'Win', x, y, 1.25));
      x += 1.25;
    }
    const rCtrlW = opts.rightCtrlW || Math.max(1.25, 15 - x);
    keys.push(K('ControlRight', 'Ctrl', x, y, rCtrlW));
    return keys;
  }
  function funcRow(y, tight) {
    const keys = [K('Escape', 'Esc', 0, y)];
    if (tight) {
      for (let i = 1; i <= 12; i++) keys.push(K('F' + i, 'F' + i, 0.25 + i, y));
    } else {
      const groups = [[1, 4], [5, 8], [9, 12]];
      let x = 2;
      groups.forEach(([a, b], gi) => {
        for (let n = a; n <= b; n++) {
          keys.push(K('F' + n, 'F' + n, x, y));
          x += 1;
        }
        if (gi < groups.length - 1) x += 0.5;
      });
    }
    return keys;
  }

  const ROW = { func: 0, num: 1.25, qwerty: 2.25, home: 3.25, bottom: 4.25, mod: 5.25 };
  const NO_FUNC_ROW = { num: 0, qwerty: 1, home: 2, bottom: 3, mod: 4 };

  function fullSizeMain(tightFunc) {
    return [].concat(
      funcRow(ROW.func, tightFunc),
      numberRow(ROW.num),
      qwertyRow(ROW.qwerty),
      homeRow(ROW.home),
      bottomRow(ROW.bottom, tightFunc ? 1.75 : undefined),
      modRow(ROW.mod)
    );
  }

  // 3x2 Ins/Home/PgUp + Del/End/PgDn block, plus an inverted-T arrow cluster below.
  function fullNavCluster(x) {
    return [
      K('PrintScreen', 'PrtSc', x, ROW.func),
      K('ScrollLock', 'ScrLk', x + 1, ROW.func),
      K('Pause', 'Pause', x + 2, ROW.func),
      K('Insert', 'Ins', x, ROW.num),
      K('Home', 'Home', x + 1, ROW.num),
      K('PageUp', 'PgUp', x + 2, ROW.num),
      K('Delete', 'Del', x, ROW.qwerty),
      K('End', 'End', x + 1, ROW.qwerty),
      K('PageDown', 'PgDn', x + 2, ROW.qwerty),
      K('ArrowUp', '↑', x + 1, ROW.bottom),
      K('ArrowLeft', '←', x, ROW.mod),
      K('ArrowDown', '↓', x + 1, ROW.mod),
      K('ArrowRight', '→', x + 2, ROW.mod)
    ];
  }

  function numpad(x) {
    return [
      K('NumLock', 'Num', x, ROW.num), K('NumpadDivide', '/', x + 1, ROW.num), K('NumpadMultiply', '*', x + 2, ROW.num), K('NumpadSubtract', '-', x + 3, ROW.num),
      K('Numpad7', '7', x, ROW.qwerty), K('Numpad8', '8', x + 1, ROW.qwerty), K('Numpad9', '9', x + 2, ROW.qwerty), K('NumpadAdd', '+', x + 3, ROW.qwerty, 1, 2),
      K('Numpad4', '4', x, ROW.home), K('Numpad5', '5', x + 1, ROW.home), K('Numpad6', '6', x + 2, ROW.home),
      K('Numpad1', '1', x, ROW.bottom), K('Numpad2', '2', x + 1, ROW.bottom), K('Numpad3', '3', x + 2, ROW.bottom), K('NumpadEnter', 'Enter', x + 3, ROW.bottom, 1, 2),
      K('Numpad0', '0', x, ROW.mod, 2), K('NumpadDecimal', '.', x + 2, ROW.mod)
    ];
  }

  const LAYOUTS = {
    full: {
      id: 'full', label: 'Full-Size (100%)',
      blurb: 'Function row, main cluster, dedicated nav cluster, and numpad.',
      width: 23, rows: 6.25,
      keys: [].concat(fullSizeMain(false), fullNavCluster(15.5), numpad(19))
    },
    tkl: {
      id: 'tkl', label: 'Tenkeyless (80%/TKL)',
      blurb: 'Full-size minus the numpad — same function row and nav cluster.',
      width: 18.5, rows: 6.25,
      keys: [].concat(fullSizeMain(false), fullNavCluster(15.5))
    },
    e1800: {
      id: 'e1800', label: '96% (1800-Compact)',
      blurb: 'TKL density with the numpad pulled flush against a compact nav column.',
      width: 22.75, rows: 6.25,
      keys: [].concat(
        fullSizeMain(true),
        [
          K('Insert', 'Ins', 15.5, ROW.func), K('Home', 'Home', 16.5, ROW.func), K('PageUp', 'PgUp', 17.5, ROW.func),
          K('Delete', 'Del', 15.5, ROW.num), K('End', 'End', 16.5, ROW.num), K('PageDown', 'PgDn', 17.5, ROW.num),
          K('ArrowUp', '↑', 16.5, ROW.bottom),
          K('ArrowLeft', '←', 15.5, ROW.mod), K('ArrowDown', '↓', 16.5, ROW.mod), K('ArrowRight', '→', 17.5, ROW.mod)
        ],
        numpad(18.75)
      )
    },
    seventyfive: {
      id: 'seventyfive', label: '75%',
      blurb: 'TKL layout compressed tight, with a single nav column and compact arrows.',
      width: 19.5, rows: 6.25,
      keys: [].concat(
        fullSizeMain(true),
        [
          K('PrintScreen', 'PrtSc', 15.5, ROW.func),
          K('Delete', 'Del', 15.5, ROW.num),
          K('Home', 'Home', 15.5, ROW.qwerty),
          K('End', 'End', 15.5, ROW.home),
          K('PageUp', 'PgUp', 15.5, ROW.bottom),
          K('PageDown', 'PgDn', 15.5, ROW.mod),
          K('ArrowUp', '↑', 17.5, ROW.bottom),
          K('ArrowLeft', '←', 16.5, ROW.mod), K('ArrowDown', '↓', 17.5, ROW.mod), K('ArrowRight', '→', 18.5, ROW.mod)
        ]
      )
    },
    sixtyfive: {
      id: 'sixtyfive', label: '65%',
      blurb: 'No function row, but keeps a compact nav column and arrow cluster.',
      width: 19.5, rows: 5,
      keys: [].concat(
        numberRow(NO_FUNC_ROW.num),
        qwertyRow(NO_FUNC_ROW.qwerty),
        homeRow(NO_FUNC_ROW.home),
        bottomRow(NO_FUNC_ROW.bottom, 1.75),
        modRow(NO_FUNC_ROW.mod),
        [
          K('Delete', 'Del', 15.5, NO_FUNC_ROW.num),
          K('Home', 'Home', 15.5, NO_FUNC_ROW.qwerty),
          K('End', 'End', 15.5, NO_FUNC_ROW.home),
          K('ArrowUp', '↑', 17.5, NO_FUNC_ROW.bottom),
          K('ArrowLeft', '←', 16.5, NO_FUNC_ROW.mod), K('ArrowDown', '↓', 17.5, NO_FUNC_ROW.mod), K('ArrowRight', '→', 18.5, NO_FUNC_ROW.mod)
        ]
      )
    },
    sixty: {
      id: 'sixty', label: '60%',
      blurb: 'No function row, no nav cluster, no arrows or numpad — pure typing core.',
      width: 15, rows: 5,
      keys: [].concat(
        numberRow(NO_FUNC_ROW.num),
        qwertyRow(NO_FUNC_ROW.qwerty),
        homeRow(NO_FUNC_ROW.home),
        bottomRow(NO_FUNC_ROW.bottom),
        modRow(NO_FUNC_ROW.mod)
      )
    },
    forty: {
      id: 'forty', label: '40%',
      blurb: 'Minimalist core — letters and a few mods; everything else lives on a Fn layer.',
      width: 13, rows: 4,
      keys: [
        K('Tab', 'Tab', 0, 0, 1.5),
        K('KeyQ', 'Q', 1.5, 0), K('KeyW', 'W', 2.5, 0), K('KeyE', 'E', 3.5, 0), K('KeyR', 'R', 4.5, 0), K('KeyT', 'T', 5.5, 0),
        K('KeyY', 'Y', 6.5, 0), K('KeyU', 'U', 7.5, 0), K('KeyI', 'I', 8.5, 0), K('KeyO', 'O', 9.5, 0), K('KeyP', 'P', 10.5, 0),
        K('Backspace', 'Bksp', 11.5, 0, 1.5),

        K('Escape', 'Esc', 0, 1, 1.75),
        K('KeyA', 'A', 1.75, 1), K('KeyS', 'S', 2.75, 1), K('KeyD', 'D', 3.75, 1), K('KeyF', 'F', 4.75, 1), K('KeyG', 'G', 5.75, 1),
        K('KeyH', 'H', 6.75, 1), K('KeyJ', 'J', 7.75, 1), K('KeyK', 'K', 8.75, 1), K('KeyL', 'L', 9.75, 1),
        K('Enter', 'Enter', 10.75, 1, 2.25),

        K('ShiftLeft', 'Shift', 0, 2, 2.25),
        K('KeyZ', 'Z', 2.25, 2), K('KeyX', 'X', 3.25, 2), K('KeyC', 'C', 4.25, 2), K('KeyV', 'V', 5.25, 2), K('KeyB', 'B', 6.25, 2),
        K('KeyN', 'N', 7.25, 2), K('KeyM', 'M', 8.25, 2), K('Comma', ',', 9.25, 2), K('Period', '.', 10.25, 2),
        K('ShiftRight', 'Shift', 11.25, 2, 1.75),

        K('ControlLeft', 'Ctrl', 0, 3, 1.5), K('MetaLeft', 'Win', 1.5, 3, 1.5), K('AltLeft', 'Alt', 3, 3, 1.5),
        K('Fn', 'Fn', 4.5, 3, 1.5), K('Space', '', 6, 3, 4), K('AltRight', 'Alt', 10, 3, 1.5), K('ControlRight', 'Ctrl', 11.5, 3, 1.5)
      ]
    }
  };

  global.KTS = global.KTS || {};
  global.KTS.LAYOUTS = LAYOUTS;
  global.KTS.LAYOUT_ORDER = ['full', 'tkl', 'e1800', 'seventyfive', 'sixtyfive', 'sixty', 'forty'];
})(window);
