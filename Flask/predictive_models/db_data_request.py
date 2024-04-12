from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Database connection details
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

        # Execute the query
        result_time_update_weather = connection.execute(text(sql_time_update_weather)).fetchall()

        # Extract timestamps
        timestamps_weather = [result[0] for result in result_time_update_weather]

except SQLAlchemyError as e:
    print("An error occurred:", e)
