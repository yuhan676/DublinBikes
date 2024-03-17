function initTimeAndDate() {
    // A new Date object defaults to today and now
    var date = new Date();

    // Get our elements
    var rentTimeElem = document.getElementById("rent_time");
    var returnTimeElem = document.getElementById("return_time");
    var rentDateElem = document.getElementById("rent_date");
    var returnDateElem = document.getElementById("return_date");

    // Set default date and time to today and now
    // toISOString is a member function of the JS Date object that turns the horrible UTC 
    // time number into a useable format. substring(11,16) gets the bit we need (current time HH:MM)
    rentTimeElem.value = date.toISOString().substring(11,16);
    returnTimeElem.value = date.toISOString().substring(11,16);
    rentDateElem.valueAsDate = date;
    returnDateElem.valueAsDate = date;

    // Set min data to today
    rentDateElem.min = date.toISOString().split("T")[0];
    returnDateElem.min = date.toISOString().split("T")[0];
}

// Given the user input, fetch station name suggestions and populate given output element
function fetchStationSuggestions(element_out_id, input) {
    var inputVal = input.val();
    if(inputVal.length > 0) {
        $.ajax({
            url: "/suggest_stations", // The endpoint in Flask
            type: "GET",
            dataType: 'json',
            data: { 'term': inputVal },
            success: function(return_data) {
                $('#'+element_out_id).empty();
                $.each(return_data, function(i, station) {
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

    
    var rentTabClass = "rp_rent";
    var returnTabClass = "rp_return";
    // toggle functions for the right panel content
    $('#rp_tab_rent').click(function() {
        if (!$('#right_panel').hasClass(rentTabClass)){
            $('#right_panel').addClass(rentTabClass);
            $('#right_panel').removeClass(returnTabClass);
        }
    });

    $('#rp_tab_return').click(function() {
        if (!$('#right_panel').hasClass(returnTabClass)){
            $('#right_panel').addClass(returnTabClass);
            $('#right_panel').removeClass(rentTabClass);
        }
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
    if (evt) {
        tablinks = document.getElementsByClassName('tablinks');
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
        }
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
// Function to open the pop-up when the page loads and bind close event

// Function to open the pop-up when the page loads and bind close event
$(document).ready(function() {
    openPopup(); // Show the popup when the page loads
});
// Function to open the pop-up and fetch extreme weather data
function openPopup() {
    // JavaScript to close the weather panel when clicked
    document.getElementById("popup").addEventListener("click", function(event) {
        // Check if the click occurred outside the close button
        if (!event.target.closest(".close")) {
            document.getElementById("popup").style.display = "none";
        }
    });
    console.log("Fetching extreme data..");
    fetch('/fetch_extreme_weather')
        .then(response => response.json())
        .then(data => {
            if (data && data.extreme_conditions_met) {
                displayWeatherPopup(data.extreme_conditions_met);
            } else {
                console.error('Extreme weather data not available.');
            }
        })
        .catch(error => console.error('Error fetching extreme weather data:', error));
}

// Function to display extreme weather data in a popup
function displayWeatherPopup(weatherData) {
    const weatherInfo = weatherData.list[0];
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
    $('#extreme-weather-content').html(weatherDisplay); // Using jQuery to set HTML content
    $('#popup').show(); // Using jQuery to show the popup
}

// Bind click event to close button
$('#close-popup').on('click', function() {
    $('#popup').hide(); // Hide the popup when the close button is clicked
});
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
