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
            
            console.log(`
