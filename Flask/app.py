from flask import Flask, jsonify, request, render_template, url_for, send_from_directory
from sqlalchemy import create_engine, text
from functions import connect_db, get_station_names, fetch_openweather_extreme
import json
import os
import traceback 

app = Flask(__name__, static_url_path='')
app.config.from_object('config')

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
# Connect json station data with google map
@app.route('/bike_stations')
def get_bike_stations():
    try:
        # Access the dictionary directly
        station_data = tables_to_files['station']
        return jsonify(station_data)
    except Exception as e:
        return jsonify(error=str(e))
    
@app.route('/root')
def hello_world():
    # return 'hello world'
    return render_template("index.html")

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


"""# @app.route('/about')
# def about():
    # an about page
    # google maps key below
    # render template is a flask function to call html document
    # return render_template("index.html")
    # GMAPS_APIKEY='AIzaSyBfrNOzVJuGJnSUSCtzH6T32OZLNOWJ9_M')
"""

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)



