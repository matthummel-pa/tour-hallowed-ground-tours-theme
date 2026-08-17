/* Global behaviors — Hallowed Ground Battlefield Tours */
(function(){
  "use strict";

  var yr = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function(el){ el.textContent = yr; });

  var header = document.querySelector(".site-header");
  if(header){
    var onScroll = function(){
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
  }

  var hamburgerBtn = document.getElementById("hamburgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  if(hamburgerBtn && mobileNav){
    var lastFocus = null;
    var closeMobileNav = function(){
      mobileNav.classList.remove("is-open");
      hamburgerBtn.setAttribute("aria-expanded","false");
      hamburgerBtn.setAttribute("aria-label","Open menu");
      mobileNav.setAttribute("aria-hidden","true");
      document.body.classList.remove("nav-open");
      if(lastFocus) hamburgerBtn.focus();
    };
    var openMobileNav = function(){
      lastFocus = document.activeElement;
      mobileNav.classList.add("is-open");
      hamburgerBtn.setAttribute("aria-expanded","true");
      hamburgerBtn.setAttribute("aria-label","Close menu");
      mobileNav.setAttribute("aria-hidden","false");
      document.body.classList.add("nav-open");
      var first = mobileNav.querySelector("a, button");
      if(first) first.focus();
    };
    if(!mobileNav.classList.contains("is-open")){
      mobileNav.setAttribute("aria-hidden","true");
    }
    hamburgerBtn.addEventListener("click", function(){
      if(mobileNav.classList.contains("is-open")) closeMobileNav();
      else openMobileNav();
    });
    mobileNav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMobileNav); });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeMobileNav();
      if(e.key !== "Tab" || !mobileNav.classList.contains("is-open")) return;
      var focusable = mobileNav.querySelectorAll("a, button");
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  }

  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if("IntersectionObserver" in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  document.querySelectorAll(".faq-item").forEach(function(item, idx){
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if(!btn || !panel) return;
    var pid = "faq-panel-" + idx;
    panel.id = pid;
    btn.setAttribute("aria-controls", pid);
    btn.addEventListener("click", function(){
      var isOpen = item.getAttribute("data-open") === "true";
      document.querySelectorAll(".faq-item").forEach(function(other){
        if(other !== item){
          other.setAttribute("data-open","false");
          var ob = other.querySelector(".faq-q");
          var op = other.querySelector(".faq-a");
          if(ob) ob.setAttribute("aria-expanded","false");
          if(op) op.style.maxHeight = null;
        }
      });
      if(isOpen){
        item.setAttribute("data-open","false");
        btn.setAttribute("aria-expanded","false");
        panel.style.maxHeight = null;
      } else {
        item.setAttribute("data-open","true");
        btn.setAttribute("aria-expanded","true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* Seasonal office hours: Apr–Nov daily 8–18; Dec–Mar Thu–Sun 9–16. America/New_York. */
  document.querySelectorAll("[data-hours-live]").forEach(function(el){
    var now;
    try {
      now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    } catch (err) {
      now = new Date();
    }
    var month = now.getMonth() + 1;
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();
    var peak = month >= 4 && month <= 11;
    var open = false;
    if(peak){
      open = minutes >= 8 * 60 && minutes < 18 * 60;
    } else if(day === 0 || day >= 4){
      open = minutes >= 9 * 60 && minutes < 16 * 60;
    }
    el.classList.toggle("is-closed", !open);
    el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + (open ? "Office open now (Gettysburg time)" : "Office currently closed");
  });

  document.querySelectorAll("[data-tour-filter]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var key = btn.getAttribute("data-tour-filter");
      document.querySelectorAll("[data-tour-filter]").forEach(function(b){ b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      document.querySelectorAll("[data-tour-card]").forEach(function(card){
        var match = key === "all" || card.getAttribute("data-difficulty") === key || card.getAttribute("data-mode") === key;
        card.hidden = !match;
      });
    });
  });

  if(document.querySelector(".sticky-book")){
    document.body.classList.add("has-sticky-book");
  }
})();
