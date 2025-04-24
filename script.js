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
        const mapFallback = document.querySelector('.map-fallback');
        if (mapFallback) {
          mapFallback.style.display = 'block';
        }
      }
    }
  }, 5000);
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }
  const header = document.querySelector('header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });
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
  initMap();
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
      document.body.style.overflow = 'hidden';
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.classList.contains('close-lightbox')) {
          document.body.removeChild(lightbox);
          document.body.style.overflow = 'auto';
        }
      });
    });
  });
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
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
        const sendingMessage = document.createElement('div');
        sendingMessage.classList.add('sending-message');
        sendingMessage.innerHTML = '<i class="fas fa-paper-plane"></i> Sending your message...';
        contactForm.appendChild(sendingMessage);
        const formData = new FormData(contactForm);
        fetch('https://getform.io/f/axowxmxb', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            contactForm.removeChild(sendingMessage);
            const successMessage = document.createElement('div');
            successMessage.classList.add('success-message');
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your message has been sent successfully!';
            contactForm.appendChild(successMessage);
            contactForm.reset();
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
          if (contactForm.contains(sendingMessage)) {
            contactForm.removeChild(sendingMessage);
          }
          const errorMessage = document.createElement('div');
          errorMessage.classList.add('error-message');
          errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem sending your message. Please try again.';
          contactForm.appendChild(errorMessage);
          setTimeout(() => {
            if (contactForm.contains(errorMessage)) {
              contactForm.removeChild(errorMessage);
            }
          }, 5000);
        });
      }
    });
  }
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
function initMap() {
  if (typeof google === 'undefined') {
    console.log('Google Maps API not loaded yet, will retry in 1 second');
    setTimeout(initMap, 1000);
    return;
  }
  const mapContainer = document.getElementById('pollutionMap');
  const mapLoading = document.querySelector('.map-loading');
  if (!mapContainer) return;
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
  const gangaCenter = { lat: 25.3176, lng: 83.0130 };
  const mapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#f8f8f8' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#4a4a4a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d4d4d4' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#c8c8c8' }] },
    { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#1976d2' }] },
    { featureType: 'water', elementType: 'geometry.stroke', stylers: [{ color: '#1565c0' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'simplified' }, { color: '#e0e0e0' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#d9d9d9' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#c8c8c8' }] },
    { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#e8f5e9' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#f0f0f0' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e0f2f1' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8e6c9' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] }
  ];
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
    mapId: 'a3efe1c035c9b8e4'
  };
  let map;
  try {
    map = new google.maps.Map(mapContainer, mapOptions);
  } catch (error) {
    console.error('Error creating Google Map:', error);
    if (mapLoading) {
      mapLoading.style.display = 'none';
    }
    const mapFallback = document.querySelector('.map-fallback');
    if (mapFallback) {
      mapFallback.style.display = 'block';
    }
    return;
  }
  const gangaCoordinates = [
    { lat: 30.9910, lng: 78.9200 },
    { lat: 30.0869, lng: 78.2676 },
    { lat: 29.9457, lng: 78.1642 },
    { lat: 29.4727, lng: 77.7085 },
    { lat: 28.8955, lng: 78.0883 },
    { lat: 27.1767, lng: 78.0081 },
    { lat: 26.4499, lng: 80.3319 },
    { lat: 25.4358, lng: 81.8463 },
    { lat: 25.3176, lng: 83.0130 },
    { lat: 25.5941, lng: 85.1376 },
    { lat: 24.7914, lng: 87.9336 },
    { lat: 22.5726, lng: 88.3639 },
    { lat: 21.7679, lng: 88.1108 }
  ];
  const gangaPath = new google.maps.Polyline({
    path: gangaCoordinates,
    geodesic: true,
    strokeColor: '#2196f3',
    strokeOpacity: 0.9,
    strokeWeight: 5,
    icons: [{
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3.5,
        fillColor: '#ffffff',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#0d47a1'
      },
      repeat: '80px'
    }]
  });
  const riverTooltip = document.createElement('div');
  riverTooltip.className = 'map-tooltip river-tooltip';
  riverTooltip.style.display = 'none';
  riverTooltip.style.position = 'absolute';
  riverTooltip.style.zIndex = '1000';
  riverTooltip.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
  riverTooltip.style.color = 'white';
  riverTooltip.style.padding = '8px 12px';
  riverTooltip.style.borderRadius = '6px';
  riverTooltip.style.fontSize = '14px';
  riverTooltip.style.pointerEvents = 'none';
  riverTooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  riverTooltip.style.maxWidth = '250px';
  riverTooltip.style.textAlign = 'center';
  riverTooltip.style.transform = 'translate(-50%, -130%)';
  riverTooltip.innerHTML = '<strong>Ganga River</strong>: Water quality varies along the course';
  document.body.appendChild(riverTooltip);
  gangaPath.setMap(map);
  map.addListener('mousemove', (event) => {
    const point = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
    let isNearPath = false;
    let nearestSegment = '';
    for (let i = 0; i < gangaCoordinates.length - 1; i++) {
      const start = new google.maps.LatLng(gangaCoordinates[i].lat, gangaCoordinates[i].lng);
      const end = new google.maps.LatLng(gangaCoordinates[i+1].lat, gangaCoordinates[i+1].lng);
      const distance = distanceToLineSegment(point, start, end);
      if (distance < 0.05) {
        isNearPath = true;
        if (i < 3) {
          nearestSegment = 'Upper Ganga: Excellent water quality';
        } else if (i < 7) {
          nearestSegment = 'Middle Ganga: Moderate pollution';
        } else {
          nearestSegment = 'Lower Ganga: Higher pollution levels';
        }
        break;
      }
    }
    if (isNearPath) {
      riverTooltip.style.display = 'block';
      riverTooltip.innerHTML = `<strong>Ganga River</strong>: ${nearestSegment}`;
      riverTooltip.style.left = event.pixel.x + 'px';
      riverTooltip.style.top = event.pixel.y + 'px';
    } else {
      riverTooltip.style.display = 'none';
    }
  });
  function distanceToLineSegment(p, v, w) {
    const p1 = { x: p.lat(), y: p.lng() };
    const v1 = { x: v.lat(), y: v.lng() };
    const w1 = { x: w.lat(), y: w.lng() };
    const l2 = Math.pow(v1.x - w1.x, 2) + Math.pow(v1.y - w1.y, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(p1.x - v1.x, 2) + Math.pow(p1.y - v1.y, 2));
    const t = ((p1.x - v1.x) * (w1.x - v1.x) + (p1.y - v1.y) * (w1.y - v1.y)) / l2;
    if (t < 0) return Math.sqrt(Math.pow(p1.x - v1.x, 2) + Math.pow(p1.y - v1.y, 2));
    if (t > 1) return Math.sqrt(Math.pow(p1.x - w1.x, 2) + Math.pow(p1.y - w1.y, 2));
    const proj = {
      x: v1.x + t * (w1.x - v1.x),
      y: v1.y + t * (w1.y - v1.y)
    };
    return Math.sqrt(Math.pow(p1.x - proj.x, 2) + Math.pow(p1.y - proj.y, 2));
  }
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
  window.requestAnimationFrame(animateRiver);
  let sourceMarker, mouthMarker;
  try {
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const sourcePin = new google.maps.marker.PinElement({
        background: '#0d47a1',
        glyph: 'S',
        borderColor: '#ffffff',
        scale: 1.4,
        glyphColor: '#ffffff'
      });
      const sourceTooltip = document.createElement('div');
      sourceTooltip.className = 'map-tooltip source-tooltip';
      sourceTooltip.style.display = 'none';
      sourceTooltip.style.position = 'absolute';
      sourceTooltip.style.zIndex = '1000';
      sourceTooltip.style.backgroundColor = 'rgba(13, 71, 161, 0.9)';
      sourceTooltip.style.color = 'white';
      sourceTooltip.style.padding = '8px 12px';
      sourceTooltip.style.borderRadius = '6px';
      sourceTooltip.style.fontSize = '14px';
      sourceTooltip.style.pointerEvents = 'none';
      sourceTooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
      sourceTooltip.style.maxWidth = '250px';
      sourceTooltip.style.textAlign = 'center';
      sourceTooltip.style.transform = 'translate(-50%, -130%)';
      sourceTooltip.innerHTML = '<strong>Gangotri (Source)</strong>: Pristine water quality';
      document.body.appendChild(sourceTooltip);
      sourceMarker = new google.maps.marker.AdvancedMarkerElement({
        position: gangaCoordinates[0],
        map: map,
        title: 'Gangotri (Source)',
        content: sourcePin.element,
        zIndex: 200
      });
      sourcePin.element.addEventListener('mouseenter', () => {
        sourceTooltip.style.display = 'block';
        const rect = sourcePin.element.getBoundingClientRect();
        sourceTooltip.style.left = rect.left + rect.width/2 + 'px';
        sourceTooltip.style.top = rect.top + 'px';
      });
      sourcePin.element.addEventListener('mouseleave', () => {
        sourceTooltip.style.display = 'none';
      });
      const mouthPin = new google.maps.marker.PinElement({
        background: '#0d47a1',
        glyph: 'M',
        borderColor: '#ffffff',
        scale: 1.4,
        glyphColor: '#ffffff'
      });
      const mouthTooltip = document.createElement('div');
      mouthTooltip.className = 'map-tooltip mouth-tooltip';
      mouthTooltip.style.display = 'none';
      mouthTooltip.style.position = 'absolute';
      mouthTooltip.style.zIndex = '1000';
      mouthTooltip.style.backgroundColor = 'rgba(13, 71, 161, 0.9)';
      mouthTooltip.style.color = 'white';
      mouthTooltip.style.padding = '8px 12px';
      mouthTooltip.style.borderRadius = '6px';
      mouthTooltip.style.fontSize = '14px';
      mouthTooltip.style.pointerEvents = 'none';
      mouthTooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
      mouthTooltip.style.maxWidth = '250px';
      mouthTooltip.style.textAlign = 'center';
      mouthTooltip.style.transform = 'translate(-50%, -130%)';
      mouthTooltip.innerHTML = '<strong>Ganga Sagar (Mouth)</strong>: Where the Ganga meets the Bay of Bengal';
      document.body.appendChild(mouthTooltip);
      mouthMarker = new google.maps.marker.AdvancedMarkerElement({
        position: gangaCoordinates[gangaCoordinates.length - 1],
        map: map,
        title: 'Ganga Sagar (Mouth)',
        content: mouthPin.element,
        zIndex: 200
      });
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
      sourceMarker.addEventListener('gmp-click', () => {
        sourceInfo.open(map, sourceMarker);
      });
      mouthMarker.addEventListener('gmp-click', () => {
        mouthInfo.open(map, mouthMarker);
      });
    } else {
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
  sourceMarker.addListener('click', () => {
    sourceInfo.open(map, sourceMarker);
  });
  mouthMarker.addListener('click', () => {
    mouthInfo.open(map, mouthMarker);
  });
  hotspots.forEach(spot => {
    let markerColor;
    switch(spot.level) {
      case 'high':
        markerColor = '#f44336';
        break;
      case 'medium':
        markerColor = '#ff9800';
        break;
      case 'low':
        markerColor = '#4caf50';
        break;
      default:
        markerColor = '#1e88e5';
    }
    try {
      let marker;
      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        const pinBackground = document.createElement('div');
        pinBackground.style.width = '24px';
        pinBackground.style.height = '24px';
        pinBackground.style.borderRadius = '50%';
        pinBackground.style.backgroundColor = markerColor;
        pinBackground.style.border = '3px solid white';
        pinBackground.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
        pinBackground.style.transition = 'transform 0.3s ease';
        if (spot.level === 'high') {
          pinBackground.style.animation = 'pulse 2s infinite';
        }
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.style.display = 'none';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1000';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.fontSize = '14px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        tooltip.style.maxWidth = '250px';
        tooltip.style.textAlign = 'center';
        tooltip.style.transform = 'translate(-50%, -130%)';
        let tooltipContent = '';
        if (spot.level === 'high') {
          tooltipContent = `<strong>${spot.name}</strong>: Severely polluted area with high levels of industrial waste and sewage`;
        } else if (spot.level === 'medium') {
          tooltipContent = `<strong>${spot.name}</strong>: Moderately polluted with concerning levels of contamination`;
        } else {
          tooltipContent = `<strong>${spot.name}</strong>: Lower pollution levels but still requires monitoring`;
        }
        tooltip.innerHTML = tooltipContent;
        document.body.appendChild(tooltip);
        marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lng },
          map: map,
          title: spot.name,
          content: pinBackground
        });
        pinBackground.addEventListener('mouseenter', () => {
          tooltip.style.display = 'block';
          const rect = pinBackground.getBoundingClientRect();
          tooltip.style.left = rect.left + rect.width/2 + 'px';
          tooltip.style.top = rect.top + 'px';
        });
        pinBackground.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
        map.addListener('bounds_changed', () => {
          if (tooltip.style.display === 'block') {
            const rect = pinBackground.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width/2 + 'px';
            tooltip.style.top = rect.top + 'px';
          }
        });
        const infoContent = document.createElement('div');
        infoContent.classList.add('info-window');
        let pollutionDetails = '';
        if (spot.level === 'high') {
          pollutionDetails = `
            <p>Water quality is severely compromised with:</p>
            <ul class="pollution-details">
              <li>Dissolved oxygen: <strong>Below 4 mg/L</strong> (Critical)</li>
              <li>BOD levels: <strong>Above 8 mg/L</strong> (Unsafe)</li>
              <li>Coliform count: <strong>Very high</strong></li>
              <li>Heavy metals: <strong>Present</strong></li>
            </ul>
            <p>Immediate remediation required.</p>
          `;
        } else if (spot.level === 'medium') {
          pollutionDetails = `
            <p>Water quality is concerning with:</p>
            <ul class="pollution-details">
              <li>Dissolved oxygen: <strong>4-5 mg/L</strong> (Concerning)</li>
              <li>BOD levels: <strong>5-8 mg/L</strong> (Elevated)</li>
              <li>Coliform count: <strong>Moderate</strong></li>
              <li>Heavy metals: <strong>Trace amounts</strong></li>
            </ul>
            <p>Regular monitoring recommended.</p>
          `;
        } else {
          pollutionDetails = `
            <p>Water quality is acceptable with:</p>
            <ul class="pollution-details">
              <li>Dissolved oxygen: <strong>Above 5 mg/L</strong> (Acceptable)</li>
              <li>BOD levels: <strong>Below 5 mg/L</strong> (Normal)</li>
              <li>Coliform count: <strong>Low</strong></li>
              <li>Heavy metals: <strong>Not detected</strong></li>
            </ul>
            <p>Continued monitoring advised.</p>
          `;
        }
        infoContent.innerHTML = `
          <h3>${spot.name}</h3>
          <p><strong>Pollution Level:</strong> <span class="pollution-${spot.level}">${spot.level.toUpperCase()}</span></p>
          <p>${spot.description}</p>
          ${pollutionDetails}
        `;
        marker.addEventListener('gmp-click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
            maxWidth: 300
          });
          infoWindow.open(map, marker);
        });
      } else {
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
        if (spot.level === 'high') {
          pollutionDetails = `
            <p>Water quality is severely compromised with:</p>
            <ul class="pollution-details">
              <li>Dissolved oxygen: <strong>Below 4 mg/L</strong> (Critical)</li>
              <li>BOD levels: <strong>Above 8 mg/L</strong> (Unsafe)</li>
              <li>Coliform count: <strong>Very high</strong></li>
              <li>Heavy metals: <strong>Present</strong></li>
            </ul>
            <p>Immediate remediation required.</p>
          `;
        } else if (spot.level === 'medium') {
          pollutionDetails = `
            <p>Water quality is concerning with:</p>
            <ul class="pollution-details">
              <li>Dissolved oxygen: <strong>4-5 mg/L</strong> (Concerning)</li>
              <li>BOD levels: <strong>5-8 mg/L</strong> (Elevated)</li>
              <li>Coliform count: <strong>Moderate</strong></li>
              <li>Heavy metals: <strong>Trace amounts</strong></li>
            </ul>
            <p>Regular monitoring recommended.</p>
          `;
        } else {
          pollutionDetails = `
            <p>Water quality is acceptable with:</p>
            <ul class="pollution-details">
              <li>Dissolved oxygen: <strong>Above 5 mg/L</strong> (Acceptable)</li>
              <li>BOD levels: <strong>Below 5 mg/L</strong> (Normal)</li>
              <li>Coliform count: <strong>Low</strong></li>
              <li>Heavy metals: <strong>Not detected</strong></li>
            </ul>
            <p>Continued monitoring advised.</p>
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
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    } catch (error) {
      console.error('Error creating pollution marker:', error);
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
      if (spot.level === 'high') {
        pollutionDetails = `
          <p>Water quality is severely compromised with:</p>
          <ul class="pollution-details">
            <li>Dissolved oxygen: <strong>Below 4 mg/L</strong> (Critical)</li>
            <li>BOD levels: <strong>Above 8 mg/L</strong> (Unsafe)</li>
            <li>Coliform count: <strong>Very high</strong></li>
            <li>Heavy metals: <strong>Present</strong></li>
          </ul>
          <p>Immediate remediation required.</p>
        `;
      } else if (spot.level === 'medium') {
        pollutionDetails = `
          <p>Water quality is concerning with:</p>
          <ul class="pollution-details">
            <li>Dissolved oxygen: <strong>4-5 mg/L</strong> (Concerning)</li>
            <li>BOD levels: <strong>5-8 mg/L</strong> (Elevated)</li>
            <li>Coliform count: <strong>Moderate</strong></li>
            <li>Heavy metals: <strong>Trace amounts</strong></li>
          </ul>
          <p>Regular monitoring recommended.</p>
        `;
      } else {
        pollutionDetails = `
          <p>Water quality is acceptable with:</p>
          <ul class="pollution-details">
            <li>Dissolved oxygen: <strong>Above 5 mg/L</strong> (Acceptable)</li>
            <li>BOD levels: <strong>Below 5 mg/L</strong> (Normal)</li>
            <li>Coliform count: <strong>Low</strong></li>
            <li>Heavy metals: <strong>Not detected</strong></li>
          </ul>
          <p>Continued monitoring advised.</p>
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
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }
  });
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
  google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
    if (window.mapLoadingTimeout) {
      clearTimeout(window.mapLoadingTimeout);
    }
    if (mapLoading) {
      mapLoading.classList.add('hidden');
    }
    console.log('Map loaded successfully with API key: AIzaSyAPREHAXknXIDLKG6hHhpty99gxlOlkpRw');
  });
}
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
