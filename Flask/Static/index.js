//this line indicates that the following function only triggers after 'document' (i.e. index.html) has loaded
$(document).ready(function() {
    // populates station suggestions when user starts typing
    $('#search_rent').on('input', function() {
        var inputVal = $(this).val();
        if(inputVal.length > 0) {
            $.ajax({
                url: "/suggest_stations", // The endpoint in Flask
                type: "GET",
                dataType: 'json',
                data: { 'term': inputVal },
                success: function(data) {
                    $('#suggestion_box').empty();
                    $.each(data, function(i, station) {
                        var $optionDiv = $('<div>')
                                            .addClass("suggestion_div")
                                            .text(station);
                        $('#suggestion_box').append($optionDiv);
                    });
                }
            });
        } else {
            $('#suggestion_box').empty();
        }
    });

    // set selected station when clicking suggestion
    $('#suggestion_box').on('mousedown', '.suggestion_div', function() {
        var stationName = $(this).text();
        $('#search_rent').val(stationName);
        $('#suggestion_box').empty();
    });

    // empty suggestion box when user clicks outside of suggestion box
    $('#search_rent').focusout(function() {
        $('#suggestion_box').empty();
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
