

function initAOS() {
  AOS.init({
    duration: 800,
    easing: 'ease',
    once: true,
    offset: 100
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initAOS();

  setTimeout(function() {
    if (typeof google === 'undefined') {
      console.log('Google Maps API failed to load, showing fallback');
      const mapContainer = document.getElementById('pollutionMap');
      const mapLoading = document.querySelector('.map-loading');

      if (mapContainer) {
        if (mapLoading) {
          mapLoading.style.display = 'none';
        }

        // Show fallback map
        const mapFallback = document.querySelector('.map-fallback');
        if (mapFallback) {
          mapFallback.style.display = 'block';
        }
      }
    }
  }, 5000);

  // Navigation menu toggle for mobile
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  // Header scroll effect
  const header = document.querySelector('header');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });

  // Counter animation for statistics
  const stats = document.querySelectorAll('.stat-item h4');

  if (stats.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'));
          let count = 0;
          const updateCounter = () => {
            const increment = target / 100;
            if (count < target) {
              count += increment;
              counter.textContent = Math.ceil(count);
              setTimeout(updateCounter, 10);
            } else {
              counter.textContent = target;
            }
          };
          updateCounter();
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
      counterObserver.observe(stat);
    });
  }

  // Initialize pollution map
  initMap();

  // Gallery lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').getAttribute('src');
      const title = this.querySelector('.gallery-overlay h4').textContent;

      const lightbox = document.createElement('div');
      lightbox.classList.add('lightbox');

      lightbox.innerHTML = `
        <div class="lightbox-content">
          <span class="close-lightbox">&times;</span>
          <img src="${imgSrc}" alt="${title}">
          <h4>${title}</h4>
        </div>
      `;

      document.body.appendChild(lightbox);

      // Prevent scrolling when lightbox is open
      document.body.style.overflow = 'hidden';

      // Close lightbox on click
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.classList.contains('close-lightbox')) {
          document.body.removeChild(lightbox);
          document.body.style.overflow = 'auto';
        }
      });
    });
  });

  // Form validation
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent the default form submission

      // Client-side validation
      let valid = true;
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');

      if (name.value.trim() === '') {
        showError(name, 'Name is required');
        valid = false;
      } else {
        removeError(name);
      }

      if (email.value.trim() === '') {
        showError(email, 'Email is required');
        valid = false;
      } else if (!isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email');
        valid = false;
      } else {
        removeError(email);
      }

      if (subject.value.trim() === '') {
        showError(subject, 'Subject is required');
        valid = false;
      } else {
        removeError(subject);
      }

      if (message.value.trim() === '') {
        showError(message, 'Message is required');
        valid = false;
      } else {
        removeError(message);
      }

      if (valid) {
        // Show a "Sending..." message
        const sendingMessage = document.createElement('div');
        sendingMessage.classList.add('sending-message');
        sendingMessage.innerHTML = '<i class="fas fa-paper-plane"></i> Sending your message...';
        contactForm.appendChild(sendingMessage);

        // Collect form data
        const formData = new FormData(contactForm);

        // Submit the form data to getform.io using fetch API
        fetch('https://getform.io/f/axowxmxb', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            // Remove sending message
            contactForm.removeChild(sendingMessage);

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.classList.add('success-message');
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your message has been sent successfully!';
            contactForm.appendChild(successMessage);

            // Reset the form
            contactForm.reset();

            // Remove success message after 5 seconds
            setTimeout(() => {
              if (contactForm.contains(successMessage)) {
                contactForm.removeChild(successMessage);
              }
            }, 5000);
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(error => {
          console.error('Error:', error);

          // Remove sending message
          if (contactForm.contains(sendingMessage)) {
            contactForm.removeChild(sendingMessage);
          }

          // Show error message
          const errorMessage = document.createElement('div');
          errorMessage.classList.add('error-message');
          errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem sending your message. Please try again.';
          contactForm.appendChild(errorMessage);

          // Remove error message after 5 seconds
          setTimeout(() => {
            if (contactForm.contains(errorMessage)) {
              contactForm.removeChild(errorMessage);
            }
          }, 5000);
        });
      }
    });
  }

  // Water quality data visualization
  const waterQualityChart = document.getElementById('waterQualityChart');

  if (waterQualityChart) {
    const ctx = waterQualityChart.getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Dissolved Oxygen (mg/L)',
            data: [7.2, 6.8, 6.5, 6.2, 5.8, 5.5, 5.3, 5.1, 5.4, 5.9, 6.3, 6.9],
            borderColor: '#1e88e5',
            backgroundColor: 'rgba(30, 136, 229, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'BOD (mg/L)',
            data: [2.1, 2.3, 2.5, 2.8, 3.2, 3.5, 3.8, 4.0, 3.7, 3.3, 2.9, 2.4],
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Value (mg/L)'
            }
          }
        }
      }
    });
  }
});

