(function (global) {
  const SENTENCES = [
    'The quick brown fox jumps over the lazy dog while the clock ticks past midnight.',
    'Every mechanical switch has its own sound signature, from thocky to clacky to silent.',
    'Practice makes perfect, but only if you practice the right things on purpose.',
    'A good keyboard should disappear under your fingers and let the words flow freely.',
    'Debouncing prevents a single key press from registering as several rapid inputs.',
    'Rollover testing checks how many keys a keyboard can sense being held down at once.',
    'Custom keycaps change the feel, the sound, and sometimes even the way you type.',
    'The programmer stared at the screen, chasing a bug that only appeared on Fridays.',
    'Latency is the silent enemy of competitive typing and fast paced gaming alike.',
    'Switches come in linear, tactile, and clicky flavors, each with a distinct travel.',
    'A steady rhythm beats a burst of speed when accuracy is what actually counts.',
    'The library was quiet except for the soft clatter of keys against the evening air.',
    'Ergonomic layouts reduce strain by keeping the wrists straight and the reach short.',
    'Ghosting happens when a keyboard cannot correctly report certain key combinations.',
    'Ship it now, fix it later, but never forget to write the test in between.'
  ];

  const WORDS = (
    'time year people way day man thing woman life child world school state family ' +
    'student group country problem hand part place case week company system program ' +
    'question work government number night point home water room mother area money ' +
    'story fact month lot right study book eye job word business issue side kind head ' +
    'house service friend father power hour game line end member law car city community ' +
    'name president team minute idea body information back parent face others level ' +
    'office door health person art war history party result change morning reason ' +
    'research girl guy moment air teacher force education keyboard switch pixel cursor ' +
    'window folder script bug patch build cache token cloud server client mouse pixel'
  ).split(' ');

  global.KTS = global.KTS || {};
  global.KTS.SENTENCES = SENTENCES;
  global.KTS.WORDS = WORDS;
})(window);
