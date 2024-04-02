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
}

function updateMarkers() {
    lastSearchJSON.forEach(item => {
        addMarker(map, item.position, item.number)
    })
}
// Function to clear all markers from the map
function clearMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        allMarkers[i].setMap(null); // Removes the marker from the map
    }
    allMarkers = []; // Reset the array after clearing the markers

    // Access the last index of lastSearchJSON
    var lastIndex = lastSearchJSON.length - 1;
    // If lastSearchJSON is not empty, remove the last item
    if (lastIndex >= 0) {
        lastSearchJSON.splice(lastIndex, 1);
    }
}
// Attach function to the window object
window.updateMarkers = updateMarkers;
window.clearMarkers();