from flask import Flask, jsonify, request, render_template
from sqlalchemy import create_engine, text
from functions import connect_db, get_station_names, fetch_dummy_data
import json
import os
import traceback 

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

# function to fetch 5 closest rent, return and rent&return option stations to display
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
        with open('dummy_JCDStatic.json', 'r') as f:
            station_data = json.load(f)
        for station, data in station_data.items():
            if station.lower().startswith(stationName.lower()):
                results.append({
                    'station': station,
                    'available_bikes': data['available_bikes']
                })
                if len(results) == 5:  # Limit to 5 closest options
                    break
        if len(results) == 0:
            return jsonify(message='No matching stations found!'),500
        return jsonify(results)
    except Exception as e:
        return jsonify(error=str(e))
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)



