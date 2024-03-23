from flask import Flask, jsonify, request, render_template
from sqlalchemy import create_engine, text
from functions import connect_db, get_station_names, fetch_dummy_data
import json
import os
import traceback 
from json.decoder import JSONDecodeError


app = Flask(__name__, static_url_path='')
app.config.from_object('config')

connect_db()

dummy_data1 = {
    "list": [
        {
            "wind": {
                "speed": 85,
                "gust": 140
            },
            "rain": {
                "3": 60
            },
            "main": {
                "temp_min": -15,
                "temp_max": 35
            }
        }
    ]

}
@app.route('/root')
def hello_world():
    # return 'hello world'
    return render_template("index.html")

# Associate database json station data with Google map
@app.route('/bike_stations')
def get_bike_stations():
    try:
        # Fetch data from the 'station_status' table
        station_status_data = fetch_dummy_data('station_status')

        # Check if data is fetched successfully
        if station_status_data is not None:
            # Return the fetched data as JSON response
            return jsonify(station_status_data)
        else:
            return jsonify(error='Failed to fetch station status data from the database')

    except Exception as e:
        return jsonify(error=str(e))
    
@app.route('/weather_data')
def get_weather_data():
    try:
        weather_data = fetch_dummy_data('CurrentWeather')
        if weather_data is not None:
            return jsonify(weather_data)
        else:
            return jsonify(error='Failed to fetch weather data from the database')
    except Exception as e:
        return jsonify(error=str(e))

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
    
# still working on this     
# @app.route('/search_list_5')

@app.route('/fetch_extreme_weather')
def fetch_extreme_weather():
    try:
        # Return extreme weather conditions from the dummy data dictionary
        return jsonify(extreme_conditions_met=dummy_data1)
    except Exception as e:
        return jsonify(error=str(e))

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
        
        if not station_numbers:
            return jsonify(message='No matching stations found!'), 500
        
        engine = connect_db()
        connection = engine.connect()

        results = []
        for number in station_numbers:
            # Use a parameterized query to safely fetch data from both tables
            query = text("""
                SELECT s.number, s.name, s.address, s.banking, s.bonus, s.position_lat, s.position_lng, 
                       ss.status, ss.last_update, ss.empty_stands_number, ss.total_bikes, 
                       ss.mechanical_bikes, ss.electrical_internal_battery_bikes, ss.electrical_removable_battery_bikes
                FROM station s
                JOIN station_status ss ON s.number = ss.station_number
                WHERE s.number = :number
            """)
            result = connection.execute(query, {"number": number}).fetchone()
            if result:
                results.append({
                    'number': result.number,
                    'name': result.name,
                    'address': result.address,
                    'banking': result.banking,
                    'bonus': result.bonus,
                    'position': {'lat': result.position_lat, 'lng': result.position_lng},
                    'status': result.status,
                    'last_update': result.last_update.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                    'empty_stands_number': result.empty_stands_number,
                    'total_bikes': result.total_bikes,
                    'mechanical_bikes': result.mechanical_bikes,
                    'electrical_internal_battery_bikes': result.electrical_internal_battery_bikes,
                    'electrical_removable_battery_bikes': result.electrical_removable_battery_bikes
                })
        
        if len(results) == 0:
            return jsonify(message='No data found for closest stations'), 500
        connection.close()
        return jsonify(results)
    
    except JSONDecodeError as jde:
        # Specific error handling for JSON decoding errors
        app.logger.error(f"Error decoding JSON from mapping file: {jde}")
        return jsonify(error="Error processing mapping file."), 500

    except FileNotFoundError:
        # Specific error when the mapping file is not found
        app.logger.error(f"Mapping file not found for station search: {stationName}")
        return jsonify(error="Mapping file not found."), 500

    except Exception as e:
        # Catch-all for any other exceptions that were not caught by the specific handlers
        app.logger.error(f"Unhandled exception in /search route for station '{stationName}': {e}\n{traceback.format_exc()}")
        return jsonify(error="An unexpected error occurred."), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)



