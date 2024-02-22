from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from db_config_Yuhan import db_type, username,password,hostname,port,db_name


# Create an engine to connect to the default database
engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

sql = """
CREATE TABLE IF NOT EXISTS station (
    number INT NOT NULL,
    name VARCHAR (120),
    address VARCHAR(256),
    banking TINYINT(1), 
    bonus TINYINT(1),
    position_lat REAL,
    position_lng REAL, 
    PRIMARY KEY (number)
)
"""

try:
    # connect to the database using the engine
    with engine.connect() as connection:
        #first, attempt to drop the table if it exists
        connection.execute(text("DROP TABLE IF EXISTS station"))
        # Now, create the table
        res = connection.execute(text(sql))
        print("Table 'station' created successfully")
except Exception as e:
    print(e)