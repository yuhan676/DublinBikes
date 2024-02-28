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
        ) 
        """

        with engine.connect() as connection:
            transaction = connection.begin()
            try:
                time_update = datetime.datetime.utcfromtimestamp(weather_data['dt']).strftime('%Y-%m-%d %H:%M:%S')
                feels_like = weather_data['main']['feels_like']
                temp_min = weather_data['main']['temp_min']
                temp_max = weather_data['main']['temp_max']
                weather_description = weather_data['weather'][0]['description']
                wind_speed = weather_data['wind']['speed']
                wind_gust = weather_data['wind'].get('gust', 0)

                values_to_insert = {
                    'time_update': time_update,
                    'feels_like': feels_like,
                    'temperature_min': temp_min,
                    'temperature_max': temp_max,
                    'weather_description': weather_description,
                    'wind_speed': wind_speed,
                    'wind_gust': wind_gust
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
        ) 
        """
        if 'list' in weather_data and isinstance(weather_data['list'], list):
            with engine.connect() as connection:
                transaction = connection.begin()
                try:
                    for item in weather_data['list']:
                        time_update = datetime.datetime.utcfromtimestamp(item['dt']).strftime('%Y-%m-%d %H:%M:%S')
                        temp_min = item['main']['temp_min']
                        temp_max = item['main']['temp_max']
                        wind_speed = item['wind']['speed']
                        gust_speed = item.get('wind', {}).get('gust', 0)
                        rain_3h = item.get('rain', {}).get('3h', 0)

                        values_to_insert = {
                            'time_update': time_update,
                            'temp_min': temp_min,
                            'temp_max': temp_max,
                            'wind_speed': wind_speed,
                            'gust_speed': gust_speed,
                            'rain_3h': rain_3h
                        }
                        connection.execute(text(sql), values_to_insert)
                    
                    transaction.commit()
                    print("Extreme Weather data inserted successfully")
                except:
                    transaction.rollback()
                    raise
        else:
            print("Unexpected JSON structure")
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
        ) 
        """

        with engine.connect() as connection:
            transaction = connection.begin()
            try:
                
                values_to_insert = {
                    'time_update': datetime.datetime.utcfromtimestamp(weather_data['dt']).strftime('%Y-%m-%d %H:%M:%S'),
                    'temp_min': weather_data['main']['temp_min'],
                    'temp_max': weather_data['main']['temp_max'],
                    'wind_speed': weather_data['wind']['speed'],
                    'gust': weather_data.get('wind', {}).get('gust', 0),
                    'rain_3h': weather_data.get('rain', {}).get('3h', 0)
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