// Initialize Google Map with pollution hotspots
function initMap() {
  // Check if Google Maps API is loaded
  if (typeof google === 'undefined') {
    console.log('Google Maps API not loaded yet, will retry in 1 second');
    setTimeout(initMap, 1000);
    return;
  }

  const mapContainer = document.getElementById('pollutionMap');
  const mapLoading = document.querySelector('.map-loading');

  if (!mapContainer) return;

  // Pollution hotspots data
  const hotspots = [
    {
      lat: 25.3176,
      lng: 83.0130,
      level: 'critical',
      name: 'Varanasi Industrial Area',
      description: 'Heavy industrial discharge and sewage',
      details: {
        do: '4.2 mg/L (Poor)',
        bod: '5.2 mg/L (Critical)',
        coliform: '24,000 MPN/100ml (Very High)',
        ph: '7.8 (Slightly Alkaline)',
        heavyMetals: 'Lead, Chromium detected',
        pollutionSources: 'Textile industries, cremation ghats, urban sewage'
      }
    },
    {
      lat: 25.4358,
      lng: 81.8463,
      level: 'critical',
      name: 'Prayagraj (Allahabad) Sangam',
      description: 'Urban waste and religious activities',
      details: {
        do: '4.5 mg/L (Poor)',
        bod: '5.0 mg/L (Critical)',
        coliform: '21,000 MPN/100ml (Very High)',
        ph: '7.6 (Slightly Alkaline)',
        heavyMetals: 'Lead detected',
        pollutionSources: 'Religious activities, urban sewage, agricultural runoff'
      }
    },
    {
      lat: 27.1767,
      lng: 78.0081,
      level: 'poor',
      name: 'Agra Stretch',
      description: 'Industrial and domestic waste',
      details: {
        do: '5.8 mg/L (Moderate)',
        bod: '3.2 mg/L (Poor)',
        coliform: '9,000 MPN/100ml (High)',
        ph: '7.4 (Neutral)',
        heavyMetals: 'Trace amounts',
        pollutionSources: 'Leather industries, urban waste, tourism impact'
      }
    },
    {
      lat: 22.5726,
      lng: 88.3639,
      level: 'poor',
      name: 'Kolkata Port Area',
      description: 'Industrial discharge and shipping waste',
      details: {
        do: '4.8 mg/L (Poor)',
        bod: '4.8 mg/L (Poor)',
        coliform: '16,000 MPN/100ml (High)',
        ph: '7.5 (Slightly Alkaline)',
        heavyMetals: 'Lead, Mercury detected',
        pollutionSources: 'Port activities, industrial discharge, urban sewage'
      }
    },
    {
      lat: 25.5941,
      lng: 85.1376,
      level: 'critical',
      name: 'Patna City',
      description: 'Urban sewage and domestic waste',
      details: {
        do: '4.0 mg/L (Poor)',
        bod: '5.5 mg/L (Critical)',
        coliform: '28,000 MPN/100ml (Very High)',
        ph: '7.7 (Slightly Alkaline)',
        heavyMetals: 'Lead detected',
        pollutionSources: 'Urban sewage, lack of treatment facilities, industrial discharge'
      }
    },
    {
      lat: 29.9457,
      lng: 78.1642,
      level: 'excellent',
      name: 'Haridwar',
      description: 'Religious activities and tourism',
      details: {
        do: '7.5 mg/L (Excellent)',
        bod: '1.5 mg/L (Good)',
        coliform: '500 MPN/100ml (Low)',
        ph: '7.2 (Neutral)',
        heavyMetals: 'Not detected',
        pollutionSources: 'Religious activities, tourism, minor urban waste'
      }
    },
    {
      lat: 30.0869,
      lng: 78.2676,
      level: 'excellent',
      name: 'Rishikesh',
      description: 'Tourism impact and sewage',
      details: {
        do: '7.8 mg/L (Excellent)',
        bod: '1.2 mg/L (Good)',
        coliform: '300 MPN/100ml (Low)',
        ph: '7.1 (Neutral)',
        heavyMetals: 'Not detected',
        pollutionSources: 'Tourism activities, adventure sports, minor urban waste'
      }
    },
    {
      lat: 26.4499,
      lng: 80.3319,
      level: 'critical',
      name: 'Kanpur Industrial Belt',
      description: 'Leather tanneries and chemical industries',
      details: {
        do: '4.8 mg/L (Poor)',
        bod: '4.5 mg/L (Critical)',
        coliform: '32,000 MPN/100ml (Very High)',
        ph: '8.1 (Alkaline)',
        heavyMetals: 'Chromium, Lead, Cadmium detected',
        pollutionSources: 'Leather tanneries, textile industries, chemical factories, urban sewage'
      }
    },
    {
      lat: 30.9910,
      lng: 78.9200,
      level: 'pristine',
      name: 'Gangotri Glacier',
      description: 'Sacred source of the Ganga',
      details: {
        do: '8.5 mg/L (Pristine)',
        bod: '0.8 mg/L (Excellent)',
        coliform: '<100 MPN/100ml (Minimal)',
        ph: '7.0 (Neutral)',
        heavyMetals: 'Not detected',
        pollutionSources: 'Minimal human impact, some tourism'
      }
    },
    {
      lat: 24.7914,
      lng: 87.9336,
      level: 'moderate',
      name: 'Farakka Barrage',
      description: 'Major water diversion point',
      details: {
        do: '5.0 mg/L (Moderate)',
        bod: '4.5 mg/L (Poor)',
        coliform: '8,000 MPN/100ml (Moderate)',
        ph: '7.4 (Neutral)',
        heavyMetals: 'Trace amounts',
        pollutionSources: 'Agricultural runoff, industrial discharge upstream'
      }
    },
    {
      lat: 21.7679,
      lng: 88.1108,
      level: 'moderate',
      name: 'Ganga Sagar (Mouth)',
      description: 'Where Ganga meets Bay of Bengal',
      details: {
        do: '5.5 mg/L (Moderate)',
        bod: '4.0 mg/L (Poor)',
        coliform: '6,000 MPN/100ml (Moderate)',
        ph: '7.8 (Slightly Alkaline)',
        heavyMetals: 'Diluted concentrations',
        pollutionSources: 'Accumulated pollution, tidal mixing, pilgrimage activities'
      }
    },
    {
      lat: 28.4200,
      lng: 77.9800,
      level: 'moderate',
      name: 'Bulandshahr',
      description: 'Agricultural runoff and industrial waste',
      details: {
        do: '6.5 mg/L (Good)',
        bod: '2.3 mg/L (Moderate)',
        coliform: '3,500 MPN/100ml (Moderate)',
        ph: '7.3 (Neutral)',
        heavyMetals: 'Not detected',
        pollutionSources: 'Agricultural runoff, small industries, urban waste'
      }
    },
    {
      lat: 25.2500,
      lng: 86.9800,
      level: 'poor',
      name: 'Bhagalpur',
      description: 'Silk industry and urban waste',
      details: {
        do: '4.5 mg/L (Poor)',
        bod: '5.0 mg/L (Critical)',
        coliform: '12,000 MPN/100ml (High)',
        ph: '7.6 (Slightly Alkaline)',
        heavyMetals: 'Lead detected',
        pollutionSources: 'Silk industry effluents, urban sewage, agricultural runoff'
      }
    }
  ];

  // Create the map centered on the Ganges river
  const gangaCenter = { lat: 25.3176, lng: 83.0130 }; // Varanasi as center point

  // Custom map style for a beautiful, immersive experience
  const mapStyles = [
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#0288d1" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#ffffff" }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#f5f5f5" }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#e8f5e9" }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#eeeeee" }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#c8e6c9" }
      ]
    },
    {
      "featureType": "poi.attraction",
      "stylers": [
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        { "color": "#e0e0e0" },
        { "lightness": 5 }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        { "color": "#dadada" }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#3f51b5" }
      ]
    },
    {
      "featureType": "administrative.province",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#3f51b5" }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#3f51b5" }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "poi.government",
      "stylers": [
        { "visibility": "off" }
      ]
    }
  ];

  // Map options
  const mapOptions = {
    zoom: 6,
    center: gangaCenter,
    mapTypeId: 'terrain',
    styles: mapStyles,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP
    },
    // Add Map ID for Advanced Markers
    mapId: 'a3efe1c035c9b8e4'
  };

  // Create the map with error handling
  let map;
  try {
    map = new google.maps.Map(mapContainer, mapOptions);
  } catch (error) {
    console.error('Error creating Google Map:', error);
    // Hide loading indicator
    if (mapLoading) {
      mapLoading.style.display = 'none';
    }

    // Show fallback map
    const mapFallback = document.querySelector('.map-fallback');
    if (mapFallback) {
      mapFallback.style.display = 'block';
    }
    return; // Exit the function if map creation fails
  }

  // Draw the Ganges river path (simplified)
  const gangaCoordinates = [
    { lat: 30.9910, lng: 78.9200, level: 'pristine', name: 'Gangotri (Source)', do: 8.5, bod: 0.8 }, // Gangotri (source)
    { lat: 30.7500, lng: 78.6000, level: 'pristine', name: 'Bhagirathi River', do: 8.3, bod: 0.9 }, // Bhagirathi
    { lat: 30.4000, lng: 78.4300, level: 'pristine', name: 'Tehri', do: 8.1, bod: 1.0 }, // Tehri
    { lat: 30.1400, lng: 78.3200, level: 'pristine', name: 'Devprayag', do: 8.0, bod: 1.1 }, // Devprayag
    { lat: 30.0869, lng: 78.2676, level: 'excellent', name: 'Rishikesh', do: 7.8, bod: 1.2 }, // Rishikesh
    { lat: 29.9457, lng: 78.1642, level: 'excellent', name: 'Haridwar', do: 7.5, bod: 1.5 }, // Haridwar
    { lat: 29.4727, lng: 77.7085, level: 'good', name: 'Bijnor', do: 7.2, bod: 1.8 }, // Bijnor
    { lat: 28.8955, lng: 78.0883, level: 'good', name: 'Garhmukteshwar', do: 6.9, bod: 2.0 }, // Garhmukteshwar
    { lat: 28.4200, lng: 77.9800, level: 'moderate', name: 'Bulandshahr', do: 6.5, bod: 2.3 }, // Bulandshahr
    { lat: 27.9300, lng: 78.0500, level: 'moderate', name: 'Narora', do: 6.2, bod: 2.5 }, // Narora
    { lat: 27.5900, lng: 78.0400, level: 'moderate', name: 'Aligarh Region', do: 6.0, bod: 2.8 }, // Aligarh Region
    { lat: 27.1767, lng: 78.0081, level: 'poor', name: 'Agra', do: 5.8, bod: 3.2 }, // Agra
    { lat: 26.8800, lng: 78.7500, level: 'poor', name: 'Etawah', do: 5.5, bod: 3.5 }, // Etawah
    { lat: 26.4499, lng: 80.3319, level: 'critical', name: 'Kanpur', do: 4.8, bod: 4.5 }, // Kanpur
    { lat: 25.9400, lng: 80.8300, level: 'poor', name: 'Fatehpur', do: 5.2, bod: 4.0 }, // Fatehpur
    { lat: 25.4358, lng: 81.8463, level: 'critical', name: 'Prayagraj (Allahabad)', do: 4.5, bod: 5.0 }, // Prayagraj (Allahabad)
    { lat: 25.3176, lng: 83.0130, level: 'critical', name: 'Varanasi', do: 4.2, bod: 5.2 }, // Varanasi
    { lat: 25.4000, lng: 83.6700, level: 'poor', name: 'Ghazipur', do: 4.8, bod: 4.8 }, // Ghazipur
    { lat: 25.5941, lng: 85.1376, level: 'critical', name: 'Patna', do: 4.0, bod: 5.5 }, // Patna
    { lat: 25.2500, lng: 86.9800, level: 'poor', name: 'Bhagalpur', do: 4.5, bod: 5.0 }, // Bhagalpur
    { lat: 24.7914, lng: 87.9336, level: 'moderate', name: 'Farakka', do: 5.0, bod: 4.5 }, // Farakka
    { lat: 24.1300, lng: 88.2400, level: 'moderate', name: 'Jangipur', do: 5.2, bod: 4.2 }, // Jangipur
    { lat: 23.4700, lng: 88.3400, level: 'moderate', name: 'Kalyani', do: 5.4, bod: 4.0 }, // Kalyani
    { lat: 22.5726, lng: 88.3639, level: 'poor', name: 'Kolkata', do: 4.8, bod: 4.8 }, // Kolkata
    { lat: 22.1200, lng: 88.1000, level: 'moderate', name: 'Diamond Harbour', do: 5.2, bod: 4.5 }, // Diamond Harbour
    { lat: 21.7679, lng: 88.1108, level: 'moderate', name: 'Ganga Sagar (Mouth)', do: 5.5, bod: 4.0 }  // Ganga Sagar (mouth)
  ];

  // Define pollution level colors with a beautiful gradient
  const pollutionColors = {
    'pristine': '#1DE9B6',    // Teal - Pristine water
    'excellent': '#00E676',   // Green - Excellent water quality
    'good': '#76FF03',        // Light Green - Good water quality
    'moderate': '#FFEB3B',    // Yellow - Moderate pollution
    'poor': '#FF9800',        // Orange - Poor water quality
    'critical': '#F44336'     // Red - Critical pollution
  };

  // Create a gradient river path with segments of different colors
  const gangaPaths = [];

  // Create beautiful path segments with appropriate colors and glow effect
  for (let i = 0; i < gangaCoordinates.length - 1; i++) {
    const segmentCoordinates = [gangaCoordinates[i], gangaCoordinates[i + 1]];
    const level = gangaCoordinates[i].level;

    // Create glow effect with a wider, semi-transparent path underneath
    const glowPath = new google.maps.Polyline({
      path: segmentCoordinates,
      geodesic: true,
      strokeColor: pollutionColors[level] || '#2196f3',
      strokeOpacity: 0.3,
      strokeWeight: 12,
      zIndex: 1
    });

    // Create main river path
    const segmentPath = new google.maps.Polyline({
      path: segmentCoordinates,
      geodesic: true,
      strokeColor: pollutionColors[level] || '#2196f3',
      strokeOpacity: 0.9,
      strokeWeight: 5,
      zIndex: 2
    });

    gangaPaths.push(glowPath);
    gangaPaths.push(segmentPath);
  }

  // Create a single path for flow animation
  const gangaPath = new google.maps.Polyline({
    path: gangaCoordinates,
    geodesic: true,
    strokeColor: 'transparent',
    strokeOpacity: 0,
    strokeWeight: 0,
    zIndex: 3,
    icons: [{
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 3,
        fillColor: '#ffffff',
        fillOpacity: 0.8,
        strokeWeight: 0
      },
      repeat: '90px'
    }]
  });

  // Create beautiful tooltip for river path
  const riverTooltip = document.createElement('div');
  riverTooltip.className = 'map-tooltip river-tooltip';
  riverTooltip.style.display = 'none';
  riverTooltip.style.position = 'absolute';
  riverTooltip.style.zIndex = '1000';
  riverTooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
  riverTooltip.style.color = '#333';
  riverTooltip.style.padding = '12px 15px';
  riverTooltip.style.borderRadius = '10px';
  riverTooltip.style.fontSize = '14px';
  riverTooltip.style.pointerEvents = 'none';
  riverTooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
  riverTooltip.style.maxWidth = '280px';
  riverTooltip.style.textAlign = 'left';
  riverTooltip.style.transform = 'translate(-50%, -130%)';
  riverTooltip.style.border = '1px solid rgba(0,0,0,0.05)';
  riverTooltip.style.fontFamily = "'Poppins', sans-serif";
  riverTooltip.style.transition = 'opacity 0.2s ease';

  // Initial content - will be updated dynamically
  riverTooltip.innerHTML = `
    <div style="border-left: 4px solid #2196f3; padding-left: 10px;">
      <div style="font-weight: 600; font-size: 15px; margin-bottom: 5px; color: #2196f3;">
        Ganga River
      </div>
      <div style="margin-bottom: 5px;">
        The sacred river flowing 2,525 km from the Himalayas to the Bay of Bengal
      </div>
      <div style="font-size: 12px; color: #666; font-style: italic;">
        Move cursor along river for location details
      </div>
    </div>
  `;
  document.body.appendChild(riverTooltip);

  // Add all river path segments to the map
  gangaPaths.forEach(path => {
    path.setMap(map);
  });

  // Add the transparent path for animation
  gangaPath.setMap(map);

  // Create a beautiful, interactive legend for pollution levels
  const legend = document.createElement('div');
  legend.className = 'map-legend';
  legend.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
  legend.style.padding = '15px';
  legend.style.margin = '10px';
  legend.style.borderRadius = '12px';
  legend.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  legend.style.fontSize = '13px';
  legend.style.fontFamily = "'Poppins', sans-serif";
  legend.style.lineHeight = '1.5';
  legend.style.maxWidth = '250px';
  legend.style.transition = 'all 0.3s ease';
  legend.style.border = '1px solid rgba(0,0,0,0.05)';

  // Create legend content with interactive elements
  legend.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 12px; justify-content: space-between;">
      <h3 style="margin: 0; font-size: 16px; color: #333; font-weight: 600;">Ganga Water Quality</h3>
      <div class="legend-toggle" style="cursor: pointer; font-size: 18px;">−</div>
    </div>

    <div class="legend-content">
      <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px; padding: 4px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;"
           data-level="pristine">
        <div style="width: 30px; height: 6px; background-color: ${pollutionColors.pristine}; margin-right: 10px; border-radius: 3px; box-shadow: 0 0 5px ${pollutionColors.pristine}"></div>
        <span>Pristine Water</span>
      </div>

      <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px; padding: 4px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;"
           data-level="excellent">
        <div style="width: 30px; height: 6px; background-color: ${pollutionColors.excellent}; margin-right: 10px; border-radius: 3px; box-shadow: 0 0 5px ${pollutionColors.excellent}"></div>
        <span>Excellent Water Quality</span>
      </div>

      <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px; padding: 4px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;"
           data-level="good">
        <div style="width: 30px; height: 6px; background-color: ${pollutionColors.good}; margin-right: 10px; border-radius: 3px; box-shadow: 0 0 5px ${pollutionColors.good}"></div>
        <span>Good Water Quality</span>
      </div>

      <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px; padding: 4px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;"
           data-level="moderate">
        <div style="width: 30px; height: 6px; background-color: ${pollutionColors.moderate}; margin-right: 10px; border-radius: 3px; box-shadow: 0 0 5px ${pollutionColors.moderate}"></div>
        <span>Moderate Pollution</span>
      </div>

      <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px; padding: 4px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;"
           data-level="poor">
        <div style="width: 30px; height: 6px; background-color: ${pollutionColors.poor}; margin-right: 10px; border-radius: 3px; box-shadow: 0 0 5px ${pollutionColors.poor}"></div>
        <span>Poor Water Quality</span>
      </div>

      <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px; padding: 4px; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;"
           data-level="critical">
        <div style="width: 30px; height: 6px; background-color: ${pollutionColors.critical}; margin-right: 10px; border-radius: 3px; box-shadow: 0 0 5px ${pollutionColors.critical}"></div>
        <span>Critical Pollution</span>
      </div>
    </div>
  `;

  // Add the legend to the map
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

  // Add interactivity to the legend
  const legendToggle = legend.querySelector('.legend-toggle');
  const legendContent = legend.querySelector('.legend-content');

  legendToggle.addEventListener('click', () => {
    if (legendContent.style.display === 'none') {
      legendContent.style.display = 'block';
      legendToggle.textContent = '−';
    } else {
      legendContent.style.display = 'none';
      legendToggle.textContent = '+';
    }
  });

  // Add hover effects to legend items
  const legendItems = legend.querySelectorAll('.legend-item');
  legendItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = 'rgba(0,0,0,0.05)';
    });

    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });

    // Highlight river segments when clicking on legend items
    item.addEventListener('click', () => {
      const level = item.getAttribute('data-level');

      // Reset all path opacities first
      gangaPaths.forEach(path => {
        path.setOptions({ strokeOpacity: path.strokeWeight === 12 ? 0.3 : 0.9 });
      });

      // Highlight paths of the selected level
      gangaPaths.forEach((path, index) => {
        if (index % 2 === 1) { // Main paths only
          const pathIndex = Math.floor(index / 2);
          if (pathIndex < gangaCoordinates.length - 1) {
            const pathLevel = gangaCoordinates[pathIndex].level;

            if (pathLevel === level) {
              // Highlight this path
              path.setOptions({ strokeOpacity: 1, strokeWeight: 6 });
              // Also highlight its glow
              gangaPaths[index-1].setOptions({ strokeOpacity: 0.6, strokeWeight: 14 });
            } else {
              // Dim other paths
              path.setOptions({ strokeOpacity: 0.4 });
              gangaPaths[index-1].setOptions({ strokeOpacity: 0.1 });
            }
          }
        }
      });

      // Reset after 3 seconds
      setTimeout(() => {
        gangaPaths.forEach((path, index) => {
          if (index % 2 === 0) { // Glow paths
            path.setOptions({ strokeOpacity: 0.3, strokeWeight: 12 });
          } else { // Main paths
            path.setOptions({ strokeOpacity: 0.9, strokeWeight: 5 });
          }
        });
      }, 3000);
    });
  });

  // Add mousemove listener to the map to show river tooltip
  map.addListener('mousemove', (event) => {
    // Check if mouse is near the river path
    const point = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
    let isNearPath = false;
    let nearestSegment = '';

    // Check distance to each segment of the path
    for (let i = 0; i < gangaCoordinates.length - 1; i++) {
      const start = new google.maps.LatLng(gangaCoordinates[i].lat, gangaCoordinates[i].lng);
      const end = new google.maps.LatLng(gangaCoordinates[i+1].lat, gangaCoordinates[i+1].lng);

      // Calculate distance from point to line segment
      const distance = distanceToLineSegment(point, start, end);

      // If within threshold distance, consider it near the path
      if (distance < 0.05) { // Threshold in degrees, adjust as needed
        isNearPath = true;

        // Get detailed information about this river segment
        const segmentInfo = gangaCoordinates[i];
        const levelText = {
          'pristine': 'Pristine',
          'excellent': 'Excellent',
          'good': 'Good',
          'moderate': 'Moderate',
          'poor': 'Poor',
          'critical': 'Critical'
        };

        // Create simplified tooltip content
        nearestSegment = `
          <div style="text-align: left; padding: 5px;">
            <strong>${segmentInfo.name}</strong>
            <div style="margin-top: 5px; font-size: 13px;">
              <div><span style="color: ${pollutionColors[segmentInfo.level]}; font-weight: bold;">${levelText[segmentInfo.level]}</span> section of the river</div>
              <div style="font-size: 11px; margin-top: 5px; color: #eee;">Click on markers for more details</div>
            </div>
          </div>
        `;

        break;
      }
    }

    // Update tooltip
    if (isNearPath) {
      riverTooltip.style.display = 'block';
      riverTooltip.innerHTML = nearestSegment;
      riverTooltip.style.left = event.pixel.x + 'px';
      riverTooltip.style.top = (event.pixel.y - 10) + 'px';
      riverTooltip.style.minWidth = '200px';
    } else {
      riverTooltip.style.display = 'none';
    }
  });

  // Helper function to calculate distance from point to line segment
  function distanceToLineSegment(p, v, w) {
    // Convert to simple points for calculation
    const p1 = { x: p.lat(), y: p.lng() };
    const v1 = { x: v.lat(), y: v.lng() };
    const w1 = { x: w.lat(), y: w.lng() };

    // Calculate squared length of line segment
    const l2 = Math.pow(v1.x - w1.x, 2) + Math.pow(v1.y - w1.y, 2);

    // If segment is a point, return distance to the point
    if (l2 === 0) return Math.sqrt(Math.pow(p1.x - v1.x, 2) + Math.pow(p1.y - v1.y, 2));

    // Calculate projection of point onto line
    const t = ((p1.x - v1.x) * (w1.x - v1.x) + (p1.y - v1.y) * (w1.y - v1.y)) / l2;

    // If projection is outside segment, return distance to nearest endpoint
    if (t < 0) return Math.sqrt(Math.pow(p1.x - v1.x, 2) + Math.pow(p1.y - v1.y, 2));
    if (t > 1) return Math.sqrt(Math.pow(p1.x - w1.x, 2) + Math.pow(p1.y - w1.y, 2));

    // Calculate projection point
    const proj = {
      x: v1.x + t * (w1.x - v1.x),
      y: v1.y + t * (w1.y - v1.y)
    };

    // Return distance to projection point
    return Math.sqrt(Math.pow(p1.x - proj.x, 2) + Math.pow(p1.y - proj.y, 2));
  }

  // Create a more beautiful and smooth river flow animation
  let count = 0;
  const animateRiver = () => {
    if (gangaPath && gangaPath.get) {
      try {
        // Slower, smoother animation
        count = (count + 0.5) % 200;
        const icons = gangaPath.get('icons');
        if (icons && icons.length > 0) {
          icons[0].offset = count + '%';
          gangaPath.set('icons', icons);
        }

        // Add a pulsing effect to the river
        const pulseAmount = Math.sin(count / 30) * 0.1 + 0.9;
        gangaPaths.forEach((path, index) => {
          // Only apply pulsing to the main paths (even indices), not the glow paths
          if (index % 2 === 1) {
            path.setOptions({
              strokeOpacity: 0.8 * pulseAmount
            });
          }
        });
      } catch (error) {
        console.log('Animation error:', error);
      }
    }
    window.requestAnimationFrame(animateRiver);
  };

  // Start the animation
  window.requestAnimationFrame(animateRiver);

  // Add source and mouth markers using AdvancedMarkerElement if available, or fallback to regular Marker
  let sourceMarker, mouthMarker;

  try {
    // Try to use AdvancedMarkerElement (recommended by Google)
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      // Create source marker with enhanced styling
      const sourcePin = new google.maps.marker.PinElement({
        background: '#0d47a1',
        glyph: 'S',
        borderColor: '#ffffff',
        scale: 1.4,
        glyphColor: '#ffffff'
      });

      // Create beautiful tooltip for source marker
      const sourceTooltip = document.createElement('div');
      sourceTooltip.className = 'map-tooltip source-tooltip';
      sourceTooltip.style.display = 'none';
      sourceTooltip.style.position = 'absolute';
      sourceTooltip.style.zIndex = '1000';
      sourceTooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      sourceTooltip.style.color = '#333';
      sourceTooltip.style.padding = '12px 15px';
      sourceTooltip.style.borderRadius = '10px';
      sourceTooltip.style.fontSize = '14px';
      sourceTooltip.style.pointerEvents = 'none';
      sourceTooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
      sourceTooltip.style.maxWidth = '280px';
      sourceTooltip.style.textAlign = 'left';
      sourceTooltip.style.transform = 'translate(-50%, -130%)';
      sourceTooltip.style.border = '1px solid rgba(0,0,0,0.05)';
      sourceTooltip.style.fontFamily = "'Poppins', sans-serif";

      // Create simplified tooltip content
      sourceTooltip.innerHTML = `
        <div style="border-left: 4px solid ${pollutionColors.pristine}; padding-left: 10px;">
          <div style="font-weight: 600; font-size: 15px; margin-bottom: 5px; color: ${pollutionColors.pristine};">
            Gangotri (Source)
          </div>
          <div style="margin-bottom: 8px;">
            The sacred source of the Ganga river in the Himalayas
          </div>
          <div style="display: flex; align-items: center; font-size: 13px; color: #666;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${pollutionColors.pristine}; margin-right: 6px;"></div>
            <div>Click for more information</div>
          </div>
        </div>
      `;
      document.body.appendChild(sourceTooltip);

      sourceMarker = new google.maps.marker.AdvancedMarkerElement({
        position: gangaCoordinates[0],
        map: map,
        title: 'Gangotri (Source)',
        content: sourcePin.element,
        zIndex: 200
      });

      // Add hover events to source marker
      sourcePin.element.addEventListener('mouseenter', () => {
        sourceTooltip.style.display = 'block';
        const rect = sourcePin.element.getBoundingClientRect();
        sourceTooltip.style.left = rect.left + rect.width/2 + 'px';
        sourceTooltip.style.top = rect.top + 'px';
      });

      sourcePin.element.addEventListener('mouseleave', () => {
        sourceTooltip.style.display = 'none';
      });

      // Create mouth marker with enhanced styling
      const mouthPin = new google.maps.marker.PinElement({
        background: '#0d47a1',
        glyph: 'M',
        borderColor: '#ffffff',
        scale: 1.4,
        glyphColor: '#ffffff'
      });

      // Create beautiful tooltip for mouth marker
      const mouthTooltip = document.createElement('div');
      mouthTooltip.className = 'map-tooltip mouth-tooltip';
      mouthTooltip.style.display = 'none';
      mouthTooltip.style.position = 'absolute';
      mouthTooltip.style.zIndex = '1000';
      mouthTooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      mouthTooltip.style.color = '#333';
      mouthTooltip.style.padding = '12px 15px';
      mouthTooltip.style.borderRadius = '10px';
      mouthTooltip.style.fontSize = '14px';
      mouthTooltip.style.pointerEvents = 'none';
      mouthTooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
      mouthTooltip.style.maxWidth = '280px';
      mouthTooltip.style.textAlign = 'left';
      mouthTooltip.style.transform = 'translate(-50%, -130%)';
      mouthTooltip.style.border = '1px solid rgba(0,0,0,0.05)';
      mouthTooltip.style.fontFamily = "'Poppins', sans-serif";

      // Create simplified tooltip content
      mouthTooltip.innerHTML = `
        <div style="border-left: 4px solid ${pollutionColors.moderate}; padding-left: 10px;">
          <div style="font-weight: 600; font-size: 15px; margin-bottom: 5px; color: ${pollutionColors.moderate};">
            Ganga Sagar (Mouth)
          </div>
          <div style="margin-bottom: 8px;">
            Where the Ganga meets the Bay of Bengal
          </div>
          <div style="display: flex; align-items: center; font-size: 13px; color: #666;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${pollutionColors.moderate}; margin-right: 6px;"></div>
            <div>Click for more information</div>
          </div>
        </div>
      `;
      document.body.appendChild(mouthTooltip);

      mouthMarker = new google.maps.marker.AdvancedMarkerElement({
        position: gangaCoordinates[gangaCoordinates.length - 1],
        map: map,
        title: 'Ganga Sagar (Mouth)',
        content: mouthPin.element,
        zIndex: 200
      });

      // Add hover events to mouth marker
      mouthPin.element.addEventListener('mouseenter', () => {
        mouthTooltip.style.display = 'block';
        const rect = mouthPin.element.getBoundingClientRect();
        mouthTooltip.style.left = rect.left + rect.width/2 + 'px';
        mouthTooltip.style.top = rect.top + 'px';
      });

      mouthPin.element.addEventListener('mouseleave', () => {
        mouthTooltip.style.display = 'none';
      });

      const sourceInfo = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>Gangotri (Source)</h3>
            <p>The sacred source of the Ganga river in the Himalayas</p>
            <p>This glacial source at an altitude of 3,892 meters (12,769 feet) marks the beginning of the Ganga's 2,525 km journey to the Bay of Bengal.</p>
            <p>The pristine waters here flow from the Gangotri Glacier, one of the largest glaciers in the Himalayas.</p>
          </div>
        `,
        maxWidth: 350
      });

      const mouthInfo = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>Ganga Sagar (Mouth)</h3>
            <p>Where the Ganga meets the Bay of Bengal</p>
            <p>The final destination of the mighty Ganga, where freshwater meets the sea at the Bay of Bengal.</p>
            <p>This delta region is home to the Sundarbans, the world's largest mangrove forest and a UNESCO World Heritage site.</p>
          </div>
        `,
        maxWidth: 350
      });

      // Add event listeners for advanced markers - using gmp-click
      sourceMarker.addEventListener('gmp-click', () => {
        sourceInfo.open(map, sourceMarker);
      });

      mouthMarker.addEventListener('gmp-click', () => {
        mouthInfo.open(map, mouthMarker);
      });
    } else {
      // Fallback to regular Marker with custom icons
      sourceMarker = new google.maps.Marker({
        position: gangaCoordinates[0],
        map: map,
        title: 'Gangotri (Source)',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: pollutionColors.pristine,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 10
        },
        zIndex: 100
      });

      mouthMarker = new google.maps.Marker({
        position: gangaCoordinates[gangaCoordinates.length - 1],
        map: map,
        title: 'Ganga Sagar (Mouth)',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: pollutionColors.moderate,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 10
        },
        zIndex: 100
      });
    }
  } catch (error) {
    console.error('Error creating markers:', error);
    // Fallback to regular Marker if AdvancedMarkerElement fails
    sourceMarker = new google.maps.Marker({
      position: gangaCoordinates[0],
      map: map,
      title: 'Gangotri (Source)',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: pollutionColors.pristine,
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 10
      },
      zIndex: 100
    });

    mouthMarker = new google.maps.Marker({
      position: gangaCoordinates[gangaCoordinates.length - 1],
      map: map,
      title: 'Ganga Sagar (Mouth)',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: pollutionColors.moderate,
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 10
      },
      zIndex: 100
    });
  }

  const sourceInfo = new google.maps.InfoWindow({
    content: `
      <div class="info-window">
        <h3>Gangotri (Source)</h3>
        <p>The sacred source of the Ganga river in the Himalayas</p>
        <p>This glacial source at an altitude of 3,892 meters (12,769 feet) marks the beginning of the Ganga's 2,525 km journey to the Bay of Bengal.</p>
        <p>The pristine waters here flow from the Gangotri Glacier, one of the largest glaciers in the Himalayas.</p>
      </div>
    `,
    maxWidth: 350
  });

  const mouthInfo = new google.maps.InfoWindow({
    content: `
      <div class="info-window">
        <h3>Ganga Sagar (Mouth)</h3>
        <p>Where the Ganga meets the Bay of Bengal</p>
        <p>The final destination of the mighty Ganga, where freshwater meets the sea at the Bay of Bengal.</p>
        <p>This delta region is home to the Sundarbans, the world's largest mangrove forest and a UNESCO World Heritage site.</p>
      </div>
    `,
    maxWidth: 350
  });

  // Add click listeners for source and mouth markers
  sourceMarker.addListener('click', () => {
    sourceInfo.open(map, sourceMarker);
  });

  mouthMarker.addListener('click', () => {
    mouthInfo.open(map, mouthMarker);
  });

  // Add markers for pollution hotspots
  hotspots.forEach(spot => {
    // Choose marker color based on pollution level
    let markerColor;
    switch(spot.level) {
      case 'high':
        markerColor = '#f44336'; // Red
        break;
      case 'medium':
        markerColor = '#ff9800'; // Orange
        break;
      case 'low':
        markerColor = '#4caf50'; // Green
        break;
      default:
        markerColor = '#1e88e5'; // Blue
    }

    try {
      let marker;

      // Try to use AdvancedMarkerElement if available
      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        // Create a custom pin for the pollution hotspot with enhanced styling
        const pinBackground = document.createElement('div');
        pinBackground.style.width = '24px';
        pinBackground.style.height = '24px';
        pinBackground.style.borderRadius = '50%';
        pinBackground.style.backgroundColor = markerColor;
        pinBackground.style.border = '3px solid white';
        pinBackground.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
        pinBackground.style.transition = 'transform 0.3s ease';

        // Add pulse animation for high pollution areas
        if (spot.level === 'high') {
          pinBackground.style.animation = 'pulse 2s infinite';
        }

        // Create beautiful tooltip for hover
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.style.display = 'none';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1000';
        tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        tooltip.style.color = '#333';
        tooltip.style.padding = '12px 15px';
        tooltip.style.borderRadius = '10px';
        tooltip.style.fontSize = '14px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
        tooltip.style.maxWidth = '280px';
        tooltip.style.textAlign = 'left';
        tooltip.style.transform = 'translate(-50%, -130%)';
        tooltip.style.border = '1px solid rgba(0,0,0,0.05)';
        tooltip.style.fontFamily = "'Poppins', sans-serif";

        // Get color based on pollution level
        const levelColor = pollutionColors[spot.level] || '#2196f3';

        // Create simplified tooltip content
        const tooltipContent = `
          <div style="border-left: 4px solid ${levelColor}; padding-left: 10px;">
            <div style="font-weight: 600; font-size: 15px; margin-bottom: 5px; color: ${levelColor};">
              ${spot.name}
            </div>
            <div style="margin-bottom: 8px;">
              ${spot.description}
            </div>
            <div style="display: flex; align-items: center; font-size: 13px; color: #666;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${levelColor}; margin-right: 6px;"></div>
              <div>Click for more information</div>
            </div>
          </div>
        `;

        tooltip.innerHTML = tooltipContent;

        // Add tooltip to the document body
        document.body.appendChild(tooltip);

        // Create the advanced marker
        marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lng },
          map: map,
          title: spot.name,
          content: pinBackground
        });

        // Add hover events to the marker
        pinBackground.addEventListener('mouseenter', () => {
          tooltip.style.display = 'block';

          // Position the tooltip near the marker
          const rect = pinBackground.getBoundingClientRect();
          tooltip.style.left = rect.left + rect.width/2 + 'px';
          tooltip.style.top = rect.top + 'px';
        });

        pinBackground.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });

        // Update tooltip position when map is panned
        map.addListener('bounds_changed', () => {
          if (tooltip.style.display === 'block') {
            const rect = pinBackground.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width/2 + 'px';
            tooltip.style.top = rect.top + 'px';
          }
        });

        const infoContent = document.createElement('div');
        infoContent.classList.add('info-window');

        // Create simplified pollution information
        let pollutionDetails = `
          <div class="pollution-details-container">
            <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
              ${spot.name}
            </h4>
            <p>${spot.description}</p>

            <div class="pollution-sources">
              <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
              <p style="margin: 0;">${spot.details.pollutionSources}</p>
            </div>
          </div>
        `;
        // Use consistent format for all pollution levels
        if (spot.level === 'critical') {
          pollutionDetails = `
            <div class="pollution-details-container">
              <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${spot.name}
              </h4>
              <p>${spot.description}</p>
              <div class="pollution-sources">
                <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
                <p style="margin: 0;">Critical area requiring immediate intervention. Major sources include industrial discharge, untreated sewage, and chemical waste.</p>
              </div>
            </div>
          `;
        } else if (spot.level === 'poor' || spot.level === 'moderate') {
          pollutionDetails = `
            <div class="pollution-details-container">
              <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${spot.name}
              </h4>
              <p>${spot.description}</p>
              <div class="pollution-sources">
                <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
                <p style="margin: 0;">Area with concerning pollution levels requiring regular monitoring. Main sources include urban runoff, agricultural activities, and moderate industrial impact.</p>
              </div>
            </div>
          `;
        } else {
          pollutionDetails = `
            <div class="pollution-details-container">
              <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${spot.name}
              </h4>
              <p>${spot.description}</p>
              <div class="pollution-sources">
                <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
                <p style="margin: 0;">Area with good water quality. Limited pollution sources with primarily natural factors and minimal human impact.</p>
              </div>
            </div>
          `;
        }

        infoContent.innerHTML = `
          <h3>${spot.name}</h3>
          <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
          <p>${spot.description}</p>
          ${pollutionDetails}
        `;

        // Add click listener for advanced marker - using gmp-click for AdvancedMarkerElement
        marker.addEventListener('gmp-click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
            maxWidth: 300
          });
          infoWindow.open(map, marker);
        });
      } else {
        // Fallback to regular Marker
        marker = new google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map: map,
          title: spot.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 10
          },
          animation: google.maps.Animation.DROP
        });

        let pollutionDetails = '';
        // Use consistent format for all pollution levels
        if (spot.level === 'critical') {
          pollutionDetails = `
            <div class="pollution-details-container">
              <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${spot.name}
              </h4>
              <p>${spot.description}</p>
              <div class="pollution-sources">
                <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
                <p style="margin: 0;">Critical area requiring immediate intervention. Major sources include industrial discharge, untreated sewage, and chemical waste.</p>
              </div>
            </div>
          `;
        } else if (spot.level === 'poor' || spot.level === 'moderate') {
          pollutionDetails = `
            <div class="pollution-details-container">
              <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${spot.name}
              </h4>
              <p>${spot.description}</p>
              <div class="pollution-sources">
                <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
                <p style="margin: 0;">Area with concerning pollution levels requiring regular monitoring. Main sources include urban runoff, agricultural activities, and moderate industrial impact.</p>
              </div>
            </div>
          `;
        } else {
          pollutionDetails = `
            <div class="pollution-details-container">
              <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${spot.name}
              </h4>
              <p>${spot.description}</p>
              <div class="pollution-sources">
                <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
                <p style="margin: 0;">Area with good water quality. Limited pollution sources with primarily natural factors and minimal human impact.</p>
              </div>
            </div>
          `;
        }

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="info-window">
              <h3>${spot.name}</h3>
              <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
              <p>${spot.description}</p>
              ${pollutionDetails}
            </div>
          `,
          maxWidth: 350
        });

        // Add click listener to open info window
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    } catch (error) {
      console.error('Error creating pollution marker:', error);

      // Fallback to regular Marker if AdvancedMarkerElement fails
      const marker = new google.maps.Marker({
        position: { lat: spot.lat, lng: spot.lng },
        map: map,
        title: spot.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 10
        }
      });

      let pollutionDetails = '';
      // Use consistent format for all pollution levels
      if (spot.level === 'critical') {
        pollutionDetails = `
          <div class="pollution-details-container">
            <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
              ${spot.name}
            </h4>
            <p>${spot.description}</p>
            <div class="pollution-sources">
              <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
              <p style="margin: 0;">Critical area requiring immediate intervention. Major sources include industrial discharge, untreated sewage, and chemical waste.</p>
            </div>
          </div>
        `;
      } else if (spot.level === 'poor' || spot.level === 'moderate') {
        pollutionDetails = `
          <div class="pollution-details-container">
            <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
              ${spot.name}
            </h4>
            <p>${spot.description}</p>
            <div class="pollution-sources">
              <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
              <p style="margin: 0;">Area with concerning pollution levels requiring regular monitoring. Main sources include urban runoff, agricultural activities, and moderate industrial impact.</p>
            </div>
          </div>
        `;
      } else {
        pollutionDetails = `
          <div class="pollution-details-container">
            <h4 style="margin-top: 0; color: ${pollutionColors[spot.level] || '#2196f3'}; border-bottom: 1px solid #eee; padding-bottom: 8px;">
              ${spot.name}
            </h4>
            <p>${spot.description}</p>
            <div class="pollution-sources">
              <h5 style="margin: 12px 0 8px 0;">Key Information:</h5>
              <p style="margin: 0;">Area with good water quality. Limited pollution sources with primarily natural factors and minimal human impact.</p>
            </div>
          </div>
        `;
      }

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>${spot.name}</h3>
            <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
            <p>${spot.description}</p>
            ${pollutionDetails}
          </div>
        `,
        maxWidth: 350
      });

      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }
  });

  // Add custom styles to the info windows
  const style = document.createElement('style');
  style.textContent = `
    .info-window {
      padding: 15px;
      font-family: 'Poppins', sans-serif;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    .info-window h3 {
      margin: 0 0 12px;
      color: #0d47a1;
      font-size: 18px;
      border-bottom: 2px solid #2196f3;
      padding-bottom: 8px;
      font-weight: 600;
    }
    .info-window p {
      margin: 8px 0;
      line-height: 1.5;
      color: #424242;
    }
    .info-window strong {
      font-weight: 600;
      color: #212121;
    }
    .pollution-high {
      color: #f44336;
      font-weight: bold;
      background-color: rgba(244, 67, 54, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pollution-medium {
      color: #ff9800;
      font-weight: bold;
      background-color: rgba(255, 152, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pollution-low {
      color: #4caf50;
      font-weight: bold;
      background-color: rgba(76, 175, 80, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pollution-details {
      margin: 8px 0 12px 0;
      padding-left: 20px;
    }
    .pollution-details li {
      margin-bottom: 6px;
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);

  // Hide loading indicator when map is fully loaded
  google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
    // Clear the timeout to prevent showing fallback
    if (window.mapLoadingTimeout) {
      clearTimeout(window.mapLoadingTimeout);
    }

    // Hide loading indicator
    if (mapLoading) {
      mapLoading.classList.add('hidden');
    }

    console.log('Map loaded successfully with API key: AIzaSyAPREHAXknXIDLKG6hHhpty99gxlOlkpRw');
  });
}

// Helper functions
function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function showError(input, message) {
  const formGroup = input.parentElement;
  const errorElement = formGroup.querySelector('.error-message') || document.createElement('div');

  errorElement.classList.add('error-message');
  errorElement.textContent = message;

  if (!formGroup.querySelector('.error-message')) {
    formGroup.appendChild(errorElement);
  }

  input.classList.add('error');
}

function removeError(input) {
  const formGroup = input.parentElement;
  const errorElement = formGroup.querySelector('.error-message');

  if (errorElement) {
    formGroup.removeChild(errorElement);
  }

  input.classList.remove('error');
}


