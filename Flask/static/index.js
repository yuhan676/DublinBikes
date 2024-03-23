// We use this for our state a lot, so keep track of the currently open tab here
// Rent is open by default
var activeTab = "rent";

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

// Use the global active tab var to check if we can enable the search button
function updateSearchBtn() {
    isRent = activeTab == "rent";
    var searchBtn = $('#search_btn');
    var inputElem = $(isRent ? '#search_rent' : '#search_return');
    if (inputElem.val().length > 0) {
        searchBtn.removeClass('disabled');
    }
    else {
        searchBtn.addClass('disabled');
    }
}

// Do some input validity checking and submit the search
function verifyAndSubmitQuery() {
    // Clear the error text
    $('#error_text').empty();

    // Clear the content of 5 suggestion box here

    isRent = activeTab == "rent";

    // Get currently set time and date for the active tab
    // [0] is used to get the DOM element from JQuery, so we can get the date and time easily
    var timeElem = $(isRent ? '#rent_time' : '#return_time')[0];
    var dateElem = $(isRent ? '#rent_date' : '#return_date')[0];


    // If date is today, check that the time is not earlier than now or correct it
    var dateNow = new Date();
    var dateSelected = dateElem.valueAsDate;
    var timeSelected = timeElem.valueAsDate;
    if (!(dateSelected > dateNow))
    {
        if (timeSelected.getHours() < dateNow.getHours() || 
           (timeSelected.getHours() == dateNow.getHours() && timeSelected.getMinutes() < dateNow.getMinutes()))
        {
            // Use current time for query...
            timeSelected = dateNow;
            // ...and set current time in the input element
            timeElem.value = dateNow.toISOString().substring(11,16);
        }
    }

    // For simplicity, compact our date and time into one
    dateSelected.setHours(timeSelected.getHours());
    dateSelected.setMinutes(timeSelected.getMinutes());

    // Package and submit query
    var stationName = $(isRent ? '#search_rent' : '#search_return').val();
    $.ajax({
        url: "/search", // The endpoint in Flask
        type: "GET",
        dataType: 'json',
        data: { 
            'isRent': isRent,
            'stationName': stationName,
            'date': JSON.stringify(dateSelected) // format: YYYY-MM-DDTHH:MM:SS.MMMZ
        },
        success: function(return_data) {
            // Success! return_data should contain the five stations plus any other necessary info
            // Pass this to a function to display here, maybe don't add population code here to keep things clean
        },
        error: function(request, status, errorString) {
            if (request.status == 500)
            {
                // 500 here is so we can show the user when they have entered an invalid station name
                $('#error_text').text(request.responseJSON.message);
            }
        }
    });


    // Handle failure/invalid station name
}
// Populate suggestion box dynamically
function populateSuggestionBox(suggestions) {
    // Clear previous suggestions
    suggestionContainer.innerHTML = '';

    // Check if suggestions exist
    if (suggestions.length > 0) {
        // Display the container
        suggestionContainer.style.display = 'block';

        // Create and append station boxes
        suggestions.forEach(function(suggestion) {
            const stationBox = document.createElement('div');
            stationBox.classList.add('station-box');
            stationBox.textContent = suggestion;
            suggestionContainer.appendChild(stationBox);
        });
    } else {
        // Hide the container when empty
        suggestionContainer.style.display = 'none';
    }
}

// Given a station name, update the content on the right pane;
function populateRightPanel(stationName){
    $.ajax({
        url: "get_rp_info", // The end point in flask
        type: "GET",
        dataType: 'json',
        data: {
            'stationName': stationName
        },
        success: function(return_data) {
            // Success! return_data should contain the five station's newest status 
            // Pass this into a function to display here
        }
    })
}
// This line indicates that the following function only triggers after 'document' (i.e. index.html) has loaded
// All JQuery event handler definitions should go in here
$(document).ready(function() {
    // populates station suggestions when user starts typing
    $('#search_rent').on('input', function() {
        fetchStationSuggestions('suggestion_box_rent', $(this))
        updateSearchBtn();
    });
    $('#search_return').on('input', function() {
        fetchStationSuggestions('suggestion_box_return', $(this))
        updateSearchBtn();
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


    // Search button click listener
    $('#search_btn').click(function() {
        verifyAndSubmitQuery();
    });

    // Still working on it
    // Function to fetch weather data from Flask route and update right panel
function updateRightPanelWeather() {
    $.ajax({
        url: "/get_weather_data", // Flask route for fetching weather data
        type: "GET",
        dataType: 'json',
        success: function(weatherData) {
            // Update weather content in the right panel with fetched data
            $('#rp_weather-icon').text(weatherData.icon);
            $('#rp_feels-like').text(weatherData.feels_like);
            $('#rp_wind-info').text(weatherData.wind);
            $('#rp_humidity-info').text(weatherData.humidity);
        },
        error: function(error) {
            console.error('Error fetching weather data:', error);
        }
    });
}
// Call the function to fetch and update weather data when the page loads
$(document).ready(function() {
    updateRightPanelWeather();
});


    // Extreme weather popup
    // Bind click event to close button
    $('#close-popup').on('click', function() {
        $('#popup').hide(); // Hide the popup when the close button is clicked
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
    // Update global tab value
    activeTab = tabName;

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

    // Check if the search button needs updating
    updateSearchBtn();
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


