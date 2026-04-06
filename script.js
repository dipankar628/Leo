// =============================================
//  LEO CAVE RESTRO — INTERACTIVE FEATURES
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    // ========== NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
    const sections = document.querySelectorAll('section[id]');

    function handleNavScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === current ||
                (current === 'about-snippet' && href === 'home') ||
                (current === 'featured' && href === 'home')) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();


    // ========== MOBILE MENU TOGGLE ==========
    const navToggle = document.getElementById('navToggle');
    const navLinksEl = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinksEl.classList.toggle('open');
        document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinksEl.classList.remove('open');
            document.body.style.overflow = '';
        });
    });


    // ========== MENU TABS ==========
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuGrids = document.querySelectorAll('.menu-grid');

    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');

            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            menuGrids.forEach(grid => {
                grid.classList.remove('active');
                if (grid.id === category) {
                    grid.classList.add('active');
                    // Re-trigger reveal animations for newly visible items
                    grid.querySelectorAll('.reveal').forEach(el => {
                        el.classList.remove('visible');
                        void el.offsetWidth; // force reflow
                        el.classList.add('visible');
                    });
                }
            });
        });
    });


    // ========== GALLERY LIGHTBOX ==========
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const caption = item.getAttribute('data-caption') || '';
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });


    // ========== SCROLL REVEAL ==========
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ========== RESERVATION FORM (WhatsApp Integration) ==========
    const form = document.getElementById('reservationForm');
    const formSuccess = document.getElementById('formSuccess');

    // ⚠️ CHANGE THIS to your WhatsApp number (with country code, no + or spaces)
    // Example: India = 91, so 91XXXXXXXXXX
    const WHATSAPP_NUMBER = '917002025251';

    // Set minimum date to today
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        const name = document.getElementById('guestName').value.trim();
        const email = document.getElementById('guestEmail').value.trim();
        const phone = document.getElementById('guestPhone').value.trim();
        const date = document.getElementById('resDate').value;
        const time = document.getElementById('resTime').value;
        const guests = document.getElementById('guestCount').value;
        const specialReqs = document.getElementById('specialReqs').value.trim();

        // Validation
        if (!name || !email || !phone || !date || !time || !guests) {
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('guestEmail').focus();
            return;
        }

        // Format the date nicely
        const dateObj = new Date(date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Format time nicely
        const [h, m] = time.split(':');
        const hour12 = ((+h % 12) || 12) + ':' + m + (+h >= 12 ? ' PM' : ' AM');

        // Build WhatsApp message
        let message = `🦁 *LEO CAVE RESTRO — New Reservation* 🦁\n\n`;
        message += `👤 *Name:* ${name}\n`;
        message += `📧 *Email:* ${email}\n`;
        message += `📞 *Phone:* ${phone}\n`;
        message += `📅 *Date:* ${formattedDate}\n`;
        message += `🕐 *Time:* ${hour12}\n`;
        message += `👥 *Guests:* ${guests}\n`;
        if (specialReqs) {
            message += `📝 *Special Requests:* ${specialReqs}\n`;
        }
        message += `\n_Sent from leocaverestro.com_`;

        // Encode and open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');

        // Show success state on the form
        form.style.display = 'none';
        formSuccess.classList.add('active');

        // Reset after 8 seconds
        setTimeout(() => {
            form.reset();
            form.style.display = 'block';
            formSuccess.classList.remove('active');
        }, 8000);
    });


    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
