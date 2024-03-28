// Global variable to store the last search results
var lastSearchJSON = {};

// Global variable to store the last weather search data
var lastWeatherJSON = {};

// We use this for our state a lot, so keep track of the currently open tab here
// Rent is open by default
var activeTab = "rent";

// var weatherActiveTab = "Current Weather";

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

            // Clear the global variable
            lastSearchJSON = {};

            // Update the global variable with the new data
            lastSearchJSON = return_data;
            
            // Now, lastSearchJSON contains the latest search results
            console.log(lastSearchJSON); // For debugging: log the latest search results. 
            updateMarkers()
            // Determine the current date in the same format as your 'date' variable
        var currentDate = new Date().toISOString();

        // Check if the 'date' selected matches the current date and proceed to populate the correct container
        if (JSON.stringify(dateSelected).split('T')[0] === currentDate.split('T')[0]) {
            // Choose the container to populate based on the isRent value
            var containerId = isRent ? '#selection_container_rent' : '#selection_container_return';

            // Call the function to populate the container with the new data
            populateSelectionContainer(containerId);
        }
    },
        error: function(request, status, errorString) {
            // This is the dummy data I used to test on my local machine
            // lastSearchJSON = [
            //     {
            //         "address": "Clarendon Row",
            //         "banking": 0,
            //         "bonus": 0,
            //         "electrical_internal_battery_bikes": 0,
            //         "electrical_removable_battery_bikes": 2,
            //         "empty_stands_number": 25,
            //         "last_update": "2024-03-27T18:13:45.000000Z",
            //         "mechanical_bikes": 4,
            //         "name": "CLARENDON ROW",
            //         "number": 1,
            //         "position": {
            //             "lat": 53.340927,
            //             "lng": -6.262501
            //         },
            //         "status": "OPEN",
            //         "total_bikes": 6
            //     },
            //     {
            //         "address": "York Street West",
            //         "banking": 0,
            //         "bonus": 0,
            //         "electrical_internal_battery_bikes": 0,
            //         "electrical_removable_battery_bikes": 2,
            //         "empty_stands_number": 36,
            //         "last_update": "2024-03-27T18:14:15.000000Z",
            //         "mechanical_bikes": 2,
            //         "name": "YORK STREET WEST",
            //         "number": 51,
            //         "position": {
            //             "lat": 53.339334,
            //             "lng": -6.264699
            //         },
            //         "status": "OPEN",
            //         "total_bikes": 4
            //     },
            //     {
            //         "address": "York Street East",
            //         "banking": 0,
            //         "bonus": 0,
            //         "electrical_internal_battery_bikes": 0,
            //         "electrical_removable_battery_bikes": 1,
            //         "empty_stands_number": 30,
            //         "last_update": "2024-03-27T18:06:25.000000Z",
            //         "mechanical_bikes": 1,
            //         "name": "YORK STREET EAST",
            //         "number": 52,
            //         "position": {
            //             "lat": 53.338755,
            //             "lng": -6.262003
            //         },
            //         "status": "OPEN",
            //         "total_bikes": 2
            //     },
            //     {
            //         "address": "Exchequer Street",
            //         "banking": 0,
            //         "bonus": 0,
            //         "electrical_internal_battery_bikes": 0,
            //         "electrical_removable_battery_bikes": 8,
            //         "empty_stands_number": 6,
            //         "last_update": "2024-03-27T18:13:01.000000Z",
            //         "mechanical_bikes": 10,
            //         "name": "EXCHEQUER STREET",
            //         "number": 9,
            //         "position": {
            //             "lat": 53.343034,
            //             "lng": -6.263578
            //         },
            //         "status": "OPEN",
            //         "total_bikes": 18
            //     },
            //     {
            //         "address": "Molesworth Street",
            //         "banking": 0,
            //         "bonus": 0,
            //         "electrical_internal_battery_bikes": 0,
            //         "electrical_removable_battery_bikes": 0,
            //         "empty_stands_number": 18,
            //         "last_update": "2024-03-27T18:08:19.000000Z",
            //         "mechanical_bikes": 2,
            //         "name": "MOLESWORTH STREET",
            //         "number": 27,
            //         "position": {
            //             "lat": 53.341288,
            //             "lng": -6.258117
            //         },
            //         "status": "OPEN",
            //         "total_bikes": 1
            //     }
            // ]
            // updateMarkers()
            if (request.status == 500)
            {
                // 500 here is so we can show the user when they have entered an invalid station name
                $('#error_text').text(request.responseJSON.message);
            }
        }
    });
    // Handle failure/invalid station name
}
// The following functions populate the selection box dynamically

// Function to create the HTML for a single station
function createStationBox(name, status, mechanicalBikes, emptyStandsNumber, banking) {
    // Convert banking to a Yes/No string
    let paymentAvailable = banking ? 'Yes' : 'No';
  
    return `
        <div class="selection_box">
            <div class="station_info">
                <div class="station_name">${name}</div>
                <div class="info_section">
                    <img src="static/image/info.png" class="selection_icon" id="info_icon">
                    <div class="station_status">${status}</div>
                </div>
                <div class="bike_section">
                    <img src="static/image/bike.png" class="selection_icon" id="bicycle_icon">
                    <div class="bikes_available">${mechanicalBikes}</div>
                </div>
                <div class="parking_section">
                    <img src="static/image/parking.png" class="selection_icon" id="parking_icon">
                    <div class="parking_available">${emptyStandsNumber}</div>
                </div>
                <div class="payment_section">
                    <img src="static/image/payment.png" class="selection_icon" id="payment_icon">
                    <div class="payment_available">${paymentAvailable}</div>
                </div>
            </div>
        </div>`;
}
// Function to populate the selection container using the lastSearchJSON global variable
function populateSelectionContainer() {
    var container = $('#selection_container_rent');
    container.empty(); // Clear the container before populating

    // Add the title
    container.append('<div class="nearest_station">Nearest Stations:</div>');

    // Iterate over the lastSearchJSON to add each station box
    lastSearchJSON.forEach(function(station) {
        container.append(createStationBox(
            station.name, 
            station.status, 
            station.mechanical_bikes, 
            station.empty_stands_number, 
            station.banking
        ));
    });
}

