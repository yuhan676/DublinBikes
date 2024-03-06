from flask import Flask, render_template
import pandas as pd
import matplotlib as mp
import requests
import sqlalchemy as sqla
import datetime as dt
import numpy as mp
import sys
import os
import traceback as tb
import json
# import seaborn as sns
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import requests
from winfo import API_KEY, URL2
# # create flask app, static files for static directory
# app = Flask(__name__, static_url_patj='')
# app.config.from_object('config')

def connect_db(hostname, username, password, port, default_db, db_name):
    #!!remember to move these credentials out before submitting!!
    db_type = 'mysql'  # Change to 'mysql' for MySQL/MariaDB
    username = 'admin'
    password = 'DublinBike2024%'
    hostname = 'database-dublinbike.c1g2mg4aerll.eu-north-1.rds.amazonaws.com'
    port = '3306'  # Use '3306' for MySQL/MariaDB
    default_db = 'mysql'  # Use 'mysql' for MySQL/MariaDB
    db_name = 'dublinbike_db'
    
    try:
        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')
        return engine
    except Exception as exc:
        print(exc)
        # Print traceback for detailed error information
        tb.print_exc() 
        return None

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database(host, username, password, port)
    return db

def get_station_names(engine):
        sql = "SELECT name FROM station;"
        try:
            with engine.connect() as conn:
                result = conn.execute(sql)
                # Fetch all the results and extract the 'name' column into a list
                station_names = [row['name'] for row in result.fetchall()]
                return station_names
        except Exception as e:
            print(f"An error occurred: {tb.format_exc()}")
            return []

# Function to fetch weather data and determine extreme weather conditions
def fetch_openweather_extreme():
    # Fetch the URL from winfo 
    url = URL2

    # Parameters for the API request
    params = {
        "q": "Dublin.ie",
        "appid": API_KEY,
        "units": "metric"
    }

    try:
        # Get request to the OpenWeather API
        response = requests.get(url, params=params)
        response.raise_for_status()

        # Parse the JSON response into a Python dictionary
        data = response.json()

        # Logic to determine extreme weather conditions
        for forecast in data["list"]:
            wind_speed = forecast["wind"]["speed"]
            gust_speed = forecast["wind"].get("gust", 0)
            rain_3h = forecast.get("rain", {}).get("3", 0)
            temp_min = forecast["main"]["temp_min"]
            temp_max = forecast["main"]["temp_max"]

            # Check for specific extreme weather conditions
            if wind_speed > 80 or gust_speed > 130 or rain_3h > 50 or temp_min < -10 or temp_max > 30:
                return True  # Extreme weather conditions met

        return False  # Extreme weather conditions not met

    except requests.exceptions.RequestException as e:
        print("Error fetching weather data:", e)
        return False  # Unable to fetch weather data, assume no extreme weather




