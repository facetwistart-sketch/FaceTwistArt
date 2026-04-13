/* ============================================
   Mobile Menu Toggle
   ============================================ */
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
    document.getElementById('hamburger').classList.toggle('active');
}

// Close mobile menu on link click
document.querySelectorAll('#navLinks a').forEach(function (link) {
    link.addEventListener('click', function () {
        document.getElementById('navLinks').classList.remove('open');
        document.getElementById('hamburger').classList.remove('active');
    });
});

/* ============================================
   Navbar background on scroll
   ============================================ */
window.addEventListener('scroll', function () {
    var nav = document.getElementById('navbar');
    nav.style.background = window.scrollY > 50
        ? 'rgba(9,9,11,0.95)'
        : 'rgba(9,9,11,0.85)';
});

/* ============================================
   Scroll Reveal (Fade-in on scroll)
   ============================================ */
var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
});

/* ============================================
   Count-up Animation for 80+ stat
   ============================================ */
var countStarted = false;
var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting && !countStarted) {
            countStarted = true;
            var el = document.getElementById('clientCount');
            var target = 80;
            var current = 0;
            var duration = 2000;
            var stepTime = Math.floor(duration / target);
            var timer = setInterval(function () {
                current++;
                el.textContent = current + '+';
                if (current >= target) {
                    clearInterval(timer);
                }
            }, stepTime);
        }
    });
}, { threshold: 0.3 });

var countEl = document.getElementById('clientCount');
if (countEl) {
    countObserver.observe(countEl.closest('.why-us-stats'));
}

/* ============================================
   ORDER MODAL – Open / Close
   ============================================ */
var currentFormat = '';
var currentPrice = '';

function openOrderModal(format, price, dims) {
    currentFormat = format;
    currentPrice = price;

    // Remove highlight from all cards, then highlight selected
    document.querySelectorAll('.product-card').forEach(function (card) {
        card.classList.remove('highlighted');
    });
    var selectedCard = document.getElementById('card-' + format);
    if (selectedCard) {
        selectedCard.classList.add('highlighted');
    }

    // Fill modal product info
    document.getElementById('modalFormat').textContent = format + ' Карикатура';
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalDims').textContent = dims;
    document.getElementById('modalImg').src = 'media/' + format.toLowerCase() + '.jpg';

    // Fill hidden fields
    document.getElementById('orderFormat').value = format;
    document.getElementById('orderPrice').value = price;

    // Show modal
    var overlay = document.getElementById('orderModal');
    overlay.style.display = 'flex';
    // Trigger reflow for animation
    void overlay.offsetWidth;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    var overlay = document.getElementById('orderModal');
    overlay.classList.remove('active');
    setTimeout(function () {
        overlay.style.display = 'none';
    }, 300);
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('orderModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeOrderModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeOrderModal();
    }
});

/* ============================================
   HELPER – Submit form via fetch or native fallback
   ============================================ */
function submitForm(form, btn, successText, defaultText, onSuccess) {
    btn.textContent = 'Се испраќа...';
    btn.disabled = true;

    // If opened from file://, use native submit (fetch won't work)
    if (window.location.protocol === 'file:') {
        form.submit();
        return;
    }

    // Send as standard form-encoded data
    var formData = new FormData(form);
    var params = new URLSearchParams(formData).toString();

    fetch(form.action, {
        method: 'POST',
        body: params,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        if (response.ok) {
            btn.textContent = successText;
            btn.style.background = 'var(--green)';
            form.reset();
            if (onSuccess) onSuccess();
            setTimeout(function () {
                btn.textContent = defaultText;
                btn.style.background = '';
                btn.disabled = false;
            }, 3500);
        } else {
            showFormError(btn, defaultText);
        }
    }).catch(function () {
        // Fallback: native form submit
        form.submit();
    });
}

function showFormError(btn, defaultText) {
    btn.textContent = 'Грешка – обидете се повторно';
    btn.style.background = '#ef4444';
    setTimeout(function () {
        btn.textContent = defaultText;
        btn.style.background = '';
        btn.disabled = false;
    }, 3000);
}

/* ============================================
   ORDER FORM – Validation & Submit
   ============================================ */
document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = this;
    var valid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(function (g) {
        g.classList.remove('error');
    });

    // Name
    var name = document.getElementById('orderName');
    if (!name.value.trim()) {
        name.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Surname
    var surname = document.getElementById('orderSurname');
    if (!surname.value.trim()) {
        surname.closest('.form-group').classList.add('error');
        valid = false;
    }

    // City
    var city = document.getElementById('orderCity');
    if (!city.value) {
        city.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Phone – pattern: 07X XXX XXX
    var phone = document.getElementById('orderPhone');
    var phonePattern = /^07[0-9]\s?[0-9]{3}\s?[0-9]{3}$/;
    if (!phonePattern.test(phone.value.trim())) {
        phone.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Email – must contain @
    var email = document.getElementById('orderEmail');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
        email.closest('.form-group').classList.add('error');
        valid = false;
    }

    if (!valid) return;

    var btn = document.getElementById('orderSubmitBtn');
    submitForm(form, btn, 'Нарачката е испратена!', 'Испрати нарачка', function () {
        document.querySelectorAll('.product-card').forEach(function (card) {
            card.classList.remove('highlighted');
        });
        setTimeout(function () { closeOrderModal(); }, 2500);
    });
});

/* ============================================
   CONTACT FORM – Validation & Submit
   ============================================ */
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = this;
    var valid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(function (g) {
        g.classList.remove('error');
    });

    // Name
    var name = document.getElementById('contactName');
    if (!name.value.trim()) {
        name.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Surname
    var surname = document.getElementById('contactSurname');
    if (!surname.value.trim()) {
        surname.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Phone
    var phone = document.getElementById('contactPhone');
    var phonePattern = /^07[0-9]\s?[0-9]{3}\s?[0-9]{3}$/;
    if (!phonePattern.test(phone.value.trim())) {
        phone.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Email
    var email = document.getElementById('contactEmail');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
        email.closest('.form-group').classList.add('error');
        valid = false;
    }

    // Message
    var message = document.getElementById('contactMessage');
    if (!message.value.trim()) {
        message.closest('.form-group').classList.add('error');
        valid = false;
    }

    if (!valid) return;

    var btn = document.getElementById('contactSubmitBtn');
    submitForm(form, btn, 'Пораката е испратена!', 'Испрати порака');
});
