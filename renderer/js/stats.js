/* Global, persisted press statistics used by the heatmap & dashboard. */
(function (global) {
  const STORAGE_KEY = 'kts-stats-v1';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error('empty');
      const data = JSON.parse(raw);
      return {
        counts: data.counts || {},
        totalPresses: data.totalPresses || 0,
        maxRolloverEver: data.maxRolloverEver || 0,
        bestWpm: data.bestWpm || 0,
        gamesPlayed: data.gamesPlayed || 0,
        sessionsStarted: (data.sessionsStarted || 0) + 1
      };
    } catch (e) {
      return { counts: {}, totalPresses: 0, maxRolloverEver: 0, bestWpm: 0, gamesPlayed: 0, sessionsStarted: 1 };
    }
  }

  const state = load();
  let saveHandle = null;
  function persist() {
    clearTimeout(saveHandle);
    saveHandle = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 300);
  }

  const listeners = new Set();
  function notify() {
    listeners.forEach((fn) => fn(state));
  }

  const Stats = {
    record(code) {
      state.counts[code] = (state.counts[code] || 0) + 1;
      state.totalPresses += 1;
      persist();
      notify();
    },
    noteRollover(n) {
      if (n > state.maxRolloverEver) {
        state.maxRolloverEver = n;
        persist();
      }
    },
    noteWpm(wpm) {
      if (wpm > state.bestWpm) {
        state.bestWpm = wpm;
        persist();
      }
    },
    noteGamePlayed() {
      state.gamesPlayed += 1;
      persist();
    },
    getCounts() {
      return state.counts;
    },
    getSummary() {
      const counts = state.counts;
      let topCode = null;
      let topCount = 0;
      Object.keys(counts).forEach((c) => {
        if (counts[c] > topCount) {
          topCount = counts[c];
          topCode = c;
        }
      });
      return {
        totalPresses: state.totalPresses,
        maxRolloverEver: state.maxRolloverEver,
        bestWpm: state.bestWpm,
        gamesPlayed: state.gamesPlayed,
        topCode,
        topCount
      };
    },
    reset() {
      state.counts = {};
      state.totalPresses = 0;
      state.maxRolloverEver = 0;
      state.bestWpm = 0;
      state.gamesPlayed = 0;
      persist();
      notify();
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };

  global.KTS = global.KTS || {};
  global.KTS.Stats = Stats;
})(window);
