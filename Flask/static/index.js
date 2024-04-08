// Global variable to store the last search results
var lastRentSearchJSON = {};
var lastReturnSearchJSON = {};

// Global variable to store the last weather search data
var lastWeatherJSON = {};

// We use this for our state a lot, so keep track of the currently open tab here
// Rent is open by default
var activeTab = "rent";

function getLastSearchJSON() {
    return (activeTab == "rent" ? lastRentSearchJSON : lastReturnSearchJSON);
}

// Define a global variable to store the active tab
var weatherActiveTab = 'weather-current-content';

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

// Function to send a simulated location to server, longitude and lattitude are that of Dublin
function simulateUserLocation() {
    // Simulate getting the position with a fake location
  const position = {
    coords: {
      latitude: 53.3498053,
      longitude: -6.2603097
    }
  };

  // Use the simulated position
  sendPositionToServer(position);
  }

  // Function called by findUerLocation to send the query to the flask endpoint adn update the server's respond
  function sendPositionToServer(position) {
    // Convert position to a format that your server expects
  const postData = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };

  // Perform the AJAX request to the server
  $.ajax({
    url: '/closest_station', // Flask endpoint
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(postData),
    success: function(response) {
        if ( activeTab == "rent"){
            $('#search_rent').val(response.closest_station);
        }
        else{
            $('#search_return').val(response.closest_station);
        }
        updateSearchBtn()
        
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX request failed: ', textStatus, errorThrown);
      }
    });
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
    // This is the dummy data I used to test on my local machine
    // testDummyData();
    // return
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
            if (isRent) {
                lastRentSearchJSON = {};
            }
            else {
                lastReturnSearchJSON = {};
            }

            // Update the global variable with the new data
            if (isRent) {
                lastRentSearchJSON = return_data;
            }
            else {
                lastReturnSearchJSON = return_data;
            }
            
            // Now, lastSearchJSON contains the latest search results
            console.log(getLastSearchJSON()); // For debugging: log the latest search results. 
            updateMarkers(isRent)
            // Determine the current date in the same format as your 'date' variable
            // var currentDate = new Date().toISOString();

            // Check if the 'date' selected matches the current date and proceed to populate the correct container
            // if (JSON.stringify(dateSelected).split('T')[0] === currentDate.split('T')[0]) {

            // Call the function to populate the container with the new data
            
            // If the selection toggle doesn't exist, create it
            if (!document.getElementById(isRent ? 'nearest_station_rent' : 'nearest_station_return')) 
            {createSelectionToggle(isRent);}
            // Populate the selection boxes
            populateStationBoxes(isRent);
        
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
// The following functions populate the selection box dynamically

//Create the toggle button and the selection wrapper
function createSelectionToggle(isRent){
    const Togglebutton = document.createElement('button');
    Togglebutton.className='nearest_station';
    Togglebutton.setAttribute('id', isRent ? 'nearest_station_rent' : 'nearest_station_return');
    Togglebutton.textContent='Nearest Stations ▲';

    const SelectionWrapper = document.createElement('div');
    SelectionWrapper.className='selection_wrapper';
    SelectionWrapper.setAttribute('id', isRent ? 'selection_wrapper_rent' : 'selection_wrapper_return');
    SelectionWrapper.style.display='block';
    Togglebutton.onclick = function() {selectionToggle(isRent);};

    const selectionContainer = document.getElementById(isRent ? 'selection_container_rent' : 'selection_container_return');
    selectionContainer.appendChild(Togglebutton);
    selectionContainer.appendChild(SelectionWrapper);}

