async function initMap() {
    // Fetch bike station data from backend and associate with Google Map
    fetch('/bike_stations')
        .then(response => response.json())
        .then(async(data) => {
            // JSON data can be processed here
            // Initialize the Google Map with the fetched data
            const { Map } = await google.maps.importLibrary("maps");
            var dublin = { lat: 53.349805, lng: -6.26031 };
            map = new Map(document.getElementById("map"), {
              center: dublin,
              zoom: 14,
              mapId: "d002b4f3df859edb",
            });
            // Points for the map will be added here
        })
        .catch(error => console.error('Error fetching bike station data:', error));
}

async function addMarker(station, number) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    var position = new google.maps.LatLng(station.lat, station.lng);
    const marker = new AdvancedMarkerElement({
      map,
      position: position,
      title: number.toString()
     });
    // Assuming map is a global variable referencing the map instance
    map.panTo(position); // Optionally, center the map on the new marker
}

function updateMarkers() {
    lastSearchJSON.forEach(item => {
        addMarker(item.position, item.number)
    })
}