(function () {
    'use strict';

    var root = document.documentElement;
    var body = document.body;
    root.classList.remove('no-js');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ---------- Header: glass bar once the page scrolls ---------- */
    var header = document.getElementById('siteHeader');
    var ticking = false;
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 24);
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- Menu sheet (tablet & mobile) ---------- */
    var menu = document.getElementById('siteMenu');
    var menuToggle = document.querySelector('.menu-toggle');

    function setMenu(open) {
        menu.hidden = !open;
        body.classList.toggle('no-scroll', open);
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    menuToggle.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) {
        if (e.target.closest('a, [data-sheet-close]')) setMenu(false);
    });
    var desktopQuery = window.matchMedia('(min-width: 1200px)');
    function onDesktop(e) { if (e.matches && !menu.hidden) setMenu(false); }
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onDesktop);

    /* ---------- Enquiry popup ---------- */
    var enquiryModal = document.getElementById('enquiryModal');
    var popupTitle = document.getElementById('popupTitle');
    var lightbox = document.getElementById('lightbox');
    var lastFocus = null;

    function openModal(modal) {
        lastFocus = document.activeElement;
        if (!menu.hidden) setMenu(false);
        modal.hidden = false;
        body.classList.add('no-scroll');
        var close = modal.querySelector('.modal-close');
        if (close) close.focus();
    }
    function closeModal(modal) {
        modal.hidden = true;
        if (menu.hidden && lightbox.hidden) body.classList.remove('no-scroll');
        if (lastFocus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-popup]');
        if (trigger) {
            popupTitle.textContent = trigger.getAttribute('data-popup') || 'Enquire Now';
            openModal(enquiryModal);
            return;
        }
        var closer = e.target.closest('[data-close]');
        if (closer) closeModal(closer.closest('.modal'));
    });

    // Auto-open the enquiry popup once per session
    var autoKey = 'pn_popup_seen';
    var seen = false;
    try { seen = sessionStorage.getItem(autoKey) === '1'; } catch (err) { /* storage unavailable */ }
    if (!seen) {
        setTimeout(function () {
            var busy = !menu.hidden || !lightbox.hidden || !enquiryModal.hidden;
            if (busy) return;
            popupTitle.textContent = 'Get Exclusive Launch Offers';
            openModal(enquiryModal);
            try { sessionStorage.setItem(autoKey, '1'); } catch (err) { /* storage unavailable */ }
        }, 12000);
    }

    /* ---------- Hero residences carousel ---------- */
    var residences = [
        { t: '3 BHK Premium', m: '1,960 Sq.Ft. · ₹2.89 Cr*', img: 'ai-kitchen-dining-sm', alt: 'Marble island kitchen and dining – artistic impression' },
        { t: '3 BHK Luxury', m: '2,260 – 2,490* Sq.Ft. · On Request', img: 'ai-sky-lounge-pool-sm', alt: 'Rooftop infinity pool at sunset – artistic impression' },
        { t: '3 BHK + Staff Grande', m: '2,700 Sq.Ft. · On Request', img: 'ai-central-greens-sm', alt: 'Landscaped central garden – artistic impression' },
        { t: '4 BHK Luxury', m: '3,150 Sq.Ft. · On Request', img: 'ai-gymnasium-sm', alt: 'Clubhouse gymnasium – artistic impression' },
        { t: '4 BHK + Staff Grande', m: '3,200 Sq.Ft. · On Request', img: 'ai-mini-theatre-sm', alt: 'Private mini theatre – artistic impression' }
    ];
    var feature = document.getElementById('heroFeature');
    var hcfImg = document.getElementById('hcfImg');
    var hcfTitle = document.getElementById('hcfTitle');
    var hcfMeta = document.getElementById('hcfMeta');
    var hcfNo = document.getElementById('hcfNo');
    var hcfLink = document.getElementById('hcfLink');
    var hcfBar = document.getElementById('hcfBar');
    var slide = 0;

    // checked live: with reduced motion the progress animation is near-instant and would spin the slides
    function runProgress() {
        if (reduceMotion.matches) { hcfBar.classList.remove('run'); return; }
        hcfBar.classList.remove('run');
        void hcfBar.offsetWidth; // restart the CSS animation
        hcfBar.classList.add('run');
    }
    function showSlide(i) {
        slide = (i + residences.length) % residences.length;
        var r = residences[slide];
        var src = 'images/gallery/' + r.img + '.webp';
        hcfImg.classList.add('is-swapping');
        var pre = new Image();
        pre.onload = pre.onerror = function () {
            hcfImg.src = src;
            hcfImg.alt = r.alt;
            hcfImg.classList.remove('is-swapping');
        };
        pre.src = src;
        hcfTitle.textContent = r.t;
        hcfMeta.textContent = r.m;
        hcfNo.textContent = ('0' + (slide + 1)).slice(-2);
        hcfLink.setAttribute('data-popup', 'Unlock Price Breakdown – ' + r.t);
        runProgress();
    }
    feature.addEventListener('click', function (e) {
        var nav = e.target.closest('[data-hcf]');
        if (nav) showSlide(slide + parseInt(nav.getAttribute('data-hcf'), 10));
    });
    hcfBar.addEventListener('animationend', function () { showSlide(slide + 1); });
    ['mouseenter', 'focusin'].forEach(function (ev) {
        feature.addEventListener(ev, function () { feature.classList.add('paused'); });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
        feature.addEventListener(ev, function () { feature.classList.remove('paused'); });
    });
    // let the hero entrance finish before the first auto-advance starts
    setTimeout(runProgress, 1200);

    /* ---------- Gallery lightbox ---------- */
    var lbImg = document.getElementById('lbImg');
    var lbCaption = document.getElementById('lbCaption');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var current = 0;

    function showItem(i) {
        current = (i + items.length) % items.length;
        var item = items[current];
        lbImg.src = item.getAttribute('href');
        lbImg.alt = item.querySelector('img').alt;
        lbCaption.textContent = item.getAttribute('data-caption') || '';
    }
    items.forEach(function (item, i) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            lastFocus = item;
            showItem(i);
            lightbox.hidden = false;
            body.classList.add('no-scroll');
            lightbox.querySelector('.lb-close').focus();
        });
    });
    function closeLightbox() {
        lightbox.hidden = true;
        if (menu.hidden && enquiryModal.hidden) body.classList.remove('no-scroll');
        if (lastFocus) lastFocus.focus();
    }
    lightbox.addEventListener('click', function (e) {
        var action = e.target.closest('[data-lb]');
        if (action) {
            var a = action.getAttribute('data-lb');
            if (a === 'close') closeLightbox();
            if (a === 'prev') showItem(current - 1);
            if (a === 'next') showItem(current + 1);
        } else if (e.target === lightbox) {
            closeLightbox();
        }
    });

    /* ---------- Keyboard ---------- */
    document.addEventListener('keydown', function (e) {
        if (!lightbox.hidden) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showItem(current - 1);
            if (e.key === 'ArrowRight') showItem(current + 1);
            return;
        }
        if (e.key !== 'Escape') return;
        if (!menu.hidden) setMenu(false);
        if (!enquiryModal.hidden) closeModal(enquiryModal);
    });

    /* ---------- Map: load the iframe only on demand ---------- */
    var mapFacade = document.getElementById('mapFacade');
    mapFacade.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.google.com/maps?q=Neopolis+Kokapet+Hyderabad&output=embed';
        iframe.title = 'Project Name, Neopolis Kokapet location on Google Maps';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.allowFullscreen = true;
        mapFacade.replaceWith(iframe);
    });

    /* ---------- Active section in the header menu & sheet ---------- */
    var menuLinks = document.querySelectorAll('.top-nav a, .sheet-list a');
    var navTargets = {};
    document.querySelectorAll('.top-nav a').forEach(function (a) { navTargets[a.getAttribute('href')] = true; });

    /* ---------- Scroll reveal ---------- */
    var reveals = document.querySelectorAll('.reveal');
    // stagger siblings so grids cascade
    reveals.forEach(function (el) {
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (s) {
            return s.classList.contains('reveal');
        });
        var index = siblings.indexOf(el);
        if (index > 0) el.style.setProperty('--d', (index % 4) * 0.1 + 's');
    });

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(function (el) { el.classList.add('in'); });
        return;
    }

    var motion = !reduceMotion.matches;

    // wrap each word of an element in a span; nested inline elements (e.g. <em>) keep their styling
    function wrapWords(el, make) {
        Array.prototype.slice.call(el.childNodes).forEach(function (node) {
            if (node.nodeType === 1) {
                if (!node.classList.contains('sr-only')) wrapWords(node, make);
                return;
            }
            if (node.nodeType !== 3 || !node.textContent.trim()) return;
            var frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(function (part) {
                if (part) frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : make(part));
            });
            node.parentNode.replaceChild(frag, node);
        });
    }

    /* ---------- Masked word rise for section titles ---------- */
    var splitTitles = [];
    /* ---------- Scroll-filled statement text ---------- */
    var fills = [];
    if (motion) {
        document.querySelectorAll('main .section-title').forEach(function (title) {
            var i = 0;
            title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
            wrapWords(title, function (word) {
                var w = document.createElement('span');
                var inner = document.createElement('span');
                w.className = 'w';
                w.setAttribute('aria-hidden', 'true');
                inner.className = 'wi';
                inner.textContent = word;
                inner.style.setProperty('--i', i++);
                w.appendChild(inner);
                return w;
            });
            title.classList.add('split');
            splitTitles.push(title);
        });
        document.querySelectorAll('.fill-text').forEach(function (el) {
            var words = [];
            wrapWords(el, function (word) {
                var s = document.createElement('span');
                s.className = 'fw';
                s.textContent = word;
                words.push(s);
                return s;
            });
            fills.push({ el: el, words: words });
        });
    }

    root.classList.add('anim-ready');

    // Animations replay on every pass, in both scroll directions:
    // an element animates in once it is properly on screen, and resets only after it has
    // fully left the screen, so the reset is never visible.
    var enterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add('in');
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    var exitObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) entry.target.classList.remove('in');
        });
    });
    var animated = Array.prototype.slice.call(reveals).concat(splitTitles);
    animated.forEach(function (el) {
        enterObserver.observe(el);
        if (motion) exitObserver.observe(el);
    });

    /* ---------- Number counters (re-count on every pass) ---------- */
    function countUp(el) {
        var m = el.dataset.final.match(/^(\d+)(.*)$/);
        var end = +m[1], suffix = m[2], start = null;
        var run = el.dataset.run = (+el.dataset.run || 0) + 1; // a newer run cancels an older one
        function step(t) {
            if (el.dataset.run != run) return;
            if (start === null) start = t;
            var p = Math.min((t - start) / 1600, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }
    if (motion) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var el = entry.target;
                // count once well in view; reset to 0 only when completely off screen
                if (entry.intersectionRatio >= 0.6 && el.dataset.state !== 'counted') {
                    el.dataset.state = 'counted';
                    countUp(el);
                } else if (!entry.isIntersecting) {
                    el.dataset.state = '';
                    el.dataset.run = (+el.dataset.run || 0) + 1; // stop any run in progress
                    el.textContent = el.dataset.final.replace(/^\d+/, '0');
                }
            });
        }, { threshold: [0, 0.6] });
        document.querySelectorAll('.count').forEach(function (el) {
            if (!/^\d+/.test(el.textContent)) return;
            el.dataset.final = el.textContent;
            counterObserver.observe(el);
        });
    }

    /* ---------- Scroll-linked motion: hero recede, parallax, text fill, highlight steps ---------- */
    var parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var hero = document.querySelector('.hero');
    var heroInner = hero.querySelector('.hero-inner');
    var heroPic = hero.querySelector('.hero-media picture');
    var hlList = document.getElementById('highlightList');
    var hlItems = Array.prototype.slice.call(hlList.children);
    var wide = window.matchMedia('(min-width: 1024px)');
    var frameQueued = false;

    function onFrame() {
        frameQueued = false;
        var vh = window.innerHeight;

        // the hero copy drifts up and fades while the image slowly pushes in (desktop: image is the backdrop)
        if (wide.matches) {
            var p = Math.min(window.scrollY / hero.offsetHeight, 1);
            heroInner.style.transform = 'translate3d(0,' + (p * -90).toFixed(1) + 'px,0)';
            heroInner.style.opacity = Math.max(1 - p * 1.6, 0).toFixed(3);
            heroPic.style.transform = 'scale(' + (1 + p * 0.12).toFixed(4) + ')';
        } else if (heroInner.style.transform) {
            heroInner.style.transform = heroInner.style.opacity = heroPic.style.transform = '';
        }

        // images move a little slower than the page
        parallax.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            var c = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
            el.style.setProperty('--py', (-c * r.height * 0.06).toFixed(1) + 'px');
        });

        // statement fills in word by word; complete once its top reaches ~38% of the screen
        fills.forEach(function (f) {
            var top = f.el.getBoundingClientRect().top;
            var n = Math.round(Math.min(Math.max((vh * 0.88 - top) / (vh * 0.5), 0), 1) * f.words.length);
            f.words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
        });

        // highlights: light up the row nearest the centre of the screen
        if (wide.matches) {
            var rects = hlItems.map(function (li) { return li.getBoundingClientRect(); });
            var bestTop = null, bestD = Infinity;
            rects.forEach(function (r) {
                var d = Math.abs(r.top + r.height / 2 - vh / 2);
                if (d < bestD) { bestD = d; bestTop = r.top; }
            });
            hlList.classList.add('is-tracking');
            hlItems.forEach(function (li, i) { li.classList.toggle('is-active', Math.abs(rects[i].top - bestTop) < 4); });
        } else {
            hlList.classList.remove('is-tracking');
        }
    }
    function requestFrame() {
        if (!frameQueued) { frameQueued = true; window.requestAnimationFrame(onFrame); }
    }
    if (motion) {
        window.addEventListener('scroll', requestFrame, { passive: true });
        window.addEventListener('resize', requestFrame);
        onFrame();
    }

    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = '#' + entry.target.id;
            // sections without a desktop link (e.g. FAQ) keep the sheet in sync but leave the top nav as is
            menuLinks.forEach(function (link) {
                var inTop = link.closest('.top-nav');
                if (inTop && !navTargets[id]) return;
                link.classList.toggle('active', link.getAttribute('href') === id);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
})();
