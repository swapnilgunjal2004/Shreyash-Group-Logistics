/* =========================================
   SG LOGISTIC – Main JavaScript
   ========================================= */

'use strict';

// ===== NAVBAR SCROLL BEHAVIOR =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Scroll handler
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
})();


// ===== SCROLL TO TOP =====
(function initScrollTop() {
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ===== ACTIVE NAV LINK ON SCROLL =====
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
})();


// ===== PRICE ESTIMATOR =====
(function initPriceEstimator() {
  const weightInput  = document.getElementById('weight');
  const truckSelect  = document.getElementById('truckType');
  const pickupInput  = document.getElementById('pickup');
  const dropInput    = document.getElementById('drop');
  const priceBox     = document.getElementById('priceEstimate');
  const priceValue   = document.getElementById('priceValue');

  // Base rates in INR per ton per kilometer (approximate market rates)
  const truckRates = {
    mini:      18,
    medium:    14,
    large:     11,
    trailer:   9,
    container: 12
  };

  // Rough distance lookup (city pairs, one-way km)
  const cityDistances = {
    'pune-mumbai':     149, 'mumbai-pune':     149,
    'pune-nashik':     211, 'nashik-pune':     211,
    'pune-nagpur':     703, 'nagpur-pune':     703,
    'mumbai-nashik':   163, 'nashik-mumbai':   163,
    'mumbai-nagpur':   838, 'nagpur-mumbai':   838,
    'pune-delhi':     1409, 'delhi-pune':     1409,
    'pune-bengaluru':  838, 'bengaluru-pune':  838,
    'pune-hyderabad':  555, 'hyderabad-pune':  555,
    'mumbai-delhi':   1415, 'delhi-mumbai':   1415,
    'mumbai-bengaluru': 980, 'bengaluru-mumbai': 980,
    'delhi-bengaluru': 2150, 'bengaluru-delhi': 2150,
    'delhi-hyderabad': 1490, 'hyderabad-delhi': 1490
  };

  function normalizeCity(str) {
    return str.trim().toLowerCase()
      .replace(/\s+/g, '')
      .replace(/,.*$/, '');
  }

  function estimatePrice() {
    const weight = parseFloat(weightInput.value);
    const truck  = truckSelect.value;
    const from   = normalizeCity(pickupInput.value);
    const to     = normalizeCity(dropInput.value);

    if (!weight || !truck || !from || !to || from === to) {
      priceBox.classList.add('hidden');
      return;
    }

    const key = `${from}-${to}`;
    const distance = cityDistances[key] || null;

    if (distance && truckRates[truck]) {
      const rate = truckRates[truck];
      const estimate = Math.round(weight * distance * rate);
      const low  = Math.round(estimate * 0.9);
      const high = Math.round(estimate * 1.1);

      priceValue.textContent = `₹${low.toLocaleString('en-IN')} – ₹${high.toLocaleString('en-IN')}`;
      priceBox.classList.remove('hidden');
    } else if (weight && truck) {
      // Fallback: flat per-ton rate estimate
      const rate = truckRates[truck] || 12;
      const estimate = Math.round(weight * 500 * rate);
      priceValue.textContent = `₹${Math.round(estimate * 0.8).toLocaleString('en-IN')} – ₹${Math.round(estimate * 1.2).toLocaleString('en-IN')}`;
      priceBox.classList.remove('hidden');
    }
  }

  [weightInput, truckSelect, pickupInput, dropInput].forEach(el => {
    el.addEventListener('input', estimatePrice);
    el.addEventListener('change', estimatePrice);
  });
})();


// ===== WHATSAPP BOOKING LINK =====
(function initWhatsAppBooking() {
  const form = document.getElementById('bookingForm');
  const waLink = document.getElementById('whatsappBooking');

  function buildWhatsAppMessage() {
    const pickup  = document.getElementById('pickup').value.trim()  || '[Pickup Location]';
    const drop    = document.getElementById('drop').value.trim()    || '[Drop Location]';
    const goods   = document.getElementById('goodsType').value.trim()|| '[Goods Type]';
    const weight  = document.getElementById('weight').value.trim()  || '[Weight]';
    const truck   = document.getElementById('truckType');
    const truckText = truck.options[truck.selectedIndex]?.text      || '[Truck Type]';
    const dateEl  = document.getElementById('dateTime').value;
    const date    = dateEl ? new Date(dateEl).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) : '[Date & Time]';
    const name    = document.getElementById('contactName').value.trim()  || '[Name]';
    const phone   = document.getElementById('contactPhone').value.trim() || '[Phone]';

    const msg = `Hi SG Logistic, I want to book a truck.

📍 From: ${pickup}
📍 To: ${drop}
📦 Goods: ${goods}
⚖️ Weight: ${weight} tons
🚛 Truck: ${truckText}
📅 Date: ${date}
👤 Name: ${name}
📞 Phone: ${phone}`;

    return encodeURIComponent(msg);
  }

  function updateWaLink() {
    waLink.href = `https://wa.me/918483889717?text=${buildWhatsAppMessage()}`;
  }

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', updateWaLink);
    el.addEventListener('change', updateWaLink);
  });

  updateWaLink();
})();


// ===== BOOKING FORM SUBMISSION =====
(function initBookingForm() {
  const form    = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');

  function validateField(el) {
    if (el.hasAttribute('required') && !el.value.trim()) {
      el.classList.add('error');
      return false;
    }
    el.classList.remove('error');
    return true;
  }

  // Live validation
  form.querySelectorAll('input[required], select[required]').forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(el);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('input[required], select[required]').forEach(el => {
      if (!validateField(el)) valid = false;
    });

    if (!valid) {
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Simulate submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      success.classList.remove('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Reset after 8 seconds
      setTimeout(() => {
        success.classList.add('hidden');
      }, 8000);
    }, 1200);
  });
})();


// ===== TESTIMONIAL SLIDER =====
(function initTestimonialSlider() {
  const track    = document.getElementById('testimonialTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');
  const cards    = track.querySelectorAll('.testimonial-card');
  const total    = cards.length;
  let   current  = 0;
  let   autoTimer;

  function getVisible() {
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, total - getVisible());
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() {
    goTo(current >= maxIndex() ? 0 : current + 1);
  }

  function prev() {
    goTo(current <= 0 ? maxIndex() : current - 1);
  }

  function startAuto() {
    autoTimer = setInterval(next, 4500);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      if (diff > 0) next(); else prev();
      startAuto();
    }
  });

  // Init
  buildDots();
  goTo(0);
  startAuto();

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, maxIndex()));
    }, 200);
  });
})();


// ===== SCROLL REVEAL ANIMATIONS =====
(function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.service-card, .why-card, .contact-card, .testimonial-card, .pillar, .booking-feature'
  );

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, (entry.target.dataset.aosDelay || 0));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
})();


// ===== FOOTER YEAR =====
(function setYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
})();


// ===== SET MIN DATETIME FOR BOOKING =====
(function setMinDateTime() {
  const dateInput = document.getElementById('dateTime');
  if (!dateInput) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() + 30); // At least 30 min from now
  const pad = n => String(n).padStart(2, '0');
  const min = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  dateInput.min = min;
  dateInput.value = min;
})();
