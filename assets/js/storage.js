export function copyAreaToClipboard(areaData, latLngs) {
  // Generate a unique ID for new areas
  if (!areaData.id) {
    areaData.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  // Combine areaData and latLngs
  const area = {
    id: areaData.id,
    type: areaData.type,
    name: areaData.name,
    gangId: areaData.gangId,
    gangName: areaData.gangName,
    latLngs: latLngs
  };
  
  const jsonStr = JSON.stringify(area, null, 2);
  console.log('Attempting to copy JSON:', jsonStr);
  
  const jsonOutput = document.getElementById('jsonOutput');
  const jsonOutputLabel = document.getElementById('jsonOutputLabel');
  
  // Populate and show textarea
  if (jsonOutput && jsonOutputLabel) {
    jsonOutput.value = jsonStr;
    jsonOutput.style.display = 'block';
    jsonOutputLabel.style.display = 'block';
    jsonOutput.select(); // Auto-select text for easy copying
    console.log(`Displayed JSON in textarea for ${area.type}`);
    
    // Try copying to clipboard
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        console.log(`Successfully copied ${area.type} JSON to clipboard`);
        alert(`JSON for ${area.type} copied to clipboard! Paste it into data/${area.type}Data.json. Also available in the textarea below.`);
      }).catch(err => {
        console.error('Failed to copy JSON to clipboard:', err);
        alert(`Clipboard API unavailable. Please copy the JSON from the textarea below and paste it into data/${area.type}Data.json.`);
      });
    } else {
      console.warn('Clipboard API unavailable or not in secure context.');
      alert(`Clipboard API unavailable. Please copy the JSON from the textarea below and paste it into data/${area.type}Data.json.`);
    }
  } else {
    console.error('Textarea or label not found. Falling back to alert.');
    alert(`Failed to display JSON in textarea. Please manually copy the following JSON into data/${area.type}Data.json:\n\n${jsonStr}`);
  }
}