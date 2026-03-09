/* ============================================
   Jochen Winter e.K. – Website Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Sticky Navigation with Glassmorphism ----
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---- Mobile Navigation ----
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-menu-overlay';
    document.body.appendChild(overlay);

    const toggleMenu = () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    };

    navToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu on link click
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) toggleMenu();
        });
    });

    // ---- Intersection Observer for Reveal Animations ----
    const reveals = document.querySelectorAll('.reveal-animate');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // Sofort alle im Viewport sichtbaren Elemente einblenden
    setTimeout(() => {
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }, 200);

    // ---- Counter Animation ----
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    if (!target || el.dataset.counted) return;
                    el.dataset.counted = 'true';
                    const duration = 2000;
                    const steps = 60;
                    const increment = target / steps;
                    let current = 0;
                    let step = 0;
                    const timer = setInterval(() => {
                        step++;
                        current = Math.round((target * step) / steps);
                        el.textContent = current;
                        if (step >= steps) {
                            el.textContent = target;
                            clearInterval(timer);
                        }
                    }, duration / steps);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.3 });
        counters.forEach(el => counterObserver.observe(el));
    }

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = navbar.offsetHeight + 20;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- Multi-Step Funnel ----
    const funnelBody = document.getElementById('funnelBody');
    const progressBar = document.getElementById('funnelProgressBar');

    if (funnelBody) {
        let selectedFahrt = '';

        const progressMap = {
            choice: 25,
            frage: 50,
            kontakt: 40,
            fahrtart: 60,
            details: 85,
            success: 100
        };

        const goToStep = (stepName) => {
            const steps = funnelBody.querySelectorAll('.funnel-step');
            steps.forEach(s => s.classList.remove('active'));
            const target = funnelBody.querySelector(`[data-step="${stepName}"]`);
            if (target) {
                target.classList.add('active');
                if (progressBar) {
                    progressBar.style.width = (progressMap[stepName] || 25) + '%';
                }
                // Scroll card into view
                const card = document.querySelector('.funnel-card');
                if (card) {
                    const rect = card.getBoundingClientRect();
                    if (rect.top < 0 || rect.top > window.innerHeight * 0.4) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        };

        // Step 1: Choice cards
        funnelBody.querySelectorAll('.funnel-choice-card').forEach(card => {
            card.addEventListener('click', () => {
                const choice = card.dataset.choice;
                if (choice === 'frage') {
                    goToStep('frage');
                } else if (choice === 'fahrt') {
                    goToStep('kontakt');
                }
            });
        });

        // Back buttons
        funnelBody.querySelectorAll('.funnel-btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                goToStep(btn.dataset.goto);
            });
        });

        // Allgemeine Frage form
        const frageForm = document.getElementById('frageForm');
        if (frageForm) {
            frageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                goToStep('success');
            });
        }

        // Kontakt step (Lead Capture) – save to localStorage on submit
        const kontaktStep = document.getElementById('kontaktStep');
        if (kontaktStep) {
            kontaktStep.addEventListener('submit', (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(kontaktStep).entries());
                try {
                    localStorage.setItem('jw_lead', JSON.stringify(data));
                } catch (_) {}
                goToStep('fahrtart');
            });
        }

        // Fahrt type selection
        const fahrtCards = funnelBody.querySelectorAll('.funnel-fahrt-card');
        const fahrtNextBtn = funnelBody.querySelector('[data-step="fahrtart"] .funnel-btn-next');

        fahrtCards.forEach(card => {
            card.addEventListener('click', () => {
                fahrtCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedFahrt = card.dataset.fahrt;
                if (fahrtNextBtn) fahrtNextBtn.disabled = false;
            });
        });

        if (fahrtNextBtn) {
            fahrtNextBtn.addEventListener('click', () => {
                if (selectedFahrt) goToStep('details');
            });
        }

        // Details form – final submit
        const detailsForm = document.getElementById('detailsForm');
        if (detailsForm) {
            detailsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const details = Object.fromEntries(new FormData(detailsForm).entries());
                let lead = {};
                try {
                    lead = JSON.parse(localStorage.getItem('jw_lead') || '{}');
                } catch (_) {}
                const fullData = { ...lead, fahrtart: selectedFahrt, ...details };
                // Store complete request
                try {
                    localStorage.setItem('jw_anfrage', JSON.stringify(fullData));
                    localStorage.removeItem('jw_lead');
                } catch (_) {}
                goToStep('success');
            });
        }
    }

    // ---- Parallax effect on hero ----
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
        }, { passive: true });
    }

});