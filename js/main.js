/* PLANTCARE — лендинг: меню, компас, поиск по базе, анимации */
(function () {
  "use strict";
  var PLANTS = window.PLANTS || [];

  /* ---------- Ссылка на анкету ---------- */
  var SURVEY_URL = "https://forms.gle/wRgu3GPD23EedmZf6";
  document.querySelectorAll("[data-survey]").forEach(function (a) {
    if (SURVEY_URL) { a.href = SURVEY_URL; a.target = "_blank"; a.rel = "noopener"; }
    else { a.href = "#survey"; a.removeAttribute("target"); }
  });

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

  /* ---------- Компас: та же логика, что в SunMath.kt ---------- */
  var DIRS = [
    { id: "N",  short: "С",  title: "Север",       az: 0 },
    { id: "NE", short: "СВ", title: "Северо-восток", az: 45 },
    { id: "E",  short: "В",  title: "Восток",      az: 90 },
    { id: "SE", short: "ЮВ", title: "Юго-восток",  az: 135 },
    { id: "S",  short: "Ю",  title: "Юг",          az: 180 },
    { id: "SW", short: "ЮЗ", title: "Юго-запад",   az: 225 },
    { id: "W",  short: "З",  title: "Запад",       az: 270 },
    { id: "NW", short: "СЗ", title: "Северо-запад", az: 315 }
  ];
  var VERDICT = {
    S:  ["DIRECT",  "Самое солнечное окно: солнце светит большую часть дня. Летом в полдень может обжигать нежные листья."],
    SE: ["DIRECT",  "Много солнца с утра до обеда. Хорошо подходит почти всем растениям, кроме тенелюбивых."],
    SW: ["DIRECT",  "Солнце после обеда и вечером, самое жаркое время. Нежным растениям нужна лёгкая тюль."],
    E:  ["BRIGHT",  "Мягкое утреннее солнце, потом рассеянный свет. Отличное окно для большинства комнатных растений."],
    W:  ["BRIGHT",  "Солнце во второй половине дня, ярко и тепло. Летом вечером бывает жарко."],
    NE: ["PARTIAL", "Немного солнца рано утром, остальное время рассеянный свет. Подходит для полутени."],
    NW: ["PARTIAL", "Немного вечернего солнца летом, в остальное время рассеянный свет."],
    N:  ["SHADE",   "Прямого солнца почти не бывает. Подходит теневыносливым растениям, светолюбивым нужна досветка."]
  };
  var LIGHT_NAME = { DIRECT: "Прямое солнце", BRIGHT: "Яркий рассеянный", PARTIAL: "Полутень", SHADE: "Тень" };

  function fromAzimuth(a) {
    a = ((a % 360) + 360) % 360;
    return DIRS[Math.floor((a + 22.5) / 45) % 8];
  }

  var dial = document.getElementById("dial");
  var needle = document.getElementById("needle");
  var hemi = document.getElementById("hemi");
  var current = DIRS[3];
  var needleAngle = current.az;

  DIRS.forEach(function (d) {
    var b = document.createElement("button");
    b.className = "dir-btn";
    b.type = "button";
    b.textContent = d.short;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", d.title);
    var r = 41, rad = (d.az - 90) * Math.PI / 180;
    b.style.left = (50 + r * Math.cos(rad)) + "%";
    b.style.top = (50 + r * Math.sin(rad)) + "%";
    b.addEventListener("click", function () { select(d); });
    d.el = b;
    dial.appendChild(b);
  });

  // стрелки на клавиатуре переключают стороны
  dial.addEventListener("keydown", function (e) {
    var i = DIRS.indexOf(current);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") i = (i + 1) % 8;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") i = (i + 7) % 8;
    else return;
    e.preventDefault();
    select(DIRS[i]);
    DIRS[i].el.focus();
  });
  hemi.addEventListener("change", function () { render(); });

  function select(d) {
    // поворачиваем стрелку по кратчайшему пути
    var diff = ((d.az - needleAngle) % 360 + 540) % 360 - 180;
    needleAngle += diff;
    current = d;
    render();
  }

  function render() {
    DIRS.forEach(function (d) {
      var on = d === current;
      d.el.setAttribute("aria-checked", String(on));
      d.el.tabIndex = on ? 0 : -1;
    });
    needle.style.transform = "rotate(" + needleAngle + "deg)";

    var effective = hemi.checked ? fromAzimuth(180 - current.az) : current;
    var v = VERDICT[effective.id];
    var light = v[0];
    document.getElementById("v-dir").textContent = current.title;
    var badge = document.getElementById("v-light");
    badge.textContent = LIGHT_NAME[light];
    badge.setAttribute("data-l", light);
    document.getElementById("v-text").textContent = v[1];

    var fit = PLANTS.filter(function (p) { return p.light.indexOf(light) !== -1; });
    document.getElementById("v-count").textContent = fit.length;
    var ul = document.getElementById("v-plants");
    ul.innerHTML = "";
    fit.forEach(function (p, i) {
      var li = document.createElement("li");
      li.textContent = p.nameRu;
      li.style.animationDelay = Math.min(i * 18, 500) + "ms";
      ul.appendChild(li);
    });
  }
  render();

  /* ---------- Библиотека: поиск и фильтр ---------- */
  var CACTI = ["aloe_vera", "crassula", "echeveria", "haworthia", "lithops", "echinocactus", "opuntia", "agave", "sansevieria_cylindrica"];
  var FLOWERS = ["spathiphyllum", "phalaenopsis", "anthurium", "hibiscus", "saintpaulia", "gloxinia", "begonia", "pelargonium",
    "cyclamen", "kalanchoe", "hoya", "passiflora", "medinilla", "achimenes", "streptocarpus", "clivia", "strelitzia"];
  var LIGHT_ICON = { DIRECT: "☀️", BRIGHT: "🌤", PARTIAL: "⛅", SHADE: "☁️" };

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
