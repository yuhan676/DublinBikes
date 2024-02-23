from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from db_config import db_type, username,password,hostname,port,db_name


# Create an engine to connect to the default database
engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

sql = """
DROP TABLE IF EXISTS station_status;
CREATE TABLE station_status (
    station_number INT NOT NULL,
    status VARCHAR(256) NOT NULL,
    last_update DATETIME,
    empty_stands_number INT,
    total_bikes INT,
    mechanical_bikes INT,
    electrical_internal_battery_bikes INT,
    electrical_removable_battery_bikes INT,
    PRIMARY KEY (station_number, last_update),
    FOREIGN KEY (station_number) REFERENCES station(number)
    ON DELETE CASCADE
)
"""


try:
    # connect to the database using the engine
    with engine.connect() as connection:
        #first, attempt to drop the table if it exists
        connection.execute(text("DROP TABLE IF EXISTS station_status"))
        # Now, create the table
        res = connection.execute(text(sql))
        print("Table 'station_status' created successfully")
except Exception as e:
    print(e)