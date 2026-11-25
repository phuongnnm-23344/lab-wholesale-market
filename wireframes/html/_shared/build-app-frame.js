// Builds the shared PC frame (_common-layout.md §1: C-1..C-8) around a screen's content, so each
// wireframes/html/{SCREEN_ID}.html only writes its own .main. Offline, no dependencies.
//
// <div class="browser" data-url="/trades/new" data-crumb="ホーム › 取引 › 相対取引入力・確定"
//      data-user="取引担当 桜 太郎" data-day="2027/08/02(月)" data-net="online|offline"
//      data-menu="ホーム|取引:相対取引入力・確定*,取引一覧|ロット:ロット一覧">
//   <div class="main">…screen content…</div>
// </div>
// data-menu: groups split by "|"; "Group:item,item" or a lone item; "*" marks the active item.
// data-day-locked (any value) appends 「締め済」 to 業務日 (C-2). Omit data-menu for no side menu.
(function () {
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildMenu(spec) {
    var nav = el("nav", "side-menu");
    spec.split("|").forEach(function (group) {
      var parts = group.split(":");
      var items = parts.length > 1 ? parts[1].split(",") : [parts[0]];
      if (parts.length > 1) nav.appendChild(el("div", "grp", parts[0]));
      items.forEach(function (it) {
        var on = /\*$/.test(it);
        nav.appendChild(el("div", "it" + (on ? " on" : ""), it.replace(/\*$/, "")));
      });
    });
    return nav;
  }

  function buildFrame(box) {
    var d = box.dataset;
    var main = box.querySelector(":scope > .main");
    var bar = el("div", "browser-bar", '<span class="dots"></span><span class="url"></span>');
    bar.querySelector(".url").textContent = d.url || "/";
    var day = "業務日 " + (d.day || "2027/08/02(月)") + ("dayLocked" in d ? ' <span class="chip">締め済</span>' : "");
    var net = d.net === "offline" ? '<span class="chip dark">● オフライン</span>' : '<span class="chip">● オンライン</span>';
    var header = el("div", "app-header",
      '<span class="sys-name">水産物卸売市場 業務支援システム</span><span class="crumb"></span>' +
      '<span class="right"><span>' + day + "</span>" + net +
      '<b class="who"></b><span class="btn sm">利用者切替</span><span class="btn sm">ログアウト</span></span>');
    header.querySelector(".crumb").textContent = d.crumb || "";
    header.querySelector(".who").textContent = d.user || "";
    var body = el("div", "app-body");
    if (d.menu) body.appendChild(buildMenu(d.menu)); else body.style.gridTemplateColumns = "1fr";
    if (main) body.appendChild(main);
    box.appendChild(bar);
    box.appendChild(header);
    box.appendChild(body);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".browser[data-url]").forEach(buildFrame);
  });
})();