// Function to create the HTML for a single station selection box
function createStationBox(isRent,stationData) {
    // Convert banking to a Yes/No string
    // let paymentAvailable = banking ? 'Yes' : 'No';

    const selectionBox = document.createElement('div');
    selectionBox.className = 'selection_box';

    const stationInfo = document.createElement('div');
    stationInfo.className = 'station_info';

    const stationName = document.createElement('div');
    stationName.className = 'station_name';
    stationName.textContent = stationData.name;

    const infoSection = document.createElement('div');
    infoSection.className = 'info_section';

    const infoIcon= document.createElement('img');
    infoIcon.className = 'selection_icon';
    infoIcon.src = BASE_STATIC_URL + 'image/info.png';

    const stationStatus = document.createElement('div');
    stationStatus.className = 'station_status';
    stationStatus.textContent = stationData.status;

    const bikeSection = document.createElement('div');
    bikeSection.className = 'bike_section';

    const bikeIcon= document.createElement('img');
    bikeIcon.className = 'selection_icon';
    bikeIcon.src = BASE_STATIC_URL + 'image/bike.png';

    const bikeAvailable=document.createElement('div');
    bikeAvailable.textContent=stationData.bikesAvailable;

    const parkingSection = document.createElement('div');
    parkingSection.className = 'parking_section';

    const parkingIcon= document.createElement('img');
    parkingIcon.className = 'selection_icon';
    parkingIcon.src = BASE_STATIC_URL + 'image/parking.png';

    const parkingAvailable=document.createElement('div');
    parkingAvailable.textContent=stationData.parkingAvailable;

    const paymentSection = document.createElement('div');
    paymentSection.className = 'payment_section';

    const paymentIcon= document.createElement('img');
    paymentIcon.className = 'selection_icon';
    paymentIcon.src = BASE_STATIC_URL + 'image/payment.png';

    const paymentAvailable=document.createElement('div');
    paymentAvailable.textContent=stationData.paymentAvailable;
    
    const SelectionWrapper = document.getElementById(isRent ? 'selection_wrapper_rent' : 'selection_wrapper_return');
    SelectionWrapper.appendChild(selectionBox);
    selectionBox.appendChild(stationInfo);
    stationInfo.appendChild(stationName);
    stationInfo.appendChild(infoSection);
    infoSection.appendChild(infoIcon);
    infoSection.appendChild(stationStatus);
    stationInfo.appendChild(bikeSection);
    bikeSection.appendChild(bikeIcon);
    bikeSection.appendChild(bikeAvailable);
    stationInfo.appendChild(parkingSection);
    parkingSection.appendChild(parkingIcon);
    parkingSection.appendChild(parkingAvailable);
    stationInfo.appendChild(paymentSection);
    paymentSection.appendChild(paymentIcon);
    paymentSection.appendChild(paymentAvailable);
    
}
// Function to populate the selection container with station boxes using the lastSearchJSON global variable
function populateStationBoxes(isRent) {
    // Get the appropriate wrapper based on the isRent flag
    const selectionWrapper = document.getElementById(isRent ? 'selection_wrapper_rent' : 'selection_wrapper_return');
    selectionWrapper.textContent = ''; // Clear any existing content

    // Loop through the lastSearchJSON array and create a selection box for each station
    getLastSearchJSON().forEach(stationData => {
        createStationBox(isRent, {
            name: stationData.name,
            status: stationData.status,
            bikesAvailable: stationData.total_bikes,
            parkingAvailable: stationData.empty_stands_number,
            paymentAvailable: stationData.banking === 1 ? 'Yes' : 'No' // Assuming banking: 1 means 'Yes', 0 means 'No'
        });
    });
    //Select the first box by default
    selectStation(0, isRent);
}

