from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

db_type = 'mysql'  # Change to 'mysql' for MySQL/MariaDB
username = 'admin'
password = 'DublinBike2024%'
hostname = 'database-dublinbike.c1g2mg4aerll.eu-north-1.rds.amazonaws.com'
port = '3306'  # Use '3306' for MySQL/MariaDB
default_db = 'mysql'  # Use 'mysql' for MySQL/MariaDB
db_name = 'dublinbike_db'

# Create an engine to connect to the database
engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

try:
    # Connect to the database using the engine
    with engine.connect() as connection:
        # Query to retrieve timestamps from the weather tables
        sql_time_update_weather = """
        SELECT time_update
        FROM (
            SELECT time_update FROM CurrentWeather LIMIT 1
            UNION ALL
            SELECT time_update FROM ExtremWeather LIMIT 1
            UNION ALL
            SELECT time_update FROM FiveDayPrediction LIMIT 1
        ) AS union_query
        """

        # Query to retrieve last_update timestamps from station and station_status tables
        sql_last_update_station = "SELECT last_update FROM station LIMIT 1"
        sql_last_update_station_status = "SELECT last_update FROM station_status LIMIT 1"

        # Execute the queries
        result_time_update_weather = connection.execute(text(sql_time_update_weather)).fetchall()
        result_last_update_station = connection.execute(text(sql_last_update_station)).fetchone()
        result_last_update_station_status = connection.execute(text(sql_last_update_station_status)).fetchone()

        # Extract timestamps
        timestamps_weather = [result[0] for result in result_time_update_weather]
        last_update_station = result_last_update_station[0] if result_last_update_station else None
        last_update_station_status = result_last_update_station_status[0] if result_last_update_station_status else None

except SQLAlchemyError as e:
    print("An error occurred:", e)
