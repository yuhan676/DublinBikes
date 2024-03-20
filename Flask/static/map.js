/*function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}
*/

function initMap() {
    // Fetch bike station data from backend and associate with Google Map
    fetch('/bike_stations')
        .then(response => response.json())
        .then(data => {
            // JSON data can be processed here
            console.log(data); // For demonstration, just logging the data

            // Initialize the Google Map with the fetched data
            var dublin = { lat: 53.349805, lng: -6.26031 };
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 10,
                center: dublin
            });

            // Points for the map will be added here
        })
        .catch(error => console.error('Error fetching bike station data:', error));
}
