from flask import Flask, render_template 
# import also files, jsonify etc
import pandas as pd
import datetime as dt

# app.config.from_object('config')

@app.route('/')
def hello_world():
    # debug page to confirm does the flask app fucntion
    # return 'Hello world!'
    pass

@app.route('/about')
def about():
    # an about page
    # return render_template('about.html', MAPS_APIKEY=app.config["MAPS_APIKEY"])
    pass

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

@app.route('/hourly_station_availability')
def hourly_station_availability():
    # returns hourly station availability

@app.route('/weekly_station_availability')
def weekly_station_availability():
    # returns weekly station availability
    pass

# multiple functions with variations of return data
# have to decide what station data will be displayed

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
    pass

@app.route()
def __main__():
    if __name__ == '__main__':
        app.run(debug=True, host="0.0.0.0", port=5000)
# create a test function to test the functionality of the web page and various queries
# app.run(debug=True)