// Function to show/unshow the selection wrapper
function selectionToggle() {
    var x = document.getElementById("rent_selection_wrapper");
    var y = document.getElementById("nearest_station_rent");

    if (x.style.display === "none") {
        x.style.display = "block";
        y.innerHTML = "Nearest Stations ▲"; 
        y.style.backgroundColor = "#50a152"
    } else {
        x.style.display = "none";
        y.innerHTML = "Nearest Stations ▼"; 
        y.style.backgroundColor = "#5cb85c"
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

    // Check if the search button needs updating
    updateSearchBtn();
        
    // Adjust the weather panel position
    adjustWeatherPanelPosition();
}
/* function openWeatherTab(evt, tabName) {
    console.log('Tab name:', tabName);
    // Update global variable value
    activeWeatherTab = tabName;

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("weather-tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    
    if (evt) {
        tablinks = document.getElementsByClassName('weather-tablinks');
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove('active');
        }
    }    
    document.getElementById(tabName).style.display = 'block';
    if (evt) {
        evt.currentTarget.classList.add('active');
    }
    // Adjust the weather panel position
    adjustWeatherPanelPosition()
    */
// Function to fetch weather data using AJAX
function fetchCurrenthWeatherData() {
    $.ajax({
        url: "/weather_data",
        type: "GET",
        dataType: "json", // Specify that the expected response is JSON
        success: function(response) {
            //Store the fecthed weather data in the global variable
            lastWeatherJSON = response;

            // Extract weather data from the response
            var weatherData = response;

            // Extracting individual weather data fields
            // Convert time update to a Date object
            var timeupdate = new Date(weatherData[0].time_update); 
            var feelsLike = kelvinToCelsius(weatherData[0].feels_like);
            var tempMin = kelvinToCelsius(weatherData[0].temperature_min);
            var tempMax = kelvinToCelsius(weatherData[0].temperature_max);
            var weatherDescription = weatherData[0].weather_description;
            var windSpeed = mpsToKph(weatherData[0].wind_speed);
            var windGust = mpsToKph(weatherData[0].wind_gust);

            // Format time update as a timestamp
            var dayOfWeek = timeupdate.toLocaleDateString(undefined, { weekday: 'long' });
            var month = timeupdate.toLocaleDateString(undefined, { month: 'long' });
            var day = timeupdate.toLocaleDateString(undefined, { day: 'numeric' });
            var year = timeupdate.toLocaleDateString(undefined, { year: 'numeric' });
            var time = timeupdate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Europe/Dublin' });
            var timezone = timeupdate.toLocaleTimeString(undefined, { timeZone: 'Europe/Dublin', timeZoneName: 'short' });
            
            var timestamp = dayOfWeek + ", " + month + "  " + day + ", " + timezone;

            // Update HTML content with fetched weather data
            $('#weather-content').html(
                "<p><strong>Latest Update:</strong> <span style='color: #007ACC; font-size: 0.9em;'>" + timestamp + "</span></p>" + 
                "<p><span style='font-size: 1.1em;'>Feels Like:</span> " + feelsLike + " °C</p>" +
                "<p><span style='font-size: 1.1em;'>Min Temperature:</span> " + tempMin + " °C</p>" +
                "<p><span style='font-size: 1.1em;'>Max Temperature:</span> " + tempMax + " °C</p>" +
                "<p><span style='font-size: 1.1em;'>Description:</span> " + weatherDescription + "</p>" +
                "<p><span style='font-size: 1.1em;'>Wind Speed:</span> " + windSpeed + " km/h</p>" +
                "<p><span style='font-size: 1.1em;'>Wind Gust:</span> " + windGust + " km/h</p>"
            );
        },
        error: function(xhr, status, error) {
            // Handle AJAX error
            console.error(xhr.responseText);
            $('#weather-content').html('Error fetching weather data');
        }
    });
}
// Call the fetchCurrentWeatherData function directly after its definition
fetchCurrenthWeatherData();

// Dynamic conversion functions
function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(2);
}

function mpsToKph(mps) {
    return (mps * 3.6).toFixed(2);
}
// Function to open the pop-up and fetch extreme weather data
function openPopup() {
    // Fetch extreme weather data and display the popup every hour
    const popupInterval = setInterval(() => {
        fetch('/fetch_extreme_weather')
            .then(response => response.json())
            .then(data => {
                if (data && data.extreme_conditions_met) {
                    // Store the fetched extreme weather data in global variable
                    lastWeatherJSON = data.extreme_conditions_met;
                    displayWeatherPopup(data.extreme_conditions_met);
                } else {
                    console.error('Extreme weather data not available.');
                }
            })
            .catch(error => console.error('Error fetching extreme weather data:', error));
    }, 3600000); // Repeat every hour (3600 seconds * 1000 milliseconds)

    // Function to display the popup
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

        // Close the popup after 10 seconds
        setTimeout(() => {
            $('#popup').hide(); // Using jQuery to hide the popup
        }, 10000); // 10 seconds (10,000 milliseconds)
    }

    // JavaScript to close the weather panel when clicked
    document.getElementById("popup").addEventListener("click", function(event) {
        // Check if the click occurred outside the close button
        if (!event.target.closest(".close")) {
            document.getElementById("popup").style.display = "none";
        }
    });
}
