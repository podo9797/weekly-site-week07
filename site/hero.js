/* 첫 화면 커스텀 — 학생 요청(6주): 첨부 영상의 흐름(사진 위 검색창 타이핑 → 확대 → 떠다니는 검색창 + 가운데 제목)
   검색창 문구는 모두 이 아카이브의 기획서(02_plan.md)에 있는 학생 문장. 가운데 질문은 6주 주제카드의 '이번 주 질문'. */
(function () {
  var hero = document.querySelector('.hx');
  if (!hero) return;

  var QUESTION = '어떤 빛·색·배치가 나를 머물게 할까?';
  var LINES = [
    '자연, 하늘, 꽃', '여행의 추억', '바닷속의 생물들',
    '가만히 앉아서 바람에 흔들리는 꽃이나 흘러가는 구름을 보는 것이 좋아서',
    '평소에 가보지 못한 곳이니까 좀 더 눈에 담아두고 싶어서',
    '바닷속에 직접 들어간 것 같은 느낌이 들고 여러 생물들이 움직이며 가끔 눈을 마주치는 것이 즐거워서',
    '여행자의 눈으로 풍경을 담는 사람',
    '빛이 하늘을 물들이는 순간처럼, 평범한 장면이 특별해지는 때를 고른다',
    '보는 사람을 그 안으로 끌어들이는 몰입감을 기준으로 고른다',
    '전철 속에서 본 구름'
  ];
  /* 자리: 왼쪽 x · 위 y · 글자 크기 · 흐림 · 진하기 · 흐르는 시간 */
  var SPOTS = [
    ['-4%', '15%', '26px', 0, 1, 24], ['58%', '13%', '15px', 0, .95, 19], ['12%', '25%', '13px', 0, .9, 27],
    ['63%', '27%', '16px', 0, 1, 21], ['-6%', '30%', '11px', '1.5px', .5, 30], ['70%', '35%', '11px', '1.5px', .5, 26],
    ['2%', '66%', '15px', 0, 1, 23], ['55%', '60%', '12px', '1px', .6, 29], ['-8%', '81%', '20px', 0, 1, 25],
    ['38%', '85%', '30px', 0, 1, 20], ['30%', '20%', '11px', '2px', .45, 33], ['74%', '74%', '13px', 0, .9, 22],
    ['20%', '46%', '10px', '2px', .4, 31], ['78%', '50%', '10px', '2px', .4, 28], ['8%', '93%', '12px', '1px', .6, 24]
  ];
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

  /* 떠다니는 검색창 만들기 */
  var float = hero.querySelector('.hx-float');
  LINES.forEach(function (t, i) {
    var s = SPOTS[i % SPOTS.length], p = document.createElement('span');
    p.className = 'hx-pill';
    p.style.cssText = '--x:' + s[0] + ';--y:' + s[1] + ';--fs:' + s[2] + ';--bl:' + s[3] + ';--op:' + s[4] + ';--du:' + s[5] + 's;--dl:' + (i * 0.07).toFixed(2) + 's';
    p.innerHTML = ICON + '<span></span>' + (i % 4 === 0 ? '<i class="hx-caret"></i>' : '');
    p.querySelector('span').textContent = t;
    float.appendChild(p);
  });

  var q = hero.querySelector('.hx-q');
  var root = document.documentElement;
  var still = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || root.classList.contains('m0') || document.body.classList.contains('m0');

  var timers = [], cycle = null, typer = null;
  var bgm = window.HXBGM;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function add(c) { hero.classList.add(c); }
  function rm(c) { hero.classList.remove(c); }
  function cue(name) { if (bgm && bgm.playing) bgm[name](); }

  /* 소리 버튼 — 브라우저는 누르기 전에는 소리를 막으므로, 누르면 첫 화면이 음악과 함께 처음부터 다시 재생된다 */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'hx-sound hx-pill';
  btn.innerHTML = '<span aria-hidden="true">♪</span><span class="hx-sound-t">소리 켜기</span>';
  hero.appendChild(btn);
  btn.addEventListener('click', function () {
    if (!bgm) return;
    if (bgm.playing) { bgm.stop(); btn.querySelector('.hx-sound-t').textContent = '소리 켜기'; btn.classList.remove('is-on'); return; }
    if (bgm.start()) { btn.querySelector('.hx-sound-t').textContent = '소리 끄기'; btn.classList.add('is-on'); if (!still) play(); }
  });

  if (still) { /* 움직임 없이 마지막 장면 */
    hero.classList.add('static', 'act2', 'f-in', 't-in');
    return;
  }

  var imgs = [].slice.call(hero.querySelectorAll('.hx-photos img'));

  function play() {
    /* 처음 상태로 되돌린다 */
    timers.forEach(clearTimeout); timers = []; clearInterval(cycle); clearInterval(typer);
    ['s-in', 's-zoom', 's-out', 'act2', 'f-in', 'c-in', 't-in'].forEach(rm);
    q.textContent = '';
    imgs.forEach(function (im) { im.classList.remove('on'); });

    /* 1막 — 사진이 1.1초마다 바뀐다 */
    var k = 0;
    if (imgs.length) imgs[0].classList.add('on');
    cycle = setInterval(function () {
      if (!imgs.length) return;
      imgs[k].classList.remove('on'); k = (k + 1) % imgs.length; imgs[k].classList.add('on');
    }, 1100);

    /* 검색창이 뜨고 한 글자씩 입력된다 */
    at(400, function () { add('s-in'); });
    at(900, function () {
      var i = 0; typer = setInterval(function () { i++; q.textContent = QUESTION.slice(0, i); if (QUESTION[i - 1] !== ' ') cue('tick'); if (i >= QUESTION.length) clearInterval(typer); }, 75);
    });

    /* 확대 → 2막 바탕 */
    at(4400, function () { cue('whoosh'); });
    at(4600, function () { add('s-zoom'); });
    at(5300, function () { add('act2'); clearInterval(cycle); });
    at(5700, function () { rm('s-zoom'); add('f-in'); add('c-in'); cue('bells'); });

    /* 가운데 사진 카드가 사라지고 제목이 뜬다 */
    at(7300, function () { rm('c-in'); add('s-out'); });
    at(7700, function () { add('t-in'); cue('chime'); });
  }
  play();
})();