// Function to show/unshow the selection wrapper using toggle, distinguishing rent and return
function selectionToggle(isRent) {
    // Determine the correct ID based on isRent
    var wrapperId = isRent ? 'selection_wrapper_rent' : 'selection_wrapper_return';
    var buttonId = isRent ? 'nearest_station_rent' : 'nearest_station_return';

    // Use getElementById to select the wrapper and button
    var x = document.getElementById(wrapperId);
    var y = document.getElementById(buttonId);

    // Make sure that both elements exist
    if (x && y) {
        if (x.style.display === "none" || x.style.display === "") {
            x.style.display = "block";
            y.textContent = "Nearest Stations ▲"; // Use textContent for text
            y.style.backgroundColor = "#50a152";
        } else {
            x.style.display = "none";
            y.textContent = "Nearest Stations ▼"; // Use textContent for text
            y.style.backgroundColor = "#5cb85c";
        }
    } else {
        console.error('One of the elements was not found in the DOM.');
    }
}
// Function to handle the selection of a station box
function selectStation(index, isRent) {
    // Clear marker when search is clicked again
    // clearMarkers();

    // The container ID will depend on whether isRent is true or false
    var containerId = isRent ? 'selection_container_rent' : 'selection_container_return';
    var $selectionWrapper = $('#' + containerId + ' .selection_wrapper');

    // Remove the 'selected' class from all selection boxes
    $selectionWrapper.find('.selection_box').removeClass('selected');

    // Add the 'selected' class to the clicked selection box
    $selectionWrapper.find('.selection_box').eq(index).addClass('selected');

    // Additional logic for when a station is selected
    console.log('Station selected:', index, 'Is Rent:', isRent);

    // Get the station name based on the index
    var stationName = getLastSearchJSON()[index].name;

    // // update all markers
    // updateMarkers(index);
    // animate marker
    animateMarker(index);

    // Call the populateRightPanel function with the selected station name
    populateRightPanel(stationName, isRent);
} 
// Function to populate the right-hand pane
function populateRightPanel(stationName, isRent) {
    try {
        var lastSearchJSON = getLastSearchJSON();
        var stationData;
        if (lastSearchJSON && lastSearchJSON.length > 0) {
            for (var i = 0; i < lastSearchJSON.length; i++) {
                if (lastSearchJSON[i].name === stationName) {
                    stationData = lastSearchJSON[i];
                    break;
                }
            }
        }
        
        if (!stationData) {
            throw new Error("Station data not found.");
        }

        console.log('Station data found:', stationData);

        var rightPanelContainer = $('#rp_content');
        if (!rightPanelContainer || rightPanelContainer.length === 0) {
            throw new Error("Right panel container not found.");
        }

        console.log('Right panel container:', rightPanelContainer);

        rightPanelContainer.empty();
        console.log('Previous content cleared.');

        var stationElementName = $('<div>').addClass('rp_station_name').text('Station Name: ' + stationData.name);
        var totalBikeLabel = $('<div>').addClass('rp_bike_total_label').text('Total Bike: ').append($('<p>').attr('id', 'available-bikes').text(stationData.total_bikes));
        var mechanicalBikeLabel = $('<div>').addClass('rp_info_label').text('Mechanical Bikes: ').append($('<p>').attr('id', 'available_mechanical').text(stationData.mechanical_bikes));
        var eBikeRemovableLabel = $('<div>').addClass('rp_info_label').text('E-Bike Removable Battery: ').append($('<p>').attr('id', 'available_e_removable').text(stationData.electrical_removable_battery_bikes));
        var eBikeInternalLabel = $('<div>').addClass('rp_info_label').text('E-Bike Internal Battery: ').append($('<p>').attr('id', 'available_e_internal').text(stationData.electrical_internal_battery_bikes));
        var totalParkingLabel = $('<div>').addClass('rp_park_total_label').text('Total Parking: ').append($('<p>').attr('id', 'available-park').text(stationData.empty_stands_number));

        var timeUpdateDate = new Date(stationData.last_update);
        if (isNaN(timeUpdateDate.getTime())) {
            throw new Error("Invalid last update date.");
            
        }

        var options = {
            weekday: 'long', 
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'Europe/Dublin'
        };

        var formattedTime = timeUpdateDate.toLocaleString(undefined, options);

        var timeUpdateLabelRent = $('<div>').addClass('rp_info_label').html("<p style='margin-bottom: 5px;'><strong>Last Updated:</strong> <span style='color: #007ACC; font-size: 0.9em;'>" + formattedTime + "</span></p>");
        var timeUpdateLabelReturn = $('<div>').addClass('rp_info_label').html("<p style='margin-bottom: 5px;'><strong>Last Updated:</strong> <span style='color: #007ACC; font-size: 0.9em;'>" + formattedTime + "</span></p>");

        if (isRent) {
            rightPanelContainer.append(stationElementName, totalParkingLabel, totalBikeLabel, mechanicalBikeLabel, eBikeRemovableLabel, eBikeInternalLabel, timeUpdateLabelRent);
        } else {
            rightPanelContainer.append(stationElementName, totalParkingLabel, totalBikeLabel, timeUpdateLabelReturn);
        }

        console.log('Station information appended to right panel container.');

        // Load Google Charts library and draw graphs when loaded
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(function() {


            // Initialize the data table for hourly bike availability
            var hourlyBikeData = new google.visualization.DataTable();
            hourlyBikeData.addColumn('datetime', 'Time of Day');
            hourlyBikeData.addColumn('number', 'Bikes');

            // Extracting the hour component using getHours()
            var hours = timeUpdateDate.getHours();
            
            console.log("Hour: " + hours);

            console.log("Timestamp:", stationData.last_update);

            var timestamp = stationData.last_update;
            console.log("Timestamp before parsing:", timestamp);
            
            var timeUpdateDate1 = new Date(timestamp);
            console.log("Date object after parsing:", timeUpdateDate1);
            
            if (isNaN(timeUpdateDate1.getTime())) {
                throw new Error("Invalid last update date.");
            }

            for (var hour = 0; hour < 24; hour++) {
                // hourlyBikeData.addRow([timeUpdateDate, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '8 am', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '9 am', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '10 am', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '11 am', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '12 am', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '1 pm', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '2 pm', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '3 pm', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '4 pm', formattedTime}, stationData.total_bikes]);
                hourlyBikeData.addRow([{v: [hour, 0, 0], f: '5 pm', formattedTime}, stationData.total_bikes]);

            }
            // hourlyBikeData.addRow([{v: [..., 0, 0], f: '8 am', formattedTime}, stationData.total_bikes]);

            // [{v: [8, 0, 0], f: '8 am'}, 1, .25]    
            
            // Define options for daily bike availability chart
            var options = {
                title: 'Bike Availability',
                hAxis: { title: 'Hourly Availability', titleTextStyle: { color: '#333' } },
                vAxis: { 
                    title: "Testing again....",
                    minValue: 0,  // Set the minimum value for the vertical axis
                    maxValue: 25, // Set the maximum value for the vertical axis
                },
                legend: { position: 'none' }
            };            
            
            // Create container for the chart
            var dailyBikeChartContainer = $('<div>').addClass('rp_prediction_rent').append($('<div>').attr('id', 'dailyBikePredictionChart'));
            rightPanelContainer.append(dailyBikeChartContainer);
            // Draw the chart
            var dailyBikeChart = new google.visualization.ColumnChart(document.getElementById('dailyBikePredictionChart'));
            dailyBikeChart.draw(hourlyBikeData, options);
            
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
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

    // Add event listener to find closest station button
    document.getElementById('closestStation_btn').addEventListener('click', simulateUserLocation);

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
    // Add event listener to detect keyboard stroke for opening the popup
    document.addEventListener('keydown', openPopupWithKeystroke);
        
    // Bind click event to close the popup when clicked outside of it
    $(document).on('click', function(event) {
        // Check if the clicked element is not the popup or its children
        if (!$(event.target).closest('#popup').length) {
            $('#popup').hide(); // Hide the popup
        }
    });
    // Bind click event to close button
    $('#close-popup').on('click', function() {
        $('#popup').hide(); // Hide the popup when the close button is clicked
    });

    // j-query listener  that listens  for a click on the selection box
    $('#selection_container_rent').on('mousedown','.selection_box',function(){
    var index = $('#selection_container_rent .selection_box').index(this);
    selectStation(index, true);});

    $('#selection_container_return').on('mousedown','.selection_box',function(){
    var index = $('#selection_container_return .selection_box').index(this);
    selectStation(index, false);});
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

    // Clear markers and repopulate
    updateMarkers(activeTab == "rent");
    if (Object.keys(getLastSearchJSON()).length)
    {
        selectStation(0, activeTab == "rent");
    }
    // TODO: clear/hide the right hand panel
}
function weatherOpenTab(evt, tabContentId) {
    try {
        // Update the value of the global variable
        weatherActiveTab = tabContentId;

        // Get all elements with class="weather-tabcontent" and hide them
        var weather_tabcontent = document.getElementsByClassName('weather-tabcontent');
        if (!weather_tabcontent || weather_tabcontent.length === 0) {
            throw new Error("Weather tab content elements not found.");
        }
        for (var i = 0; i < weather_tabcontent.length; i++) {
            weather_tabcontent[i].style.display = 'none';
        }

        // Get all elements with class="weather-tablinks" and remove the class "active"
        var weather_tablinks = document.getElementsByClassName('weather-tablinks');
        if (!weather_tablinks || weather_tablinks.length === 0) {
            throw new Error("Weather tab links elements not found.");
        }
        for (var i = 0; i < weather_tablinks.length; i++) {
            weather_tablinks[i].classList.remove('active');
        }

        // Show the content of the clicked tab and add the "active" class to the button
        var tabElement = document.getElementById(tabContentId);
        if (!tabElement) {
            throw new Error("Weather tab content element with ID '" + tabContentId + "' not found.");
        }
        tabElement.style.display = 'block';
        evt.currentTarget.classList.add('active');
    } catch (error) {
        console.error("An error occurred in weatherOpenTab:", error);
        // Handle the error, e.g., display a message to the user or gracefully recover
    }
}
function fetchCurrentWeatherData() {
    try {
        $.ajax({
            url: "/weather_data",
            type: "GET",
            dataType: "json", // Specify that the expected response is JSON
            success: function(response) {
                // Store the fetched weather data in the global variable
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
                var timezone = timeupdate.toLocaleTimeString(undefined, { timeZone: 'Europe/Dublin', hour: '2-digit', minute: '2-digit', hour12: true });

                var timestamp = dayOfWeek + ", " + month + "  " + day + ", " + timezone;

                // Update HTML content with fetched weather data
                $('#weather-current-content').html(
                    // "<img src='static/image/weather.png' alt='TEST'>" +
                    "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Feels Like:</span> " + feelsLike + " °C</p>" +
                    "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Min Temperature:</span> " + tempMin + " °C</p>" +
                    "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Max Temperature:</span> " + tempMax + " °C</p>" +
                    "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Description:</span> " + weatherDescription + "</p>" +
                    "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Wind Speed:</span> " + windSpeed + " km/h</p>" +
                    "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Wind Gust:</span> " + windGust + " km/h</p>" +
                    "<p style='margin-bottom: 5px;'><strong>Last Updated:</strong> <span style='color: #007ACC; font-size: 0.9em;'>" + timestamp + "</span></p>"
                );

                // Adjust the margin dynamically after content has been populated
                $('#weather-current-content').css('margin-top', '10px');
            },
            error: function(_, _, error) {
                // Handle AJAX error
                console.error("An error occurred in fetchCurrentWeatherData:", error);
                $('#weather-current-content').html('Error fetching weather data');
            }
        });
    } catch (error) {
        console.error("An error occurred in fetchCurrentWeatherData:", error);
        // Handle the error, e.g., display a message to the user or gracefully recover
    }
}
// Function to fetch forecast data using AJAX
function fetchForecastData() {
    $.ajax({
        url: "/five_day_prediction",
        type: "GET",
        dataType: "json", // Specify that the expected response is JSON
        success: function(response) {
            // Store the fetched weather data in the global variable
            lastWeatherJSON = response;

            // Extract weather data from the response
            var weatherData = response;

            // Extracting individual weather data fields
            // Convert time update to a Date object
            var timeupdate = new Date(weatherData[0].time_update); 
            var tempMin = kelvinToCelsius(weatherData[0].temp_min);
            var tempMax = kelvinToCelsius(weatherData[0].temp_max);
            var rain = weatherData[0].rain;
            var windSpeed = mpsToKph(weatherData[0].wind_speed);
            var windGust = mpsToKph(weatherData[0].gust);

            // Format time update as a timestamp
            var dayOfWeek = timeupdate.toLocaleDateString(undefined, { weekday: 'long' });
            var month = timeupdate.toLocaleDateString(undefined, { month: 'long' });
            var day = timeupdate.toLocaleDateString(undefined, { day: 'numeric' });
            var timezone = timeupdate.toLocaleTimeString(undefined, { timeZone: 'Europe/Dublin', hour: '2-digit', minute: '2-digit', hour12: true });
            
            var timestamp = dayOfWeek + ", " + month + "  " + day + ", " + timezone;

            // Update HTML content with fetched weather data
            $('#weather-forecast-content').html(
                "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Min Temperature:</span> " + tempMin + " °C</p>" +
                "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Max Temperature:</span> " + tempMax + " °C</p>" +
                "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Rain:</span> " + rain + "</p>" +
                "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Wind Speed:</span> " + windSpeed + " km/h</p>" +
                "<p style='margin-bottom: 5px;'><span style='font-size: 1.1em;'>Wind Gust:</span> " + windGust + " km/h</p>" +
                "<p style='margin-bottom: 5px;'><strong>Last Updated:</strong> <span style='color: #007ACC; font-size: 0.9em;'>" + timestamp + "</span></p>"
            );

            // Adjust the margin dynamically after content has been populated
            $('#weather-forecast-content').css('margin-top', '10px');
        },
        error: function(_, _, error) {
            // Handle AJAX error
            console.error("An error occurred in fetchForecastData:", error);
            $('#weather-forecast-content').html('Error fetching weather data');
        }
    });
}

// Call the fetchCurrentWeatherData 
fetchCurrentWeatherData();
// Call the fetchForecastData function 
fetchForecastData();

// Dynamic conversion functions
function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(2);
}

function mpsToKph(mps) {
    return (mps * 3.6).toFixed(2);
}
// Function to open the pop-up and fetch extreme weather data
function openPopup() {
    // Fetch extreme weather data and display the popup
    // trigger is lowercase "p" on the keyboard. Popup can be closed by clicking outside of it or from the x on the top right hand corner
    fetch('/fetch_extreme_weather?trigger=true')
        .then(response => response.json())
        .then(data => {
            if (data) {
                displayWeatherPopup(data);
            } else {
                console.error('Weather data not available.');
            }
        })
        .catch(error => console.error('Error fetching extreme weather data:', error));
}

function displayWeatherPopup(weatherData) {
    try {
        const weatherInfo = weatherData.list[0];
        const windSpeed = weatherInfo.wind.speed;
        const rainProbability = weatherInfo.rain["3"];
        const minTemperature = weatherInfo.main.temp_min;
        const maxTemperature = weatherInfo.main.temp_max;

        // Format the weather information for display
        const weatherDisplay = `
            <div>Wind Speed: ${windSpeed} m/s</div>
            <div>Rainfall exceeding 50mm within a span of 6 hours: ${rainProbability}%</div>
            <div>Minimum Temperature: ${minTemperature}°C</div>
            <div>Maximum Temperature: ${maxTemperature}°C</div>
        `;
                
        // Display the formatted weather information in the popup
        $('#extreme-weather-content').html(weatherDisplay); // Using jQuery to set HTML content
        $('#popup').show(); // Using jQuery to show the popup
    } catch (error) {
        console.error("An error occurred in displayWeatherPopup:", error);
        $('#extreme-weather-content').html('Error displaying weather data');
        $('#popup').hide(); // Hide the popup in case of error
    }
}

// Function to open the popup when the 'p' key is pressed
function openPopupWithKeystroke(event) {
    // Check if the event object exists and has the 'key' property
    if (event && event.key) { 
        // Check if the pressed key is 'p'
        if (event.key === 'p') { 
            openPopup();
        }
    }
}
// Function to test dummy data on local machine
function testDummyData() {
    lastSearchJSON = [
        {
            "address": "Clarendon Row",
            "banking": 0,
            "bonus": 0,
            "electrical_internal_battery_bikes": 0,
            "electrical_removable_battery_bikes": 2,
            "empty_stands_number": 25,
            "last_update": "2024-03-27T18:13:45.000000Z",
            "mechanical_bikes": 4,
            "name": "CLARENDON ROW",
            "number": 1,
            "position": {
                "lat": 53.340927,
                "lng": -6.262501
            },
            "status": "OPEN",
            "total_bikes": 6
        },
        {
            "address": "York Street West",
            "banking": 0,
            "bonus": 0,
            "electrical_internal_battery_bikes": 0,
            "electrical_removable_battery_bikes": 2,
            "empty_stands_number": 36,
            "last_update": "2024-03-27T18:14:15.000000Z",
            "mechanical_bikes": 2,
            "name": "YORK STREET WEST",
            "number": 51,
            "position": {
                "lat": 53.339334,
                "lng": -6.264699
            },
            "status": "OPEN",
            "total_bikes": 4
        },
        {
            "address": "York Street East",
            "banking": 0,
            "bonus": 0,
            "electrical_internal_battery_bikes": 0,
            "electrical_removable_battery_bikes": 1,
            "empty_stands_number": 30,
            "last_update": "2024-03-27T18:06:25.000000Z",
            "mechanical_bikes": 1,
            "name": "YORK STREET EAST",
            "number": 52,
            "position": {
                "lat": 53.338755,
                "lng": -6.262003
            },
            "status": "OPEN",
            "total_bikes": 2
        },
        {
            "address": "Exchequer Street",
            "banking": 0,
            "bonus": 0,
            "electrical_internal_battery_bikes": 0,
            "electrical_removable_battery_bikes": 8,
            "empty_stands_number": 6,
            "last_update": "2024-03-27T18:13:01.000000Z",
            "mechanical_bikes": 10,
            "name": "EXCHEQUER STREET",
            "number": 9,
            "position": {
                "lat": 53.343034,
                "lng": -6.263578
            },
            "status": "OPEN",
            "total_bikes": 18
        },
        {
            "address": "Molesworth Street",
            "banking": 0,
            "bonus": 0,
            "electrical_internal_battery_bikes": 0,
            "electrical_removable_battery_bikes": 0,
            "empty_stands_number": 18,
            "last_update": "2024-03-27T18:08:19.000000Z",
            "mechanical_bikes": 2,
            "name": "MOLESWORTH STREET",
            "number": 27,
            "position": {
                "lat": 53.341288,
                "lng": -6.258117
            },
            "status": "OPEN",
            "total_bikes": 0
        }
    ];
    updateMarkers(isRent);
    createSelectionToggle(isRent)
    populateStationBoxes(isRent);
}