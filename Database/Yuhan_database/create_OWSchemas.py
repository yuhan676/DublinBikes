import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from db_config import db_type, username, password, hostname, port, db_name
import traceback
import datetime

def create_tables(engine):
    # tables created below
    try:
        CurrentWeather = """
        CREATE TABLE IF NOT EXISTS CurrentWeather (
            time_update DATETIME NOT NULL,
            current_weather_id INT AUTO_INCREMENT PRIMARY KEY,
            feels_like DECIMAL(5, 2) NOT NULL,
            temperature_min DECIMAL(5, 2) NOT NULL,
            temperature_max DECIMAL(5, 2) NOT NULL,
            weather_description VARCHAR(120),
            wind_speed DECIMAL(5, 2) NOT NULL,
            wind_gust DECIMAL(5, 2) NOT NULL DEFAULT 0
        );
        """

        ExtremeWeather = """
        CREATE TABLE IF NOT EXISTS ExtremeWeather (
            time_update DATETIME NOT NULL,
            extreme_weather_id INT AUTO_INCREMENT PRIMARY KEY,
            temp_min DECIMAL(5, 2) NOT NULL,
            temp_max DECIMAL(5, 2) NOT NULL,
            wind_speed DECIMAL(5, 2) NOT NULL,
            gust_speed DECIMAL(5, 2) NOT NULL DEFAULT 0,
            rain_3h DECIMAL(5, 2) NOT NULL DEFAULT 0
        );
        """

        FiveDayPrediction = """
        CREATE TABLE IF NOT EXISTS FiveDayPrediction (
            time_update DATETIME NOT NULL,
            forecast_id INT AUTO_INCREMENT PRIMARY KEY,
            temp_min DECIMAL(5, 2) NOT NULL,
            temp_max DECIMAL(5, 2) NOT NULL,
            wind_speed DECIMAL(5, 2) NOT NULL,
            gust DECIMAL(5, 2) NOT NULL DEFAULT 0,
            rain_3h DECIMAL(5, 2) NOT NULL DEFAULT 0
        );
        """

        with engine.connect() as connection:
            connection.execute(text(CurrentWeather))
            connection.execute(text(ExtremeWeather))
            connection.execute(text(FiveDayPrediction))
            print('Open Weather Tables created successfully')
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        print(traceback.format_exc())

def main():
    try:
        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

        create_tables(engine)

    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        # using traceback for additional information about the stack trace, which can be helpful for debugging and understanding the context of the error.
        print(traceback.format_exc())

if __name__ == "__main__":
    main()