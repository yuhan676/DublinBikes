from flask import Flask, render_template
import pandas as pd
import matplotlib as mp
import requests
import sqlalchemy as sqla
import datetime as dt
import numpy as np
import traceback as tb
import json
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from db_config import db_type,username,password,hostname,port,db_name
from geopy.distance import geodesic
import traceback
import pickle

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

# Define a function to fetch data from the database and return it as JSON
def fetch_weather_data_database(query):
    try:
        engine = connect_db()
        connection = engine.connect()

        result = connection.execute(query)
        row = result.fetchone()  # Fetch one row from the result

        # If row exists, convert it to a dictionary
        if row:
            weather_data = [dict(row)]
        else:
            weather_data = []

        connection.close()  # Close the database connection
        return weather_data

    except Exception as e:
        traceback.print_exc()  # Log the exception traceback
        return None, str(e)  # Handle any exceptions

def predict_station_status(stationNum, input):
    numpyInput = np.array(input)

    # Load model from the pickle file
    with open(str(stationNum) + '_output_data.pickle', 'rb') as file:
        model = pickle.load(file)
    
    # Predict!
    output = model.predict(numpyInput)

    # [0] because output format is a list within a list
    return output[0]






