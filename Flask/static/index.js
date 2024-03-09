function fetchStationSuggestions(element_out_id, input) {
    var inputVal = input.val();
    if(inputVal.length > 0) {
        $.ajax({
            url: "/suggest_stations", // The endpoint in Flask
            type: "GET",
            dataType: 'json',
            data: { 'term': inputVal },
            success: function(data) {
                $('#'+element_out_id).empty();
                $.each(data, function(i, station) {
                    var $optionDiv = $('<div>')
                                        .addClass("suggestion_div")
                                        .text(station);
                    $('#'+element_out_id).append($optionDiv);
                });
            }
        });
    } else {
        $('#'+element_out_id).empty();
    }
}

//this line indicates that the following function only triggers after 'document' (i.e. index.html) has loaded
$(document).ready(function() {
    // populates station suggestions when user starts typing
    $('#search_rent').on('input', function() {
        fetchStationSuggestions('suggestion_box_rent', $(this))
    });
    $('#search_return').on('input', function() {
        fetchStationSuggestions('suggestion_box_return', $(this))
    });

    // set selected station when clicking suggestion
    $('#suggestion_box_rent').on('mousedown', '.suggestion_div', function() {
        var stationName = $(this).text();
        $('#search_rent').val(stationName);
        $('#suggestion_box_rent').empty();
    });
    // empty suggestion box when user clicks outside of suggestion box
    $('#search_rent').focusout(function() {
        $('#suggestion_box_rent').empty();
    });

    // set selected station when clicking suggestion
    $('#suggestion_box_return').on('mousedown', '.suggestion_div', function() {
        var stationName = $(this).text();
        $('#search_return').val(stationName);
        $('#suggestion_box_return').empty();
    });
    // empty suggestion box when user clicks outside of suggestion box
    $('#search_return').focusout(function() {
        $('#suggestion_box_return').empty();
    });
});


function adjustWeatherPanelPosition() {
    // Adjust the weather panel position based on the height of the left panel
    var leftPanel = document.getElementById('left-panel');
    var weatherPanel = document.getElementById('weather-panel');
    var topPosition = leftPanel.offsetTop + leftPanel.offsetHeight + 10; // Additional 10px for spacing
    weatherPanel.style.top = topPosition + 'px';
}


function openTab(evt, tabName) {
    // Get all elements with class="tabcontent" and hide them
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    if (tabName == "rent_return")
    {
        document.getElementById("rent").style.display = 'block';
        document.getElementById("return").style.display = 'block';
    }
    else
    {
        document.getElementById(tabName).style.display = 'block';
    }
    if (evt) {
        evt.currentTarget.className += ' active';
    }

    // Adjust the weather panel position
    adjustWeatherPanelPosition();
}


function toggleWeatherPanel() {
    var weatherPanel = document.getElementById('weather-panel');
    var moreInfo = weatherPanel.querySelector('.weather-more-info');
    var icon = weatherPanel.querySelector('.material-icons');

    // Check if the panel is currently expanded
    if (weatherPanel.classList.contains('expanded')) {
        // Collapse the panel
        moreInfo.style.display = 'none';
        icon.textContent = 'expand_more';
        weatherPanel.classList.remove('expanded');
    } else {
        // Expand the panel
        moreInfo.style.display = 'block';
        icon.textContent = 'expand_less';
        weatherPanel.classList.add('expanded');
    }
}
// extreme weather pop up
function openPopup() {
    console.log("fetching extreme data..");
    fetch('/fetch_extreme_weather')
        .then(response => response.json())
        .then(data => {
            if (data.extreme_conditions_met) {
                document.getElementById('extreme-weather-content').innerText = 'Extreme weather conditions have been detected!';
                document.getElementById('popup').style.display = 'block';
            }
        })
        .catch(error => console.error('Error fetching extreme weather data:', error));
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
// working on this feature
function getAvailability() {
    var stationName = document.getElementById('search_rent').value;
    var availabilityDisplay = document.getElementById('available-bikes-rent');
    fetch(`/get_availability?station_name=${stationName}`)
        .then(response => response.json())
        .then(data => {
            availabilityDisplay.innerText = data.availability;
        })
        .catch(error => {
            console.error('Error fetching availability:', error);
            availabilityDisplay.innerText = 'Data not available';
        });
}

