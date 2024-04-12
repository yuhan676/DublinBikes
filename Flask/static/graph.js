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
    console.log("🚀 ~ data:", data)
     return processData(data)
  })
  .catch(error => console.error('Error:', error));

}


async function drawDaily(chartId, options, isRent, stationName, stationNumber, isDaily) {
  console.log("🚀 ~ stationNumber:", stationNumber, stationName)
  var dailyStandChart = new google.visualization.ColumnChart(document.getElementById(chartId));
  var dailyStandData = new google.visualization.DataTable();
  dailyStandData.addColumn('string', 'Day of the Week');

  dailyStandData.addColumn('number', isRent ? 'Available Bikes' : 'Available Stands');

  let array = await makeDataArrays(isRent, stationName)
  console.log("🚀 ~ array:", array)
  let dataToRender = isDaily ? array.daily : array.hourly
  console.log("🚀 ~ dataToRender:", dataToRender)
  dataToRender.forEach(item => {
    var updatedTime = new Date(item.date || null);
    let value = isRent ? item.avg_bikes : item.avg_empty_stands
    // Extract formatted timestamp for the current hour
    if (!isDaily) {
      updatedTime.setHours(item.hour)
    }
    var formattedTimestamp = isDaily ? updatedTime.toLocaleDateString() : updatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Add row for each hour with the correct timestamp
    if (item.stationNumber === stationNumber) {
        console.log("🚀 ~ stationNumber  2:", stationNumber)
        dailyStandData.addRow([{ v: formattedTimestamp, f: formattedTimestamp }, parseInt(value)]);
    }
  })

  dailyStandChart.draw(dailyStandData, options);

}

function initGraph(stationName, stationNumber, isRent) {
  console.log("🚀 ~ isRent:", isRent)
  var rightPanelContainer = $('#rp_content');
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(function() {
    var dailyStandChartContainer = $('<div>').addClass('rp_prediction_return').append($('<div>').attr('id', 'dailyStandPredictionChart'));
    var hourlyStandChartContainer = $('<div>').addClass('rp_prediction_return').append($('<div>').attr('id', 'hourlyStandPredictionChart'));
    rightPanelContainer.append(dailyStandChartContainer);
    rightPanelContainer.append(hourlyStandChartContainer);

    let dailyOptions = {
      title: isRent ? 'Bike Availability' : 'Stand Availability',
      hAxis: { 
          title: 'Daily Availability', 
          titleTextStyle: { 
              color: '#871B47', // Title color
              opacity: 0.6 // Title opacity
          }, 
          textStyle: { // Text style for axis labels
              color: '#BC5679', // Color of axis labels
              opacity: 0.2 // Opacity of axis labels
          }
      },
      vAxis: { 
          title: isRent ? 'Number of Available Bikes' : "Number of Available Stands",
          color: '##76A7FA',
          minValue: 0,  // Set the minimum value for the vertical axis
          maxValue: 25 // Set the maximum value for the vertical axis
      },
      legend: { position: 'none' },
      width: 400, // Set the width of the chart
      height: 300 // Set the height of the chart
  };
  let hourlyOptions = {
    title: isRent ? 'Bike Availability' : 'Stand Availability',
    hAxis: { 
        title: 'Hourly Availability', 
        titleTextStyle: { 
            color: '#871B47', // Title color
            opacity: 0.6 // Title opacity
        }, 
        textStyle: { // Text style for axis labels
            color: '#BC5679', // Color of axis labels
            opacity: 0.2 // Opacity of axis labels
        }
    },
    vAxis: { 
        title: isRent ? 'Number of Available Bikes' : "Number of Available Stands",
        color: '##76A7FA',
        minValue: 0,  // Set the minimum value for the vertical axis
        maxValue: 25 // Set the maximum value for the vertical axis
    },
    legend: { position: 'none' },
    width: 400, // Set the width of the chart
    height: 300 // Set the height of the chart
};
    // Draw the chart
    drawDaily('dailyStandPredictionChart', dailyOptions, isRent, stationName, stationNumber, true)
    drawDaily('hourlyStandPredictionChart', hourlyOptions, isRent, stationName, stationNumber)
    // drawDaily
  });
}

window.drawDaily = drawDaily
window.initGraph = initGraph

