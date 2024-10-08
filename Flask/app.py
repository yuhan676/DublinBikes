from flask import Flask, jsonify, request, render_template
from sqlalchemy import create_engine, text
from functions import connect_db, get_station_names, fetch_weather_data_database, predict_station_status
import json
import traceback 
from json.decoder import JSONDecodeError
import pandas as pd
import numpy
from haversine import haversine
from sqlalchemy.exc import SQLAlchemyError


app = Flask(__name__, static_url_path='')
app.config.from_object('config')

connect_db()

@app.route('/')
def hello_world():
    # return 'hello world'
    return render_template("index.html")

@app.route('/weather_data', methods=['GET'])
def get_weather_data():
    try:
        # Call connect_db to get the SQLAlchemy Engine object
        engine = connect_db()
        connection = engine.connect()

        # Select from 'CurrentWeather' table name
        query = text("""
                SELECT cw.feels_like, cw.temperature_min, cw.temperature_max, cw.weather_description,
                cw.wind_speed, cw.wind_gust, cw.time_update
                FROM CurrentWeather cw
                ORDER BY cw.time_update DESC
                LIMIT 1
            """)
      
        result = connection.execute(query)
        row = result.fetchone()

        # If row exists, convert it to a dictionary
        if row:
            weather_data = [dict(row)]
        else:
            weather_data = []

        connection.close()
        return jsonify(weather_data)

    except Exception as e:
        traceback.print_exc()
        app.logger.error('Error fetching weather data:', e)
        traceback.print_exc()
        return jsonify(error=str(e)), 500
    
@app.route('/prediction_weather', methods=['GET'])
def fetch_prediction_weather_route():
    # Get the timestamp from the request parameters
    timestamp = request.args.get('timestamp')
    try:
        return jsonify(fetch_prediction_weather(timestamp))
    except ValueError as ve:
        # Handle the case where the timestamp format is incorrect
        app.logger.error('Error parsing timestamp:', ve)
        return jsonify(error="Invalid timestamp format. Please provide the timestamp in the format 'YYYY-MM-DD HH:MM:SS'."), 400

    except SQLAlchemyError as sqle:
        # Handle SQLAlchemy errors (e.g., database connectivity issues, SQL syntax errors)
        app.logger.error('SQLAlchemy error:', sqle)
        return jsonify(error="An error occurred while querying the database."), 500

    except Exception as e:
        app.logger.error('Error fetching weather prediction data:', e)
        return jsonify(error=str(e)), 500

# This function should only be called within a Try block
def fetch_prediction_weather(timestamp):
    # Parse the timestamp into a datetime object
    # selected_time = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    selected_time = timestamp[1:-6].replace("T", " ")

    # Call connect_db to get the SQLAlchemy Engine object
    engine = connect_db()
    connection = engine.connect()

    # Query the weather prediction data closest to the selected timestamp
    query = text("""
        SELECT temp_min, temp_max, wind_speed, gust, rain_3h, time_update
        FROM FiveDayPrediction
        WHERE time_update <= :selected_time
        ORDER BY time_update DESC
        LIMIT 1
    """)
    
    result = connection.execute(query, {"selected_time": selected_time})
    row = result.fetchone()

    # If a row exists, convert it to a dictionary
    if row:
        weather_data = dict(row)
        # Replace "NaN" and "undefined" values with "Not Available"
        for key in weather_data:
            if weather_data[key] == "NaN" or weather_data[key] == "undefined":
                weather_data[key] = "Not Available"
    else:
        weather_data = {}

    connection.close()
    return weather_data


@app.route('/five_day_prediction', methods=['GET'])
def fetch_five_day_prediction():
    try:
        # Call connect_db to get the SQLAlchemy Engine object
        engine = connect_db()
        connection = engine.connect()

        query = text("""
            SELECT fp.temp_min, fp.temp_min, fp.wind_speed, 
            fp.gust, fp.rain_3h, fp.time_update
            FROM FiveDayPrediction fp
            ORDER BY fp.time_update DESC
            LIMIT 1
        """)
        result = connection.execute(query)
        row = result.fetchone()

        # If row exists, convert it to a dictionary
        if row:
            weather_data = [dict(row)]
            # Replace "NaN °C" and "undefined" values with "Not Available"
            for key in weather_data[0]:
                if key.startswith('temp') and weather_data[0][key] == "NaN °C":
                    weather_data[0][key] = "Not Available"
                elif weather_data[0][key] == "undefined":
                    weather_data[0][key] = "Not Available"
        else:
            weather_data = []

        connection.close()
        return jsonify(weather_data)

    except Exception as e:
        traceback.print_exc()
        app.logger.error('Error fetching weather data:', e)
        return jsonify(error=str(e)), 500

