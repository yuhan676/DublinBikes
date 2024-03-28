function initMap() {
    // Initialize the Google Map in Dublin using latitude and longitude
    var dublin = { lat: 53.349805, lng: -6.26031 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: dublin
    });
}
