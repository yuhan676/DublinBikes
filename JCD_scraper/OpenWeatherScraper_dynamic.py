import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
# from winfo import API_KEY, URL1, URL2
from db_config import db_type, username, password, hostname, port, db_name
import traceback
import datetime
# import winfo to securely attain key and url
from winfo import API_KEY, URL1, URL2

engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

API_KEY = "daf15fe5d6b088b90171f21de62933df"
URL1 = "https://api.openweathermap.org/data/2.5/weather"
URL2 = "https://api.openweathermap.org/data/2.5/forecast"
# function that inserts values to current weather table
def insert_current_weather():
    try:
        params = {'appid': API_KEY}
        response = requests.get(URL1, params)
        response.raise_for_status()
        weather_data = response.json()
        # Create an engine to connect to the default database
        sql = """
        INSERT INTO CurrentWeather (
            time_update,
            feels_like,
            temperature_min,
            temperature_max,
            weather_description,
            wind_speed,
            wind_gust
        ) VALUES (
            :time_update,
            :feels_like,
            :temperature_min,
            :temperature_max,
            :weather_description,
            :wind_speed,
            :wind_gust
        ) ON DUPLICATE KEY UPDATE
            feels_like = VALUES(feels_like),
            temperature_min = VALUES(temperature_min),
            temperature_max = VALUES(temperature_max),
            weather_description = VALUES(weather_description),
            wind_speed = VALUES(wind_speed),
            wind_gust = VALUES(wind_gust)
        """

        with engine.connect() as connection:
            transaction = connection.begin()
            try:
                for data in weather_data:
                    values_to_insert = {
                        'time_update': datetime.datetime.utcfromtimestamp(data['dt']).strftime('%Y-%m-%d %H:%M:%S'),
                        'feels_like': data['feels_like'],
                        'temperature_min': data['main']['temp_min'],
                        'temperature_max': data['main']['temp_max'],
                        'weather_description': data['weather'][0]['description'],
                        'wind_speed': data['wind']['speed'],
                        'wind_gust': data.get('wind_gust', 0)
                    }
                    connection.execute(text(sql), values_to_insert)
                
                transaction.commit()
                print("Current Weather data inserted successfully")
            except:
                transaction.rollback()
                raise
    except requests.RequestException as e:
        print(f"Error fetching CurrentWeather data: {e}")
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        print(traceback.format_exc())

# function that inserts values to extreme weather table
def insert_extreme_weather():
    try:
        params = {'appid': API_KEY}
        response = requests.get(URL2, params)
        response.raise_for_status()
        weather_data = response.json()

        sql = """
        INSERT INTO ExtremeWeather (
            time_update,
            temp_min,
            temp_max,
            wind_speed,
            gust_speed,
            rain_3h
        ) VALUES (
            :time_update,
            :temp_min,
            :temp_max,
            :wind_speed,
            :gust_speed,
            :rain_3h
        ) ON DUPLICATE KEY UPDATE
            temp_min = VALUES(temp_min),
            temp_max = VALUES(temp_max),
            wind_speed = VALUES(wind_speed),
            gust_speed = VALUES(gust_speed),
            rain_3h = VALUES(rain_3h)
        """

        with engine.connect() as connection:
            transaction = connection.begin()
            try:
                for data in weather_data:
                    values_to_insert = {
                        'time_update': datetime.datetime.utcfromtimestamp(data['dt']).strftime('%Y-%m-%d %H:%M:%S'),
                        'temp_min': data['main']['temp_min'],
                        'temp_max': data['main']['temp_max'],
                        'wind_speed': data['wind']['speed'],
                        'gust_speed': data.get('wind', {}).get('gust', 0),
                        'rain_3h': data.get('rain', {}).get('3h', 0)
                    }
                    connection.execute(text(sql), values_to_insert)
                
                transaction.commit()
                print("Extreme Weather data inserted successfully")
            except:
                transaction.rollback()
                raise
    except requests.RequestException as e:
        print(f"Error fetching Extreme Weather  data: {e}")
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        print(traceback.format_exc())

# function that inserts values to five day prediction table
def insert_five_day_prediction():
    try:
        params = {'appid': API_KEY}
        response = requests.get(URL2, params)
        response.raise_for_status()
        weather_data = response.json()

        sql = """
        INSERT INTO FiveDayPrediction (
            time_update,
            temp_min,
            temp_max,
            wind_speed,
            gust,
            rain_3h
        ) VALUES (
            :time_update,
            :temp_min,
            :temp_max,
            :wind_speed,
            :gust,
            :rain_3h
        ) ON DUPLICATE KEY UPDATE
            temp_min = VALUES(temp_min),
            temp_max = VALUES(temp_max),
            wind_speed = VALUES(wind_speed),
            gust = VALUES(gust),
            rain_3h = VALUES(rain_3h)
        """

        with engine.connect() as connection:
            transaction = connection.begin()
            try:
                for data in weather_data['list']:
                    values_to_insert = {
                        'time_update': datetime.datetime.utcfromtimestamp(data['dt']).strftime('%Y-%m-%d %H:%M:%S'),
                        'temp_min': data['main']['temp_min'],
                        'temp_max': data['main']['temp_max'],
                        'wind_speed': data['wind']['speed'],
                        'gust': data.get('wind', {}).get('gust', 0),
                        'rain_3h': data.get('rain', {}).get('3h', 0)
                    }
                    connection.execute(text(sql), values_to_insert)
                
                transaction.commit()
                print("Five Day Prediction data inserted successfully")
            except:
                transaction.rollback()
                raise
    except requests.RequestException as e:
        print(f"Error fetching Five Day Prediction: {e}")
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        # Print the traceback information
        print(traceback.format_exc())

# Run the main function, when the script is executed
def main():
    try:
        
        insert_current_weather()
        insert_extreme_weather()
        insert_five_day_prediction()
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        # using traceback for additional information about the stack trace, which can be helpful for debugging and understanding the context of the error.
        print(traceback.format_exc())

if __name__ == "__main__":
    main()

