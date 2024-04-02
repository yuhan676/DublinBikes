// Declare allMarkers as a global variable to track markers
let allMarkers = []; 

async function initMap() {
    // Initialize the Google Map with Dublin as the center
    const { Map } = await google.maps.importLibrary("maps");
    var dublin = { lat: 53.349805, lng: -6.26031 };
    map = new Map(document.getElementById("map"), {
        center: dublin,
        zoom: 14,
        mapId: "d002b4f3df859edb",
    });
}

async function addMarker(map, station, number) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    var position = new google.maps.LatLng(station.lat, station.lng);
    const marker = new AdvancedMarkerElement({
        map,
        position: position,
        title: number.toString()
    });
    map.panTo(position); // Optionally, center the map on the new marker
    
    // Add the marker to the global array
    addMarkerToGlobalArray(marker);

    // Log the added marker
    console.log('Marker added:', marker);
}

function clearMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        allMarkers[i].setMap(null); // Removes the marker from the map
    }
    allMarkers = []; // Reset the array after clearing the markers

    // Log that markers have been cleared
    console.log('Markers cleared');
}

function updateMarkers() {
    // CLear existing markers before addig new ones.
    clearMarkers();
    // Add markers for the new search result
    lastSearchJSON.forEach(item => {
        addMarker(map, item.position, item.number)
    })
}
function addMarkerToGlobalArray(marker) {
    // Add the new marker to the global array
    allMarkers.push(marker);
    // Return the marker for further manipulation
    return marker;
}

function handleMarkerAnimations(index) {
    // Stop any currently bouncing marker
    allMarkers.forEach(marker => {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        }
    });

    // Start bounce animation for the selected station's marker
    const selectedMarker = allMarkers[index];
    if (selectedMarker) {
        selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
// Attach function to the window object
window.updateMarkers = updateMarkers;
window.clearMarkers = clearMarkers; 

