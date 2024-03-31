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
async function addMarker(station, number) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    var position = new google.maps.LatLng(station.lat, station.lng);
    const marker = new AdvancedMarkerElement({
      map,
      position: position,
      title: number.toString()
     });
    // Add the new marker to the global array
    allMarkers.push(marker);
    return marker; // Return the marker for manipulating marke's animation etc.

    // Assuming map is a global variable referencing the map instance
    map.panTo(position); // Optionally, center the map on the new marker
}

function clearMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        allMarkers[i].setMap(null); // Removes the marker from the map
    }
    allMarkers = []; // Reset the array after clearing the markers
}

function updateMarkers() {
    lastSearchJSON.forEach(item => {
        addMarker(item.position, item.number)
    })
}