var dummyData = {
    "daily_avg_data": {
      "2": [
        {
          "avg_bikes": "5.7943",
          "avg_empty_stands": "14.2057",
          "date": "2024-04-05"
        },
        {
          "avg_bikes": "1.6108",
          "avg_empty_stands": "18.3892",
          "date": "2024-04-06"
        },
        {
          "avg_bikes": "0.4645",
          "avg_empty_stands": "19.5355",
          "date": "2024-04-07"
        },
        {
          "avg_bikes": "3.4430",
          "avg_empty_stands": "16.5570",
          "date": "2024-04-08"
        },
        {
          "avg_bikes": "8.2391",
          "avg_empty_stands": "11.7609",
          "date": "2024-04-09"
        },
        {
          "avg_bikes": "9.8232",
          "avg_empty_stands": "10.1768",
          "date": "2024-04-10"
        },
        {
          "avg_bikes": "6.9259",
          "avg_empty_stands": "13.0741",
          "date": "2024-04-11"
        }
      ],
      "12": [
        {
          "avg_bikes": "4.2281",
          "avg_empty_stands": "15.7719",
          "date": "2024-04-05"
        },
        {
          "avg_bikes": "1.5443",
          "avg_empty_stands": "18.4557",
          "date": "2024-04-06"
        },
        {
          "avg_bikes": "1.3397",
          "avg_empty_stands": "18.6603",
          "date": "2024-04-07"
        },
        {
          "avg_bikes": "7.4783",
          "avg_empty_stands": "12.5217",
          "date": "2024-04-08"
        },
        {
          "avg_bikes": "8.4857",
          "avg_empty_stands": "11.5143",
          "date": "2024-04-09"
        },
        {
          "avg_bikes": "10.8987",
          "avg_empty_stands": "9.1013",
          "date": "2024-04-10"
        },
        {
          "avg_bikes": "4.3647",
          "avg_empty_stands": "15.6353",
          "date": "2024-04-11"
        }
      ],
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
      "79": [
        {
          "avg_bikes": "2.6646",
          "avg_empty_stands": "24.3354",
          "date": "2024-04-05"
        },
        {
          "avg_bikes": "0.3630",
          "avg_empty_stands": "26.6370",
          "date": "2024-04-06"
        },
        {
          "avg_bikes": "0.8621",
          "avg_empty_stands": "26.1379",
          "date": "2024-04-07"
        },
        {
          "avg_bikes": "4.7722",
          "avg_empty_stands": "22.0253",
          "date": "2024-04-08"
        },
        {
          "avg_bikes": "8.5839",
          "avg_empty_stands": "18.4161",
          "date": "2024-04-09"
        },
        {
          "avg_bikes": "5.9333",
          "avg_empty_stands": "21.0667",
          "date": "2024-04-10"
        },
        {
          "avg_bikes": "3.5139",
          "avg_empty_stands": "23.4861",
          "date": "2024-04-11"
        }
      ],
      "102": [
        {
          "avg_bikes": "9.6928",
          "avg_empty_stands": "30.3072",
          "date": "2024-04-05"
        },
        {
          "avg_bikes": "4.9737",
          "avg_empty_stands": "35.0263",
          "date": "2024-04-06"
        },
        {
          "avg_bikes": "0.5867",
          "avg_empty_stands": "39.4133",
          "date": "2024-04-07"
        },
        {
          "avg_bikes": "13.5705",
          "avg_empty_stands": "26.4295",
          "date": "2024-04-08"
        },
        {
          "avg_bikes": "15.1420",
          "avg_empty_stands": "24.8580",
          "date": "2024-04-09"
        },
        {
          "avg_bikes": "10.4172",
          "avg_empty_stands": "29.5828",
          "date": "2024-04-10"
        },
        {
          "avg_bikes": "7.4000",
          "avg_empty_stands": "32.6000",
          "date": "2024-04-11"
        }
      ]
    },
    "hourly_avg_data": {
      "2": [
        {
          "avg_bikes": "12.0000",
          "avg_empty_stands": "8.0000",
          "hour": 10
        },
        {
          "avg_bikes": "8.4000",
          "avg_empty_stands": "11.6000",
          "hour": 11
        },
        {
          "avg_bikes": "8.2500",
          "avg_empty_stands": "11.7500",
          "hour": 12
        },
        {
          "avg_bikes": "10.4286",
          "avg_empty_stands": "9.5714",
          "hour": 13
        },
        {
          "avg_bikes": "10.0000",
          "avg_empty_stands": "10.0000",
          "hour": 14
        },
        {
          "avg_bikes": "8.6667",
          "avg_empty_stands": "11.3333",
          "hour": 15
        },
        {
          "avg_bikes": "8.0000",
          "avg_empty_stands": "12.0000",
          "hour": 16
        },
        {
          "avg_bikes": "8.5000",
          "avg_empty_stands": "11.5000",
          "hour": 17
        },
        {
          "avg_bikes": "6.7143",
          "avg_empty_stands": "13.2857",
          "hour": 18
        },
        {
          "avg_bikes": "4.4444",
          "avg_empty_stands": "15.5556",
          "hour": 19
        },
        {
          "avg_bikes": "2.6667",
          "avg_empty_stands": "17.3333",
          "hour": 20
        },
        {
          "avg_bikes": "2.0000",
          "avg_empty_stands": "18.0000",
          "hour": 21
        },
        {
          "avg_bikes": "1.5000",
          "avg_empty_stands": "18.5000",
          "hour": 22
        }
      ],
      "12": [
        {
          "avg_bikes": "0.0000",
          "avg_empty_stands": "20.0000",
          "hour": 10
        },
        {
          "avg_bikes": "1.5000",
          "avg_empty_stands": "18.5000",
          "hour": 11
        },
        {
          "avg_bikes": "2.1250",
          "avg_empty_stands": "17.8750",
          "hour": 12
        },
        {
          "avg_bikes": "0.5000",
          "avg_empty_stands": "19.5000",
          "hour": 13
        },
        {
          "avg_bikes": "8.6250",
          "avg_empty_stands": "11.3750",
          "hour": 14
        },
        {
          "avg_bikes": "11.6250",
          "avg_empty_stands": "8.3750",
          "hour": 15
        },
        {
          "avg_bikes": "6.0000",
          "avg_empty_stands": "14.0000",
          "hour": 16
        },
        {
          "avg_bikes": "4.7500",
          "avg_empty_stands": "15.2500",
          "hour": 17
        },
        {
          "avg_bikes": "3.3333",
          "avg_empty_stands": "16.6667",
          "hour": 18
        },
        {
          "avg_bikes": "2.4444",
          "avg_empty_stands": "17.5556",
          "hour": 19
        },
        {
          "avg_bikes": "3.8889",
          "avg_empty_stands": "16.1111",
          "hour": 20
        },
        {
          "avg_bikes": "4.5714",
          "avg_empty_stands": "15.4286",
          "hour": 21
        },
        {
          "avg_bikes": "7.0000",
          "avg_empty_stands": "13.0000",
          "hour": 22
        }
      ],
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
      "79": [
        {
          "avg_bikes": "6.0000",
          "avg_empty_stands": "21.0000",
          "hour": 10
        },
        {
          "avg_bikes": "6.0000",
          "avg_empty_stands": "21.0000",
          "hour": 11
        },
        {
          "avg_bikes": "5.4286",
          "avg_empty_stands": "21.5714",
          "hour": 12
        },
        {
          "avg_bikes": "3.8333",
          "avg_empty_stands": "23.1667",
          "hour": 13
        },
        {
          "avg_bikes": "5.3750",
          "avg_empty_stands": "21.6250",
          "hour": 14
        },
        {
          "avg_bikes": "6.8333",
          "avg_empty_stands": "20.1667",
          "hour": 15
        },
        {
          "avg_bikes": "3.0000",
          "avg_empty_stands": "24.0000",
          "hour": 16
        },
        {
          "avg_bikes": "3.0000",
          "avg_empty_stands": "24.0000",
          "hour": 17
        },
        {
          "avg_bikes": "1.7143",
          "avg_empty_stands": "25.2857",
          "hour": 18
        },
        {
          "avg_bikes": "2.0000",
          "avg_empty_stands": "25.0000",
          "hour": 19
        },
        {
          "avg_bikes": "1.2857",
          "avg_empty_stands": "25.7143",
          "hour": 20
        },
        {
          "avg_bikes": "0.2857",
          "avg_empty_stands": "26.7143",
          "hour": 21
        },
        {
          "avg_bikes": "0.0000",
          "avg_empty_stands": "27.0000",
          "hour": 22
        }
      ],
      "102": [
        {
          "avg_bikes": "15.0000",
          "avg_empty_stands": "25.0000",
          "hour": 10
        },
        {
          "avg_bikes": "11.1250",
          "avg_empty_stands": "28.8750",
          "hour": 11
        },
        {
          "avg_bikes": "9.1429",
          "avg_empty_stands": "30.8571",
          "hour": 12
        },
        {
          "avg_bikes": "8.3333",
          "avg_empty_stands": "31.6667",
          "hour": 13
        },
        {
          "avg_bikes": "7.5714",
          "avg_empty_stands": "32.4286",
          "hour": 14
        },
        {
          "avg_bikes": "7.5714",
          "avg_empty_stands": "32.4286",
          "hour": 15
        },
        {
          "avg_bikes": "4.0000",
          "avg_empty_stands": "36.0000",
          "hour": 16
        },
        {
          "avg_bikes": "4.2857",
          "avg_empty_stands": "35.7143",
          "hour": 17
        },
        {
          "avg_bikes": "5.4444",
          "avg_empty_stands": "34.5556",
          "hour": 18
        },
        {
          "avg_bikes": "6.6667",
          "avg_empty_stands": "33.3333",
          "hour": 19
        },
        {
          "avg_bikes": "6.3750",
          "avg_empty_stands": "33.6250",
          "hour": 20
        },
        {
          "avg_bikes": "6.0000",
          "avg_empty_stands": "34.0000",
          "hour": 21
        },
        {
          "avg_bikes": "6.0000",
          "avg_empty_stands": "34.0000",
          "hour": 22
        }
      ]
    }
  }    