@app.route('/fetch_extreme_weather', methods=['GET'])
def fetch_extreme_weather():
    try:
        # Check if the 'trigger' parameter is present in the request query string
        # trigger is lowercase "p" on the keyboard. Popup can be closed by clicking outside of it or from the x on the top right hand corner
        trigger = request.args.get('trigger')

        # If 'trigger' is present and its value is 'true', return dummy data
        # dummy data is generated based on Met Eireann extreme weather classification to trigger the extreme weather pop up
        # when conditions of the database data are not met, to demonstrate how the function operates in frontend when the 
        # actual database doesn't meet Met Eireann extreme weather conditions
        if trigger == 'true':
            dummy_data1 = {
                "list": [
                    {
                        "wind": {
                            "speed": 80,
                            "gust": 130
                        },
                        "rain": {
                            "3": 50
                        },
                        "main": {
                            "temp_min": -10,
                            "temp_max": 30
                        }
                    }
                ]
            }
            
            return jsonify(dummy_data1)

        else:
            # If 'trigger' is not 'true', fetch and return real data from the database
            engine = connect_db()
            connection = engine.connect()
            # generated ExtremeWeather table uses fivedayprediction OpenWeather API, and is created for specific purpose of 
            # generating severe weather predictions
            query = text("""
                SELECT ew.temp_max, ew.temp_min, ew.wind_speed,
                ew.rain, ew.time_update
                FROM ExtremeWeather ew
                ORDER BY ew.time_update DESC
                LIMIT 1
            """)
            
            result = connection.execute(query)
            row = result.fetchone()

            # If row exists, convert it to a dictionary
            if row:
                weather_data = [dict(row)]
            else:
                weather_data = []

            connection.close()

            # Logic to determine extreme weather conditions
            for forecast in weather_data:
                wind_speed = forecast["wind_speed"]
                rain_3h = forecast.get("rain", 0)
                temp_min = forecast["temp_min"]
                temp_max = forecast["temp_max"]

                # Check for specific extreme weather conditions 
                # Severe weather conditions are taken from Met Eireann official website. 
                # https://www.met.ie/cms/assets/uploads/2020/04/Severe-weather-chart.pdf
                if (wind_speed > 130 or rain_3h > 50 or temp_min < -10 or temp_max > 30):
                    return jsonify(True)  # Extreme weather conditions met

            return jsonify(False)  # Extreme weather conditions not met

    except FileNotFoundError as e:
        print("Error loading weather data:", e)
        traceback.print_exc()
        return jsonify(False)  # Unable to load weather data, assume no extreme weather

# Read the static station data downloaded from JCDecaux, compute the closest station and return the station name
STATIONS_CSV = 'Static_dublin.csv'

@app.route('/closest_station', methods=['POST'])
def closest_station():
    data = request.get_json()
    user_lat = data['latitude']
    user_lng = data['longitude']

    # Load the station data
    stations = pd.read_csv(STATIONS_CSV)

    # Find the closest station
    min_distance = float('inf')
    closest_station = None
    for _, station in stations.iterrows():
        distance = haversine((user_lat, user_lng), (station['Latitude'], station['Longitude']))
        if distance < min_distance:
            min_distance = distance
            closest_station = station['Name']

    return jsonify(closest_station=closest_station.title())

# provide suggestion for station names based on user's input of station name
@app.route('/suggest_stations')
def suggest_stations():
    term = request.args.get('term', '').lower()
    try:
        engine = connect_db()
        STATIONS = get_station_names(engine)
        suggestions = [station.title() for station in STATIONS if station.lower().startswith(term)]
        return jsonify(suggestions)
    except Exception as e:
        app.logger.error('Error in suggest_stations: %s', e)
        return jsonify([])

