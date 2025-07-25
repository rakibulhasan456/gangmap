import { getAreaColor, getAreaOpacity, getGangName } from './gang-info.js';

export async function loadAreasToMap(map, turfLayer, hoodLayer, zoneLayer, labelsVisible) {
  const types = ['turf', 'hood', 'zone'];
  for (const type of types) {
    try {
      const response = await fetch(`${type}Data.json`); // Updated path: no 'data/' prefix
      if (!response.ok) {
        console.warn(`No data found for ${type}, returning empty array`);
        continue;
      }
      const areas = await response.json();
      const targetLayer = type === 'turf' ? turfLayer : type === 'hood' ? hoodLayer : zoneLayer;

      areas.forEach(area => {
        let layer;
        if (area.latLngs[0].length > 2) { // Polygons have >2 points
          layer = L.polygon(area.latLngs, {
            color: getAreaColor(area.type, area.gangId),
            fillColor: getAreaColor(area.type, area.gangId),
            fillOpacity: getAreaOpacity(area.type),
            weight: 2
          });
        } else { // Rectangles have 2 points (bounds)
          layer = L.rectangle(area.latLngs, {
            color: getAreaColor(area.type, area.gangId),
            fillColor: getAreaColor(area.type, area.gangId),
            fillOpacity: getAreaOpacity(area.type),
            weight: 2
          });
        }

        layer.areaData = {
          id: area.id,
          type: area.type,
          name: area.name,
          gangId: area.gangId,
          gangName: area.gangName
        };

        if (area.name || (area.gangId && area.gangId !== 'unoccupied')) {
          const tooltipText = area.name || `${area.type.charAt(0).toUpperCase() + area.type.slice(1)}` + 
            (area.gangId && area.gangId !== 'unoccupied' ? `\n(${area.gangName})` : '');
          const tooltip = layer.bindTooltip(tooltipText, { 
            permanent: true, 
            direction: 'center',
            className: 'area-tooltip'
          });
          if (labelsVisible) {
            tooltip.openTooltip();
          }
        }

        targetLayer.addLayer(layer);
        console.log(`Loaded ${area.type}: ${area.name || area.type} (${area.gangName})`);
      });
    } catch (error) {
      console.error(`Error loading ${type} data:`, error);
    }
  }
}