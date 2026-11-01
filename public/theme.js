// Runs in <head> before first paint so a saved theme never flashes. "auto" stores nothing.
(function () {
  try {
    var t = localStorage.getItem("es-theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch (_) {}
})();
