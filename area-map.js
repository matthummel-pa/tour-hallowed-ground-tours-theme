/* Area diorama map — public view + owner admin (concept).
   Sage: ACF options `area_map_places` or CPT `area_place`.
   localStorage overlay is the demo CMS; live theme would persist to WP. */
(function () {
  "use strict";

  var STORAGE = "hg-area-map-v1";
  var ADMIN_GATE = "hg-area-admin";

  var DEFAULTS = {
    version: 1,
    places: [
      { id: "lincoln-square", title: "Lincoln Square", blurb: "The civic heart of downtown Gettysburg. The lantern walk uses a sample downtown meet at the flagpole — tour geography, not a live business address.", category: "downtown", tourHref: "tours.html#after-dark", tourLabel: "Ghosts of Gettysburg Lantern Walk", x: 68, z: 16, elev: 28, visible: true },
      { id: "david-wills-house", title: "David Wills House", blurb: "On the square, where Lincoln finished the Gettysburg Address the night before the cemetery dedication.", category: "downtown", tourHref: "tours.html#after-dark", tourLabel: "Ghosts of Gettysburg Lantern Walk", x: 71, z: 19, elev: 26, visible: true },
      { id: "sample-office", title: "Sample ticket office", blurb: "100 Sample Street — concept placeholder, not a live storefront. Day walking and bus tours in this demo check in here.", category: "meet", tourHref: "book.html", tourLabel: "Book a tour", x: 74, z: 24, elev: 24, visible: true },
      { id: "national-cemetery", title: "Soldiers' National Cemetery", blurb: "South of the square. The dedication ground of the Address, on the rise that became Cemetery Hill.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", x: 62, z: 30, elev: 22, visible: true },
      { id: "mcpherson-ridge", title: "McPherson Ridge", blurb: "Northwest of town. First-day ground: the opening fight on July 1, walked on the Highlights tour.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", x: 34, z: 22, elev: 18, visible: true },
      { id: "seminary-ridge", title: "Seminary Ridge", blurb: "The long western ridge. Confederate line after July 1, marked by the seminary cupola.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", x: 24, z: 48, elev: 20, visible: true },
      { id: "cemetery-ridge", title: "Cemetery Ridge", blurb: "The Union fishhook. Walking tours cross this ridge to tie all three days into one story.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", x: 54, z: 50, elev: 22, visible: true },
      { id: "high-water-mark", title: "High Water Mark", blurb: "The Copse of Trees on Cemetery Ridge — the farthest reach of Pickett's Charge on July 3.", category: "ridge", tourHref: "tours.html", tourLabel: "Pickett's Charge Deluxe Bus Tour", x: 52, z: 56, elev: 24, visible: true },
      { id: "devils-den", title: "Devil's Den", blurb: "Jumbled boulders at the south end of the field. Close fighting on July 2, walked on the hike.", category: "hike", tourHref: "tours.html", tourLabel: "Little Round Top & Devil's Den Hike", x: 46, z: 78, elev: 16, visible: true },
      { id: "little-round-top", title: "Little Round Top", blurb: "The rocky hill Union forces fought to hold on July 2. The hike climbs this ground.", category: "hill", tourHref: "tours.html", tourLabel: "Little Round Top & Devil's Den Hike", x: 58, z: 80, elev: 36, visible: true },
      { id: "big-round-top", title: "Big Round Top", blurb: "The wooded height just south of Little Round Top, commanding the southern end of the field.", category: "hill", tourHref: "tours.html", tourLabel: "Little Round Top & Devil's Den Hike", x: 66, z: 86, elev: 40, visible: true }
    ]
  };

  function clonePlaces(list) {
    return JSON.parse(JSON.stringify(list || []));
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.places)) return parsed;
    } catch (err) { /* demo storage may be blocked */ }
    return null;
  }

  function writeStored(places) {
    localStorage.setItem(STORAGE, JSON.stringify({ version: 1, places: places }));
  }

  function loadPlaces(done) {
    var stored = readStored();
    if (stored) {
      done(clonePlaces(stored.places));
      return;
    }
    fetch("data/area-map.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        done(clonePlaces((data && data.places) || DEFAULTS.places));
      })
      .catch(function () {
        done(clonePlaces(DEFAULTS.places));
      });
  }

  function terrainHTML() {
    return [
      '<div class="diorama-world" data-dio-world>',
      '  <div class="dio-table" aria-hidden="true">',
      '    <div class="dio-leg dio-leg--nw"></div>',
      '    <div class="dio-leg dio-leg--ne"></div>',
      '    <div class="dio-leg dio-leg--sw"></div>',
      '    <div class="dio-leg dio-leg--se"></div>',
      '    <div class="dio-apron"></div>',
      '    <div class="dio-board">',
      '      <div class="dio-grass"></div>',
      '      <div class="dio-wheat"></div>',
      '      <div class="dio-road dio-road--emmitsburg"></div>',
      '      <div class="dio-road dio-road--taneytown"></div>',
      '      <div class="dio-road dio-road--baltimore"></div>',
      '      <div class="dio-patch" data-patch="mcpherson-ridge"></div>',
      '      <div class="dio-patch dio-ridge-west" data-patch="seminary-ridge"><span class="dio-cupola"></span></div>',
      '      <div class="dio-patch dio-ridge-east" data-patch="cemetery-ridge"></div>',
      '      <div class="dio-patch dio-copse" data-patch="high-water-mark"></div>',
      '      <div class="dio-patch dio-cemetery" data-patch="national-cemetery"></div>',
      '      <div class="dio-patch dio-rocks" data-patch="devils-den"><i></i><i></i><i></i><i></i></div>',
      '      <div class="dio-patch dio-hill dio-hill--lrt" data-patch="little-round-top"></div>',
      '      <div class="dio-patch dio-hill dio-hill--brt" data-patch="big-round-top"></div>',
      '      <div class="dio-town" data-patch="lincoln-square">',
      '        <span class="dio-bldg"></span><span class="dio-bldg tall"></span><span class="dio-bldg"></span>',
      '        <span class="dio-bldg wide"></span><span class="dio-flag" data-patch="david-wills-house"></span>',
      '      </div>',
      '      <div class="dio-office" data-patch="sample-office"></div>',
      '      <div class="dio-compass"><b>N</b></div>',
      '      <div class="dio-pins" data-diorama-pins></div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<p class="dio-hint">Drag the table to turn it. Pins stay upright. Keyboard: use the place list.</p>'
    ].join("");
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function catLabel(cat) {
    var map = { ridge: "Ridge", hill: "Hill", downtown: "Downtown", meet: "Meeting point", hike: "Hike ground" };
    return map[cat] || cat;
  }

  function setPose(world, yaw, pitch) {
    world.style.setProperty("--yaw", yaw + "deg");
    world.style.setProperty("--pitch", pitch + "deg");
    world.style.setProperty("--yaw-inv", (-yaw) + "deg");
    world.style.setProperty("--pitch-inv", (-pitch) + "deg");
  }

  function bindOrbit(stage) {
    if (stage.dataset.orbitBound) return;
    stage.dataset.orbitBound = "1";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var yaw = -24;
    var pitch = reduce ? 72 : 60;
    var world = function () { return stage.querySelector("[data-dio-world]"); };
    stage._yaw = yaw;
    stage._pitch = pitch;
    stage._applyPose = function () {
      var w = world();
      if (w) setPose(w, stage._yaw, stage._pitch);
    };
    stage._applyPose();
    if (reduce) return;
    if (stage.getAttribute("data-diorama-mode") === "edit") return;

    var dragging = false;
    var sx = 0;
    var sy = 0;
    var startYaw = yaw;
    var startPitch = pitch;
    stage._yaw = yaw;
    stage._pitch = pitch;
    stage._applyPose = function () {
      var w = world();
      if (w) setPose(w, stage._yaw, stage._pitch);
    };
    stage._applyPose();

    stage.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".dio-pin, button, a, input, select, textarea, [data-diorama-list]")) return;
      dragging = true;
      stage.classList.add("is-dragging");
      sx = e.clientX;
      sy = e.clientY;
      startYaw = yaw;
      startPitch = pitch;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      yaw = startYaw + (e.clientX - sx) * 0.28;
      pitch = Math.max(42, Math.min(78, startPitch + (sy - e.clientY) * 0.18));
      stage._yaw = yaw;
      stage._pitch = pitch;
      stage._applyPose();
    });
    var stop = function () {
      dragging = false;
      stage.classList.remove("is-dragging");
    };
    stage.addEventListener("pointerup", stop);
    stage.addEventListener("pointercancel", stop);
  }

  function highlight(root, id) {
    root.querySelectorAll("[data-patch]").forEach(function (el) {
      el.classList.toggle("is-lit", el.getAttribute("data-patch") === id);
    });
    root.querySelectorAll(".dio-pin").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-id") === id);
    });
    root.querySelectorAll("[data-diorama-list] button").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-id") === id);
    });
  }

  function fillDetail(panel, place) {
    if (!panel) return;
    if (!place) {
      panel.innerHTML = "<p class=\"lede\">Choose a pin on the table, or a place in the list, to see which tour covers that ground.</p>";
      return;
    }
    panel.innerHTML =
      "<span class=\"eyebrow\">" + esc(catLabel(place.category)) + "</span>" +
      "<h3>" + esc(place.title) + "</h3>" +
      "<p>" + esc(place.blurb) + "</p>" +
      (place.tourHref ? "<p><a class=\"btn btn-primary btn-sm\" href=\"" + esc(place.tourHref) + "\">" + esc(place.tourLabel || "See the tour") + "</a></p>" : "");
  }

  function renderView(stage, places, opts) {
    opts = opts || {};
    var mode = stage.getAttribute("data-diorama-mode") || "view";
    stage.innerHTML = terrainHTML();
    var world = stage.querySelector("[data-dio-world]");
    var pinBox = stage.querySelector("[data-diorama-pins]");
    var list = document.querySelector("[data-diorama-list]");
    var detail = document.querySelector("[data-diorama-detail]");
    var visible = places.filter(function (p) { return p.visible !== false; });

    pinBox.innerHTML = "";
    visible.forEach(function (place) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dio-pin cat-" + place.category;
      btn.setAttribute("data-id", place.id);
      btn.style.setProperty("--x", place.x);
      btn.style.setProperty("--z", place.z);
      btn.style.setProperty("--elev", place.elev);
      btn.innerHTML = "<span class=\"dio-stem\"></span><span class=\"dio-head\"></span><span class=\"dio-label\">" + esc(place.title) + "</span>";
      btn.setAttribute("aria-label", place.title);
      pinBox.appendChild(btn);
    });

    if (list) {
      list.innerHTML = "";
      visible.forEach(function (place) {
        var li = document.createElement("li");
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-id", place.id);
        b.innerHTML = "<b>" + esc(place.title) + "</b><span>" + esc(catLabel(place.category)) + "</span>";
        li.appendChild(b);
        list.appendChild(li);
      });
    }

    var select = function (id) {
      var place = places.filter(function (p) { return p.id === id; })[0];
      highlight(document, id);
      fillDetail(detail, place);
      if (opts.onSelect) opts.onSelect(place);
    };

    stage._hgSelect = select;
    if (!stage.dataset.selectBound) {
      stage.dataset.selectBound = "1";
      stage.addEventListener("click", function (e) {
        var pin = e.target.closest(".dio-pin");
        if (pin && stage._hgSelect) stage._hgSelect(pin.getAttribute("data-id"));
      });
    }
    if (list && !list.dataset.selectBound) {
      list.dataset.selectBound = "1";
      list.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-id]");
        var host = document.querySelector("[data-diorama]");
        if (b && host && host._hgSelect) host._hgSelect(b.getAttribute("data-id"));
      });
    }

    bindOrbit(stage);
    if (stage._applyPose) stage._applyPose();
    else if (world) setPose(world, -24, 60);
    if (visible[0] && mode === "view" && !opts.skipAuto) select(visible[0].id);
    return { select: select, world: world };
  }

  function slugify(str) {
    return String(str || "place")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "place";
  }

  function uniqueId(base, places) {
    var id = base;
    var n = 2;
    var ids = places.map(function (p) { return p.id; });
    while (ids.indexOf(id) !== -1) {
      id = base + "-" + n;
      n += 1;
    }
    return id;
  }

  function initView() {
    var stage = document.querySelector("[data-diorama][data-diorama-mode='view']");
    if (!stage) return;
    loadPlaces(function (places) {
      renderView(stage, places);
    });
  }

  function initAdmin() {
    var gate = document.querySelector("[data-admin-gate]");
    var app = document.querySelector("[data-admin-app]");
    if (!gate || !app) return;

    var unlocked = sessionStorage.getItem(ADMIN_GATE) === "1";
    var show = function (on) {
      gate.hidden = on;
      app.hidden = !on;
    };
    show(unlocked);

    var enter = document.getElementById("adminEnter");
    if (enter) {
      enter.addEventListener("click", function () {
        sessionStorage.setItem(ADMIN_GATE, "1");
        show(true);
      });
    }

    var stage = document.querySelector("[data-diorama][data-diorama-mode='edit']");
    var form = document.getElementById("placeForm");
    var status = document.querySelector("[data-admin-status]");
    var setStatus = function (msg) { if (status) status.textContent = msg || ""; };

    loadPlaces(function (places) {
      var selectedId = places[0] && places[0].id;
      var api;

      var paint = function () {
        api = renderView(stage, places, {
          skipAuto: true,
          onSelect: function (place) {
            selectedId = place.id;
            fillForm(place);
            renderRows();
          }
        });
        if (selectedId) highlight(document, selectedId);
        renderRows();
      };

      function current() {
        return places.filter(function (p) { return p.id === selectedId; })[0];
      }

      function fillForm(place) {
        if (!form || !place) return;
        form.title.value = place.title;
        form.blurb.value = place.blurb;
        form.category.value = place.category;
        form.tourHref.value = place.tourHref || "";
        form.tourLabel.value = place.tourLabel || "";
        form.x.value = place.x;
        form.z.value = place.z;
        form.elev.value = place.elev;
        form.visible.checked = place.visible !== false;
      }

      function readForm() {
        var place = current();
        if (!place) return;
        place.title = form.title.value.trim() || place.title;
        place.blurb = form.blurb.value.trim();
        place.category = form.category.value;
        place.tourHref = form.tourHref.value.trim();
        place.tourLabel = form.tourLabel.value.trim();
        place.x = Number(form.x.value);
        place.z = Number(form.z.value);
        place.elev = Number(form.elev.value);
        place.visible = form.visible.checked;
      }

      function renderRows() {
        var tbody = document.querySelector("[data-place-rows]");
        if (!tbody) return;
        tbody.innerHTML = "";
        places.forEach(function (place) {
          var tr = document.createElement("tr");
          if (place.id === selectedId) tr.className = "is-selected";
          tr.innerHTML =
            "<td><button type=\"button\" data-pick=\"" + esc(place.id) + "\">" + esc(place.title) + "</button></td>" +
            "<td>" + esc(catLabel(place.category)) + "</td>" +
            "<td>" + Math.round(place.x) + " / " + Math.round(place.z) + "</td>" +
            "<td>" + (place.visible !== false ? "On" : "Off") + "</td>";
          tbody.appendChild(tr);
        });
      }

      document.addEventListener("click", function (e) {
        var pick = e.target.closest("[data-pick]");
        if (pick) {
          selectedId = pick.getAttribute("data-pick");
          api.select(selectedId);
          fillForm(current());
          renderRows();
        }
      });

      stage.addEventListener("click", function (e) {
        if (!e.target.closest(".dio-board")) return;
        if (e.target.closest(".dio-pin")) return;
        var board = stage.querySelector(".dio-board");
        var rect = board.getBoundingClientRect();
        /* Approximate placement from screen click; owner can nudge with number fields. */
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var z = ((e.clientY - rect.top) / rect.height) * 100;
        var place = current();
        if (!place) return;
        place.x = Math.max(4, Math.min(96, x));
        place.z = Math.max(4, Math.min(96, z));
        fillForm(place);
        paint();
        setStatus("Moved “" + place.title + "” on the table. Save to keep it.");
      });

      form.addEventListener("input", function () {
        readForm();
        paint();
      });
      form.addEventListener("change", function () {
        readForm();
        paint();
      });

      document.getElementById("saveMap").addEventListener("click", function () {
        readForm();
        writeStored(places);
        setStatus("Saved on this browser. The Area page will read these pins until you reset.");
        paint();
      });

      document.getElementById("resetMap").addEventListener("click", function () {
        localStorage.removeItem(STORAGE);
        places = clonePlaces(DEFAULTS.places);
        selectedId = places[0].id;
        setStatus("Reset to the default field. Save if you want this to stick.");
        paint();
        fillForm(current());
      });

      document.getElementById("addPlace").addEventListener("click", function () {
        var id = uniqueId(slugify("new-place"), places);
        var place = {
          id: id,
          title: "New place",
          blurb: "Short, specific copy for this pin.",
          category: "ridge",
          tourHref: "tours.html",
          tourLabel: "See tours",
          x: 50,
          z: 50,
          elev: 20,
          visible: true
        };
        places.push(place);
        selectedId = id;
        paint();
        fillForm(place);
        setStatus("Added a pin. Rename it, place it, then save.");
      });

      document.getElementById("deletePlace").addEventListener("click", function () {
        if (places.length < 2) {
          setStatus("Keep at least one place on the table.");
          return;
        }
        places = places.filter(function (p) { return p.id !== selectedId; });
        selectedId = places[0].id;
        paint();
        fillForm(current());
        setStatus("Removed that pin. Save to keep the change.");
      });

      document.getElementById("exportMap").addEventListener("click", function () {
        readForm();
        var blob = new Blob([JSON.stringify({ version: 1, places: places }, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "area-map.json";
        a.click();
        setStatus("Downloaded JSON. In Sage, this maps to an ACF export / theme option.");
      });

      paint();
      fillForm(current());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initView();
      initAdmin();
    });
  } else {
    initView();
    initAdmin();
  }
})();
