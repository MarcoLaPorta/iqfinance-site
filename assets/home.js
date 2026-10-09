/* IQ Finance — home behaviour (v4).
   Without JavaScript or with "reduce motion" on, the page shows its final state and every
   example strategy is listed one after the other. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Mobile menu closes after choosing a section.
  document.querySelectorAll('.menu-panel a').forEach(function (a) {
    a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
  });

  // Example strategies: pill selector (ARIA tabs, arrow keys supported).
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.ex-tabs [role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) { p.hidden = !on; if (on) { var d = p.querySelector('.draw'); if (d) { d.classList.remove('in'); void d.getBoundingClientRect(); d.classList.add('in'); } } }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });
  if (tabs.length) select(tabs[0]);

  // Sub-navigation: highlight the section in view.
  var links = Array.prototype.slice.call(document.querySelectorAll('.subnav a'));
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window)) { root.classList.add('no-motion'); return; }
  var current = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) {
        var on = l.getAttribute('href') === '#' + e.target.id;
        l.classList.toggle('on', on);
        if (on) { var ul = l.closest('ul'); if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: l.offsetLeft - 12, behavior: reduced ? 'auto' : 'smooth' }); }
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(function (l) { var s = document.querySelector(l.getAttribute('href')); if (s) current.observe(s); });

  if (reduced) { root.classList.add('no-motion'); return; }

  // Panels rise into view; charts draw once; key figures count up.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.rv, .draw, [data-count]').forEach(function (el) { io.observe(el); });

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10), start = null;
    el.textContent = '0';
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 1300, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();
