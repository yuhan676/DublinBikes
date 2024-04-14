function processData(data) {
  let hourlyAvgData = [];
  let dailyAvgData = [];
  // Loop through each station number in the hourly_avg_data object
  for (let stationNumber in data.hourly_avg_data) {
      // Push each data object into the hourlyAvgData array
      data.hourly_avg_data[stationNumber].forEach(item => {
          hourlyAvgData.push({
              stationNumber: stationNumber,
              hour: item.hour,
              avg_bikes: item.avg_bikes,
              avg_empty_stands: item.avg_empty_stands
          });
      });
  }

  // Loop through each station number in the daily_avg_data object
  for (let stationNumber in data.daily_avg_data) {
      // Push each data object into the dailyAvgData array
      data.daily_avg_data[stationNumber].forEach(item => {
          dailyAvgData.push({
              stationNumber: stationNumber,
              date: item.date,
              avg_bikes: item.avg_bikes,
              avg_empty_stands: item.avg_empty_stands
          });
      });
  }

  let dataInArrays = {
      'hourly': hourlyAvgData,
      'daily': dailyAvgData
  }
  return dataInArrays;
}

async function makeDataArrays(isRent, stationName){
  var fetchUrl = '/bike_station_data?isRent=' + isRent + '&stationName=' + stationName;
  // return processData(dummyData) // for test dummy data
  return fetch(fetchUrl)
  .then(response => response.json())
  .then(data => {
     return processData(data)
  })
  .catch(error => console.error('Error:', error));

}


async function drawChart(chartId, options, isRent, stationName, stationNumber, isDaily) {
  var dailyStandChart = new google.visualization.ColumnChart(document.getElementById(chartId));
  var dailyStandData = new google.visualization.DataTable();
  dailyStandData.addColumn('string', 'Day of the Week');

  dailyStandData.addColumn('number', isRent ? 'Available Bikes' : 'Available Stands');

  let array = await makeDataArrays(isRent, stationName)
  let dataToRender = isDaily ? array.daily : array.hourly
  let filteredData = dataToRender.filter(item => Number.parseInt(item.stationNumber) === Number.parseInt(stationNumber))
  filteredData.forEach(item => {
    var updatedTime = new Date(item.date || null);
    let value = isRent ? item.avg_bikes : item.avg_empty_stands
    // Extract formatted timestamp for the current hour
    if (!isDaily) {
      updatedTime.setHours(item.hour)
    }
    var formattedTimestamp = isDaily ? `${updatedTime.getMonth()}/${updatedTime.getDate()}` : updatedTime.toLocaleTimeString([], { hour: '2-digit'});
    // Add row for each hour with the correct timestamp
      dailyStandData.addRow([{ v: formattedTimestamp, f: formattedTimestamp }, parseInt(value)]);
  })

  dailyStandChart.draw(dailyStandData, options);

}

function initGraph(stationName, stationNumber, isRent) {
  var rightPanelContainer = $('#rp_content');
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(function() {
    var dailyStandChartContainer = $('<div>').addClass('rp_prediction_return').append("<p class='chart-title'>Past 7 days</p>").append($('<div>').attr('id', 'dailyStandPredictionChart'));
    var hourlyStandChartContainer = $('<div>').addClass('rp_prediction_return').append("<p class='chart-title'>Past 24 hours</p>").append($('<div>').attr('id', 'hourlyStandPredictionChart'));
    rightPanelContainer.append(dailyStandChartContainer);
    rightPanelContainer.append(hourlyStandChartContainer);

    let dailyOptions = {
      title: isRent ? 'Bike Availability' : 'Bike Parking Availability',
      hAxis: { 
          title: 'Average Daily Availability', 
          titleTextStyle: { 
              color: '#871B47', // Title color
              opacity: 0.6 // Title opacity
          }, 
          textStyle: { // Text style for axis labels
              color: '#871B47', // Color of axis labels
              opacity: 0.6 // Opacity of axis labels
          }
      },
      vAxis: { 
          title: isRent ? 'Number of Available Bikes' : "Number of Available Stands",
          color: '##76A7FA',
          minValue: 0,  // Set the minimum value for the vertical axis
          maxValue: 25 // Set the maximum value for the vertical axis
      },
      legend: { position: 'none' },
      width: 360, // Set the width of the chart
      height: 300 // Set the height of the chart
  };
  let hourlyOptions = {
    title: isRent ? 'Bike Availability' : 'Bike Parking Availability',
    hAxis: { 
        title: 'Average Hourly Availability', 
        titleTextStyle: { 
            color: '#871B47', // Title color
            opacity: 0.6 // Title opacity
        }, 
        textStyle: { // Text style for axis labels
            color: '#871B47', // Color of axis labels
            opacity: 0.6 // Opacity of axis labels
        }
    },
    vAxis: { 
        title: isRent ? 'Number of Available Bikes' : "Number of Available Stands",
        color: '##76A7FA',
        minValue: 0,  // Set the minimum value for the vertical axis
        maxValue: 25 // Set the maximum value for the vertical axis
    },
    legend: { position: 'none' },
    width: 360, // Set the width of the chart
    height: 300 // Set the height of the chart
};
    // Draw the chart
    drawChart('dailyStandPredictionChart', dailyOptions, isRent, stationName, stationNumber, true)
    drawChart('hourlyStandPredictionChart', hourlyOptions, isRent, stationName, stationNumber)
    // drawChart
  });
}

