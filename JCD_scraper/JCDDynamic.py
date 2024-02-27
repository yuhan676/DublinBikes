import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from jcdinfo import API_KEY, CONTRACT, STATION_STATUS_URL
from db_config import db_type, username, password, hostname, port, db_name

def fetch_JCDStatus():
    params = {
        "contract": CONTRACT,
        "apiKey": API_KEY
    }

    try:
        response = requests.get(STATION_STATUS_URL, params=params)
        response.raise_for_status()
        stations_status_data = response.json()

        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')
        sql = """
        INSERT INTO station_status (
            station_number,
            status,
            last_update,
            empty_stands_number,
            total_bikes,
            mechanical_bikes,
            electrical_internal_battery_bikes,
            electrical_removable_battery_bikes
        ) VALUES (
            :station_number,
            :status,
            :last_update,
            :empty_stands_number,
            :total_bikes,
            :mechanical_bikes,
            :electrical_internal_battery_bikes,
            :electrical_removable_battery_bikes
        ) ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            last_update = VALUES(last_update),
            empty_stands_number = VALUES(empty_stands_number),
            total_bikes = VALUES(total_bikes),
            mechanical_bikes = VALUES(mechanical_bikes),
            electrical_internal_battery_bikes = VALUES(electrical_internal_battery_bikes),
            electrical_removable_battery_bikes = VALUES(electrical_removable_battery_bikes);
        """
        with engine.connect() as connection:
            for data in stations_status_data:
                values_to_insert = {
                    'station_number': data['number'],
                    'status': data['status'],
                    'last_update': datetime.fromtimestamp(data['last_update'] / 1e3),
                    'empty_stands_number': data['available_bike_stands'],
                    'total_bikes': data['available_bikes'],
                    'mechanical_bikes': data.get('available_mechanical_bikes', 0),  # Assuming these keys exist
                    'electrical_internal_battery_bikes': data.get('available_electrical_internal_battery_bikes', 0),
                    'electrical_removable_battery_bikes': data.get('available_electrical_removable_battery_bikes', 0)
                }
                connection.execute(text(sql), values_to_insert)

        print("JCD Status data inserted successfully")

    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
    except SQLAlchemyError as e:
        print(f"Database error: {e}")

# Schedule this to run every 5 minutes using crontab
fetch_JCDStatus()