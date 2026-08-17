/* Area diorama map — public view + owner admin (concept).
   Sage: ACF options `area_map_places` or CPT `area_place`.
   localStorage overlay is the demo CMS; live theme would persist to WP. */
(function () {
  "use strict";

  var STORAGE = "hg-area-map-v1";
  var MAPS_STORAGE = "hg-maps-config-v1";
  var ADMIN_GATE = "hg-area-admin";
  var PIN_COLOR = { ridge: "#e0be72", hill: "#7eb56a", hike: "#7eb56a", downtown: "#c9a06a", meet: "#d36a3a" };
  var DEFAULT_MAPS = {
    apiKey: "",
    mapId: "",
    center: { lat: 39.812, lng: -77.236, altitude: 40 },
    tilt: 58,
    heading: 20,
    range: 3800,
    mode: "HYBRID"
  };

  var DEFAULTS = {
    version: 1,
    places: [
      { id: "lincoln-square", title: "Lincoln Square", blurb: "The civic heart of downtown Gettysburg. The lantern walk uses a sample downtown meet at the flagpole — tour geography, not a live business address.", category: "downtown", tourHref: "tours.html#after-dark", tourLabel: "Ghosts of Gettysburg Lantern Walk", lat: 39.83092, lng: -77.23114, x: 68, z: 16, elev: 28, visible: true },
      { id: "david-wills-house", title: "David Wills House", blurb: "On the square, where Lincoln finished the Gettysburg Address the night before the cemetery dedication.", category: "downtown", tourHref: "tours.html#after-dark", tourLabel: "Ghosts of Gettysburg Lantern Walk", lat: 39.83055, lng: -77.23095, x: 71, z: 19, elev: 26, visible: true },
      { id: "sample-office", title: "Sample ticket office", blurb: "100 Sample Street — concept placeholder, not a live storefront. Day walking and bus tours in this demo check in here.", category: "meet", tourHref: "book.html", tourLabel: "Book a tour", lat: 39.8292, lng: -77.2314, x: 74, z: 24, elev: 24, visible: true },
      { id: "national-cemetery", title: "Soldiers' National Cemetery", blurb: "South of the square. The dedication ground of the Address, on the rise that became Cemetery Hill.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", lat: 39.82155, lng: -77.23135, x: 62, z: 30, elev: 22, visible: true },
      { id: "mcpherson-ridge", title: "McPherson Ridge", blurb: "Northwest of town. First-day ground: the opening fight on July 1, walked on the Highlights tour.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", lat: 39.8385, lng: -77.2508, x: 34, z: 22, elev: 18, visible: true },
      { id: "seminary-ridge", title: "Seminary Ridge", blurb: "The long western ridge. Confederate line after July 1, marked by the seminary cupola.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", lat: 39.8198, lng: -77.2448, x: 24, z: 48, elev: 20, visible: true },
      { id: "cemetery-ridge", title: "Cemetery Ridge", blurb: "The Union fishhook. Walking tours cross this ridge to tie all three days into one story.", category: "ridge", tourHref: "tours.html#historical", tourLabel: "Battlefield Highlights Walking Tour", lat: 39.8138, lng: -77.2348, x: 54, z: 50, elev: 22, visible: true },
      { id: "high-water-mark", title: "High Water Mark", blurb: "The Copse of Trees on Cemetery Ridge — the farthest reach of Pickett's Charge on July 3.", category: "ridge", tourHref: "tours.html", tourLabel: "Pickett's Charge Deluxe Bus Tour", lat: 39.81248, lng: -77.23555, x: 52, z: 56, elev: 24, visible: true },
      { id: "devils-den", title: "Devil's Den", blurb: "Jumbled boulders at the south end of the field. Close fighting on July 2, walked on the hike.", category: "hike", tourHref: "tours.html", tourLabel: "Little Round Top & Devil's Den Hike", lat: 39.7915, lng: -77.2424, x: 46, z: 78, elev: 16, visible: true },
      { id: "little-round-top", title: "Little Round Top", blurb: "The rocky hill Union forces fought to hold on July 2. The hike climbs this ground.", category: "hill", tourHref: "tours.html", tourLabel: "Little Round Top & Devil's Den Hike", lat: 39.7914, lng: -77.237, x: 58, z: 80, elev: 36, visible: true },
      { id: "big-round-top", title: "Big Round Top", blurb: "The wooded height just south of Little Round Top, commanding the southern end of the field.", category: "hill", tourHref: "tours.html", tourLabel: "Little Round Top & Devil's Den Hike", lat: 39.7872, lng: -77.2378, x: 66, z: 86, elev: 40, visible: true }
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

  function readMapsStored() {
    try {
      var raw = localStorage.getItem(MAPS_STORAGE);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (err) { /* ignore */ }
    return null;
  }

  function writeMapsStored(cfg) {
    var copy = JSON.parse(JSON.stringify(cfg || {}));
    localStorage.setItem(MAPS_STORAGE, JSON.stringify(copy));
  }

  function mergeMaps(base, extra) {
    var out = JSON.parse(JSON.stringify(base || DEFAULT_MAPS));
    extra = extra || {};
    Object.keys(extra).forEach(function (k) {
      if (k === "center" && extra.center) {
        out.center = Object.assign({}, out.center, extra.center);
      } else if (extra[k] !== undefined && extra[k] !== null && extra[k] !== "") {
        out[k] = extra[k];
      }
    });
    return out;
  }

  function loadMapsConfig(done) {
    var stored = readMapsStored();
    fetch("data/maps-config.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : {}; })
      .then(function (fileCfg) {
        var cfg = mergeMaps(DEFAULT_MAPS, fileCfg);
        cfg = mergeMaps(cfg, stored);
        if (!cfg.apiKey && window.HG_GOOGLE_MAPS_KEY) cfg.apiKey = window.HG_GOOGLE_MAPS_KEY;
        done(cfg);
      })
      .catch(function () {
        var cfg = mergeMaps(DEFAULT_MAPS, stored);
        if (!cfg.apiKey && window.HG_GOOGLE_MAPS_KEY) cfg.apiKey = window.HG_GOOGLE_MAPS_KEY;
        done(cfg);
      });
  }

  var mapsBootstrapped = false;
  function bootstrapMaps(apiKey) {
    if (window.google && google.maps && google.maps.importLibrary) {
      return google.maps.importLibrary("maps3d");
    }
    if (mapsBootstrapped) {
      return google.maps.importLibrary("maps3d");
    }
    mapsBootstrapped = true;
    (function (g) {
      var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
      b = b[c] || (b[c] = {});
      var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(), u = function () {
        return h || (h = new Promise(async function (f, n) {
          await (a = m.createElement("script"));
          e.set("libraries", [...r] + "");
          for (k in g) e.set(k.replace(/[A-Z]/g, function (t) { return "_" + t[0].toLowerCase(); }), g[k]);
          e.set("callback", c + ".maps." + q);
          a.src = "https://maps.googleapis.com/maps/api/js?" + e;
          d[q] = f;
          a.onerror = function () { h = n(Error(p + " could not load.")); };
          m.head.append(a);
        }));
      };
      d[l] ? console.warn(p + " only loads once.") : d[l] = function (f) {
        r.add(f);
        return u().then(function () { return d[l](f); });
      };
    })({ key: apiKey, v: "beta" });
    return google.maps.importLibrary("maps3d");
  }

  function cameraFor(place, cfg, close) {
    var lat = Number(place && place.lat);
    var lng = Number(place && place.lng);
    if (!isFinite(lat) || !isFinite(lng)) {
      lat = cfg.center.lat;
      lng = cfg.center.lng;
    }
    return {
      center: { lat: lat, lng: lng, altitude: close ? 30 : (cfg.center.altitude || 40) },
      tilt: cfg.tilt,
      heading: cfg.heading,
      range: close ? 900 : cfg.range
    };
  }

  function fillList(places, opts) {
    var list = document.querySelector("[data-diorama-list]");
    var visible = places.filter(function (p) { return p.visible !== false; });
    if (!list) return visible;
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
    if (!list.dataset.selectBound) {
      list.dataset.selectBound = "1";
      list.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-id]");
        var host = document.querySelector("[data-diorama]");
        if (btn && host && host._hgSelect) host._hgSelect(btn.getAttribute("data-id"));
      });
    }
    return visible;
  }

  function mountGoogle(stage, places, opts, cfg, done) {
    opts = opts || {};
    stage.classList.add("is-google");
    stage.innerHTML = "<div class=\"gmp-host\" data-gmp-host></div><p class=\"dio-hint\">Real Gettysburg roads and buildings from Google Maps 3D (HYBRID). Drag to orbit. Click a pin or the list.</p>";
    var host = stage.querySelector("[data-gmp-host]");
    var detail = document.querySelector("[data-diorama-detail]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    bootstrapMaps(cfg.apiKey).then(function (lib) {
      return google.maps.importLibrary("marker").then(function (markerLib) {
        return { lib: lib, PinElement: markerLib && markerLib.PinElement };
      }).catch(function () {
        return { lib: lib, PinElement: null };
      });
    }).then(function (pack) {
      var lib = pack.lib;
      var PinElement = pack.PinElement;
      var Map3DElement = lib.Map3DElement;
      var MapMode = lib.MapMode;
      var Marker3DInteractiveElement = lib.Marker3DInteractiveElement;
      var map = new Map3DElement({
        center: cfg.center,
        range: cfg.range,
        tilt: cfg.tilt,
        heading: cfg.heading,
        mode: (MapMode && MapMode[cfg.mode]) || cfg.mode || "HYBRID"
      });
      try { map.defaultUIHidden = true; } catch (err) { /* older preview builds */ }
      if (cfg.mapId) map.mapId = cfg.mapId;
      host.appendChild(map);
      stage._gmap = map;
      stage._gmarkers = [];

      var select = function (id, fly) {
        var place = places.filter(function (p) { return p.id === id; })[0];
        if (!place) return;
        highlight(document, id);
        fillDetail(detail, place);
        if (fly !== false && map.flyCameraTo && !reduce) {
          map.flyCameraTo({ endCamera: cameraFor(place, cfg, true), durationMillis: 1400 });
        } else if (fly !== false) {
          var cam = cameraFor(place, cfg, true);
          map.center = cam.center;
          map.range = cam.range;
          map.tilt = cam.tilt;
          map.heading = cam.heading;
        }
        if (opts.onSelect) opts.onSelect(place);
      };

      var skipMapClick = false;
      function syncMarkers(nextPlaces) {
        places = nextPlaces;
        (stage._gmarkers || []).forEach(function (m) { if (m.remove) m.remove(); });
        stage._gmarkers = [];
        var visible = fillList(places, opts);
        visible.forEach(function (place) {
          if (!isFinite(Number(place.lat)) || !isFinite(Number(place.lng))) return;
          var marker = new Marker3DInteractiveElement({
            position: { lat: Number(place.lat), lng: Number(place.lng), altitude: 8 },
            altitudeMode: "RELATIVE_TO_GROUND",
            extruded: true,
            label: place.title,
            title: place.title
          });
          marker.dataset.id = place.id;
          if (PinElement) {
            try {
              var pin = new PinElement({
                background: PIN_COLOR[place.category] || "#e0be72",
                borderColor: "#14100a",
                glyphColor: "#14100a"
              });
              marker.append(pin);
            } catch (err) { /* default glyph */ }
          }
          marker.addEventListener("gmp-click", function () {
            skipMapClick = true;
            select(place.id);
            setTimeout(function () { skipMapClick = false; }, 0);
          });
          map.append(marker);
          stage._gmarkers.push(marker);
        });
      }

      syncMarkers(places);
      stage._hgSelect = select;
      stage._refreshPlaces = syncMarkers;

      if (opts.onMapClick) {
        map.addEventListener("gmp-click", function (ev) {
          if (skipMapClick) return;
          var pos = (ev && (ev.position || (ev.detail && ev.detail.position))) || null;
          if (pos) opts.onMapClick(pos);
        });
      }

      if (!opts.skipAuto && places[0]) select(places[0].id, false);
      if (done) done({ select: select });
    }).catch(function () {
      stage.classList.remove("is-google");
      var cssApi = mountCss(stage, places, opts);
      var banner = document.createElement("p");
      banner.className = "maps-key-banner";
      banner.textContent = "Google Maps 3D could not load. Check the Maps JavaScript API key in owner admin (enable Maps JavaScript API, restrict by referrer).";
      stage.prepend(banner);
      if (done) done(cssApi);
    });
  }

  function hydratePlaces(list) {
    var byId = {};
    DEFAULTS.places.forEach(function (p) { byId[p.id] = p; });
    return (list || []).map(function (p) {
      return Object.assign({}, byId[p.id] || {}, p);
    });
  }

  function loadPlaces(done) {
    var stored = readStored();
    if (stored) {
      done(hydratePlaces(stored.places));
      return;
    }
    fetch("data/area-map.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        done(hydratePlaces((data && data.places) || DEFAULTS.places));
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

  function mountCss(stage, places, opts) {
    opts = opts || {};
    stage.classList.remove("is-google");
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

  function renderView(stage, places, opts, done) {
    opts = opts || {};
    var api = {
      select: function (id) {
        if (stage._hgSelect) stage._hgSelect(id);
        else stage._pendingSelect = id;
      }
    };
    loadMapsConfig(function (cfg) {
      var finish = function (real) {
        if (real && real.select) api.select = real.select;
        if (stage._pendingSelect && api.select) api.select(stage._pendingSelect);
        if (done) done(api, cfg);
      };
      if (cfg.apiKey) {
        if (stage._gmap && stage._refreshPlaces) {
          stage._refreshPlaces(places);
          finish({ select: stage._hgSelect });
          return;
        }
        mountGoogle(stage, places, opts, cfg, finish);
      } else {
        var cssApi = mountCss(stage, places, opts);
        if (!stage.querySelector(".maps-key-banner")) {
          var banner = document.createElement("p");
          banner.className = "maps-key-banner";
          banner.innerHTML = "Add a Google Maps JavaScript API key in <a href=\"admin.html#area-map\">owner admin</a> to load real Gettysburg roads and buildings.";
          stage.prepend(banner);
        }
        finish(cssApi);
      }
    });
    return api;
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
      var mapsCfg;

      var onMapClick = function (pos) {
        var place = current();
        if (!place || pos.lat == null || pos.lng == null) return;
        place.lat = Number(pos.lat);
        place.lng = Number(pos.lng);
        fillForm(place);
        if (stage._refreshPlaces) stage._refreshPlaces(places);
        setStatus("Moved “" + place.title + "” to " + Number(place.lat).toFixed(5) + ", " + Number(place.lng).toFixed(5) + ". Save to keep it.");
      };

      var paint = function () {
        api = renderView(stage, places, {
          skipAuto: true,
          onSelect: function (place) {
            selectedId = place.id;
            fillForm(place);
            renderRows();
          },
          onMapClick: onMapClick
        }, function (real, cfg) {
          if (real) api = real;
          mapsCfg = cfg;
          fillMapsForm(cfg);
          if (selectedId && api && api.select) api.select(selectedId);
          renderRows();
        });
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
        if (form.lat) form.lat.value = place.lat;
        if (form.lng) form.lng.value = place.lng;
        if (form.x) form.x.value = place.x;
        if (form.z) form.z.value = place.z;
        if (form.elev) form.elev.value = place.elev;
        form.visible.checked = place.visible !== false;
      }

      function fillMapsForm(cfg) {
        var mf = document.getElementById("mapsConfigForm");
        if (!mf || !cfg) return;
        mf.apiKey.value = cfg.apiKey || "";
        mf.mapId.value = cfg.mapId || "";
        mf.tilt.value = cfg.tilt;
        mf.heading.value = cfg.heading;
        mf.range.value = cfg.range;
      }

      function readMapsForm() {
        var mf = document.getElementById("mapsConfigForm");
        if (!mf) return mapsCfg;
        mapsCfg = mergeMaps(mapsCfg || DEFAULT_MAPS, {
          apiKey: mf.apiKey.value.trim(),
          mapId: mf.mapId.value.trim(),
          tilt: Number(mf.tilt.value),
          heading: Number(mf.heading.value),
          range: Number(mf.range.value)
        });
        return mapsCfg;
      }

      function readForm() {
        var place = current();
        if (!place) return;
        place.title = form.title.value.trim() || place.title;
        place.blurb = form.blurb.value.trim();
        place.category = form.category.value;
        place.tourHref = form.tourHref.value.trim();
        place.tourLabel = form.tourLabel.value.trim();
        if (form.lat) place.lat = Number(form.lat.value);
        if (form.lng) place.lng = Number(form.lng.value);
        if (form.x) place.x = Number(form.x.value);
        if (form.z) place.z = Number(form.z.value);
        if (form.elev) place.elev = Number(form.elev.value);
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
            "<td>" + (place.lat ? Number(place.lat).toFixed(4) : "—") + ", " + (place.lng ? Number(place.lng).toFixed(4) : "—") + "</td>" +
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
        if (stage._refreshPlaces) stage._refreshPlaces(places);
        renderRows();
      });
      form.addEventListener("change", function () {
        readForm();
        if (stage._refreshPlaces) stage._refreshPlaces(places);
        else paint();
        renderRows();
      });

      document.getElementById("saveMap").addEventListener("click", function () {
        readForm();
        writeStored(places);
        writeMapsStored(readMapsForm());
        setStatus("Saved on this browser. Reload The Area page to see the Google 3D map with these pins.");
        stage._gmap = null;
        stage._refreshPlaces = null;
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
          lat: 39.83,
          lng: -77.231,
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
