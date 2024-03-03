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