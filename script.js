// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Get DOM elements
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.section');
    
    // Debug: Check if elements are found
    console.log('Sidebar:', sidebar);
    console.log('Main Content:', mainContent);
    console.log('Menu Toggle:', menuToggle);
    console.log('Nav Links:', navLinks.length);
    console.log('Sections:', sections.length);
    
    // State tracking
    let isDesktop = window.innerWidth > 768;
    let sidebarOpen = isDesktop; // Desktop: open by default, Mobile: closed by default
    let currentActiveSection = 'home'; // Track current active section
    let isNavigating = false; // Prevent conflicts during navigation
    
    // Initialize page state
    function initializePage() {
        console.log('Initializing page...');
        isDesktop = window.innerWidth > 768;
        
        if (isDesktop) {
            console.log('Desktop mode - sidebar open by default');
            sidebarOpen = true;
            if (sidebar) {
                sidebar.classList.remove('hidden');
                sidebar.classList.remove('active');
            }
            if (mainContent) {
                mainContent.classList.remove('full-width');
            }
        } else {
            console.log('Mobile mode - sidebar closed by default');
            sidebarOpen = false;
            if (sidebar) {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('active');
            }
            if (mainContent) {
                mainContent.classList.add('full-width');
            }
        }
        
        updateMenuIcon();
        
        // Set initial active section
        setTimeout(() => {
            setActiveLink('home');
        }, 100);
    }
    
    // Update menu icon based on state
    function updateMenuIcon() {
        if (menuToggle) {
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (sidebarOpen) {
                    icon.className = 'fas fa-bars';
                } else {
                    icon.className = 'fas fa-bars';
                }
                console.log('Menu icon updated to:', icon.className);
            }
        }
    }
    
    // Toggle sidebar function
    function toggleSidebar() {
        console.log('Toggle sidebar called. Current state:', sidebarOpen);
        sidebarOpen = !sidebarOpen;
        
        if (isDesktop) {
            // Desktop behavior
            console.log('Desktop toggle - sidebarOpen:', sidebarOpen);
            if (sidebarOpen) {
                sidebar.classList.remove('hidden');
                mainContent.classList.remove('full-width');
            } else {
                sidebar.classList.add('hidden');
                mainContent.classList.add('full-width');
            }
        } else {
            // Mobile behavior
            console.log('Mobile toggle - sidebarOpen:', sidebarOpen);
            if (sidebarOpen) {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.remove('active');
                sidebar.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
        
        updateMenuIcon();
    }
    
    // Set up menu toggle click handler
    if (menuToggle) {
        console.log('Setting up menu toggle click handler');
        menuToggle.addEventListener('click', function(e) {
            console.log('Menu toggle clicked!');
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
        
        // Also add a test to make sure the button is clickable
        menuToggle.style.pointerEvents = 'auto';
        menuToggle.style.cursor = 'pointer';
    } else {
        console.error('Menu toggle button not found!');
    }
    
    // COMPLETELY NEW: Set active link function with forced cleanup
    function setActiveLink(sectionId) {
        console.log('Setting active link to:', sectionId);
        
        // Don't update if it's the same section
        if (currentActiveSection === sectionId) {
            return;
        }
        
        currentActiveSection = sectionId;
        
        // FORCE remove active class from ALL links using direct DOM manipulation
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.style.color = ''; // Reset inline styles
            link.style.fontWeight = '';
            link.style.backgroundColor = '';
            link.style.transform = '';
        });
        
        // Force a reflow to ensure changes are applied
        document.body.offsetHeight;
        
        // Add active class to the target link
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
                console.log('Active class added to:', href);
            }
        });
    }
    
    // Set up navigation links
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            console.log('Nav link clicked:', targetId);
            
            // Immediately set active link
            setActiveLink(targetId);
            
            if (mainContent && targetSection) {
                // Set navigation flag
                isNavigating = true;
                
                mainContent.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
                
                // Clear navigation flag after scroll
                setTimeout(() => {
                    isNavigating = false;
                }, 1000);
            }
            
            // Close sidebar on mobile after navigation
            if (!isDesktop && sidebarOpen) {
                toggleSidebar();
            }
        });
    });
    
    // COMPLETELY NEW: Scroll-based section detection
    function detectActiveSection() {
        if (isNavigating) return; // Don't update during navigation
        
        let activeSection = 'home'; // Default to home
        let maxVisibility = 0;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const containerRect = mainContent.getBoundingClientRect();
            
            // Calculate how much of the section is visible
            const visibleTop = Math.max(rect.top, containerRect.top);
            const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            
            // Calculate visibility ratio
            const sectionHeight = rect.height;
            const visibilityRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
            
            // If this section is more visible than previous ones
            if (visibilityRatio > maxVisibility && visibilityRatio > 0.3) {
                maxVisibility = visibilityRatio;
                activeSection = section.getAttribute('id');
            }
        });
        
        // Update active link if section changed
        if (activeSection !== currentActiveSection) {
            console.log('Section changed from', currentActiveSection, 'to', activeSection);
            setActiveLink(activeSection);
        }
    }
    
    // Set up scroll listener with throttling
    let scrollTimer;
    if (mainContent) {
        mainContent.addEventListener('scroll', function() {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(detectActiveSection, 150);
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const wasDesktop = isDesktop;
        isDesktop = window.innerWidth > 768;
        
        if (wasDesktop !== isDesktop) {
            console.log('Screen size changed, reinitializing...');
            initializePage();
        }
    });
    
    // Handle form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMail();
        });
    }
    
    // Email function
    function sendMail() {
        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const subject = document.getElementById("subject")?.value.trim();
        const message = document.getElementById("message")?.value.trim();

        if (!name || !email || !subject || !message) {
            alert("Please fill in all fields.");
            return;
        }

        const params = {
            name: name,
            email: email,
            subject: subject,
            message: message
        };

        if (typeof emailjs !== 'undefined') {
            emailjs.send("service_oa758gs", "template_i0wsmos", params)
                .then(function(response) {
                    alert("Email sent successfully!");
                    contactForm.reset();
                }, function(error) {
                    alert("Email failed. Check console.");
                    console.error("EmailJS Error:", error);
                });
        } else {
            console.error("EmailJS not loaded");
        }
    }
    
    // Animation setup
    const animatedElements = document.querySelectorAll('.animate-fade-up, .animate-slide-right');
    if (animatedElements.length > 0) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    animationObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = element.classList.contains('animate-fade-up') 
                ? 'translateY(20px)' 
                : 'translateX(-20px)';
            animationObserver.observe(element);
        });
    }
    
    // Initialize the page
    initializePage();
    
    console.log('Initialization complete');
});

