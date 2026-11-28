/* PLANTCARE — лендинг: меню, поиск по базе, анимации */
(function () {
  "use strict";
  var PLANTS = window.PLANTS || [];

  /* ---------- Шапка: фон при скролле и мобильное меню ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-scrolled", open || window.scrollY > 20);
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Библиотека: поиск и фильтр ---------- */
  var CACTI = ["aloe_vera", "crassula", "echeveria", "haworthia", "lithops", "echinocactus", "opuntia", "agave", "sansevieria_cylindrica"];
  var FLOWERS = ["spathiphyllum", "phalaenopsis", "anthurium", "hibiscus", "saintpaulia", "gloxinia", "begonia", "pelargonium",
    "cyclamen", "kalanchoe", "hoya", "passiflora", "medinilla", "achimenes", "streptocarpus", "clivia", "strelitzia"];
  var LIGHT_ICON = { DIRECT: "☀️", BRIGHT: "🌤", PARTIAL: "⛅", SHADE: "☁️" };
  var LIGHT_NAME = { DIRECT: "Прямое солнце", BRIGHT: "Яркий рассеянный", PARTIAL: "Полутень", SHADE: "Тень" };

  function norm(s) { return String(s || "").toLowerCase().replace(/ё/g, "е").trim(); }
  function icon(p) { return CACTI.indexOf(p.id) !== -1 ? "🌵" : FLOWERS.indexOf(p.id) !== -1 ? "🌸" : "🌿"; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function row(label, value) {
    var p = el("p");
    p.appendChild(el("b", null, label + ": "));
    p.appendChild(document.createTextNode(value));
    return p;
  }

  var grid = document.getElementById("plants");
  var empty = document.getElementById("plants-empty");
  var moreBtn = document.getElementById("more");
  var q = document.getElementById("q");
  var filterLight = "ALL";
  var PAGE = 9, shown = PAGE;

  function card(p) {
    var b = el("button", "plant");
    b.type = "button";
    b.setAttribute("aria-expanded", "false");
    var top = el("div", "plant__top");
    top.appendChild(el("span", "plant__pic", icon(p)));
    var names = el("div");
    names.appendChild(el("h3", null, p.nameRu));
    names.appendChild(el("p", "plant__latin", p.latin));
    top.appendChild(names);
    b.appendChild(top);

    var meta = el("div", "plant__meta");
    meta.appendChild(el("span", "pill", "💧 летом раз в " + p.waterSummerDays + " дн."));
    meta.appendChild(el("span", "pill", "❄️ зимой раз в " + p.waterWinterDays + " дн."));
    p.light.forEach(function (l) { meta.appendChild(el("span", "pill pill--sun", LIGHT_ICON[l] + " " + LIGHT_NAME[l])); });
    b.appendChild(meta);

    var desc = el("div", "plant__desc");
    desc.appendChild(el("p", null, p.description));
    desc.appendChild(row("Свет", p.lightNote));
    desc.appendChild(row("Полив", p.wateringNote));
    desc.appendChild(row("Влажность", p.humidity));
    desc.appendChild(row("Температура", p.temperature));
    if (p.toxicity) desc.appendChild(row("Токсичность", p.toxicity));
    b.appendChild(desc);

    var more = el("p", "plant__more", "Подробнее об уходе ↓");
    b.appendChild(more);
    b.addEventListener("click", function () {
      var open = b.classList.toggle("is-open");
      b.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "Свернуть ↑" : "Подробнее об уходе ↓";
    });
    return b;
  }

  function renderPlants() {
    var s = norm(q.value);
    var list = PLANTS.filter(function (p) {
      var okLight = filterLight === "ALL" || p.light.indexOf(filterLight) !== -1;
      var okText = !s || [p.nameRu, p.nameEn, p.latin].some(function (n) { return norm(n).indexOf(s) !== -1; });
      return okLight && okText;
    });
    grid.innerHTML = "";
    list.slice(0, shown).forEach(function (p) { grid.appendChild(card(p)); });
    empty.hidden = list.length !== 0;
    moreBtn.parentElement.hidden = list.length <= shown;
    moreBtn.textContent = "Показать ещё (" + (list.length - shown) + ")";
  }

  q.addEventListener("input", function () { shown = PAGE; renderPlants(); });
  document.querySelectorAll(".filter").forEach(function (f) {
    f.addEventListener("click", function () {
      document.querySelectorAll(".filter").forEach(function (x) { x.classList.remove("is-active"); });
      f.classList.add("is-active");
      filterLight = f.getAttribute("data-light");
      shown = PAGE;
      renderPlants();
    });
  });
  moreBtn.addEventListener("click", function () { shown += PAGE; renderPlants(); });
  renderPlants();

  /* ---------- Появление блоков при прокрутке ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (i * 90) + "ms";
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (it) { io.observe(it); });
  } else {
    items.forEach(function (it) { it.classList.add("is-visible"); });
  }
})();
