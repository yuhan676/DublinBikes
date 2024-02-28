import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
# from winfo import API_KEY, URL1, URL2
from db_config import db_type, username, password, hostname, port, db_name
import traceback
import datetime
# import winfo to securely attain key and url
from winfo import API_KEY, URL1, URL2


# function that inserts values to current weather table
def print_current_weather():
    try:
        params = {'appid': API_KEY}
        response = requests.get(URL1, params)
        response.raise_for_status()
        weather_data = response.json()
        print(type(weather_data))
        print(weather_data)
        weather_data = response.json()
        print(type(weather_data))
        for data in weather_data:
            print(type(data))
            print(data)
    except requests.RequestException as e:
        print(f"Error fetching CurrentWeather data: {e}")
    
print_current_weather()
    