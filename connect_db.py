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
# sql = """
# CREATE TABLE IF NOT EXISTS station (
#     address VARCHAR(256),
#     banking INTEGER,
#     bike_stands INTEGER,
#     bonus INTEGER,
#     contract_name VARCHAR(256),
#     name VARCHAR(256),
#     number INTEGER,
#     position_lat REAL,
#     position_lng REAL,  
#     status VARCHAR(256)
# )
# """

# try:
#     # First, attempt to drop the table if it exists
#     res = engine.execute("DROP TABLE IF EXISTS station")
#     # Now, create the table
#     res = engine.execute(sql)
#     print("Table 'station' created successfully")
# except Exception as e:
#     print(e)
