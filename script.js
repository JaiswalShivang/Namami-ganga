// Namami Ganga Project - Main JavaScript

// Initialize AOS when DOM is loaded
function initAOS() {
  AOS.init({
    duration: 800,
    easing: 'ease',
    once: true,
    offset: 100
  });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  initAOS();

  // Check if Google Maps API failed to load after 5 seconds
  setTimeout(function() {
    if (typeof google === 'undefined') {
      console.log('Google Maps API failed to load, showing fallback');
      const mapContainer = document.getElementById('pollutionMap');
      const mapLoading = document.querySelector('.map-loading');

      if (mapContainer) {
        // Hide loading indicator
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
      e.preventDefault();

      // Basic validation
      let valid = true;
      const name = document.getElementById('name');
      const email = document.getElementById('email');
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

      if (message.value.trim() === '') {
        showError(message, 'Message is required');
        valid = false;
      } else {
        removeError(message);
      }

      if (valid) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.textContent = 'Your message has been sent successfully!';

        contactForm.reset();
        contactForm.appendChild(successMessage);

        // Remove success message after 3 seconds
        setTimeout(() => {
          contactForm.removeChild(successMessage);
        }, 3000);
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
    { lat: 25.3176, lng: 83.0130, level: 'high', name: 'Varanasi Industrial Area', description: 'Heavy industrial discharge and sewage' },
    { lat: 25.4358, lng: 81.8463, level: 'high', name: 'Allahabad Sangam', description: 'Urban waste and religious activities' },
    { lat: 27.1767, lng: 78.0081, level: 'medium', name: 'Agra Stretch', description: 'Industrial and domestic waste' },
    { lat: 22.5726, lng: 88.3639, level: 'high', name: 'Kolkata Port Area', description: 'Industrial discharge and shipping waste' },
    { lat: 25.5941, lng: 85.1376, level: 'medium', name: 'Patna City', description: 'Urban sewage and domestic waste' },
    { lat: 29.9457, lng: 78.1642, level: 'low', name: 'Haridwar', description: 'Religious activities and tourism' },
    { lat: 30.0869, lng: 78.2676, level: 'low', name: 'Rishikesh', description: 'Tourism impact and sewage' },
    { lat: 26.4499, lng: 80.3319, level: 'high', name: 'Kanpur Industrial Belt', description: 'Leather tanneries and chemical industries' }
  ];

  // Create the map centered on the Ganges river
  const gangaCenter = { lat: 25.3176, lng: 83.0130 }; // Varanasi as center point

  // Custom map style for better river visibility
  const mapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#1e88e5' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#e8f5e9' }] }
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
    mapId: '8f066f0a7f1e3c0c'
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
    { lat: 30.9910, lng: 78.9200 }, // Gangotri (source)
    { lat: 30.0869, lng: 78.2676 }, // Rishikesh
    { lat: 29.9457, lng: 78.1642 }, // Haridwar
    { lat: 29.4727, lng: 77.7085 }, // Bijnor
    { lat: 28.8955, lng: 78.0883 }, // Garhmukteshwar
    { lat: 27.1767, lng: 78.0081 }, // Agra
    { lat: 26.4499, lng: 80.3319 }, // Kanpur
    { lat: 25.4358, lng: 81.8463 }, // Allahabad
    { lat: 25.3176, lng: 83.0130 }, // Varanasi
    { lat: 25.5941, lng: 85.1376 }, // Patna
    { lat: 24.7914, lng: 87.9336 }, // Farakka
    { lat: 22.5726, lng: 88.3639 }, // Kolkata
    { lat: 21.7679, lng: 88.1108 }  // Ganga Sagar (mouth)
  ];

  // Create river path with animation
  const gangaPath = new google.maps.Polyline({
    path: gangaCoordinates,
    geodesic: true,
    strokeColor: '#1e88e5',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    icons: [{
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        fillColor: '#1e88e5',
        fillOpacity: 0.8,
        strokeWeight: 1
      },
      repeat: '100px'
    }]
  });

  // Add the river path to the map
  gangaPath.setMap(map);

  // Animate the river flow
  let count = 0;
  const animateRiver = () => {
    if (gangaPath && gangaPath.get) {
      try {
        count = (count + 1) % 200;
        const icons = gangaPath.get('icons');
        if (icons && icons.length > 0) {
          icons[0].offset = (count / 2) + '%';
          gangaPath.set('icons', icons);
        }
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
      // Create source marker
      const sourcePin = new google.maps.marker.PinElement({
        background: '#1e88e5',
        glyph: 'S',
        borderColor: '#ffffff',
        scale: 1.2
      });

      sourceMarker = new google.maps.marker.AdvancedMarkerElement({
        position: gangaCoordinates[0],
        map: map,
        title: 'Gangotri (Source)',
        content: sourcePin.element
      });

      // Create mouth marker
      const mouthPin = new google.maps.marker.PinElement({
        background: '#1e88e5',
        glyph: 'M',
        borderColor: '#ffffff',
        scale: 1.2
      });

      mouthMarker = new google.maps.marker.AdvancedMarkerElement({
        position: gangaCoordinates[gangaCoordinates.length - 1],
        map: map,
        title: 'Ganga Sagar (Mouth)',
        content: mouthPin.element
      });

      // Create info windows for source and mouth
      const sourceInfo = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>Gangotri (Source)</h3>
            <p>The sacred source of the Ganga river in the Himalayas</p>
          </div>
        `,
        maxWidth: 300
      });

      const mouthInfo = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>Ganga Sagar (Mouth)</h3>
            <p>Where the Ganga meets the Bay of Bengal</p>
          </div>
        `,
        maxWidth: 300
      });

      // Add event listeners for advanced markers - using gmp-click
      sourceMarker.addEventListener('gmp-click', () => {
        sourceInfo.open(map, sourceMarker);
      });

      mouthMarker.addEventListener('gmp-click', () => {
        mouthInfo.open(map, mouthMarker);
      });
    } else {
      // Fallback to regular Marker
      sourceMarker = new google.maps.Marker({
        position: gangaCoordinates[0],
        map: map,
        title: 'Gangotri (Source)',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        },
        zIndex: 100
      });

      mouthMarker = new google.maps.Marker({
        position: gangaCoordinates[gangaCoordinates.length - 1],
        map: map,
        title: 'Ganga Sagar (Mouth)',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(40, 40)
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
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(40, 40)
      },
      zIndex: 100
    });

    mouthMarker = new google.maps.Marker({
      position: gangaCoordinates[gangaCoordinates.length - 1],
      map: map,
      title: 'Ganga Sagar (Mouth)',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new google.maps.Size(40, 40)
      },
      zIndex: 100
    });
  }

  // Create info windows for source and mouth
  const sourceInfo = new google.maps.InfoWindow({
    content: `
      <div class="info-window">
        <h3>Gangotri (Source)</h3>
        <p>The sacred source of the Ganga river in the Himalayas</p>
      </div>
    `,
    maxWidth: 300
  });

  const mouthInfo = new google.maps.InfoWindow({
    content: `
      <div class="info-window">
        <h3>Ganga Sagar (Mouth)</h3>
        <p>Where the Ganga meets the Bay of Bengal</p>
      </div>
    `,
    maxWidth: 300
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
        // Create a custom pin for the pollution hotspot
        const pinBackground = document.createElement('div');
        pinBackground.style.width = '20px';
        pinBackground.style.height = '20px';
        pinBackground.style.borderRadius = '50%';
        pinBackground.style.backgroundColor = markerColor;
        pinBackground.style.border = '2px solid white';
        pinBackground.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

        // Create the advanced marker
        marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lng },
          map: map,
          title: spot.name,
          content: pinBackground
        });

        // Create info window content
        const infoContent = document.createElement('div');
        infoContent.classList.add('info-window');
        infoContent.innerHTML = `
          <h3>${spot.name}</h3>
          <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
          <p>${spot.description}</p>
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

        // Create info window for regular marker
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="info-window">
              <h3>${spot.name}</h3>
              <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
              <p>${spot.description}</p>
            </div>
          `,
          maxWidth: 300
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

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>${spot.name}</h3>
            <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
            <p>${spot.description}</p>
          </div>
        `,
        maxWidth: 300
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
      padding: 10px;
      font-family: 'Poppins', sans-serif;
    }
    .info-window h3 {
      margin: 0 0 10px;
      color: #0d47a1;
      font-size: 16px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 5px;
    }
    .pollution-high {
      color: #f44336;
      font-weight: bold;
    }
    .pollution-medium {
      color: #ff9800;
      font-weight: bold;
    }
    .pollution-low {
      color: #4caf50;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  // Hide loading indicator when map is fully loaded
  google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
    if (mapLoading) {
      mapLoading.classList.add('hidden');
    }
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


