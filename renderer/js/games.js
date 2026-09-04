/* Typing games: WPM speed test + falling-words arcade game. */
(function (global) {
  // ---------------------------------------------------------------- Speed Test
  const INFINITE_LOOKAHEAD = 60; // keep at least this many un-typed chars queued up
  const INFINITE_TRIM_AT = 400; // fold completed text into cumulative stats past this length

  function pickSentences(n) {
    const picks = [];
    const pool = global.KTS.SENTENCES.slice();
    for (let i = 0; i < n && pool.length; i++) {
      picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return picks.join(' ');
  }

  function randomSentence() {
    const bank = global.KTS.SENTENCES;
    return bank[Math.floor(Math.random() * bank.length)];
  }

  function SpeedTest(opts) {
    this.promptEl = opts.promptEl;
    this.inputEl = opts.inputEl;
    this.onUpdate = opts.onUpdate || function () {};
    this.onFinish = opts.onFinish || function () {};
    this.mode = 'normal';
    this.target = '';
    this.startTime = null;
    this.timer = null;
    this.running = false;
    this.cumCorrect = 0;
    this.cumTyped = 0;
    this._bindInput();
  }

  SpeedTest.prototype._bindInput = function () {
    this.inputEl.addEventListener('input', () => this._check());
  };

  SpeedTest.prototype.start = function (mode) {
    this.mode = mode === 'infinite' ? 'infinite' : 'normal';
    this.target = this.mode === 'infinite' ? pickSentences(2) : pickSentences(2 + Math.floor(Math.random() * 2));
    this.startTime = null;
    this.cumCorrect = 0;
    this.cumTyped = 0;
    this.inputEl.value = '';
    this.inputEl.disabled = false;
    this.finished = false;
    this.running = true;
    clearInterval(this.timer);
    this._render();
    this.inputEl.focus();
    this.onUpdate(this._stats(0));
  };

  SpeedTest.prototype._render = function () {
    const typed = this.inputEl.value;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.target.length; i++) {
      const span = document.createElement('span');
      span.textContent = this.target[i];
      if (i < typed.length) {
        span.className = typed[i] === this.target[i] ? 'ch-correct' : 'ch-wrong';
      } else if (i === typed.length) {
        span.className = 'ch-current';
      }
      frag.appendChild(span);
    }
    this.promptEl.innerHTML = '';
    this.promptEl.appendChild(frag);
  };

  SpeedTest.prototype._stats = function (elapsedMsOverride) {
    const typed = this.inputEl.value;
    let correct = this.cumCorrect;
    for (let i = 0; i < typed.length; i++) if (typed[i] === this.target[i]) correct++;
    const typedTotal = this.cumTyped + typed.length;
    const elapsedMs = elapsedMsOverride != null ? elapsedMsOverride : (this.startTime ? performance.now() - this.startTime : 0);
    const minutes = Math.max(elapsedMs / 60000, 1 / 60000);
    const wpm = Math.round((correct / 5) / minutes);
    const accuracy = typedTotal ? Math.round((correct / typedTotal) * 100) : 100;
    return { wpm: isFinite(wpm) ? Math.max(wpm, 0) : 0, accuracy, elapsedMs, typed: typedTotal, target: this.target.length, correct };
  };

  // Infinite mode: queue up more text ahead of the cursor, and fold already-typed
  // text into the cumulative counters so the prompt/input never grow unbounded.
  SpeedTest.prototype._extendInfinite = function () {
    const typed = this.inputEl.value;
    while (this.target.length - typed.length < INFINITE_LOOKAHEAD) {
      this.target += ' ' + randomSentence();
    }
    if (typed.length >= INFINITE_TRIM_AT) {
      for (let i = 0; i < typed.length; i++) if (typed[i] === this.target[i]) this.cumCorrect++;
      this.cumTyped += typed.length;
      this.target = this.target.slice(typed.length);
      this.inputEl.value = '';
    }
  };

  SpeedTest.prototype._check = function () {
    if (this.finished) return;
    if (this.startTime == null) {
      this.startTime = performance.now();
      this.timer = setInterval(() => this.onUpdate(this._stats()), 200);
    }
    if (this.mode === 'infinite') this._extendInfinite();
    const typed = this.inputEl.value;
    if (typed.length > this.target.length) {
      this.inputEl.value = typed.slice(0, this.target.length);
    }
    this._render();
    const stats = this._stats();
    this.onUpdate(stats);
    if (this.mode === 'normal' && this.inputEl.value.length >= this.target.length) {
      this.finished = true;
      this.running = false;
      this.inputEl.disabled = true;
      clearInterval(this.timer);
      this.onFinish(stats);
    }
  };

  // Ends an in-progress test early (used to end infinite mode, or bail out of normal mode).
  SpeedTest.prototype.stop = function () {
    if (this.finished) return;
    const stats = this._stats();
    this.finished = true;
    this.running = false;
    clearInterval(this.timer);
    this.inputEl.disabled = true;
    this.onFinish(stats);
  };

  // ---------------------------------------------------------------- Falling Words
  function FallingGame(opts) {
    this.arena = opts.arena;
    this.inputEl = opts.inputEl;
    this.onUpdate = opts.onUpdate || function () {};
    this.onGameOver = opts.onGameOver || function () {};
    this.words = [];
    this.running = false;
    this.score = 0;
    this.lives = 5;
    this.spawnEvery = 1800;
    this.fallSpeed = 40; // px/sec
    this._lastTs = 0;
    this._spawnAcc = 0;
    this.inputEl.addEventListener('input', () => this._onType());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === ' ') e.preventDefault();
    });
  }

  FallingGame.prototype.start = function () {
    this.arena.innerHTML = '';
    this.words = [];
    this.score = 0;
    this.lives = 5;
    this.spawnEvery = 1800;
    this.fallSpeed = 40;
    this.running = true;
    this.inputEl.value = '';
    this.inputEl.disabled = false;
    this.inputEl.focus();
    this._lastTs = performance.now();
    this._spawnAcc = 9999;
    this._raf = requestAnimationFrame((ts) => this._tick(ts));
    this.onUpdate(this._stats());
  };

  FallingGame.prototype.stop = function () {
    this.running = false;
    cancelAnimationFrame(this._raf);
    this.inputEl.disabled = true;
  };

  FallingGame.prototype._stats = function () {
    return { score: this.score, lives: this.lives, active: this.words.length };
  };

  FallingGame.prototype._spawn = function () {
    const bank = global.KTS.WORDS;
    const text = bank[Math.floor(Math.random() * bank.length)];
    const el = document.createElement('div');
    el.className = 'falling-word';
    el.textContent = text;
    const arenaW = this.arena.clientWidth || 600;
    el.style.left = Math.max(4, Math.random() * (arenaW - 80)) + 'px';
    el.style.top = '-24px';
    this.arena.appendChild(el);
    this.words.push({ text, el, y: -24 });
  };

  FallingGame.prototype._onType = function () {
    if (!this.running) return;
    const buf = this.inputEl.value.trim().toLowerCase();
    this.words.forEach((w) => w.el.classList.remove('is-match'));
    if (!buf) return;
    const hit = this.words.find((w) => w.text === buf);
    if (hit) {
      this.score += hit.text.length * 10;
      this.arena.removeChild(hit.el);
      this.words = this.words.filter((w) => w !== hit);
      this.inputEl.value = '';
      this.spawnEvery = Math.max(650, this.spawnEvery - 25);
      this.fallSpeed = Math.min(180, this.fallSpeed + 2);
      this.onUpdate(this._stats());
      return;
    }
    const match = this.words.find((w) => w.text.startsWith(buf));
    if (match) match.el.classList.add('is-match');
  };

  FallingGame.prototype._tick = function (ts) {
    if (!this.running) return;
    const dt = Math.min(50, ts - this._lastTs);
    this._lastTs = ts;
    this._spawnAcc += dt;
    if (this._spawnAcc >= this.spawnEvery) {
      this._spawnAcc = 0;
      this._spawn();
    }

    const arenaH = this.arena.clientHeight || 400;
    const lost = [];
    this.words.forEach((w) => {
      w.y += (this.fallSpeed * dt) / 1000;
      w.el.style.top = w.y + 'px';
      if (w.y > arenaH - 10) lost.push(w);
    });
    if (lost.length) {
      lost.forEach((w) => {
        if (w.el.parentNode) this.arena.removeChild(w.el);
      });
      this.words = this.words.filter((w) => lost.indexOf(w) === -1);
      this.lives -= lost.length;
      this.onUpdate(this._stats());
      if (this.lives <= 0) {
        this.stop();
        this.onGameOver(this._stats());
        return;
      }
    }

    this._raf = requestAnimationFrame((t) => this._tick(t));
  };

  global.KTS = global.KTS || {};
  global.KTS.SpeedTest = SpeedTest;
  global.KTS.FallingGame = FallingGame;
})(window);