# function to fetch the closest 5 stations' data and return 1) if action is rent 2) time of interest 3) packaged 5-station info
# into a json file 
@app.route('/search', methods=['GET'])
def search():
    # boolean: is this for rent?
    isRent = request.args.get('isRent')
    # strip() removes leading and trailing whitespace
    stationName = request.args.get('stationName').strip()
    # format: YYYY-MM-DDTHH:MM:SS.MMMZ
    date = request.args.get('date')
    withinOpeningHours = (request.args.get('withinOpeningHours') == "true")
    isNow = request.args.get('isNow')

    results = []
    try:
        with open('1_to_5_Mapping.json', 'r') as f:
            station_data = json.load(f)
        
        station_numbers = []
        # First, find the station numbers directly if the station name matches exactly
        if stationName in station_data:
            station_numbers = station_data[stationName]
        else:
            # If not found, attempt to find a station starting with the given name
            for station, numbers in station_data.items():
                if station.lower().startswith(stationName.lower()):
                    station_numbers = numbers
                    break
        
        engine = connect_db()
        connection = engine.connect()

        for number in station_numbers:
            # Fetch the latest status for the station
            status_query = text("""
                SELECT ss.status, ss.last_update, ss.empty_stands_number, ss.total_bikes, 
                       ss.mechanical_bikes, ss.electrical_internal_battery_bikes, ss.electrical_removable_battery_bikes
                FROM station_status ss
                WHERE ss.station_number = :number
                ORDER BY ss.last_update DESC
                LIMIT 1
            """)
            status_result = connection.execute(status_query, {"number": number}).fetchone()
            
            if status_result:
                # Fetch the corresponding station details
                station_query = text("""
                    SELECT number, name, address, banking, bonus, position_lat, position_lng
                    FROM station
                    WHERE number = :number
                """)
                station_result = connection.execute(station_query, {"number": number}).fetchone()
                
                if station_result:
                    # Combine the details into one dictionary and append to results
                    combined_result = {
                        'number': station_result.number,
                        'name': station_result.name,
                        'address': station_result.address,
                        'banking': station_result.banking,
                        'bonus': station_result.bonus,
                        'position': {'lat': station_result.position_lat, 'lng': station_result.position_lng},
                        'status': status_result.status,
                        'last_update': status_result.last_update.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                        'empty_stands_number': status_result.empty_stands_number,
                        'total_bikes': status_result.total_bikes,
                        'mechanical_bikes': status_result.mechanical_bikes,
                        'electrical_internal_battery_bikes': status_result.electrical_internal_battery_bikes,
                        'electrical_removable_battery_bikes': status_result.electrical_removable_battery_bikes,
                        'is_now':isNow
                    }
                    results.append(combined_result)

        connection.close()
        if not results:
            return jsonify(message='No data found for closest stations'), 404
        
        if isNow == "true":
            return jsonify(results)
        else:
            # We need a prediction! Fetch and replace within results.
            weatherData = fetch_prediction_weather(date)
            tempMin = float(weatherData['temp_min'])
            tempMax = float(weatherData['temp_max'])
            feelsLike = (tempMin + tempMax)/2
            weatherInput = [[feelsLike, tempMin, tempMax, float(weatherData['wind_speed']), float(weatherData['gust'])]]
            
            counter = 0
            for number in station_numbers:
                realTotalBikes = results[counter]['total_bikes'] + results[counter]['empty_stands_number']
                prediction = predict_station_status(number, weatherInput)
                
                # Detect crazy predicted values. Negative is crazy, and so is any number bigger than the current
                # total number of bike slots
                correctCrazyValues = False
                for num in prediction:
                    if (num < 0) or (num > realTotalBikes):
                        correctCrazyValues = True
                        break

                # Handling extreme values predicted by linear regression model
                if correctCrazyValues:
                    # Since I cannot assume the extreme values to have any worth or bearing on truth, let's
                    # use their relative fractions to generate some correct-looking values
                    elein_bike = abs(prediction[0])
                    mec_bike = abs(prediction[1])
                    elerem_bike = abs(prediction[2])
                    emt_stand = abs(prediction[3])
                    predCrazyTotal = elein_bike + mec_bike + elerem_bike + emt_stand

                    # This way each value becomes a fraction relative to the crazy total (predCrazyTotal) which
                    # is then multiplied against the known total number of bike stands for this station from
                    # the current data
                    elein_bike = (elein_bike/predCrazyTotal) * realTotalBikes
                    mec_bike = (mec_bike/predCrazyTotal) * realTotalBikes
                    elerem_bike = (elerem_bike/predCrazyTotal) * realTotalBikes
                    emt_stand = (emt_stand/predCrazyTotal) * realTotalBikes

                    # Put them back like nothing happened...
                    prediction[0] = elein_bike
                    prediction[1] = mec_bike
                    prediction[2] = elerem_bike
                    prediction[3] = emt_stand

                # Do this no matter if the predictions are crazy, because the number of total bikes
                # should always be the sum of the three bike types
                # int() here to make sure the total matches the bike numbers
                prediction[4] = int(prediction[0]) + int(prediction[1]) + int(prediction[2])
  
                results[counter]['electrical_internal_battery_bikes'] = int(prediction[0])
                results[counter]['mechanical_bikes'] = int(prediction[1])
                results[counter]['electrical_removable_battery_bikes'] = int(prediction[2])
                results[counter]['empty_stands_number'] = int(prediction[3])
                results[counter]['total_bikes'] = int(prediction[4])

                # Check and set if the station status should be closed or open
                if isRent and not withinOpeningHours:
                    results[counter]['status'] = "CLOSED"
                else:
                    results[counter]['status'] = "OPEN"

                counter += 1

            return jsonify(results)
    
    except JSONDecodeError as jde:
        # Specific error handling for JSON decoding errors
        app.logger.error(f"Error decoding JSON from mapping file: {jde}")
        return jsonify(error="Error processing mapping file."), 500

    except FileNotFoundError as e:
        # Specific error when the mapping file is not found
        app.logger.error(f"Pickle model not found for stations: {station_numbers, e}")
        return jsonify(error="Mapping file not found."), 500

    except Exception as e:
        # Catch-all for any other exceptions that were not caught by the specific handlers
        app.logger.error(f"Unhandled exception in /search route for station '{stationName}': {e}\n{traceback.format_exc()}")
        return jsonify(error="An unexpected error occurred."), 500


