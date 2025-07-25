// Set up the map container
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -5,
  maxZoom: 2,
  zoomSnap: 0.25,
  zoomControl: true,
  // Optimized options for smoother performance
  preferCanvas: false,
  updateWhenZooming: true, // Changed to true for smoother zoom
  updateWhenIdle: false,   // Changed to false to prevent delays
  zoomAnimation: true,     // Enable smooth zoom animations
  fadeAnimation: true      // Enable smooth fade animations
});

// Image dimensions - ensure these match your actual image dimensions exactly
const mapWidth = 8192;
const mapHeight = 8192;
const bounds = [[0, 0], [mapHeight, mapWidth]];

// Static base layers (atlas and satellite) - with exact bounds
const atlasLayer = L.imageOverlay('gta5_map_atlas.png', bounds, {
  interactive: false,
  bubblingMouseEvents: false
});
const satelliteLayer = L.imageOverlay('gta5_map_satellite.png', bounds, {
  interactive: false,
  bubblingMouseEvents: false
});

// Base layers control
const baseLayers = {
  'Atlas': atlasLayer,
  'Satellite': satelliteLayer
};

// Add default base layer (Atlas)
atlasLayer.addTo(map);

// Fit map to full image with padding to prevent edge issues
map.fitBounds(bounds, { padding: [10, 10] });

// Set strict bounds to prevent coordinates from going outside image area
map.setMaxBounds(bounds);

// Custom background color behind image based on map type
map.on('baselayerchange', function (e) {
  const container = document.getElementById('map');
  if (e.name === 'Atlas') {
    container.style.background = 'linear-gradient(to right, #1BA9CF, #0FA8D2)';
  } else if (e.name === 'Satellite') {
    container.style.background = 'linear-gradient(to right, #143D6B, #143D6B)';
  }
});

// Add base layer toggle control
L.control.layers(baseLayers).addTo(map);

// ------------------------
// Drawing tools - REMOVED (handled in map-init.js)
// ------------------------
// The drawing functionality is now handled in map-init.js to avoid duplicates