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
                // Extract weather information from the data
                const weatherInfo = data.extreme_conditions_met.list[0];
                const windSpeed = weatherInfo.wind.speed;
                const windGust = weatherInfo.wind.gust;
                const rainProbability = weatherInfo.rain["3"];
                const minTemperature = weatherInfo.main.temp_min;
                const maxTemperature = weatherInfo.main.temp_max;

                // Format the weather information for display
                const weatherDisplay = `
                    <div>Wind Speed: ${windSpeed} m/s</div>
                    <div>Wind Gust: ${windGust} m/s</div>
                    <div>Rain Probability: ${rainProbability}%</div>
                    <div>Min Temperature: ${minTemperature}°C</div>
                    <div>Max Temperature: ${maxTemperature}°C</div>
                `;

                // Display the formatted weather information in the pop-up
                document.getElementById('extreme-weather-content').innerHTML = weatherDisplay;
                document.getElementById('popup').style.display = 'block';
            }
        })
        .catch(error => console.error('Error fetching extreme weather data:', error));
}
// function to opentab on the left side of the page pane, for return, rent and return/rent
$(document).ready(function() {
    // Function to handle selecting an option from the suggestion box
    function selectOption(option, inputField) {
        var stationName = $(option).text().split(' (')[0]; // Extract station name from the suggestion
        inputField.val(stationName); // Set the input field value to the selected station name
        $(option).parent().empty(); // Clear the suggestion box
    }

    // Event listener for input field for renting
    $('#search_rent').on('input', function() {
        var query = $(this).val();
        $.ajax({
            url: '/search',
            data: { query: query },
            success: function(response) {
                $('#suggestion_box_rent').empty();
                response.forEach(function(station) {
                    $('#suggestion_box_rent').append('<div class="suggestion_div">' + station.station + ' (Available Bikes: ' + station.available_bikes + ')</div>');
                });
            }
        });
    });

    // Event listener for input field for returning
    $('#search_return').on('input', function() {
        var query = $(this).val();
        $.ajax({
            url: '/search',
            data: { query: query },
            success: function(response) {
                $('#suggestion_box_return').empty();
                response.forEach(function(station) {
                    $('#suggestion_box_return').append('<div class="suggestion_div">' + station.station + ' (Available Bikes: ' + station.available_bikes + ')</div>');
                });
            }
        });
    });

    // Event listener for selecting suggestion for renting
    $('#suggestion_box_rent').on('mousedown', '.suggestion_div', function() {
        var inputField = $('#search_rent');
        selectOption(this, inputField);
    });

    // Event listener for selecting suggestion for returning
    $('#suggestion_box_return').on('mousedown', '.suggestion_div', function() {
        var inputField = $('#search_return');
        selectOption(this, inputField);
    });
});
