// Iyamossa Empire - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeScrollAnimations();
    initializeParallax();
    initializeCarousel();
    initializeBackToTop();
    initializeSmoothScroll();
    initializeFormValidation();
    initializeCounters();
    initializeLazyLoading();
});

// Enhanced Navigation functionality with touch support
function initializeNavigation() {
    const header = document.getElementById('header');
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    let lastScrollY = window.scrollY;
    let ticking = false;

    // Enhanced scroll detection with throttling for mobile performance
    function updateScrollState() {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class with offset
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Add direction-based classes
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add('scrolling-down');
            header.classList.remove('scrolling-up');
        } else {
            header.classList.add('scrolling-up');
            header.classList.remove('scrolling-down');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }

    // Optimized scroll event listener
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }, { passive: true });

    // Enhanced mobile menu toggle with touch support
    if (navbarToggle && navbarMenu) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        // Touch gesture support for menu
        navbarMenu.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        navbarMenu.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        });
        
        function handleSwipeGesture() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            // Swipe left to close menu
            if (diff < -swipeThreshold && navbarMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
        
        function closeMobileMenu() {
            navbarToggle.classList.remove('active');
            navbarMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
        
        function openMobileMenu() {
            navbarToggle.classList.add('active');
            navbarMenu.classList.add('active');
            document.body.classList.add('menu-open');
        }

        // Enhanced toggle with touch support
        navbarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (navbarMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Enhanced close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                closeMobileMenu();
                
                // Smooth scroll to target
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        const headerHeight = header.offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    // Navigate to different page
                    window.location.href = href;
                }
            });
        });

        // Enhanced close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navbarMenu.classList.contains('active') && 
                !navbarToggle.contains(e.target) && 
                !navbarMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close menu on window resize if above mobile breakpoint
        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth > 768 && navbarMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }, 250));
    }
}

// Enhanced Scroll animations with mobile optimization
function initializeScrollAnimations() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;
    
    const observerOptions = {
        threshold: prefersReducedMotion ? 0.01 : 0.1,
        rootMargin: prefersReducedMotion ? '0px' : '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay for grid items on mobile
                if (entry.target.classList.contains('grid-item') && isMobile) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                } else {
                    entry.target.classList.add('visible');
                }
                
                // Trigger counter animation if element has counter class
                if (entry.target.classList.contains('counter')) {
                    if (prefersReducedMotion) {
                        // Instant counter update for reduced motion
                        const target = parseInt(entry.target.getAttribute('data-target'));
                        entry.target.textContent = target;
                    } else {
                        animateCounter(entry.target);
                    }
                }
                
                // Trigger progress bar animation
                if (entry.target.classList.contains('progress-bar')) {
                    entry.target.classList.add('animate');
                }
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .grid-item, .counter, .progress-bar');
    
    // For reduced motion, make animations instant
    if (prefersReducedMotion) {
        animatedElements.forEach(el => {
            el.classList.add('visible');
            if (el.classList.contains('counter')) {
                const target = parseInt(el.getAttribute('data-target'));
                if (target) el.textContent = target;
            }
        });
        return;
    }
    
    animatedElements.forEach(el => observer.observe(el));
}

// Enhanced Parallax effects with mobile optimization
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    // Check if device supports parallax without performance issues
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || prefersReducedMotion) {
        // Disable parallax on mobile or for users who prefer reduced motion
        parallaxElements.forEach(element => {
            element.style.transform = 'none';
        });
        return;
    }

    // Optimized parallax with RAF
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3; // Reduced intensity for better performance

        parallaxElements.forEach(element => {
            // Use transform3d for hardware acceleration
            element.style.transform = `translate3d(0, ${rate}px, 0)`;
        });
        
        ticking = false;
    }
    
    function requestParallaxUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
}

// Carousel functionality
function initializeCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        
        let currentSlide = 0;
        let autoplayInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev');
                if (i === index) {
                    slide.classList.add('active');
                } else if (i < index) {
                    slide.classList.add('prev');
                }
            });

            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });

            currentSlide = index;
        }

        function nextSlide() {
            const next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }

        function prevSlide() {
            const prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
        }

        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => showSlide(index));
        });

        // Pause autoplay on hover
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        // Initialize
        showSlide(0);
        startAutoplay();
    });
}

// Back to top button
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const isValid = validateForm(form);
            
            if (isValid) {
                // Show success message
                showNotification('Message sent successfully!', 'success');
                form.reset();
            }
        });
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const errorElement = input.parentNode.querySelector('.error-message');
        
        // Remove existing error message
        if (errorElement) {
            errorElement.remove();
        }
        
        // Validate input
        if (!value) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
            showFieldError(input, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '5px';
    
    input.parentNode.appendChild(errorElement);
    input.style.borderColor = '#e74c3c';
    
    // Remove error styling on input
    input.addEventListener('input', function() {
        input.style.borderColor = '';
        if (errorElement) {
            errorElement.remove();
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(function() {
        current += increment;
        element.textContent = Math.floor(current);
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimizations
window.addEventListener('scroll', throttle(function() {
    // Throttled scroll events
}, 16));

window.addEventListener('resize', debounce(function() {
    // Debounced resize events
}, 250));

