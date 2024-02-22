from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text

# Replace these variables with your actual RDS details
db_type = ''  # Change to 'mysql' for MySQL/MariaDB
username = ''
password = ''
hostname = '' #change to your rds IP
port = '3306'  # Use '3306' for MySQL/MariaDB
default_db = 'mysql'  # Use 'mysql' for MySQL/MariaDB

# Create an engine to connect to the default database
engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{default_db}')

try:
    # Connect to the default database
    with engine.connect() as conn:
        # Create the new database
        conn.execute(text(f"CREATE DATABASE dublinbike_db;"))
        print("Database 'DublinBike_db' created successfully")
        
        # Close the connection to the default database
        conn.close()

    # Create a new engine for the new database
    new_db_engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/dublinbike_db')

    # Test connection to the new database
    with new_db_engine.connect() as new_db_conn:
        result = new_db_conn.execute(text("SELECT 1;"))
        for row in result:
            print("Test query executed successfully:", row)
        new_db_conn.close()

except SQLAlchemyError as e:
    print(f"An error occurred: {e}")

finally:
    engine.dispose()  # Dispose the connection to the default database
    new_db_engine.dispose()  # Dispose the connection to the new database


# Notes:
# Replace the placeholders (your-username, your-password, your-rds-endpoint.amazonaws.com) with your actual RDS details.
# The db_type variable should be set to 'postgresql' for PostgreSQL databases and 'mysql' for MySQL/MariaDB databases.
# This script first connects to a default database (postgres for PostgreSQL, mysql for MySQL/MariaDB) to execute the CREATE DATABASE command. It then connects to the newly created database to run a test query.
# The try...except...finally structure ensures proper handling of exceptions and cleanup of database connections.

#See following for Table creation prototype
    #Use TINYINT(1) for boolean values in MySQL for banking and bonus
    #Use REAL instead of FLOAT for lat & long info because REAL has a higher precision
sql = """
CREATE TABLE IF NOT EXISTS station (
    number INT NOT NULL
    name VARCHAR (120)
    address VARCHAR(256),
    banking TINYINT(1), 
    bonus TINYINT(1),
    position_lat REAL,
    position_lng REAL, 
    PRIMARY KEY (station_number)
)
"""

try:
    # First, attempt to drop the table if it exists
    res = engine.execute("DROP TABLE IF EXISTS station")
    # Now, create the table
    res = engine.execute(sql)
    print("Table 'station' created successfully")
except Exception as e:
    print(e)

#Creating dynamic table
new_table_sql = """
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
    # Execute the SQL command to drop if exists and create the new table with a foreign key reference
    res = engine.execute(new_table_sql)
    print("Table 'station_status' dropped (if existed) and created successfully")
except Exception as e:
    print(e)