/* IQ Finance — site behaviour (v3). Kept deliberately small.
   Without JavaScript, or with "reduce motion" on, everything is shown in its final state. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  // Close the mobile menu after choosing a section.
  document.querySelectorAll('.menu-panel a').forEach(function (a) {
    a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
  });

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) { root.classList.add('no-motion'); return; }

  // The main analysis chart draws itself once, the first time it is seen.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.draw').forEach(function (el) { io.observe(el); });
})();
