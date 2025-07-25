import { gangList, populateGangDropdown, getAreaColor, getAreaOpacity, getGangName } from './gang-info.js';
import { copyAreaToClipboard } from './storage.js';
import { loadAreasToMap } from './data-loader.js';

// Layer groups
const turfLayer = L.featureGroup().addTo(map);
const hoodLayer = L.featureGroup().addTo(map);
const zoneLayer = L.featureGroup().addTo(map);

// Add layer control for visibility toggle
const overlayMaps = {
  'Turf': turfLayer,
  'Hood': hoodLayer,
  'Zone': zoneLayer
};

const layerControl = L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

// Custom Legend Toggle Control
const LegendControl = L.Control.extend({
  options: {
    position: 'bottomright'
  },

  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control legend-control');
    container.style.background = 'rgba(255,255,255,0.9)';
    container.style.borderRadius = '8px';
    container.style.padding = '8px 12px';
    container.style.cursor = 'pointer';
    container.style.fontSize = '14px';
    container.style.fontWeight = '600';
    container.style.color = '#333';
    container.style.userSelect = 'none';
    container.style.marginBottom = '10px';
    container.innerHTML = '🏷️ Labels: ON';
    
    container.onclick = function() {
      toggleLabels();
    };
    
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.stopPropagation;
    
    return container;
  }
});

// Add the legend control to the map
const legendControl = new LegendControl();
map.addControl(legendControl);

// Draw control with enhanced stability options
const drawControl = new L.Control.Draw({
  position: 'topright',
  draw: {
    polyline: false,
    circle: false,
    marker: false,
    circlemarker: false,
    polygon: { 
      allowIntersection: false,
      shapeOptions: { 
        color: "#000", 
        fillColor: "#000", 
        fillOpacity: 0.2, 
        weight: 2
      },
      precision: {
        km: 2,
        ha: 2,
        m: 0,
        mi: 2,
        ac: 2,
        yd: 0,
        ft: 0
      }
    },
    rectangle: { 
      shapeOptions: { 
        color: "#000", 
        fillColor: "#000", 
        fillOpacity: 0.2, 
        weight: 2
      }
    }
  },
  edit: { 
    featureGroup: L.featureGroup([turfLayer, hoodLayer, zoneLayer]), 
    remove: true 
  }
});
map.addControl(drawControl);

// Sidebar elements
const sidebar = document.getElementById('drawing-sidebar');
const typeSelect = document.getElementById('typeSelect');
const nameInput = document.getElementById('nameInput');
const occupiedByLabel = document.getElementById('occupiedByLabel');
const occupiedByDropdown = document.getElementById('occupiedByDropdown');
const submitButton = document.getElementById('submitBtn');
const cancelButton = document.getElementById('cancelBtn');
const addAreaButton = document.getElementById('addAreaBtn');
const jsonOutput = document.getElementById('jsonOutput');
const jsonOutputLabel = document.getElementById('jsonOutputLabel');

let currentLayer = null;
let isEditing = false;
let labelsVisible = true;

// Initialize gang dropdown
populateGangDropdown(occupiedByDropdown);

// Toggle labels function
function toggleLabels() {
  labelsVisible = !labelsVisible;
  
  const legendControlElement = document.querySelector('.legend-control');
  if (legendControlElement) {
    legendControlElement.innerHTML = labelsVisible ? '🏷️ Labels: ON' : '🏷️ Labels: OFF';
  }
  
  const allLayers = [...turfLayer.getLayers(), ...hoodLayer.getLayers(), ...zoneLayer.getLayers()];
  
  allLayers.forEach(layer => {
    if (layer.getTooltip()) {
      if (labelsVisible) {
        layer.openTooltip();
      } else {
        layer.closeTooltip();
      }
    }
  });
}

// Helper function to add click event to layers
function addLayerClickEvent(layer) {
  layer.on('click', () => {
    currentLayer = layer;
    isEditing = true;
    
    typeSelect.value = layer.areaData.type || 'turf';
    nameInput.value = layer.areaData.name || '';
    occupiedByDropdown.value = layer.areaData.gangId || 'unoccupied';
    nameInput.placeholder = `Enter ${typeSelect.value} name`;
    
    submitButton.textContent = 'Update';
    addAreaButton.style.display = 'inline-block'; // Show Add Area button for editing
    
    sidebar.style.display = 'block';
    typeSelect.focus();
  });
}

// On draw complete - add to temporary layer group
map.on(L.Draw.Event.CREATED, function (event) {
  currentLayer = event.layer;
  isEditing = false;
  
  const tempLayerGroup = L.featureGroup().addTo(map);
  tempLayerGroup.addLayer(currentLayer);
  
  resetForm();
  submitButton.textContent = 'Save';
  addAreaButton.style.display = 'inline-block'; // Show Add Area button for new area
  
  sidebar.style.display = 'block';
  typeSelect.focus();
});

// Add event listener for when editing is complete
map.on(L.Draw.Event.EDITED, function (event) {
  const layers = event.layers;
  layers.eachLayer(function (layer) {
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      const latLngs = layer.getLatLngs();
      layer.setLatLngs(latLngs);
    }
    if (layer.redraw) {
      layer.redraw();
    }
  });
});

