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

async function addMarker(map, item, isRent) {
    const colors = {
        unavailable: {
            glyphColor: "#fff",
            background: "red",
            borderColor: "red"
        },
        crowded: {
            glyphColor: "#fff",
            background: "#FBBC04",
            borderColor: "#FBBC04"
        },
        available: {
            glyphColor: "#fff",
            background: "green",
            borderColor: "green"
            
        }
    }
    let station = item.position
    let total = isRent ? item.total_bikes : item.empty_stands_number
    let style = total === 0 ? colors.unavailable : total < 7 ? colors.crowded : colors.available
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    var position = new google.maps.LatLng(station.lat, station.lng);

    //
    const pinBackground = new PinElement(style);
    
    const contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    "</div>" +
    '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
    '<div id="bodyContent">' +
    "<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
    "sandstone rock formation in the southern part of the " +
    "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
    "south west of the nearest large town, Alice Springs; 450&#160;km " +
    "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
    "features of the Uluru - Kata Tjuta National Park. Uluru is " +
    "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
    "Aboriginal people of the area. It has many springs, waterholes, " +
    "rock caves and ancient paintings. Uluru is listed as a World " +
    "Heritage Site.</p>" +
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
    "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
    "(last visited June 22, 2009).</p>" +
    "</div>" +
    "</div>";
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    ariaLabel: "Uluru",
  });


    const marker = new AdvancedMarkerElement({
        map,
        position: position,
        title: item.number.toString(),
        content: pinBackground.element,
    });

  marker.addListener("click", () => {
    console.log("mouse over")
    infowindow.open({
      anchor: marker,
      map,
    });
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

function staggeredAddMarkers() {
    lastSearchJSON.forEach((item, index) => {
        setTimeout(() => {
            addMarker(map, item, true);
        }, index * 2000); // Adjust the delay as needed
    });
}

function updateMarkers(isRent) {
    // CLear existing markers before addig new ones.
    clearMarkers();
    // Add markers for the new search result
    lastSearchJSON.forEach(item => {
        addMarker(map, item, isRent)
    })
}
function addMarkerToGlobalArray(marker) {
    // Add the new marker to the global array
    allMarkers.push(marker);
    // Return the marker for further manipulation
    return marker;
}


function animateMarker(index) {
    allMarkers.forEach(marker => {
        marker?.content?.classList.remove("bounce")
    })
    let marker = allMarkers[index]
    const content = marker?.content
    content?.classList.add("bounce")
}
// Attach function to the window object
window.animateMarker = animateMarker
window.updateMarkers = updateMarkers;
window.clearMarkers = clearMarkers; 

