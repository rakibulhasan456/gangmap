// Gang information with names and colors
export const gangList = [
  { id: 'unoccupied', name: 'Unoccupied', color: '#808080' }, // Gray for unoccupied
  { id: 'grove_street', name: 'Grove Street Families', color: '#00FF00' }, // Green
  { id: 'ballas', name: 'Ballas', color: '#800080' }, // Purple
  { id: 'vagos', name: 'Los Santos Vagos', color: '#FFFF00' }, // Yellow
  { id: 'aztecas', name: 'Varrios Los Aztecas', color: '#00FFFF' }, // Cyan
  { id: 'families', name: 'Chamberlain Hills Families', color: '#008000' }, // Dark Green
  { id: 'bloods', name: 'Davis Neighborhood Families', color: '#FF0000' }, // Red
  { id: 'crips', name: 'East Side Ballas', color: '#0000FF' }, // Blue
  { id: 'marabunta', name: 'Marabunta Grande', color: '#FF4500' }, // Orange Red
  { id: 'triads', name: 'Triads', color: '#FFD700' }, // Gold
  { id: 'lost_mc', name: 'The Lost MC', color: '#8B0000' }, // Dark Red
  { id: 'angels_of_death', name: 'Angels of Death MC', color: '#000000' }, // Black
];

// Default colors for unoccupied areas
export const defaultColors = {
  turf: '#404040', // Dark gray for unoccupied turf
  hood: '#606060', // Medium gray for unoccupied hood
  zone: '#808080'  // Light gray for unoccupied zone
};

// Get gang by ID
export function getGangById(gangId) {
  return gangList.find(gang => gang.id === gangId) || gangList[0]; // Default to unoccupied
}

// Get gang color by ID
export function getGangColor(gangId) {
  const gang = getGangById(gangId);
  return gang.color;
}

// Get gang name by ID
export function getGangName(gangId) {
  const gang = getGangById(gangId);
  return gang.name;
}

// Get area color based on type and gang occupation
export function getAreaColor(areaType, gangId) {
  if (!gangId || gangId === 'unoccupied') {
    return defaultColors[areaType];
  }
  return getGangColor(gangId);
}

// Get area opacity based on type
export function getAreaOpacity(areaType) {
  const opacities = {
    turf: 0.3,
    hood: 0.4,
    zone: 0.35
  };
  return opacities[areaType] || 0.3;
}

// Populate gang dropdown with options
export function populateGangDropdown(selectElement) {
  if (!selectElement) return;
  
  // Clear existing options
  selectElement.innerHTML = '';
  
  // Add all gang options
  gangList.forEach(gang => {
    const option = document.createElement('option');
    option.value = gang.id;
    option.textContent = gang.name;
    if (gang.id === 'unoccupied') {
      option.selected = true; // Default to unoccupied
    }
    selectElement.appendChild(option);
  });
}