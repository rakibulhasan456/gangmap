const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
document.head.appendChild(leafletCSS);

const leafletDrawCSS = document.createElement('link');
leafletDrawCSS.rel = 'stylesheet';
leafletDrawCSS.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
document.head.appendChild(leafletDrawCSS);

const leafletScript = document.createElement('script');
leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
leafletScript.onload = () => {
  const drawScript = document.createElement('script');
  drawScript.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
  drawScript.onload = () => {
    console.log("✅ Leaflet and Draw loaded");

    // Now test:
    console.log("typeof L.Control.Draw:", typeof L.Control.Draw);
  };
  document.body.appendChild(drawScript);
};
document.body.appendChild(leafletScript);
