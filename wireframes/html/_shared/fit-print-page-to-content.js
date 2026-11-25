// Size the print page to the rendered content (1280px wide, height = content height) so Chrome's
// --print-to-pdf yields exactly one PDF page per screen, like the reference wireframe PDF.
// Offline, no dependencies. Included by every wireframes/html/{SCREEN_ID}.html.
document.addEventListener("DOMContentLoaded", function () {
  var h = Math.ceil(document.documentElement.scrollHeight) + 2;
  var st = document.createElement("style");
  st.textContent = "@page { size: 1280px " + h + "px; margin: 0; }";
  document.head.appendChild(st);
});
