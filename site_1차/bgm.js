/* 첫 화면 배경음 — 학생 요청(6주). 음원 파일 없이 브라우저(Web Audio)가 직접 만드는 소리.
   1막: 잔잔한 화음 + 글자마다 작은 톡 소리 · 확대 때: 바람 소리 · 2막: 종소리가 드문드문 · 제목: 종 화음.
   소리 크기는 VOLUME 한 줄로 바꾼다(0~1). */
(function () {
  var VOLUME = 0.5;
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, wet = null, padTimer = null, bellTimer = null, on = false;

  /* 화음 (Hz) — Cmaj7 → Am9 → Fmaj7 → G6sus, 하나에 4초 */
  var CHORDS = [
    [130.81, 196.00, 246.94, 329.63],
    [110.00, 164.81, 246.94, 261.63],
    [87.31, 174.61, 220.00, 329.63],
    [98.00, 146.83, 261.63, 293.66]
  ];
  var BELLS = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 1174.7]; /* C장조 5음 */

  function setup() {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    /* 울림 — 잡음으로 만든 2.6초 잔향 */
    var len = ctx.sampleRate * 2.6, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = imp.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
    var rev = ctx.createConvolver(); rev.buffer = imp;
    wet = ctx.createGain(); wet.gain.value = 0.55; wet.connect(rev); rev.connect(master);
  }
  function out(node, dry) { var g = ctx.createGain(); g.gain.value = dry; node.connect(g); g.connect(master); node.connect(wet); }

  function pad(freqs, t, dur) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 1.6); g.gain.setValueAtTime(0.09, t + dur - 0.4); g.gain.linearRampToValueAtTime(0, t + dur + 1.8);
    lp.connect(g); out(g, 0.6);
    freqs.forEach(function (f) {
      [-4, 4].forEach(function (cent) {
        var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = cent;
        o.connect(lp); o.start(t); o.stop(t + dur + 2);
      });
    });
  }
  function bell(f, t, vol) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2.01;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    var g2 = ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(g);
    o.connect(g); out(g, 0.5); o.start(t); o2.start(t); o.stop(t + 2.5); o2.stop(t + 2.5);
  }

  function padLoop() {
    var i = 0;
    function next() { if (!on) return; pad(CHORDS[i % CHORDS.length], ctx.currentTime + 0.05, 4); i++; }
    next(); padTimer = setInterval(next, 4000);
  }

  var api = {
    get playing() { return on; },
    start: function () {
      if (!AC) return false;
      if (!ctx) setup();
      ctx.resume(); on = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 1.2);
      clearInterval(padTimer); clearInterval(bellTimer); padLoop();
      return true;
    },
    stop: function () {
      if (!ctx) return; on = false; clearInterval(padTimer); clearInterval(bellTimer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    },
    /* 글자 하나 입력될 때 */
    tick: function () {
      if (!on) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 1700 + Math.random() * 500;
      g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.08);
    },
    /* 확대될 때 — 바람 소리 */
    whoosh: function () {
      if (!on) return; var t = ctx.currentTime, n = ctx.sampleRate * 1.4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var s = ctx.createBufferSource(); s.buffer = b;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.9);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.6); g.gain.linearRampToValueAtTime(0, t + 1.4);
      s.connect(bp); bp.connect(g); out(g, 0.7); s.start(t);
    },
    /* 2막 — 종소리가 드문드문 */
    bells: function () {
      if (!on) return; clearInterval(bellTimer);
      bellTimer = setInterval(function () { if (on && Math.random() < 0.7) bell(BELLS[Math.floor(Math.random() * BELLS.length)], ctx.currentTime + 0.02, 0.05); }, 650);
    },
    /* 제목이 뜰 때 — 종 화음 */
    chime: function () {
      if (!on) return; var t = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { bell(f, t + i * 0.09, 0.06); });
    }
  };
  window.HXBGM = api;
})();
