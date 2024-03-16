from flask import Flask, jsonify, request, render_template, url_for
from sqlalchemy import create_engine, text
import traceback
from functions import connect_db, get_station_names, fetch_openweather_extreme
import os
import json
# from pull_dummy import tables_to_files
# from functions import connect_db, fetch_dummy_data, write_json_to_file

app = Flask(__name__, static_url_path='')
app.config.from_object('config')
'''
# temporary dummy data to create function to display 5 station suggestions on the left hand panel
dummy_data = {
    "Station 1": {"available_bikes": 8},
    "Station 2": {"available_bikes": 5},
    "Station 3": {"available_bikes": 10},
    "Station 4": {"available_bikes": 3},
    "Station 5": {"available_bikes": 6}
}
'''
tables_to_files = {
    'station': 'dummy_JCDStatic.json',
    'station_status': 'dummy_JCDDynamic.json',
    'CurrentWeather': 'dummy_WeaCurrent.json',
    'FiveDayPrediction': 'dummy_WeaPredict.json',
    'ExtremeWeather': 'dummy_WeaExtreme.json'
    }
# Dummy data to display extreme weather pop up
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
    query = request.args.get('query')
    results = []
    try:
        with open('dummy_JCDStatic.json', 'r') as f:
            station_data = json.load(f)
        for station, data in station_data.items():
            if station.lower().startswith(query.lower()):
                results.append({
                    'station': station,
                    'available_bikes': data['available_bikes']
                })
                if len(results) == 5:  # Limit to 5 closest options
                    break
        return jsonify(results)
    except Exception as e:
        return jsonify(error=str(e))

"""
@app.route('/current_weather')
def current_weather():
    # function that returns current weather
    # returns json and weather icon
    pass

@app.route('/five_day_weather_forecast')
def five_day_weather_forecast():
    # function that returns weather forecast
    # returns json weather forecast
    # result=five_day_weather_forecast(host=myhost,user=myuser,password=mypassword,port=myport,db=mydb)
    pass

@app.route('/extreme_weather')
def extreme_weather():
    # function that returns extreme weather forecast
    # returns a notification of severe weather
    pass

"""# @app.route('/about')
# def about():
    # an about page
    # google maps key below
    # render template is a flask function to call html document
    # return render_template("index.html")
    # GMAPS_APIKEY='AIzaSyBfrNOzVJuGJnSUSCtzH6T32OZLNOWJ9_M')
"""
@app.route('/home')
@app.route('/index')
def home():
    # get db connection
    # return app.send_static_file('contact.html')
    # return app.send_static_file('index.html')
    # http://mybikeapp.com/
    # http://mybikeapp.com/contact
    # http://mybikeapp.com/stations
    # function for station data
    # dataframe into the json
    # load jsn into the front end
    pass

# bind hmtl with route decorator
@app.route('/user')
def user():
    # return app.send_static_file('placeholder.hmtl')
    pass

# this will be connected to db
@app.route('/station/<int:station_id>')
def station(station_id):
    # create engine, look up from other code
    # print('calling stations')
    # engine = get_engine()
    # df = pd.read_sql_table("station", engine)
    # conn = get_db()
    # https://docs.python.org/2/library/sqlite3.html#sqlite3.Row
    # returns the json station data
    # turns to json
    # http://mybikeapp.com/statiom?12
    # show the station with the given id, the id is the integer
    # return f'Retrieving info for Station: {station_id}'
    # for loop to run via the stations dict
    pass

@app.route('/availability')
def availability():
    # function that returns the dataframe of the station and availability data
    pass

@app.route('/hourly_station_availability')
def hourly_station_availability():
    # returns hourly station availability
    pass

@app.route('/weekly_station_availability')
def weekly_station_availability():
    # returns weekly station availability
    pass

# multiple functions with variations of return data
# have to decide what station data will be displayed

@app.teardown_appcontext
def close_connection(exception):
    # exception handling for db connection failure
    # db = getattr(g, '_database', None)
    # if db is not None:
        # db.close()
    pass
"""

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)



