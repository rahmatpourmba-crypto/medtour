(function () {
  "use strict";

  var WHATSAPP = "989398928323";
  var TELEGRAM = "https://t.me/rahmatpour63";

  var dicts = {};
  var current = localStorage.getItem("medtour-lang") || "ar";

  function getPath(d, k) {
    return k.split(".").reduce(function (o, p) { return o ? o[p] : undefined; }, d);
  }

  function applyDict(d) {
    document.documentElement.lang = d.meta.lang;
    document.documentElement.dir = d.meta.dir;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.id === "statGrid" || el.id === "whyGrid" || el.id === "stepsGrid") return;
      var k = el.getAttribute("data-i18n");
      var v = getPath(d, k);
      if (v === undefined) return;
      if (el.tagName === "SELECT") {
        [].forEach.call(el.options, function (o) {
          var ov = o.getAttribute("data-i18n");
          var t = ov ? getPath(d, ov) : undefined;
          o.textContent = t || o.textContent;
        });
      } else {
        el.textContent = v;
      }
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var v = getPath(d, el.getAttribute("data-i18n-ph"));
      if (v !== undefined) el.setAttribute("placeholder", v);
    });

    // Stats
    var sGrid = document.getElementById("statGrid");
    (d.stats && d.stats.items || []).forEach(function (it) {
      var el = document.createElement("div");
      el.className = "stat reveal";
      el.innerHTML = "<span class='num'>" + it.n + "</span><div class='lbl'>" + it.t + "</div>";
      sGrid.appendChild(el);
    });

    // Why
    var wGrid = document.getElementById("whyGrid");
    (d.why && d.why.items || []).forEach(function (it, i) {
      var el = document.createElement("article");
      el.className = "card reveal";
      el.innerHTML = "<span class='nu'>" + String(i + 1).padStart(2, "0") + "</span><h3>" + it.t + "</h3><p>" + it.d + "</p>";
      wGrid.appendChild(el);
    });

    // Steps
    var stGrid = document.getElementById("stepsGrid");
    (d.steps && d.steps.items || []).forEach(function (it, i) {
      var el = document.createElement("div");
      el.className = "step reveal";
      el.innerHTML = "<span class='num'>" + (i + 1) + "</span><h3>" + it.t + "</h3><p>" + it.d + "</p>";
      stGrid.appendChild(el);
    });

observeReveal();
  setupVideos();
}

  function setupVideos() {
  document.querySelectorAll('.vcard').forEach(function (card) {
    var video = card.querySelector('video');
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (card.querySelector('.play')) return;
    var playBtn = document.createElement('span');
    playBtn.className = 'play';
    playBtn.innerHTML = '&#9654;';
    card.appendChild(playBtn);
    video.addEventListener('mouseenter', function () { video.play().catch(function () {}); });
    video.addEventListener('mouseleave', function () { video.pause(); video.currentTime = 0; });
    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (video.muted) { video.muted = false; playBtn.innerHTML = '&#10074;&#10074;'; }
      else { video.muted = true; playBtn.innerHTML = '&#9654;'; }
    });
  });
}

function observeReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  function switchLang(l) {
    current = l;
    localStorage.setItem("medtour-lang", l);
    var apply = function (d) {
      dicts[l] = d;
      document.getElementById("statGrid").innerHTML = "";
      document.getElementById("whyGrid").innerHTML = "";
      document.getElementById("stepsGrid").innerHTML = "";
      applyDict(d);
    };
    if (dicts[l]) apply(dicts[l]);
    else fetch("i18n/" + l + ".json").then(function (r) { return r.json(); }).then(apply).catch(function () { console.error("lang load fail " + l); });
  }

  function buildWa() {
    var name = (document.getElementById("fName").value || "").trim();
    var phone = (document.getElementById("fPhone").value || "").trim();
    var note = (document.getElementById("fNote").value || "").trim();
    var sel = document.getElementById("fSpecialty");
    var spec = sel.selectedOptions[0] ? sel.selectedOptions[0].textContent.trim() : "";
    var msg = "MedicalTourism-Lead\nName: " + name + "\nPhone: " + phone + "\nTreatment: " + spec + "\nCase: " + note;
    document.getElementById("waBtn").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    document.getElementById("tgBtn").href = TELEGRAM;
  }

  document.getElementById("langSwitcher").addEventListener("change", function () { switchLang(this.value); });
  document.getElementById("leadForm").addEventListener("submit", function (e) {
    e.preventDefault();
    buildWa();
    var a = document.createElement("a");
    a.href = document.getElementById("waBtn").href;
    a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  switchLang(current);
  document.getElementById("langSwitcher").value = current;
})();