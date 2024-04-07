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

var showingInfoWindow = null

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

    let status = total === 0 ? 'Unavailable' : total < 7 ? 'Crowded' : 'Available'

    let contentString =  `
        <p><b>Status:</b> ${status}</p>
        <p><b>Station:</b> ${item.name}</p>
        <p><b>Total bikes:</b> ${item.total_bikes}</p>
        <p><b>Empty stands:</b> ${item.empty_stands_number}</p>
    `
    // const contentItems = {
    //     unavailable: `<p>Unavailable ${item.name}</p>, <p>Total bikes:${item.total_bikes}</p>, <p>${item.empty_stands_number}</p>`,
    //     crowded: `Crowded ${item.name}, ${item.total_bikes}, ${item.empty_stands_number}`,
    //     available: `Available ${item.name}, ${item.total_bikes}, ${item.empty_stands_number}`
    // }

   

    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    var position = new google.maps.LatLng(station.lat, station.lng);

    //
    const pinElement = new PinElement(style);
    
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    ariaLabel: "Marker's Info Tooltip",
  });


const marker = new AdvancedMarkerElement({
    map,
    position: position,
    title: item.number.toString(),
    content: pinElement.element,
});

  marker.addListener("click", () => {
    if (showingInfoWindow) {
        showingInfoWindow.close()
        showingInfoWindow = null
    }
    showingInfoWindow = infowindow

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
    getLastSearchJSON().forEach((item, index) => {
        setTimeout(() => {
            addMarker(map, item, true);
        }, index * 2000); // Adjust the delay as needed
    });
}

function updateMarkers(isRent) {
    // CLear existing markers before addig new ones.
    clearMarkers();
    // Add markers for the new search result
    var JSON = getLastSearchJSON();
    if (Object.keys(JSON).length)
    {
        JSON.forEach(item => {
            addMarker(map, item, isRent)
        })
    }
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

