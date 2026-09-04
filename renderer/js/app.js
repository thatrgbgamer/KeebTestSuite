(function () {
  const $ = (sel) => document.querySelector(sel);
  const views = document.querySelectorAll('.view');
  const navItems = document.querySelectorAll('.nav__item');
  const sizeSelect = $('#sizeSelect');
  const sizeBlurb = $('#sizeBlurb');

  let currentView = 'tester';
  let currentSize = 'tkl';

  // ---------- size selector ----------
  KTS.LAYOUT_ORDER.forEach((id) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = KTS.LAYOUTS[id].label;
    sizeSelect.appendChild(opt);
  });
  sizeSelect.value = currentSize;
  sizeBlurb.textContent = KTS.LAYOUTS[currentSize].blurb;

  // ---------- key tester ----------
  const tester = new KTS.KeyTester($('#testerKb'), currentSize, (stats) => {
    $('#tCoverage').textContent = stats.percent + '%';
    $('#tRollover').textContent = stats.currentRollover;
    $('#tMaxRollover').textContent = stats.maxRollover;
    $('#tChatter').textContent = stats.chatterEvents;
    $('#tProgressBar').style.width = stats.percent + '%';
    KTS.Stats.noteRollover(stats.maxRollover);

    $('#untestedCount').textContent = stats.untested.length;
    $('#untestedList').textContent = stats.untested.length ? stats.untested.join(', ') : 'All keys tested!';
  });
  $('#tResetBtn').addEventListener('click', () => tester.reset());

  // ---------- speed test ----------
  const speedKb = KTS.buildKeyboard($('#speedKb'), 'sixty');
  let speedMode = 'normal';
  const speedTest = new KTS.SpeedTest({
    promptEl: $('#sPrompt'),
    inputEl: $('#sInput'),
    onUpdate: (s) => {
      $('#sWpm').textContent = s.wpm;
      $('#sAcc').textContent = s.accuracy + '%';
      $('#sTime').textContent = (s.elapsedMs / 1000).toFixed(1) + 's';
    },
    onFinish: (s) => {
      KTS.Stats.noteWpm(s.wpm);
      KTS.Stats.noteGamePlayed();
      $('#sStopBtn').hidden = true;
      const banner = $('#sResult');
      banner.hidden = false;
      banner.textContent = `Done! ${s.wpm} WPM at ${s.accuracy}% accuracy in ${(s.elapsedMs / 1000).toFixed(1)}s.`;
    }
  });
  function startSpeedTest() {
    $('#sResult').hidden = true;
    $('#sStopBtn').hidden = speedMode !== 'infinite';
    speedTest.start(speedMode);
  }
  $('#sRestartBtn').addEventListener('click', startSpeedTest);
  $('#sStopBtn').addEventListener('click', () => speedTest.stop());
  document.querySelectorAll('#sModeToggle .mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      speedMode = btn.dataset.mode;
      document.querySelectorAll('#sModeToggle .mode-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      startSpeedTest();
    });
  });

  // ---------- falling words ----------
  const fallingKb = KTS.buildKeyboard($('#fallingKb'), 'sixty');
  const falling = new KTS.FallingGame({
    arena: $('#fArena'),
    inputEl: $('#fInput'),
    onUpdate: (s) => {
      $('#fScore').textContent = s.score;
      $('#fLives').textContent = s.lives;
    },
    onGameOver: (s) => {
      KTS.Stats.noteGamePlayed();
      const banner = $('#fResult');
      banner.hidden = false;
      banner.textContent = `Game over! Final score: ${s.score}.`;
      $('#fInput').disabled = true;
    }
  });
  $('#fStartBtn').addEventListener('click', () => {
    $('#fResult').hidden = true;
    falling.start();
  });

  // ---------- heatmap ----------
  const heatmap = new KTS.Heatmap($('#heatmapKb'), currentSize);
  function refreshHeatmapStats() {
    const s = KTS.Stats.getSummary();
    $('#hTotal').textContent = s.totalPresses;
    $('#hTop').textContent = s.topCode ? `${s.topCode} (${s.topCount})` : '–';
    $('#hBestWpm').textContent = s.bestWpm;
    $('#hMaxRollover').textContent = s.maxRolloverEver;
    $('#hGames').textContent = s.gamesPlayed;
  }
  KTS.Stats.onChange(refreshHeatmapStats);
  refreshHeatmapStats();
  $('#hResetBtn').addEventListener('click', () => {
    if (confirm('Reset all saved statistics? This cannot be undone.')) KTS.Stats.reset();
  });

  // ---------- size changes ----------
  sizeSelect.addEventListener('change', () => {
    currentSize = sizeSelect.value;
    sizeBlurb.textContent = KTS.LAYOUTS[currentSize].blurb;
    tester.setLayout(currentSize);
    heatmap.setLayout(currentSize);
  });

  // ---------- view routing ----------
  function setView(id) {
    currentView = id;
    views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === id));
    navItems.forEach((n) => n.classList.toggle('is-active', n.dataset.view === id));
  }
  navItems.forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));

  // ---------- global key routing (drives graphics + stats + prevents OS side-effects) ----------
  const miniMaps = { speed: speedKb.map, falling: fallingKb.map };

  window.addEventListener('keydown', (e) => {
    if (!e.repeat) KTS.Stats.record(e.code);

    if (currentView === 'tester') {
      tester.handleKeyDown(e);
      e.preventDefault();
      return;
    }
    const map = miniMaps[currentView];
    if (map && map[e.code]) map[e.code].classList.add('is-pressed');
  });

  window.addEventListener('keyup', (e) => {
    if (currentView === 'tester') {
      tester.handleKeyUp(e);
      e.preventDefault();
      return;
    }
    const map = miniMaps[currentView];
    if (map && map[e.code]) map[e.code].classList.remove('is-pressed');
  });

  // keep the tester stage focusable/focused so keydown reliably fires
  $('#testerKb').addEventListener('click', () => $('#testerKb').focus());
})();
