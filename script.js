// Simple interactions for the Yashtex template

document.addEventListener('DOMContentLoaded', () => {
    // Subtle parallax to the hero highlight underline
    const highlight = document.querySelector('.green-underline');
    
    if (highlight) {
        window.addEventListener('scroll', () => {
            const scrollVal = window.scrollY;
            if (scrollVal < 300) {
                highlight.style.transform = `translateY(${scrollVal * 0.05}px) scaleX(${1 + scrollVal * 0.0001})`;
            }
        });
    }

    // FAQ Accordion Interaction
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            // Check if this item is currently active
            const isActive = item.classList.contains('active');
            
            // Close all items first for a clean accordion effect
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Tech Logos Interaction
    const techItems = document.querySelectorAll('.logo-item');
    const tooltip = document.getElementById('tech-tooltip');
    let tooltipTimeout;

    if (techItems.length > 0 && tooltip) {
        techItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const name = item.getAttribute('data-name');
                tooltip.textContent = name;
                
                // Position tooltip relative to viewport
                const rect = item.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                tooltip.style.top = rect.top - 10 + 'px';
                
                tooltip.classList.add('show');
                
                clearTimeout(tooltipTimeout);
                tooltipTimeout = setTimeout(() => {
                    tooltip.classList.remove('show');
                }, 2000); // Hide after 2 seconds
                
                // Pause animation momentarily so user can tap reliably and read
                const marquee = item.closest('.marquee-wrapper');
                const contents = marquee.querySelectorAll('.marquee-content');
                contents.forEach(c => c.style.animationPlayState = 'paused');
                setTimeout(() => {
                    contents.forEach(c => c.style.animationPlayState = 'running');
                }, 2000);
            });
        });
    }

    // --- LUSION CURSOR & GLOW ---
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    const glow = document.querySelector('.cursor-glow');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX, followerY = mouseY;
    let glowX = mouseX, glowY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // The tiny center dot snaps instantly to cursor to hide native latency feeling
        if(cursor) {
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        }
    });

    function renderLusion() {
        // Smooth easing for the outer ring (fast follow)
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        if(follower) {
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
        }

        // Extremely smooth easing for the giant background glow (slow fluid follow)
        let dx = (mouseX - glowX);
        let dy = (mouseY - glowY);
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        glowX += dx * 0.05;
        glowY += dy * 0.05;
        
        if(glow) {
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            
            // Calculate rotation angle matching trajectory
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Calculate elastic stretching based on moving speed
            // "Water Shake" inertia - stretches on length, squishes on width
            let stretchX = 1 + (distance * 0.004);
            let stretchY = 1 - (distance * 0.002);
            
            // Cap bounds to prevent extreme distortions
            stretchX = Math.min(stretchX, 2.5);
            stretchY = Math.max(stretchY, 0.4);
            
            glow.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${stretchX}, ${stretchY})`;
        }

        requestAnimationFrame(renderLusion);
    }
    renderLusion();

    // Hover state expanding ring on interactive elements
    const interactives = document.querySelectorAll('a, button, .faq-item, .logo-item, .btn-shiny, .btn-dark-sm, .social');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if(cursor) cursor.classList.add('hover');
            if(follower) follower.classList.add('hover');
            if(glow) glow.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            if(cursor) cursor.classList.remove('hover');
            if(follower) follower.classList.remove('hover');
            if(glow) glow.classList.remove('hover');
        });
    });

    // --- SCROLL REVEAL ANIMATIONS ---
    const blocksToReveal = document.querySelectorAll('.section-header, .portfolio-card, .pricing-card, .testimonial-card, .bento-card, .bento-mini, .faq-card, .product-card, .about-card');
    
    // Automatically flag elements for CSS animation without cluttering HTML
    blocksToReveal.forEach((el, index) => {
        el.classList.add('reveal-up');
        // Add a tiny stagger delay based on DOM order for a cascaded fade-in
        el.style.transitionDelay = `${(index % 3) * 0.1}s`; 
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed to retain state
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it completely enters
    });

    blocksToReveal.forEach(el => revealObserver.observe(el));

    // --- CANVAS WATER RIPPLES (LUSION SHAKE) ---
    const waveCanvas = document.createElement('canvas');
    waveCanvas.id = 'lusion-waves';
    waveCanvas.style.position = 'fixed';
    waveCanvas.style.top = '0';
    waveCanvas.style.left = '0';
    waveCanvas.style.width = '100vw';
    waveCanvas.style.height = '100vh';
    waveCanvas.style.pointerEvents = 'none';
    waveCanvas.style.zIndex = '9997'; // Behind glowing orb, above background
    document.body.prepend(waveCanvas);
    
    const ctx = waveCanvas.getContext('2d');
    let width, height;
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        waveCanvas.width = width;
        waveCanvas.height = height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let ripples = [];
    let lastRippleTime = 0;

    document.addEventListener('mousemove', (e) => {
        let now = Date.now();
        // Limit ripple spawning rate to prevent overload
        if (now - lastRippleTime > 35) {
            ripples.push({
                x: e.clientX,
                y: e.clientY,
                r: 5,
                alpha: 0.5,
                // Slightly randomize speed for organic waves
                speed: 1.5 + Math.random() * 2
            });
            lastRippleTime = now;
        }
    });

    function drawWater() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < ripples.length; i++) {
            let p = ripples[i];
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            
            // Gradient to simulate water depth and light reflection
            let gradient = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r);
            gradient.addColorStop(0, `rgba(0, 208, 132, 0)`);
            gradient.addColorStop(1, `rgba(0, 208, 132, ${p.alpha * 0.15})`); // Green tint
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(37, 99, 235, ${p.alpha * 0.3})`; // Blue outer rim
            ctx.stroke();

            // Expand and fade ripple
            p.r += p.speed;
            p.alpha -= 0.008;

            if (p.alpha <= 0) {
                ripples.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(drawWater);
    }
    drawWater();
});