// Enhanced zoomend event to stabilize coordinates
map.on('zoomend', function() {
  let needsRefresh = false;
  
  [turfLayer, hoodLayer, zoneLayer].forEach(layerGroup => {
    if (layerGroup.getLayers().length > 0) {
      needsRefresh = true;
    }
  });
  
  if (needsRefresh) {
    setTimeout(() => {
      [turfLayer, hoodLayer, zoneLayer].forEach(layerGroup => {
        layerGroup.eachLayer(layer => {
          if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            const latLngs = layer.getLatLngs();
            layer.setLatLngs(latLngs);
          }
          
          if (layer.getTooltip() && labelsVisible) {
            const tooltip = layer.getTooltip();
            if (tooltip) {
              tooltip.update();
            }
          }
        });
      });
    }, 25);
  }
});

// Reset form to default state
function resetForm() {
  nameInput.value = '';
  typeSelect.value = 'turf';
  occupiedByDropdown.value = 'unoccupied';
  showOccupiedByDropdown();
  nameInput.placeholder = 'Enter turf name';
  addAreaButton.style.display = 'inline-block';
  if (jsonOutput && jsonOutputLabel) {
    jsonOutput.style.display = 'none';
    jsonOutputLabel.style.display = 'none';
    jsonOutput.value = '';
  }
}

// Show occupied by dropdown
function showOccupiedByDropdown() {
  occupiedByLabel.style.display = 'block';
  occupiedByDropdown.style.display = 'block';
}

// Update dropdown visibility when type changes
typeSelect.addEventListener('change', () => {
  showOccupiedByDropdown();
  const type = typeSelect.value;
  nameInput.placeholder = `Enter ${type} name`;
});

// Handle form submission (Save/Update)
submitButton.addEventListener('click', () => {
  const type = typeSelect.value;
  const name = nameInput.value.trim();
  const gangId = occupiedByDropdown.value;
  
  if (!type) {
    alert('Please select a type.');
    return;
  }
  
  const color = getAreaColor(type, gangId);
  const opacity = getAreaOpacity(type);
  
  // Remove from current layer group if editing
  if (isEditing) {
    turfLayer.removeLayer(currentLayer);
    hoodLayer.removeLayer(currentLayer);
    zoneLayer.removeLayer(currentLayer);
  } else {
    map.removeLayer(currentLayer);
  }
  
  // Update layer style
  currentLayer.setStyle({
    color: color,
    fillColor: color,
    fillOpacity: opacity,
    weight: 2
  });
  
  // Add to appropriate layer group
  let targetLayer;
  if (type === 'turf') {
    targetLayer = turfLayer;
  } else if (type === 'hood') {
    targetLayer = hoodLayer;
  } else if (type === 'zone') {
    targetLayer = zoneLayer;
  }
  targetLayer.addLayer(currentLayer);
  
  // Add click event for future edits
  addLayerClickEvent(currentLayer);
  
  // Update or create tooltip
  let tooltipText = name || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
  if (gangId && gangId !== 'unoccupied') {
    tooltipText += `\n(${getGangName(gangId)})`;
  }
  
  if (name || (gangId && gangId !== 'unoccupied')) {
    if (currentLayer.getTooltip()) {
      currentLayer.setTooltipContent(tooltipText);
    } else {
      const tooltip = currentLayer.bindTooltip(tooltipText, { 
        permanent: true, 
        direction: 'center',
        className: 'area-tooltip'
      });
      if (labelsVisible) {
        tooltip.openTooltip();
      }
    }
  } else if (currentLayer.getTooltip()) {
    currentLayer.unbindTooltip();
  }
  
  // Update area data
  currentLayer.areaData = {
    id: currentLayer.areaData?.id,
    type: type,
    name: name,
    gangId: gangId,
    gangName: getGangName(gangId)
  };
  
  console.log(`Processed ${type}: ${name || type} (${getGangName(gangId)})`);
  
  closeSidebar();
});

// Handle Add Area button (copy JSON to clipboard)
addAreaButton.addEventListener('click', () => {
  console.log('Add Area button clicked');
  const type = typeSelect.value;
  const name = nameInput.value.trim();
  const gangId = occupiedByDropdown.value;
  
  if (!type) {
    alert('Please select a type.');
    return;
  }
  
  if (!currentLayer) {
    console.error('No current layer selected for copying');
    alert('No area selected. Please draw or select an area first.');
    return;
  }
  
  const areaData = {
    id: currentLayer.areaData?.id,
    type: type,
    name: name,
    gangId: gangId,
    gangName: getGangName(gangId)
  };
  const latLngs = currentLayer.getLatLngs();
  
  console.log('Copying area data:', areaData);
  copyAreaToClipboard(areaData, latLngs);
});

// Handle cancel button
cancelButton.addEventListener('click', () => {
  if (currentLayer && !isEditing) {
    map.removeLayer(currentLayer);
  }
  currentLayer = null;
  isEditing = false;
  closeSidebar();
});

// Close sidebar function
function closeSidebar() {
  sidebar.style.display = 'none';
  submitButton.textContent = 'Save';
  addAreaButton.style.display = 'inline-block';
  currentLayer = null;
  isEditing = false;
  resetForm();
}

// Handle escape key to close sidebar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.style.display === 'block') {
    cancelButton.click();
  }
});

// Disable double click zoom while drawing
map.on('draw:drawstart', () => map.doubleClickZoom.disable());
map.on('draw:drawstop', () => setTimeout(() => map.doubleClickZoom.enable(), 200));

// Add click events to existing layers and load saved areas
loadAreasToMap(map, turfLayer, hoodLayer, zoneLayer, labelsVisible);
[turfLayer, hoodLayer, zoneLayer].forEach(layerGroup => {
  layerGroup.eachLayer(layer => {
    addLayerClickEvent(layer);
  });
});