/* 6주 커스텀 — 1장 시선: 묶음(하늘·손·길) 바꾸기 · 작은 사진 누르면 오른쪽에 크게 · 점 표시가 고른 사진을 따라감 */
(function () {
  var sec = document.querySelector('.sv');
  if (!sec) return;
  var big = sec.querySelector('.sv-big'), bigImg = big.querySelector('img'), dot = sec.querySelector('.sv-dot');
  var box = sec.querySelector('.sv-thumbs');
  /* 고른 사진 테두리 — 사진마다 켜고 끄지 않고, 테두리 하나가 고른 사진으로 미끄러지듯 옮겨 감(학생 요청) */
  var frame = document.createElement('span'); frame.className = 'sv-frame'; frame.setAttribute('aria-hidden', 'true'); box.appendChild(frame);

  function moveDot(th) {
    if (!th) return;
    var b = box.getBoundingClientRect(), r = th.getBoundingClientRect();
    frame.style.left = (r.left - b.left + box.scrollLeft) + 'px'; frame.style.top = (r.top - b.top + box.scrollTop) + 'px';
    frame.style.width = r.width + 'px'; frame.style.height = r.height + 'px';
    frame.classList.add('is-on');
    if (dot) { dot.style.left = (r.left - b.left) + 'px'; dot.style.top = (r.top - b.top) + 'px'; }
  }
  function pick(th) {
    sec.querySelectorAll('.sv-th.is-sel').forEach(function (t) { t.classList.remove('is-sel'); });
    th.classList.add('is-sel');
    var src = th.getAttribute('data-src'), alt = th.querySelector('img').alt;
    if (bigImg.getAttribute('src') !== src) {
      big.classList.add('is-swap');
      setTimeout(function () { bigImg.src = src; bigImg.alt = alt; bigImg.onload = function () { big.classList.remove('is-swap'); }; }, 200);
    }
    moveDot(th);
  }
  function group(g) {
    sec.querySelectorAll('.sv-tab').forEach(function (t) { var on = t.getAttribute('data-g') === g; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    sec.querySelectorAll('.sv-set, .sv-cap').forEach(function (el) { el.hidden = el.getAttribute('data-g') !== g; });
    pick(sec.querySelector('.sv-set[data-g="' + g + '"] .sv-th'));
  }
  sec.querySelectorAll('.sv-tab').forEach(function (t) { t.addEventListener('click', function () { group(t.getAttribute('data-g')); }); });
  sec.querySelectorAll('.sv-th').forEach(function (th) { th.addEventListener('click', function () { pick(th); }); });
  /* 큰 사진을 누르면 시스템의 '크게 보기'(화면 가득 · 좌우로 넘기기)가 그 사진에서 열린다 */
  bigImg.addEventListener('click', function () { if (window.moLbOpen) window.moLbOpen(bigImg.getAttribute('src')); });
  window.addEventListener('resize', function () { moveDot(sec.querySelector('.sv-th.is-sel')); });
  window.addEventListener('load', function () { moveDot(sec.querySelector('.sv-th.is-sel')); });
  moveDot(sec.querySelector('.sv-th.is-sel'));
})();
