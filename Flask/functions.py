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
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from db_config import db_type,username,password,hostname,port,db_name
from geopy.distance import geodesic

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
        try:
            if engine is not None:
                query = "SELECT name FROM station;"  # Selects all the station names from JCD Static (station table)
                df = pd.read_sql(query, engine)
                return df['name'].tolist()
            else:
                print('DB connection failed')
                return []
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
            # Severe weather conditions are taken from Met Eireann official website. 
            # https://www.met.ie/cms/assets/uploads/2020/04/Severe-weather-chart.pdf
            if wind_speed > 80 or gust_speed > 130 or rain_3h > 50 or temp_min < -10 or temp_max > 30:
                return True  # Extreme weather conditions met

        return False  # Extreme weather conditions not met

    except FileNotFoundError as e:
        print("Error loading weather data:", e)
        return False  # Unable to load weather data, assume no extreme weather

#Following 3 functions are for producing the 1-to-5 station mapping.
def fetch_stations_coordinates():
    """
    Fetches stations's number, name, longitude and lattitude from the database using a direct SQL query.
    Returns a dataframe with columns that match the database schema.
    """
    engine = connect_db()
    if engine is not None:
        query = """
        SELECT 
            number, name, position_lat, position_lng
        FROM 
            station;
        """
        df = pd.read_sql(query, engine)
        return df
    else:
        print('DB connection failed')
        return None
    
def calculate_distances(stations):
    """
    Calculates the closest five stations for each station.
    Returns a dictionary with station names as keys and a list of the closest station numbers as values.
    """
    closest_stations = {}
    for _, station in stations.iterrows():
        station_coords = (station['position_lat'], station['position_lng'])
        distances = stations.apply(lambda x: geodesic(station_coords, (x['position_lat'], x['position_lng'])).km, axis=1)
        stations['distance'] = distances
        sorted_stations = stations.sort_values(by='distance').head(5)  # Including itself, 5 stations
        closest_numbers = sorted_stations['number'].tolist()
        closest_stations[station['name']] = closest_numbers
    return closest_stations

def save_mapping_to_json(data, filename='1_to_5_Mapping.json'):
    """
    Saves the mapping of stations to their closest stations in a JSON file.
    """
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def save_weather_to_json(data, filename='weather_data.json'):
    """
    Saves the weather data to a JSON file.
    """
    try:
        # Convert Timestamp columns to strings
        data_str = data.copy()
        for col in data_str.columns:
            if pd.api.types.is_datetime64_any_dtype(data_str[col]):
                data_str[col] = data_str[col].dt.strftime('%Y-%m-%d %H:%M:%S')

        # Save the modified DataFrame to JSON
        data_str.to_json(filename, orient='records')
        print("Weather data saved to", filename)
    except Exception as e:
        print("Error saving weather data:", e)


def fetch_weather_data():
    """
    Fetches weather data from the CurrentWeather table in the database.
    Returns a list of dictionaries where each dictionary represents a row of weather data.
    """
    engine = connect_db()
    if engine is not None:
        try:
            query = "SELECT * FROM CurrentWeather"
            df = pd.read_sql(query, engine)
            # Convert DataFrame to list of dictionaries
            weather_data = df.to_dict(orient='records')
            return weather_data
        except Exception as e:
            print("Error fetching weather data:", e)
            return None
    else:
        print('DB connection failed')
        return None



