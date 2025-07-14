// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Dynamic viewport height adjustment for mobile devices
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Initial call
    setViewportHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function() {
        setTimeout(setViewportHeight, 100);
    });
    
    // Device-specific adjustments
    function adjustForDevice() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = screenHeight / screenWidth;
        
        // Galaxy-like devices (tall aspect ratio)
        if (aspectRatio > 2 && screenWidth <= 480) {
            document.body.classList.add('tall-device');
        }
        
        // Very wide devices in landscape
        if (aspectRatio < 0.6 && screenWidth > screenHeight) {
            document.body.classList.add('wide-landscape');
        }
        
        // Ultra-narrow devices (Galaxy Fold, etc.)
        if (screenWidth <= 320) {
            document.body.classList.add('ultra-narrow');
        }
    }
    
    adjustForDevice();
    window.addEventListener('resize', adjustForDevice);
    window.addEventListener('orientationchange', function() {
        setTimeout(adjustForDevice, 100);
    });
    
    // Dynamic background change for journey section with crossfade effect
    function setupJourneyBackgrounds() {
        const journeySection = document.querySelector('.journey');
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        if (!journeySection || timelineItems.length === 0) return;
        
        let currentImage = null;
        let isTransitioning = false;
        
        // Function to preload and check if image exists
        function checkImageExists(imagePath) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`✅ Image loaded successfully: ${imagePath}`);
                    resolve(true);
                };
                img.onerror = () => {
                    console.warn(`❌ Image failed to load: ${imagePath}`);
                    resolve(false);
                };
                img.src = imagePath;
            });
        }
        
        // Test initial image
        async function initializeBackground() {
            const testImage = 'suita.png';
            console.log(`🔍 Testing image: ${testImage}`);
            
            const imageExists = await checkImageExists(testImage);
            
            if (imageExists) {
                currentImage = testImage;
                journeySection.style.backgroundImage = `url('${testImage}')`;
                console.log(`🎨 Background set to: ${testImage}`);
            } else {
                console.log('📝 Using fallback: solid color background');
                journeySection.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
            }
        }
        
        async function crossfadeToNewImage(newImage) {
            if (isTransitioning || newImage === currentImage) return;
            
            console.log(`🔄 Attempting to change background to: ${newImage}`);
            
            // Check if new image exists
            const imageExists = await checkImageExists(newImage);
            
            if (!imageExists) {
                console.warn(`⚠️ Image not found: ${newImage}`);
                
                // Try fallback for missing images (use available ones)
                const availableImages = ['suita.png', 'tokyo.png'];
                const fallbackImage = availableImages.includes(newImage) ? newImage : 
                                    availableImages.find(img => img !== currentImage) || availableImages[0];
                
                if (fallbackImage && fallbackImage !== newImage) {
                    console.log(`🔄 Using fallback image: ${fallbackImage}`);
                    const fallbackExists = await checkImageExists(fallbackImage);
                    if (fallbackExists) {
                        newImage = fallbackImage;
                    } else {
                        console.warn(`⚠️ Keeping current background: ${currentImage || 'default'}`);
                        return;
                    }
                } else {
                    console.warn(`⚠️ No fallback available, keeping current background: ${currentImage || 'default'}`);
                    return;
                }
            }
            
            isTransitioning = true;
            
            // Create a temporary style element for the transition
            const styleId = 'journey-bg-transition';
            let style = document.getElementById(styleId);
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }
            
            // Set up the crossfade
            style.textContent = `
                .journey::after {
                    background-image: url('${newImage}') !important;
                    opacity: 1 !important;
                }
            `;
            
            // After transition completes
            setTimeout(() => {
                // Move the new image to the main background
                journeySection.style.backgroundImage = `url('${newImage}')`;
                
                // Reset ::after
                style.textContent = `
                    .journey::after {
                        opacity: 0 !important;
                    }
                `;
                
                currentImage = newImage;
                isTransitioning = false;
                console.log(`✅ Background changed to: ${newImage}`);
            }, 1200);
        }
        
        function updateBackground() {
            const scrollPosition = window.scrollY;
            const viewportHeight = window.innerHeight;
            const centerOfScreen = scrollPosition + viewportHeight / 2;
            
            let activeImage = 'suita.png'; // Default image
            let foundActiveItem = null;
            
            console.log(`📜 Scroll update: position=${scrollPosition}, center=${centerOfScreen}`);
            
            timelineItems.forEach((item, index) => {
                const journeyTop = journeySection.offsetTop;
                const itemTop = item.offsetTop + journeyTop;
                const itemHeight = item.offsetHeight;
                const itemCenter = itemTop + itemHeight / 2;
                const imageName = item.getAttribute('data-image');
                
                console.log(`📍 Item ${index + 1} (${imageName}): center=${itemCenter}, screen center=${centerOfScreen}, passed=${itemCenter <= centerOfScreen}`);
                
                // Check if item center is above or at the center of screen
                if (itemCenter <= centerOfScreen) {
                    if (imageName) {
                        activeImage = imageName;
                        foundActiveItem = item;
                        console.log(`🎯 Active item updated to: ${imageName} (item ${index + 1})`);
                    }
                }
            });
            
            console.log(`🖼️ Final active image: ${activeImage}, current: ${currentImage}`);
            
            // Trigger crossfade if image changed
            if (activeImage !== currentImage) {
                console.log(`🔄 Image change detected: ${currentImage} → ${activeImage}`);
                crossfadeToNewImage(activeImage);
            } else {
                console.log(`⏸️ No image change needed`);
            }
        }
        
        // Initialize with error checking
        initializeBackground();
        
        // Intersection Observer for better performance
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };
        
        const imageObserver = new IntersectionObserver((entries) => {
            console.log(`👁️ Intersection Observer triggered with ${entries.length} entries`);
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imageName = entry.target.getAttribute('data-image');
                    console.log(`👀 Item in view: ${imageName}, ratio: ${entry.intersectionRatio}`);
                    if (imageName && imageName !== currentImage) {
                        console.log(`🔄 Observer triggered change to: ${imageName}`);
                        crossfadeToNewImage(imageName);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all timeline items
        timelineItems.forEach((item, index) => {
            console.log(`👁️ Observing item ${index + 1}: ${item.getAttribute('data-image')}`);
            imageObserver.observe(item);
        });
        
        // Enhanced scroll handler as fallback
        let ticking = false;
        function handleScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateBackground();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        console.log('🎬 Setting up scroll listeners...');
        
        // Add multiple scroll listeners for redundancy
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateBackground);
        
        // Force update on any user interaction
        ['mousewheel', 'DOMMouseScroll', 'touchmove', 'keydown'].forEach(event => {
            window.addEventListener(event, () => {
                setTimeout(updateBackground, 100);
            }, { passive: true });
        });
        
        // Manual trigger for testing
        setTimeout(() => {
            console.log('🧪 Manual test trigger after 2 seconds');
            updateBackground();
        }, 2000);
        
        // Additional test - force scroll check every 2 seconds
        setInterval(() => {
            if (window.scrollY > 0) {
                console.log('⏰ Periodic check triggered');
                updateBackground();
            }
        }, 2000);
        
        // Debug: Log all expected images and positions
        console.log('🖼️ Expected images:');
        timelineItems.forEach((item, index) => {
            const imageName = item.getAttribute('data-image');
            console.log(`  ${index + 1}. ${imageName || 'MISSING DATA-IMAGE!'}`);
        });
        
        // Additional debug info
        console.log('📁 Current images you have: suita.png, tokyo.png');
        console.log('🎯 Missing images will show as: ❌ Image failed to load');
        console.log('✅ Available images will show as: ✅ Image loaded successfully');
        
        // Debug journey section position
        setTimeout(() => {
            const journeyTop = journeySection.offsetTop;
            const journeyHeight = journeySection.offsetHeight;
            console.log(`📐 Journey section: top=${journeyTop}, height=${journeyHeight}`);
            
            timelineItems.forEach((item, index) => {
                const itemTop = item.offsetTop + journeyTop;
                const itemHeight = item.offsetHeight;
                const itemCenter = itemTop + itemHeight / 2;
                const imageName = item.getAttribute('data-image');
                console.log(`📍 Item ${index + 1} (${imageName}): top=${itemTop}, center=${itemCenter}, height=${itemHeight}`);
            });
        }, 1000);
    }
    
    // Initialize journey backgrounds
    setupJourneyBackgrounds();
    
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Scroll Animation for Sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add staggered animation for grid items
                const gridItems = entry.target.querySelectorAll('.skill-item, .work-item, .service-item, .profile-item, .pricing-item');
                gridItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                
                // Add staggered animation for timeline items
                const timelineItems = entry.target.querySelectorAll('.timeline-item');
                timelineItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateX(0)';
                    }, index * 200);
                });
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Initialize grid items with hidden state
    document.querySelectorAll('.skill-item, .work-item, .service-item, .profile-item, .pricing-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
    });
    
    // Initialize timeline items with hidden state
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.opacity = '0';
        if (index % 2 === 0) {
            item.style.transform = 'translateX(-50px)';
        } else {
            item.style.transform = 'translateX(50px)';
        }
        item.style.transition = 'all 0.6s ease';
    });
    
    // Navbar background change on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-background');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translate3d(0, ${speed}px, 0)`;
        }
    });
    
    // Add loading animation to work items
    document.querySelectorAll('.work-item').forEach((item, index) => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add pulse animation to CTA buttons
    document.querySelectorAll('.cta-button, .contact-link').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.animation = '';
        });
    });
    
    // Typing effect for hero title with layout stability
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        // Create invisible placeholder to maintain layout
        const tempElement = element.cloneNode(true);
        tempElement.style.visibility = 'hidden';
        tempElement.style.position = 'absolute';
        tempElement.style.top = '0';
        tempElement.style.left = '0';
        tempElement.textContent = text;
        element.parentNode.appendChild(tempElement);
        
        // Clear original text and start typing
        element.innerHTML = '';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove placeholder after typing is complete
                if (tempElement.parentNode) {
                    tempElement.parentNode.removeChild(tempElement);
                }
            }
        }
        
        type();
    }
    
    // Initialize hero elements with hidden state and then animate
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroContent = document.querySelector('.hero-content');
    
    if (heroTitle && heroSubtitle && heroContent) {
        // Store original text and hide it
        const originalText = heroTitle.textContent;
        heroTitle.style.opacity = '0';
        heroTitle.style.visibility = 'hidden';
        
        // Ensure the hero container maintains its height
        heroContent.style.minHeight = heroContent.offsetHeight + 'px';
        
        // Start animations after a short delay
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 1300); // Start after hero-content animation completes
    }
    
    // Add counter animation for numbers
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    // Initialize counter animations when elements come into view
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-count'));
                if (target) {
                    animateCounter(element, target);
                    counterObserver.unobserve(element);
                }
            }
        });
    });
    
    // Add floating animation to skill icons
    document.querySelectorAll('.skill-icon, .service-icon').forEach((icon, index) => {
        icon.style.animation = `float 3s ease-in-out infinite`;
        icon.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add progress bar animation for skills
    function createProgressBar(container, percentage) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-fill" style="width: 0%"></div>
        `;
        container.appendChild(progressBar);
        
        // Animate the progress bar
        setTimeout(() => {
            const fill = progressBar.querySelector('.progress-fill');
            fill.style.transition = 'width 2s ease';
            fill.style.width = percentage + '%';
        }, 500);
    }
    
    // Add scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-progress';
    scrollIndicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #007AFF, #5856D6);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(scrollIndicator);
    
    window.addEventListener('scroll', () => {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (window.pageYOffset / scrollTotal) * 100;
        scrollIndicator.style.width = scrollProgress + '%';
    });
    
    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    document.querySelectorAll('.cta-button, .contact-link').forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Add CSS for ripple effect
    const rippleCSS = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .progress-bar {
            width: 100%;
            height: 4px;
            background-color: #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
            margin-top: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #007AFF, #5856D6);
            border-radius: 2px;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = rippleCSS;
    document.head.appendChild(style);
    
    // Add intersection observer for fade-in animations
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
        fadeObserver.observe(el);
    });
    
    // Performance optimization: throttle scroll events
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
    
    // Apply throttling to scroll events
    const throttledScroll = throttle(() => {
        // Scroll-based animations here
    }, 16);
    
    window.addEventListener('scroll', throttledScroll);
    
    console.log('Portfolio site loaded successfully! 🚀');
});
