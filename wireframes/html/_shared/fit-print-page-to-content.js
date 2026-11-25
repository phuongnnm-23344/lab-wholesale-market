// Size the print page to the rendered content (1280px wide, height = content height) so Chrome's
// --print-to-pdf yields exactly one PDF page per screen, like the reference wireframe PDF.
// "?variant=A" keeps only the title + the first .variant (variant A) — used by
// scripts/render-wireframes.py --spec for the BM-51 spec image. Offline, no dependencies.
// Included by every wireframes/html/{SCREEN_ID}.html, after build-app-frame.js.
document.addEventListener("DOMContentLoaded", function () {
  if (/[?&]variant=A\b/.test(location.search)) {
    var page = document.querySelector(".wf-page");
    var first = page && page.querySelector(".variant");
    if (first) {
      Array.prototype.slice.call(page.children).forEach(function (c) {
        if (c !== first && !c.classList.contains("wf-title")) page.removeChild(c);
      });
      first.style.marginBottom = "0";
    }
  }
  var h = Math.ceil(document.documentElement.scrollHeight) + 2;
  var st = document.createElement("style");
  st.textContent = "@page { size: 1280px " + h + "px; margin: 0; }";
  document.head.appendChild(st);
});
