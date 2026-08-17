/* Area diorama map — public view + owner admin (concept).
   Sage: ACF options `area_map_places` or CPT `area_place`.
   localStorage overlay is the demo CMS; live theme would persist to WP. */
(function () {
  "use strict";

  var STORAGE = "hg-area-map-v1";
  var MAPS_STORAGE = "hg-maps-config-v2";
  var ADMIN_GATE = "hg-area-admin";
  var PIN_COLOR = { ridge: "#e0be72", hill: "#7eb56a", hike: "#7eb56a", downtown: "#c9a06a", meet: "#d36a3a" };
  var DEFAULT_MAPS = {
    center: { lat: 39.812, lng: -77.236 },
    zoom: 13.4,
    rotation: -0.18
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
        done(cfg);
      })
      .catch(function () {
        var cfg = mergeMaps(DEFAULT_MAPS, stored);
        done(cfg);
      });
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

  function pinStyle(feature, selectedId) {
    var cat = feature.get("category");
    var selected = feature.get("placeId") === selectedId;
    var color = PIN_COLOR[cat] || "#e0be72";
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: selected ? 9 : 7,
        fill: new ol.style.Fill({ color: color }),
        stroke: new ol.style.Stroke({ color: "#14100a", width: 2 })
      }),
      text: new ol.style.Text({
        text: String(feature.get("title") || ""),
        offsetY: -18,
        font: "600 11px \"IBM Plex Mono\", monospace",
        fill: new ol.style.Fill({ color: "#f0d9a0" }),
        stroke: new ol.style.Stroke({ color: "#07111c", width: 4 })
      }),
      zIndex: selected ? 20 : 10
    });
  }

  function buildingStyle(feature) {
    var layer = feature.get("layer") || feature.get("class") || "";
    if (layer && String(layer).indexOf("building") === -1 && layer !== "building") {
      return undefined;
    }
    return new ol.style.Style({
      fill: new ol.style.Fill({ color: "rgba(201,162,74,0.38)" }),
      stroke: new ol.style.Stroke({ color: "rgba(240,217,160,0.75)", width: 1 })
    });
  }

  function mountOpenLayers(stage, places, opts, cfg, done) {
    opts = opts || {};
    if (!(window.ol && ol.Map)) {
      var cssApi = mountCss(stage, places, opts);
      var banner = document.createElement("p");
      banner.className = "maps-key-banner";
      banner.textContent = "OpenLayers did not load. Check the ol.js script on this page.";
      stage.prepend(banner);
      if (done) done(cssApi);
      return;
    }

    stage.classList.remove("is-google");
    stage.classList.add("is-ol");
    stage.innerHTML = "<div class=\"ol-host\" data-ol-host></div><p class=\"dio-hint\">Click a pin for a popup about that ground. Close it to zoom back out. Drag to pan. Scroll to zoom.</p>";
    var host = stage.querySelector("[data-ol-host]");
    var detail = document.querySelector("[data-diorama-detail]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var selectedId = null;
    var pinSource = new ol.source.Vector();
    var pins = new ol.layer.Vector({
      source: pinSource,
      style: function (feature) {
        return pinStyle(feature, selectedId);
      },
      zIndex: 40
    });

    var roads = new ol.layer.Tile({
      source: new ol.source.OSM({
        attributions: "© OpenStreetMap contributors"
      })
    });

    var layers = [roads];
    if (ol.layer.VectorTile && ol.format.MVT) {
      layers.push(new ol.layer.VectorTile({
        declutter: true,
        source: new ol.source.VectorTile({
          format: new ol.format.MVT(),
          url: "https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf",
          attributions: "© OpenStreetMap, © OpenFreeMap"
        }),
        style: function (feature) {
          var layer = feature.get("layer");
          if (layer !== "building" && layer !== "buildings") return undefined;
          return buildingStyle(feature);
        },
        minZoom: 13,
        opacity: 0.95
      }));
    }
    layers.push(pins);

    var view = new ol.View({
      center: ol.proj.fromLonLat([cfg.center.lng, cfg.center.lat]),
      zoom: cfg.zoom || 13.4,
      rotation: cfg.rotation || 0,
      constrainRotation: false
    });

    var map = new ol.Map({
      target: host,
      layers: layers,
      view: view
    });

    stage._olmap = map;

    var popupEl = document.createElement("div");
    popupEl.className = "ol-popup";
    popupEl.setAttribute("role", "dialog");
    popupEl.setAttribute("aria-live", "polite");
    popupEl.innerHTML = "<button type=\"button\" class=\"ol-popup-closer\" aria-label=\"Close\"></button><div class=\"ol-popup-body\"></div>";
    var popupBody = popupEl.querySelector(".ol-popup-body");
    var popupCloser = popupEl.querySelector(".ol-popup-closer");
    var overlay = new ol.Overlay({
      element: popupEl,
      positioning: "bottom-center",
      offset: [0, -18],
      stopEvent: true,
      autoPan: {
        animation: { duration: reduce ? 0 : 280 },
        margin: 36
      }
    });
    map.addOverlay(overlay);

    var fieldView = {
      center: ol.proj.fromLonLat([Number(cfg.center.lng), Number(cfg.center.lat)]),
      zoom: cfg.zoom || 13.4,
      rotation: cfg.rotation || 0
    };
    var zoomedIn = false;

    function restoreOverview() {
      if (!zoomedIn) return;
      zoomedIn = false;
      if (reduce) {
        view.setCenter(fieldView.center);
        view.setZoom(fieldView.zoom);
        view.setRotation(fieldView.rotation);
        return;
      }
      view.animate({
        center: fieldView.center,
        zoom: fieldView.zoom,
        rotation: fieldView.rotation,
        duration: 700
      });
    }

    function hidePopup(restore) {
      overlay.setPosition(undefined);
      popupEl.classList.remove("is-open");
      if (restore) restoreOverview();
    }

    function showPopup(place) {
      if (!place || !isFinite(Number(place.lat)) || !isFinite(Number(place.lng))) {
        hidePopup(false);
        return;
      }
      popupEl.setAttribute("aria-label", place.title);
      popupBody.innerHTML =
        "<span class=\"eyebrow\">" + esc(catLabel(place.category)) + "</span>" +
        "<h3>" + esc(place.title) + "</h3>" +
        "<p>" + esc(place.blurb) + "</p>" +
        (place.tourHref ? "<p><a class=\"btn btn-primary btn-sm\" href=\"" + esc(place.tourHref) + "\">" + esc(place.tourLabel || "See the tour") + "</a></p>" : "");
      popupEl.classList.add("is-open");
      overlay.setPosition(ol.proj.fromLonLat([Number(place.lng), Number(place.lat)]));
      if (overlay.panIntoView) overlay.panIntoView({ margin: 36 });
    }

    popupCloser.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      hidePopup(true);
    });

    var select = function (id, fly) {
      var place = places.filter(function (p) { return p.id === id; })[0];
      if (!place) return;
      selectedId = id;
      pins.changed();
      highlight(document, id);
      fillDetail(detail, place);
      if (fly !== false) showPopup(place);
      else hidePopup(false);
      if (fly !== false && isFinite(Number(place.lat)) && isFinite(Number(place.lng))) {
        var center = ol.proj.fromLonLat([Number(place.lng), Number(place.lat)]);
        zoomedIn = true;
        if (reduce) {
          view.setCenter(center);
          view.setZoom(Math.max(view.getZoom(), 15.5));
        } else {
          view.animate({ center: center, zoom: 15.8, duration: 700 });
        }
      }
      if (opts.onSelect) opts.onSelect(place);
    };

    function syncMarkers(nextPlaces) {
      places = nextPlaces;
      pinSource.clear();
      var visible = fillList(places, opts);
      visible.forEach(function (place) {
        if (!isFinite(Number(place.lat)) || !isFinite(Number(place.lng))) return;
        pinSource.addFeature(new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([Number(place.lng), Number(place.lat)])),
          placeId: place.id,
          title: place.title,
          category: place.category
        }));
      });
    }

    syncMarkers(places);
    stage._hgSelect = select;
    stage._refreshPlaces = syncMarkers;

    map.on("singleclick", function (evt) {
      var hit = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        if (layer === pins) return feature;
        return null;
      });
      if (hit) {
        select(hit.get("placeId"));
        return;
      }
      hidePopup(!opts.onMapClick);
      if (opts.onMapClick) {
        var lonlat = ol.proj.toLonLat(evt.coordinate);
        opts.onMapClick({ lng: lonlat[0], lat: lonlat[1] });
      }
    });

    map.on("pointermove", function (evt) {
      var hit = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function (layer) { return layer === pins; }
      });
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hidePopup(true);
    });

    if (!opts.skipAuto && places[0]) select(places[0].id, false);
    setTimeout(function () { map.updateSize(); }, 50);
    if (done) done({ select: select });
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
      panel.innerHTML = "<p class=\"lede\">Click a pin for a popup about that ground, or use the list.</p>";
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
    stage.classList.remove("is-ol");
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
      if (stage._olmap && stage._refreshPlaces) {
          stage._refreshPlaces(places);
          finish({ select: stage._hgSelect });
          return;
        }
        mountOpenLayers(stage, places, opts, cfg, finish);
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
        setTimeout(function () {
          if (stage._olmap) stage._olmap.updateSize();
        }, 80);
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
        if (mf.zoom) mf.zoom.value = cfg.zoom;
        if (mf.rotation) mf.rotation.value = Math.round((cfg.rotation || 0) * 180 / Math.PI);
      }

      function readMapsForm() {
        var mf = document.getElementById("mapsConfigForm");
        if (!mf) return mapsCfg;
        var rotDeg = Number(mf.rotation && mf.rotation.value);
        mapsCfg = mergeMaps(mapsCfg || DEFAULT_MAPS, {
          zoom: Number(mf.zoom && mf.zoom.value),
          rotation: isFinite(rotDeg) ? rotDeg * Math.PI / 180 : 0
        });
        if (stage._olmap) {
          var view = stage._olmap.getView();
          var center = ol.proj.toLonLat(view.getCenter());
          mapsCfg.center = { lat: center[1], lng: center[0] };
          mapsCfg.zoom = view.getZoom();
          mapsCfg.rotation = view.getRotation();
        }
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
        setStatus("Saved on this browser. The Area page will use these pins and the current OpenLayers view.");
        if (stage._refreshPlaces) stage._refreshPlaces(places);
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
