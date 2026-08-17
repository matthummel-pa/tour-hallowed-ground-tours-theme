/* Inline 5-step book-and-pay flow — book.html (page-specific) */
(function(){
  "use strict";
  function upcomingSlots(times, seatsPattern){
    var out = [];
    var start = new Date();
    start.setHours(0,0,0,0);
    var i = 1;
    while(out.length < 4 && i < 21){
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var time = times[out.length % times.length];
      var seats = seatsPattern[out.length % seatsPattern.length];
      out.push({
        date: d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }),
        time: time,
        seats: seats,
        iso: d.toISOString().slice(0,10) + "T" + to24(time)
      });
      i++;
    }
    return out;
  }
  function to24(label){
    var m = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if(!m) return "09:00:00";
    var h = parseInt(m[1],10);
    var min = m[2];
    var ap = m[3].toUpperCase();
    if(ap === "PM" && h !== 12) h += 12;
    if(ap === "AM" && h === 12) h = 0;
    return String(h).padStart(2,"0") + ":" + min + ":00";
  }

  var TOURS = [
    {"id":"highlights","name":"Battlefield Highlights Walking Tour","duration":"2 hours","groupSize":15,"difficultyKey":"moderate","difficulty":"Moderate · 2 mi walking","cls":"tb-1","icon":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"5\" r=\"2\"/><path d=\"M8 21l2-8-3-2 2-5 3 2 2-2 4 1-1 4-3-1-1 3 3 3-1 5\"/></svg>","price":{"adult":38,"child":19,"senior":34},"desc":"A guided walk across Cemetery Ridge and McPherson Ridge covering the turning points of all three days of the battle.","slots":upcomingSlots(["9:00 AM","1:00 PM"],[9,4,12,2])},
    {"id":"bus","name":"Pickett's Charge Deluxe Bus Tour","duration":"3.5 hours","groupSize":24,"difficultyKey":"easy","difficulty":"Easy · Seated, ADA accessible","cls":"tb-2","icon":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"2\" y=\"7\" width=\"20\" height=\"10\" rx=\"2\"/><circle cx=\"7\" cy=\"19\" r=\"1.6\"/><circle cx=\"17\" cy=\"19\" r=\"1.6\"/><path d=\"M2 12h20M7 7V4h10v3\"/></svg>","price":{"adult":65,"child":32,"senior":58},"desc":"A narrated motorcoach loop of the full Gettysburg battlefield with two guided stops, including the High Water Mark.","slots":upcomingSlots(["10:00 AM"],[18,6,0,20])},
    {"id":"hike","name":"Little Round Top & Devil's Den Hike","duration":"2.5 hours","groupSize":12,"difficultyKey":"strenuous","difficulty":"Strenuous · Rocky, hills","cls":"tb-3","icon":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M2 20l6-11 4 6 3-5 7 10z\"/><circle cx=\"18\" cy=\"4\" r=\"2\"/></svg>","price":{"adult":44,"child":24,"senior":40},"desc":"A rugged hike to the most fought-over high ground of Day Two, with time to explore the boulders of Devil's Den.","slots":upcomingSlots(["8:00 AM"],[5,8,3,7])},
    {"id":"lantern","name":"Ghosts of Gettysburg Lantern Walk","duration":"90 minutes","groupSize":20,"difficultyKey":"easy","difficulty":"Easy · Evening, level ground","cls":"tb-4","icon":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M9 3h6l1 4H8z\"/><rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"1\"/><path d=\"M10 21h4M12 17v4\"/></svg>","price":{"adult":28,"child":16,"senior":26},"desc":"An after-dark walking tour through downtown Gettysburg pairing real wartime accounts with candlelit storytelling.","slots":upcomingSlots(["8:30 PM"],[14,1,11,9])},
    {"id":"private","name":"Sunrise Private Battlefield Experience","duration":"3 hours","groupSize":6,"difficultyKey":"moderate","difficulty":"Moderate · Customized route","cls":"tb-5","icon":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4\"/></svg>","price":{"adult":89,"child":55,"senior":82},"desc":"A private, small-group dawn tour with a senior guide, customized to your interests — for up to six guests.","slots":upcomingSlots(["6:00 AM"],[6,2,6,4])}
  ];

  var root = document.getElementById("bookingFlow");
  if(!root) return;

  function fmt(n){ return "$" + n.toFixed(2); }

  var state = { step:1, tourId:null, slotIdx:null, qty:{ adult:0, child:0, senior:0 } };

  /* Preselect from ?tour= */
  var pre = new URLSearchParams(window.location.search).get("tour");
  if(pre && TOURS.some(function(t){ return t.id === pre; })){ state.tourId = pre; state.step = 2; }

  function currentTour(){ return TOURS.filter(function(t){ return t.id === state.tourId; })[0] || null; }
  function totalTickets(){ return state.qty.adult + state.qty.child + state.qty.senior; }
  function totalPrice(){
    var t = currentTour(); if(!t) return 0;
    return t.price.adult*state.qty.adult + t.price.child*state.qty.child + t.price.senior*state.qty.senior;
  }

  var tourPickList = document.getElementById("tourPickList");
  var slotGrid = document.getElementById("slotGrid");
  var qtyEls = { adult:document.getElementById("qtyAdult"), child:document.getElementById("qtyChild"), senior:document.getElementById("qtySenior") };
  var priceEls = { adult:document.getElementById("priceAdult"), child:document.getElementById("priceChild"), senior:document.getElementById("priceSenior") };
  var liveTotal = document.getElementById("liveTotal");
  var groupNote = document.getElementById("groupNote");
  var summaryCard = document.getElementById("summaryCard");
  var payBtn = document.getElementById("payBtn");
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var doneBtn = document.getElementById("doneBtn");
  var icsBtn = document.getElementById("icsBtn");
  var flowNav = document.getElementById("flowNav");
  var checkoutForm = document.getElementById("checkoutForm");
  var ticketNumberEl = document.getElementById("ticketNumber");
  var confirmSub = document.getElementById("confirmSub");
  var confirmSummary = document.getElementById("confirmSummary");
  var stepDots = root.querySelectorAll(".step-dot");
  var stepPanels = root.querySelectorAll(".step-panel");

  function renderTourPickList(){
    tourPickList.innerHTML = "";
    TOURS.forEach(function(t){
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "pick-card";
      btn.setAttribute("aria-pressed", state.tourId === t.id ? "true" : "false");
      btn.innerHTML =
        '<span class="pc-ic">' + t.icon + '</span>' +
        '<span class="pc-body"><h4>' + t.name + '</h4><p>' + t.duration + ' · ' + t.difficulty + '</p></span>' +
        '<span class="pc-price">' + fmt(t.price.adult) + '</span>';
      btn.addEventListener("click", function(){
        state.tourId = t.id; state.slotIdx = null;
        renderTourPickList(); updateNav();
      });
      tourPickList.appendChild(btn);
    });
  }

  function renderSlots(){
    slotGrid.innerHTML = "";
    var t = currentTour(); if(!t) return;
    t.slots.forEach(function(slot, idx){
      var soldOut = slot.seats <= 0;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-btn" + (slot.seats > 0 && slot.seats <= 4 ? " low" : "");
      btn.setAttribute("aria-pressed", state.slotIdx === idx ? "true" : "false");
      btn.disabled = soldOut;
      btn.innerHTML =
        '<div class="slot-date">' + slot.date + '</div>' +
        '<div class="slot-time">' + slot.time + '</div>' +
        '<div class="slot-seats">' + (soldOut ? "Sold out" : slot.seats + " spots left") + '</div>';
      btn.addEventListener("click", function(){ state.slotIdx = idx; renderSlots(); updateNav(); });
      slotGrid.appendChild(btn);
    });
  }

  function renderTickets(){
    var t = currentTour(); if(!t) return;
    priceEls.adult.textContent = fmt(t.price.adult);
    priceEls.child.textContent = "Ages 6–12 · " + fmt(t.price.child);
    priceEls.senior.textContent = "Ages 65+ · " + fmt(t.price.senior);
    ["adult","child","senior"].forEach(function(k){ qtyEls[k].textContent = state.qty[k]; });
    liveTotal.textContent = fmt(totalPrice());
    groupNote.textContent = "This tour is limited to " + t.groupSize + " guests per departure. Currently selecting " + totalTickets() + " ticket" + (totalTickets()===1?"":"s") + ".";
    document.querySelectorAll("[data-tix-minus]").forEach(function(btn){ btn.disabled = state.qty[btn.getAttribute("data-tix-minus")] <= 0; });
    document.querySelectorAll("[data-tix-plus]").forEach(function(btn){ btn.disabled = totalTickets() >= t.groupSize; });
  }

  document.querySelectorAll("[data-tix-plus]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var k = btn.getAttribute("data-tix-plus"); var t = currentTour();
      if(t && totalTickets() < t.groupSize){ state.qty[k]++; renderTickets(); updateNav(); }
    });
  });
  document.querySelectorAll("[data-tix-minus]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var k = btn.getAttribute("data-tix-minus");
      if(state.qty[k] > 0){ state.qty[k]--; renderTickets(); updateNav(); }
    });
  });

  function renderSummary(){
    var t = currentTour(); if(!t) return;
    var slot = state.slotIdx !== null ? t.slots[state.slotIdx] : null;
    var rows = '<div class="summary-row"><span>Tour</span><span>' + t.name + '</span></div>';
    if(slot){ rows += '<div class="summary-row"><span>Date &amp; time</span><span>' + slot.date + ' · ' + slot.time + '</span></div>'; }
    if(state.qty.adult > 0){ rows += '<div class="summary-row"><span>Adult × ' + state.qty.adult + '</span><span>' + fmt(t.price.adult*state.qty.adult) + '</span></div>'; }
    if(state.qty.child > 0){ rows += '<div class="summary-row"><span>Child × ' + state.qty.child + '</span><span>' + fmt(t.price.child*state.qty.child) + '</span></div>'; }
    if(state.qty.senior > 0){ rows += '<div class="summary-row"><span>Senior × ' + state.qty.senior + '</span><span>' + fmt(t.price.senior*state.qty.senior) + '</span></div>'; }
    rows += '<div class="summary-row total"><span>Total</span><span>' + fmt(totalPrice()) + '</span></div>';
    summaryCard.innerHTML = rows;
    payBtn.textContent = "Pay " + fmt(totalPrice());
  }

  checkoutForm.addEventListener("submit", function(e){
    e.preventDefault();
    var name = document.getElementById("ccName").value.trim();
    var email = document.getElementById("ccEmail").value.trim();
    if(!name || !email){ window.alert("Please enter your name and email to complete this demo booking."); return; }
    goToConfirmation(email);
  });

  function makeTicketNumber(){
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "HG-";
    for(var i=0;i<6;i++){ s += chars[Math.floor(Math.random()*chars.length)]; }
    return s;
  }

  function goToConfirmation(email){
    var t = currentTour();
    var slot = state.slotIdx !== null ? t.slots[state.slotIdx] : null;
    ticketNumberEl.textContent = makeTicketNumber();
    confirmSub.textContent = "A confirmation with your tickets and meeting-point directions is on its way to " + email + " (demo only — no email is actually sent).";
    var rows = '<div class="summary-row"><span>Tour</span><span>' + t.name + '</span></div>';
    if(slot){ rows += '<div class="summary-row"><span>Date &amp; time</span><span>' + slot.date + ' · ' + slot.time + '</span></div>'; }
    rows += '<div class="summary-row"><span>Tickets</span><span>' + totalTickets() + '</span></div>';
    rows += '<div class="summary-row total"><span>Total paid</span><span>' + fmt(totalPrice()) + '</span></div>';
    confirmSummary.innerHTML = rows;
    if(icsBtn && slot && slot.iso){
      var durMin = t.id === "lantern" ? 90 : t.id === "bus" ? 210 : t.id === "hike" ? 150 : t.id === "private" ? 180 : 120;
      var parts = slot.iso.split("T");
      var ymd = parts[0].replace(/-/g,"");
      var hms = (parts[1] || "09:00:00").replace(/:/g,"").slice(0,6);
      var startStamp = ymd + "T" + hms;
      var endDate = new Date(slot.iso);
      if(isNaN(endDate.getTime())) endDate = new Date();
      endDate.setMinutes(endDate.getMinutes() + durMin);
      var ey = endDate.getFullYear();
      var em = String(endDate.getMonth()+1).padStart(2,"0");
      var ed = String(endDate.getDate()).padStart(2,"0");
      var eh = String(endDate.getHours()).padStart(2,"0");
      var ei = String(endDate.getMinutes()).padStart(2,"0");
      var endStamp = ey + em + ed + "T" + eh + ei + "00";
      var meet = t.id === "lantern" ? "Lincoln Square flagpole, Gettysburg, PA" : "271 Baltimore Street, Gettysburg, PA 17325";
      var ics = [
        "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Hallowed Ground Battlefield Tours//EN","BEGIN:VEVENT",
        "UID:" + ticketNumberEl.textContent + "@hallowedground.test",
        "SUMMARY:" + t.name,
        "DTSTART:" + startStamp,
        "DTEND:" + endStamp,
        "LOCATION:" + meet,
        "DESCRIPTION:Demo booking with Hallowed Ground Battlefield Tours. Arrive 15 minutes early.",
        "END:VEVENT","END:VCALENDAR"
      ].join("\r\n");
      icsBtn.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
      icsBtn.hidden = false;
    }
    state.step = 5; renderStep();
  }

  doneBtn.addEventListener("click", function(){
    state = { step:1, tourId:null, slotIdx:null, qty:{ adult:0, child:0, senior:0 } };
    checkoutForm.reset();
    renderStep();
    root.scrollIntoView({ behavior:"smooth", block:"start" });
  });

  function canAdvance(){
    switch(state.step){
      case 1: return !!state.tourId;
      case 2: return state.slotIdx !== null;
      case 3: return totalTickets() > 0;
      default: return true;
    }
  }

  function updateNav(){
    backBtn.style.visibility = state.step === 1 ? "hidden" : "visible";
    nextBtn.disabled = !canAdvance();
    if(state.step === 4){ nextBtn.style.display = "none"; }
    else { nextBtn.style.display = "inline-flex"; nextBtn.textContent = state.step === 3 ? "Review & Checkout" : "Next"; }
    flowNav.style.display = state.step === 5 ? "none" : "flex";
  }

  function renderStep(){
    stepPanels.forEach(function(panel){ panel.classList.toggle("active", Number(panel.getAttribute("data-step")) === state.step); });
    stepDots.forEach(function(dot){
      var n = Number(dot.getAttribute("data-step-dot"));
      dot.classList.toggle("done", n < state.step);
      dot.classList.toggle("active", n <= state.step);
    });
    if(state.step === 1) renderTourPickList();
    if(state.step === 2) renderSlots();
    if(state.step === 3) renderTickets();
    if(state.step === 4) renderSummary();
    updateNav();
  }

  nextBtn.addEventListener("click", function(){ if(canAdvance() && state.step < 4){ state.step++; renderStep(); } });
  backBtn.addEventListener("click", function(){ if(state.step > 1){ state.step--; renderStep(); } });

  renderStep();
})();