window.drawChart = drawChart
window.initGraph = initGraph
let dummyData = {
    "daily_avg_data": {
        "15": [
            {
                "avg_bikes": "2.5988",
                "avg_empty_stands": "13.4012",
                "date": "2024-04-05"
            },
            {
                "avg_bikes": "2.4268",
                "avg_empty_stands": "13.5732",
                "date": "2024-04-06"
            },
            {
                "avg_bikes": "3.1524",
                "avg_empty_stands": "12.8476",
                "date": "2024-04-07"
            },
            {
                "avg_bikes": "6.0610",
                "avg_empty_stands": "9.9390",
                "date": "2024-04-08"
            },
            {
                "avg_bikes": "6.3043",
                "avg_empty_stands": "9.6957",
                "date": "2024-04-09"
            },
            {
                "avg_bikes": "3.8994",
                "avg_empty_stands": "12.1006",
                "date": "2024-04-10"
            },
            {
                "avg_bikes": "2.4937",
                "avg_empty_stands": "13.0759",
                "date": "2024-04-11"
            }
        ],
        "28": [
            {
                "avg_bikes": "9.7617",
                "avg_empty_stands": "20.2383",
                "date": "2024-04-05"
            },
            {
                "avg_bikes": "7.2772",
                "avg_empty_stands": "22.7228",
                "date": "2024-04-06"
            },
            {
                "avg_bikes": "2.0578",
                "avg_empty_stands": "27.9422",
                "date": "2024-04-07"
            },
            {
                "avg_bikes": "12.8533",
                "avg_empty_stands": "17.1467",
                "date": "2024-04-08"
            },
            {
                "avg_bikes": "9.1503",
                "avg_empty_stands": "20.8497",
                "date": "2024-04-09"
            },
            {
                "avg_bikes": "7.7879",
                "avg_empty_stands": "22.2121",
                "date": "2024-04-10"
            },
            {
                "avg_bikes": "3.3855",
                "avg_empty_stands": "26.6145",
                "date": "2024-04-11"
            }
        ],
        "44": [
            {
                "avg_bikes": "13.5902",
                "avg_empty_stands": "16.4098",
                "date": "2024-04-05"
            },
            {
                "avg_bikes": "15.6905",
                "avg_empty_stands": "14.3095",
                "date": "2024-04-06"
            },
            {
                "avg_bikes": "5.2209",
                "avg_empty_stands": "24.7791",
                "date": "2024-04-07"
            },
            {
                "avg_bikes": "10.1882",
                "avg_empty_stands": "19.8118",
                "date": "2024-04-08"
            },
            {
                "avg_bikes": "10.3011",
                "avg_empty_stands": "19.6989",
                "date": "2024-04-09"
            },
            {
                "avg_bikes": "6.1646",
                "avg_empty_stands": "23.8354",
                "date": "2024-04-10"
            },
            {
                "avg_bikes": "6.5641",
                "avg_empty_stands": "23.4359",
                "date": "2024-04-11"
            }
        ],
        "59": [
            {
                "avg_bikes": "0.9880",
                "avg_empty_stands": "18.9461",
                "date": "2024-04-05"
            },
            {
                "avg_bikes": "1.3161",
                "avg_empty_stands": "18.6839",
                "date": "2024-04-06"
            },
            {
                "avg_bikes": "0.9182",
                "avg_empty_stands": "19.0629",
                "date": "2024-04-07"
            },
            {
                "avg_bikes": "2.7722",
                "avg_empty_stands": "17.2278",
                "date": "2024-04-08"
            },
            {
                "avg_bikes": "5.8047",
                "avg_empty_stands": "14.1953",
                "date": "2024-04-09"
            },
            {
                "avg_bikes": "3.2407",
                "avg_empty_stands": "16.7593",
                "date": "2024-04-10"
            },
            {
                "avg_bikes": "1.1733",
                "avg_empty_stands": "18.8267",
                "date": "2024-04-11"
            }
        ],
        "61": [
            {
                "avg_bikes": "5.3550",
                "avg_empty_stands": "19.5207",
                "date": "2024-04-05"
            },
            {
                "avg_bikes": "9.7313",
                "avg_empty_stands": "15.2688",
                "date": "2024-04-06"
            },
            {
                "avg_bikes": "5.8117",
                "avg_empty_stands": "19.1883",
                "date": "2024-04-07"
            },
            {
                "avg_bikes": "7.2785",
                "avg_empty_stands": "17.7215",
                "date": "2024-04-08"
            },
            {
                "avg_bikes": "10.9600",
                "avg_empty_stands": "14.0400",
                "date": "2024-04-09"
            },
            {
                "avg_bikes": "11.1173",
                "avg_empty_stands": "13.8827",
                "date": "2024-04-10"
            },
            {
                "avg_bikes": "2.6111",
                "avg_empty_stands": "22.3889",
                "date": "2024-04-11"
            }
        ]
    },
    "hourly_avg_data": {
        "15": [
            {
                "avg_bikes": "0.0000",
                "avg_empty_stands": "16.0000",
                "hour": 10
            },
            {
                "avg_bikes": "0.0000",
                "avg_empty_stands": "16.0000",
                "hour": 11
            },
            {
                "avg_bikes": "2.5455",
                "avg_empty_stands": "13.4545",
                "hour": 12
            },
            {
                "avg_bikes": "5.1250",
                "avg_empty_stands": "10.8750",
                "hour": 13
            },
            {
                "avg_bikes": "6.1429",
                "avg_empty_stands": "9.8571",
                "hour": 14
            },
            {
                "avg_bikes": "3.5000",
                "avg_empty_stands": "12.5000",
                "hour": 15
            },
            {
                "avg_bikes": "1.0000",
                "avg_empty_stands": "15.0000",
                "hour": 16
            },
            {
                "avg_bikes": "1.7778",
                "avg_empty_stands": "13.6667",
                "hour": 17
            },
            {
                "avg_bikes": "1.8333",
                "avg_empty_stands": "13.1667",
                "hour": 18
            },
            {
                "avg_bikes": "0.5000",
                "avg_empty_stands": "14.5000",
                "hour": 19
            },
            {
                "avg_bikes": "2.0000",
                "avg_empty_stands": "13.0000",
                "hour": 20
            },
            {
                "avg_bikes": "2.0000",
                "avg_empty_stands": "13.0000",
                "hour": 21
            },
            {
                "avg_bikes": "2.6667",
                "avg_empty_stands": "12.3333",
                "hour": 22
            }
        ],
        "28": [
            {
                "avg_bikes": "2.3333",
                "avg_empty_stands": "27.6667",
                "hour": 10
            },
            {
                "avg_bikes": "0.5000",
                "avg_empty_stands": "29.5000",
                "hour": 11
            },
            {
                "avg_bikes": "0.1250",
                "avg_empty_stands": "29.8750",
                "hour": 12
            },
            {
                "avg_bikes": "2.8571",
                "avg_empty_stands": "27.1429",
                "hour": 13
            },
            {
                "avg_bikes": "6.5714",
                "avg_empty_stands": "23.4286",
                "hour": 14
            },
            {
                "avg_bikes": "4.0000",
                "avg_empty_stands": "26.0000",
                "hour": 15
            },
            {
                "avg_bikes": "3.0000",
                "avg_empty_stands": "27.0000",
                "hour": 16
            },
            {
                "avg_bikes": "1.2857",
                "avg_empty_stands": "28.7143",
                "hour": 17
            },
            {
                "avg_bikes": "1.3333",
                "avg_empty_stands": "28.6667",
                "hour": 18
            },
            {
                "avg_bikes": "3.0000",
                "avg_empty_stands": "27.0000",
                "hour": 19
            },
            {
                "avg_bikes": "4.2857",
                "avg_empty_stands": "25.7143",
                "hour": 20
            },
            {
                "avg_bikes": "8.5000",
                "avg_empty_stands": "21.5000",
                "hour": 21
            },
            {
                "avg_bikes": "11.6667",
                "avg_empty_stands": "18.3333",
                "hour": 22
            }
        ],
        "44": [
            {
                "avg_bikes": "7.0000",
                "avg_empty_stands": "23.0000",
                "hour": 10
            },
            {
                "avg_bikes": "6.5000",
                "avg_empty_stands": "23.5000",
                "hour": 11
            },
            {
                "avg_bikes": "4.8750",
                "avg_empty_stands": "25.1250",
                "hour": 12
            },
            {
                "avg_bikes": "4.0000",
                "avg_empty_stands": "26.0000",
                "hour": 13
            },
            {
                "avg_bikes": "4.8571",
                "avg_empty_stands": "25.1429",
                "hour": 14
            },
            {
                "avg_bikes": "4.1667",
                "avg_empty_stands": "25.8333",
                "hour": 15
            },
            {
                "avg_bikes": "6.0000",
                "avg_empty_stands": "24.0000",
                "hour": 16
            },
            {
                "avg_bikes": "5.5000",
                "avg_empty_stands": "24.5000",
                "hour": 17
            },
            {
                "avg_bikes": "6.0000",
                "avg_empty_stands": "24.0000",
                "hour": 18
            },
            {
                "avg_bikes": "6.4286",
                "avg_empty_stands": "23.5714",
                "hour": 19
            },
            {
                "avg_bikes": "8.5556",
                "avg_empty_stands": "21.4444",
                "hour": 20
            },
            {
                "avg_bikes": "12.2857",
                "avg_empty_stands": "17.7143",
                "hour": 21
            },
            {
                "avg_bikes": "14.5000",
                "avg_empty_stands": "15.5000",
                "hour": 22
            }
        ],
        "59": [
            {
                "avg_bikes": "5.0000",
                "avg_empty_stands": "15.0000",
                "hour": 10
            },
            {
                "avg_bikes": "1.1429",
                "avg_empty_stands": "18.8571",
                "hour": 11
            },
            {
                "avg_bikes": "2.2500",
                "avg_empty_stands": "17.7500",
                "hour": 12
            },
            {
                "avg_bikes": "1.1429",
                "avg_empty_stands": "18.8571",
                "hour": 13
            },
            {
                "avg_bikes": "1.8571",
                "avg_empty_stands": "18.1429",
                "hour": 14
            },
            {
                "avg_bikes": "0.8000",
                "avg_empty_stands": "19.2000",
                "hour": 15
            },
            {
                "avg_bikes": "0.0000",
                "avg_empty_stands": "20.0000",
                "hour": 16
            },
            {
                "avg_bikes": "0.0000",
                "avg_empty_stands": "20.0000",
                "hour": 17
            },
            {
                "avg_bikes": "0.7778",
                "avg_empty_stands": "19.2222",
                "hour": 18
            },
            {
                "avg_bikes": "1.0000",
                "avg_empty_stands": "19.0000",
                "hour": 19
            },
            {
                "avg_bikes": "0.2857",
                "avg_empty_stands": "19.7143",
                "hour": 20
            },
            {
                "avg_bikes": "1.0000",
                "avg_empty_stands": "19.0000",
                "hour": 21
            },
            {
                "avg_bikes": "2.0000",
                "avg_empty_stands": "18.0000",
                "hour": 22
            }
        ],
        "61": [
            {
                "avg_bikes": "8.0000",
                "avg_empty_stands": "17.0000",
                "hour": 10
            },
            {
                "avg_bikes": "6.8750",
                "avg_empty_stands": "18.1250",
                "hour": 11
            },
            {
                "avg_bikes": "2.7143",
                "avg_empty_stands": "22.2857",
                "hour": 12
            },
            {
                "avg_bikes": "2.4286",
                "avg_empty_stands": "22.5714",
                "hour": 13
            },
            {
                "avg_bikes": "2.0000",
                "avg_empty_stands": "23.0000",
                "hour": 14
            },
            {
                "avg_bikes": "0.5000",
                "avg_empty_stands": "24.5000",
                "hour": 15
            },
            {
                "avg_bikes": "3.0000",
                "avg_empty_stands": "22.0000",
                "hour": 16
            },
            {
                "avg_bikes": "2.1667",
                "avg_empty_stands": "22.8333",
                "hour": 17
            },
            {
                "avg_bikes": "2.8333",
                "avg_empty_stands": "22.1667",
                "hour": 18
            },
            {
                "avg_bikes": "2.5714",
                "avg_empty_stands": "22.4286",
                "hour": 19
            },
            {
                "avg_bikes": "2.0000",
                "avg_empty_stands": "23.0000",
                "hour": 20
            },
            {
                "avg_bikes": "0.3750",
                "avg_empty_stands": "24.6250",
                "hour": 21
            },
            {
                "avg_bikes": "0.0000",
                "avg_empty_stands": "25.0000",
                "hour": 22
            }
        ]
    }
}
