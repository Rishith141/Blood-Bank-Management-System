// Blood Bank Management System - Main JavaScript

// Global variables
let map;
let markers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeContactForm();
    initializeGoogleMaps();
    initializeAnimations();
});

// Smooth scrolling navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Contact form handling
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                name: formData.get('name') || this.querySelector('input[type="text"]').value,
                email: formData.get('email') || this.querySelector('input[type="email"]').value,
                message: formData.get('message') || this.querySelector('textarea').value
            };
            
            // Simulate form submission
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            this.reset();
        });
    }
}

// Google Maps integration
function initializeGoogleMaps() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.log('Google Maps API not loaded');
        return;
    }
    
    // Blood bank locations data
    const bloodBanks = [
        {
            name: 'Central Blood Bank',
            address: '123 Medical Center Dr, Healthcare City, HC 12345',
            position: { lat: 40.7128, lng: -74.0060 }, // New York coordinates (example)
            type: 'hospital'
        },
        {
            name: 'Community Blood Center',
            address: '456 Health Plaza, Medical District, HC 12346',
            position: { lat: 40.7589, lng: -73.9851 }, // Manhattan coordinates (example)
            type: 'clinic'
        },
        {
            name: 'Emergency Blood Bank',
            address: '789 Emergency Way, Trauma Center, HC 12347',
            position: { lat: 40.7505, lng: -73.9934 }, // Midtown coordinates (example)
            type: 'emergency'
        }
    ];
    
    // Initialize map
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    map = new google.maps.Map(mapElement, {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 12,
        styles: getMapStyles(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });
    
    // Add markers for blood banks
    bloodBanks.forEach((bank, index) => {
        const marker = new google.maps.Marker({
            position: bank.position,
            map: map,
            title: bank.name,
            icon: getMarkerIcon(bank.type),
            animation: google.maps.Animation.DROP
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 200px;">
                    <h3 style="color: #e74c3c; margin: 0 0 5px 0;">${bank.name}</h3>
                    <p style="margin: 0; color: #666;">${bank.address}</p>
                    <p style="margin: 5px 0 0 0; color: #e74c3c; font-weight: bold;">
                        <i class="fas fa-phone"></i> +1 (555) 123-4567
                    </p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
    });
    
    // Add search functionality
    addSearchBox();
}

// Get custom map styles
function getMapStyles() {
    return [
        {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{"weight": "2.00"}]
        },
        {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#9c9c9c"}]
        },
        {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{"visibility": "on"}]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#ffffff"}]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#ffffff"}]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": -100}, {"lightness": 45}]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#eeeeee"}]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#7b7b7b"}]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#ffffff"}]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#c8d7d4"}]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#070707"}]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#ffffff"}]
        }
    ];
}

// Get marker icon based on blood bank type
function getMarkerIcon(type) {
    const icons = {
        hospital: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#e74c3c"/>
                    <path d="M8 12h6v-4h4v4h6v8h-4v-4h-4v4h-4v-4h-4v4H8v-8z" fill="white"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
        },
        clinic: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#3498db"/>
                    <path d="M8 12h6v-4h4v4h6v8h-4v-4h-4v4h-4v-4h-4v4H8v-8z" fill="white"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
        },
        emergency: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#f39c12"/>
                    <path d="M8 12h6v-4h4v4h6v8h-4v-4h-4v4h-4v-4h-4v4H8v-8z" fill="white"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
        }
    };
    
    return icons[type] || icons.hospital;
}

// Add search box to map
function addSearchBox() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for blood banks...';
    input.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        width: 300px;
        height: 40px;
        padding: 10px;
        border: none;
        border-radius: 5px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: 14px;
        z-index: 1000;
    `;
    
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
    const searchBox = new google.maps.places.SearchBox(input);
    
    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        
        if (places.length === 0) return;
        
        const bounds = new google.maps.LatLngBounds();
        
        places.forEach(place => {
            if (!place.geometry || !place.geometry.location) return;
            
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        
        map.fitBounds(bounds);
    });
}

// Initialize animations
function initializeAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about-card, .service-card, .location-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
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

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
}, 250));

// Export functions for global access
window.showNotification = showNotification; 