from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from Database.db_config_Yuhan import db_type, username,password,hostname,port,default_db


# Create an engine to connect to the default database
engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{default_db}')

try:
    # Obtain a connection from the engine
    with engine.connect() as connection:
        # Check if the database already exists
        db_exists = connection.execute(
            text("SELECT 1 FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :db_name"),
            {'db_name': 'dublinbike_db'}
        ).scalar()
        if not db_exists:
            # Database does not exist, create it
            connection.execute(text("CREATE DATABASE dublinbike_db"))
            print("Database 'DublinBike_db' created successfully")
        else:
            print("Database 'DublinBike_db' already exists")

    # Continue with the rest of your code...
except SQLAlchemyError as e:
    print(f"An error occurred: {e}")