from datetime import datetime, timedelta

@app.route('/bike_station_data', methods=['GET'])
def bike_station_data():
    isRent = request.args.get('isRent')
    stationName = request.args.get('stationName').strip()
    date = request.args.get('date')

    results = []
    
    try:
        with open('1_to_5_Mapping.json', 'r') as f:
            station_data = json.load(f)
        
        station_numbers = []
        # First, find the station numbers directly if the station name matches exactly
        if stationName in station_data:
            station_numbers = station_data[stationName]
        else:
            # If not found, attempt to find a station starting with the given name
            for station, numbers in station_data.items():
                if station.lower().startswith(stationName.lower()):
                    station_numbers = numbers
                    break

        engine = connect_db()
        connection = engine.connect()

        results = []

        hourly_avg_data = {}
        daily_avg_data = {}


        query = """
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = :table_name;
        """

        # Replace 'your_table_name' with the name of your table
        params = {"table_name": "station_status"}

        results = connection.execute(text(query), params).fetchall()

        for result in results:
            print(result[0])

        
        # Calculate average hourly data for the previous day
        prev_day = datetime.now() - timedelta(days=1)
        for number in station_numbers:
            hourly_avg_query = text("""
                    SELECT HOUR(last_update) AS hour, AVG(total_bikes) AS avg_bikes, AVG(empty_stands_number) AS avg_empty_stands
                    FROM station_status
                    WHERE station_number = :number
                    AND DATE(last_update) = DATE(:date)
                    GROUP BY hour
                """)
            hourly_avg_results = connection.execute(hourly_avg_query, {"number": number, "date": prev_day}).fetchall()
            print(hourly_avg_results)

            hourly_avg_check = text("""
                    SELECT HOUR(last_update) AS hour, COUNT(*) AS count
                    FROM station_status
                    WHERE station_number = :number
                    AND DATE(last_update) = DATE(:date)
                    GROUP BY hour
                    ORDER BY hour;

                """)
            hourly_avg_results_check = connection.execute(hourly_avg_check, {"number": number, "date": prev_day}).fetchall()
            print(hourly_avg_results_check)



            hourly_avg_data[number] = [{'hour': hour, 'avg_bikes': avg_bikes, 'avg_empty_stands': avg_empty_stands} for hour, avg_bikes, avg_empty_stands in hourly_avg_results]

        # Calculate average daily data for the past 7 days
        for number in station_numbers:
                daily_avg_query = text("""
                    SELECT DATE(last_update) AS date, AVG(total_bikes) AS avg_bikes, AVG(empty_stands_number) AS avg_empty_stands
                    FROM station_status
                    WHERE station_number = :number
                    AND last_update >= DATE(:date - INTERVAL 7 DAY)
                    AND last_update <= DATE(:date)
                    GROUP BY date
                """)
                daily_avg_results = connection.execute(daily_avg_query, {"number": number, "date": datetime.now()}).fetchall()

                daily_avg_data[number] = [{'date': date.strftime('%Y-%m-%d'), 'avg_bikes': avg_bikes, 'avg_empty_stands': avg_empty_stands} for date, avg_bikes, avg_empty_stands in daily_avg_results]

        connection.close()

        print(hourly_avg_data)
        print(daily_avg_data)
        return jsonify({
            'hourly_avg_data': hourly_avg_data,
            'daily_avg_data': daily_avg_data
        })

    except FileNotFoundError:
        app.logger.error("Mapping file not found.")
        return jsonify(error="Mapping file not found."), 500

    # except Exception as e:
    #     app.logger.error(f"Unhandled exception in /bike_station_graph_data route: {e}\n{traceback.format_exc()}")
    #     return jsonify(error="An unexpected error occurred."), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)