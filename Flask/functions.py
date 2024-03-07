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
from db_config import db_type,username,password,hostname,port,db_name
# create flask app, static files for static directory
# app = Flask(__name__, static_url_patj='')
# app.config.from_object('config')

def connect_db():
    try:
        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')
        return engine
    except Exception as exc:
        print(exc)
        # Print traceback for detailed error information
        tb.print_exc() 
        return None
    
def fetch_dummy_data(table_name):
    """
    Connects to the database, fetches 100 rows from the desired table,
    and returns the result as JSON.
    """
    engine = connect_db()
    if engine is not None:
        query = f"SELECT * FROM {table_name} LIMIT 100;"  # This just pulls 100 rows 
        df = pd.read_sql(query, engine)
        return df.to_json(orient='records')
    else:
        print('DB connection failed')
        return None

def write_json_to_file(data, file_name='data.json'):
    """
    Writes the provided JSON data to a file.
    """
    if data is not None:
        with open(file_name, 'w') as file:
            file.write(data)

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

def fetch_openweather_extreme(json_file):
    try:
        # Load the weather data from the provided JSON file
        with open(json_file, 'r') as file:
            data = json.load(file)

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

    except FileNotFoundError as e:
        print("Error loading weather data:", e)
        return False  # Unable to load weather data, assume no extreme weather


