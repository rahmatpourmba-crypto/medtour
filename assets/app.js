(function () {
  "use strict";

  var WHATSAPP = "989141688217";
  var TELEGRAM = "https://t.me/rahmatpour63";

  var dicts = {};
  var current = localStorage.getItem("medtour-lang") || "ar";

  function applyDict(d) {
    document.documentElement.lang = d.meta.lang;
    document.documentElement.dir = d.meta.dir;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = k.split(".").reduce(function (o, p) { return o ? o[p] : undefined; }, d);
      if (v) {
        if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
          el.value = "";
          el.options && [].forEach.call(el.options, function (o) {
            var vv = o.getAttribute("data-i18n") && o.getAttribute("data-i18n").split(".").reduce(function (a, b) { return a ? a[b] : undefined; }, d);
            if (vv) o.textContent = vv;
          });
        } else {
          el.textContent = v;
        }
      }
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      var v = k.split(".").reduce(function (o, p) { return o ? o[p] : undefined; }, d);
      if (v) el.setAttribute("placeholder", v);
    });

    var grid = document.getElementById("whyGrid");
    var items = (d.why && d.why.items) || [];
    grid.innerHTML = items.map(function (it, i) {
      return "<article class='card'><h3>" + it.t + "</h3><p>" + it.d + "</p></article>";
    }).join("");

    var out = [];
    [["ivf", d.services.ivf], ["hair", d.services.hair], ["eye", d.services.eye], ["skin", d.services.skin]]
      .forEach(function (pair) {
        out.push(pair[1].name + " — " + pair[1].desc);
      });
    localStorage.setItem("medtour-specialties", JSON.stringify(out));
  }

  function switchLang(l) {
    current = l;
    localStorage.setItem("medtour-lang", l);
    if (dicts[l]) {
      applyDict(dicts[l]);
    } else {
      fetch("i18n/" + l + ".json")
        .then(function (r) { return r.json(); })
        .then(function (d) { dicts[l] = d; applyDict(d); })
        .catch(function () { console.error("lang load fail " + l); });
    }
  }

  function buildWa() {
    var name = (document.getElementById("fName").value || "").trim();
    var phone = (document.getElementById("fPhone").value || "").trim();
    var note = (document.getElementById("fNote").value || "").trim();
    var spec = document.getElementById("fSpecialty").selectedOptions[0].textContent || "";
    var msg = "MedicalTourism-Lead\nName: " + name + "\nPhone: " + phone + "\nTreatment: " + spec + "\nCase: " + note;
    document.getElementById("waBtn").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    document.getElementById("tgBtn").href = TELEGRAM;
  }

  document.getElementById("langSwitcher").addEventListener("change", function () {
    switchLang(this.value);
  });
  document.getElementById("leadForm").addEventListener("submit", function (e) {
    e.preventDefault();
    buildWa();
    var w = document.getElementById("waBtn");
    var a = document.createElement("a");
    a.href = w.href; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  switchLang(current);
  document.getElementById("langSwitcher").value = current;
})();