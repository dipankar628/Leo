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

    // Order items storage
    let orderedItems = [];

    // Set minimum date to today
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // ========== FOOD ITEM MANAGEMENT ==========
    const foodItemSelect = document.getElementById('foodItem');
    const foodQuantityInput = document.getElementById('foodQuantity');
    const addFoodBtn = document.getElementById('addFoodBtn');
    const orderedItemsList = document.getElementById('orderedItemsList');
    const orderedItemsContainer = document.getElementById('orderedItemsContainer');
    const clearOrderBtn = document.getElementById('clearOrderBtn');

    // Add food item to order
    addFoodBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const selectedOption = foodItemSelect.options[foodItemSelect.selectedIndex];
        const foodItem = selectedOption.text.split(' - ')[0].trim(); // Extract name without price
        const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
        const quantity = parseInt(foodQuantityInput.value) || 1;

        if (!foodItem || !price) {
            alert('Please select a food item');
            return;
        }

        // Check if item already exists in order
        const existingItem = orderedItems.find(item => item.name === foodItem);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            orderedItems.push({ name: foodItem, price: price, quantity: quantity });
        }

        // Reset the selectors
        foodItemSelect.value = '';
        foodQuantityInput.value = '1';

        // Update the display
        updateOrderDisplay();
    });

    // Allow adding items with Enter key
    foodQuantityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFoodBtn.click();
        }
    });

    // Calculate total bill
    function calculateTotal() {
        return orderedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Update the order items display
    function updateOrderDisplay() {
        if (orderedItems.length === 0) {
            orderedItemsContainer.style.display = 'none';
            return;
        }

        orderedItemsContainer.style.display = 'block';
        orderedItemsList.innerHTML = '';

        orderedItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-qty">× ${item.quantity}</span>
                <span class="item-price">₹${itemTotal}</span>
                <button type="button" class="remove-item" data-index="${index}">✕</button>
            `;
            orderedItemsList.appendChild(li);
        });

        // Add bill summary (remove old one if exists)
        const existingBillSummary = orderedItemsList.parentNode.querySelector('.bill-summary');
        if (existingBillSummary) {
            existingBillSummary.remove();
        }
        
        const total = calculateTotal();
        const billSummary = document.createElement('div');
        billSummary.className = 'bill-summary';
        billSummary.innerHTML = `
            <div class="bill-row">
                <span>Subtotal:</span>
                <span>₹${total}</span>
            </div>
            <div class="bill-total">
                <span>💰 Total Bill:</span>
                <span>₹${total}</span>
            </div>
        `;
        orderedItemsList.parentNode.insertBefore(billSummary, clearOrderBtn);

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-index'));
                orderedItems.splice(index, 1);
                updateOrderDisplay();
            });
        });
    }

    // Clear entire order
    clearOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        orderedItems = [];
        updateOrderDisplay();
    });

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
        
        // Add ordered items if any
        if (orderedItems.length > 0) {
            message += `\n💳 *ORDER BILL* 💳\n`;
            message += `${'─'.repeat(40)}\n`;
            
            let totalBill = 0;
            orderedItems.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalBill += itemTotal;
                message += `${item.name}\n`;
                message += `  ₹${item.price} × ${item.quantity} = ₹${itemTotal}\n`;
            });
            
            message += `${'─'.repeat(40)}\n`;
            message += `💰 *Total Bill: ₹${totalBill}*\n`;
        }
        
        if (specialReqs) {
            message += `\n📝 *Special Requests:* ${specialReqs}\n`;
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
            orderedItems = [];
            updateOrderDisplay();
        }, 8000);
    });

    // ========== QUICK ORDER FORM (WhatsApp Integration) ==========
    const quickOrderForm = document.getElementById('quickOrderForm');
    const quickOrderSuccess = document.getElementById('quickOrderSuccess');
    let quickOrderedItems = [];

    const quickFoodItemSelect = document.getElementById('quickFoodItem');
    const quickFoodQuantityInput = document.getElementById('quickFoodQuantity');
    const quickAddFoodBtn = document.getElementById('quickAddFoodBtn');
    const quickOrderedItemsList = document.getElementById('quickOrderedItemsList');
    const quickOrderedItemsContainer = document.getElementById('quickOrderedItemsContainer');
    const quickClearOrderBtn = document.getElementById('quickClearOrderBtn');

    // Add food item to quick order
    quickAddFoodBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const selectedOption = quickFoodItemSelect.options[quickFoodItemSelect.selectedIndex];
        const foodItem = selectedOption.text.split(' - ')[0].trim();
        const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
        const quantity = parseInt(quickFoodQuantityInput.value) || 1;

        if (!foodItem || !price) {
            alert('Please select a food item');
            return;
        }

        const existingItem = quickOrderedItems.find(item => item.name === foodItem);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            quickOrderedItems.push({ name: foodItem, price: price, quantity: quantity });
        }

        quickFoodItemSelect.value = '';
        quickFoodQuantityInput.value = '1';

        updateQuickOrderDisplay();
    });

    // Allow adding items with Enter key
    quickFoodQuantityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            quickAddFoodBtn.click();
        }
    });

    // Calculate total for quick order
    function calculateQuickTotal() {
        return quickOrderedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Update quick order display
    function updateQuickOrderDisplay() {
        if (quickOrderedItems.length === 0) {
            quickOrderedItemsContainer.style.display = 'none';
            return;
        }

        quickOrderedItemsContainer.style.display = 'block';
        quickOrderedItemsList.innerHTML = '';

        quickOrderedItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-qty">× ${item.quantity}</span>
                <span class="item-price">₹${itemTotal}</span>
                <button type="button" class="remove-item" data-index="${index}">✕</button>
            `;
            quickOrderedItemsList.appendChild(li);
        });

        // Add bill summary (remove old one if exists)
        const existingBillSummary = quickOrderedItemsList.parentNode.querySelector('.bill-summary');
        if (existingBillSummary) {
            existingBillSummary.remove();
        }
        
        const total = calculateQuickTotal();
        const billSummary = document.createElement('div');
        billSummary.className = 'bill-summary';
        billSummary.innerHTML = `
            <div class="bill-row">
                <span>Subtotal:</span>
                <span>₹${total}</span>
            </div>
            <div class="bill-total">
                <span>💰 Total Bill:</span>
                <span>₹${total}</span>
            </div>
        `;
        quickOrderedItemsList.parentNode.insertBefore(billSummary, quickClearOrderBtn);

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('data-index'));
                quickOrderedItems.splice(index, 1);
                updateQuickOrderDisplay();
            });
        });
    }

    // Clear entire quick order
    quickClearOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        quickOrderedItems = [];
        updateQuickOrderDisplay();
    });

    // Quick order form submission
    quickOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('orderName').value.trim();
        const email = document.getElementById('orderEmail').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();

        // Validation
        if (!name) {
            alert('Name is required');
            return;
        }

        if (quickOrderedItems.length === 0) {
            alert('Please add at least one item to your order');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email');
            return;
        }

        // Build WhatsApp message
        let message = `🦁 *LEO CAVE RESTRO — Quick Order* 🦁\n\n`;
        message += `👤 *Name:* ${name}\n`;
        if (email) {
            message += `📧 *Email:* ${email}\n`;
        }
        if (phone) {
            message += `📞 *Phone:* ${phone}\n`;
        }
        
        message += `\n💳 *ORDER DETAILS* 💳\n`;
        message += `${'─'.repeat(40)}\n`;
        
        let totalBill = 0;
        quickOrderedItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalBill += itemTotal;
            message += `${item.name}\n`;
            message += `  ₹${item.price} × ${item.quantity} = ₹${itemTotal}\n`;
        });
        
        message += `${'─'.repeat(40)}\n`;
        message += `💰 *Total Bill: ₹${totalBill}*\n`;
        message += `\n_Sent from leocaverestro.com_`;

        // Encode and open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');

        // Show success state
        quickOrderForm.style.display = 'none';
        quickOrderSuccess.classList.add('active');

        // Reset after 8 seconds
        setTimeout(() => {
            quickOrderForm.reset();
            quickOrderForm.style.display = 'block';
            quickOrderSuccess.classList.remove('active');
            quickOrderedItems = [];
            updateQuickOrderDisplay();
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
