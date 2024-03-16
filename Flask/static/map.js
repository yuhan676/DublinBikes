/*function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}
*/
function initDublin() {
    var dublin = { lat: 53.349805, lng: -6.26031 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: dublin
    });
}