/* IQ Finance — design v2 motion. Shared by the home and the Technology page.
   Everything here is progressive: without JavaScript, or with "reduce motion" on,
   the page shows its final state with no animation. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // Close the mobile menu after choosing a section.
  document.querySelectorAll('.menu-panel a').forEach(function (a) {
    a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
  });

  if (reduced || !('IntersectionObserver' in window)) { root.classList.add('no-motion'); return; }

  // 1. Text and cards rise into place as they enter the screen.
  var revealSelector = [
    'main .eyebrow', 'main .h2', 'main .h2-big', '.principles h2 span', '.principles .lead',
    '.analysis-intro .lead', '.split-head p', '.step', '.card', '.cat', '.vault', '.funds',
    '.money-list li', '.phase-list li', '.journey li', '.stats', '.statement h2', '.chips',
    '.tech-hero .toc', '.dd-block', '.facts-list', '.callout', '.tests'
  ].join(',');
  var groups = new Map();
  document.querySelectorAll(revealSelector).forEach(function (el) {
    if (el.closest('.hero')) return;
    el.classList.add('rv');
    var parent = el.parentElement;
    var i = groups.get(parent) || 0;
    el.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
    groups.set(parent, i + 1);
  });

  // 2. Charts are unveiled from left to right.
  document.querySelectorAll('.plot-area svg, .chart-row svg, .an-panel svg, .ex svg, .cat-line svg').forEach(function (el) {
    el.classList.add('wipe');
  });

  // 3. Key figures count up to their value.
  var counters = [];
  document.querySelectorAll('.stats .v, .tests .v').forEach(function (el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    var target = parseInt(node.nodeValue, 10);
    if (isNaN(target)) return;
    node.nodeValue = '0';
    counters.push({ el: el, node: node, target: target, done: false });
  });

  function countUp(c) {
    if (c.done) return;
    c.done = true;
    var start = null, dur = 1400;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      c.node.nodeValue = String(Math.round(c.target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      counters.forEach(function (c) { if (e.target.contains(c.el) || e.target === c.el) countUp(c); });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv, .wipe').forEach(function (el) { io.observe(el); });

  // 4. A soft light follows the pointer on cards (mouse and trackpad only).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card, .cat, .vault, .funds, .stats').forEach(function (el) {
      el.classList.add('lit');
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
  }
})();
