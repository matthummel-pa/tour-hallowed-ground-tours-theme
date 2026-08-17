/* Global behaviors — Hallowed Ground
   hamburger, mega-nav, scroll reveal, FAQ, tour filters, newsletter demo */
(function(){
  "use strict";

  var yr = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function(el){ el.textContent = yr; });

  var header = document.querySelector(".site-header");
  if(header){
    var onScroll = function(){
      if(window.scrollY > 8){ header.classList.add("is-scrolled"); }
      else { header.classList.remove("is-scrolled"); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
  }

  var hamburgerBtn = document.getElementById("hamburgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  if(hamburgerBtn && mobileNav){
    var closeMobileNav = function(){
      mobileNav.classList.remove("is-open");
      hamburgerBtn.setAttribute("aria-expanded","false");
      hamburgerBtn.setAttribute("aria-label","Open menu");
      document.body.classList.remove("modal-locked");
    };
    hamburgerBtn.addEventListener("click", function(){
      var open = mobileNav.classList.toggle("is-open");
      hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
      hamburgerBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("modal-locked", open);
    });
    mobileNav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMobileNav); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeMobileNav(); });
  }

  document.querySelectorAll(".has-sub").forEach(function(item){
    var trigger = item.querySelector(".nav-trigger");
    if(!trigger) return;
    trigger.addEventListener("click", function(){
      var open = item.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  var revealEls = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
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

  document.querySelectorAll(".faq-item").forEach(function(item){
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if(!btn || !panel) return;
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

  var filterBar = document.querySelector("[data-tour-filter]");
  if(filterBar){
    var cards = document.querySelectorAll("[data-category]");
    var applyFilter = function(val){
      filterBar.querySelectorAll("button").forEach(function(b){
        b.setAttribute("aria-pressed", b.getAttribute("data-filter") === val ? "true" : "false");
      });
      cards.forEach(function(card){
        var show = val === "all" || card.getAttribute("data-category") === val;
        card.classList.toggle("is-hidden", !show);
      });
    };
    filterBar.querySelectorAll("button").forEach(function(btn){
      btn.addEventListener("click", function(){ applyFilter(btn.getAttribute("data-filter")); });
    });
    var hash = (window.location.hash || "").replace("#","");
    if(hash === "after-dark" || hash === "historical") applyFilter(hash);
  }

  document.querySelectorAll("[data-newsletter]").forEach(function(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      var note = form.querySelector("[data-newsletter-note]") || (form.parentElement && form.parentElement.querySelector("[data-newsletter-note]"));
      if(!input || !input.value.trim()){
        if(note) note.textContent = "Add an email to join the field notes list.";
        return;
      }
      if(note) note.textContent = "This concept demo does not send email. On WordPress this maps to a Mailchimp / WooCommerce follow-up.";
      form.reset();
    });
  });

})();
