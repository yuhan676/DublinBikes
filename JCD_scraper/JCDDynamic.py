import requests
import logging
import traceback
from requests.exceptions import RequestException
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from jcdinfo import API_KEY, CONTRACT, STATION_URL
from db_config import db_type, username, password, hostname, port, db_name

# Configure logging for exception handling
logging.basicConfig(level=logging.ERROR, filename='JCD_error.log',
                    format='%(asctime)s - %(levelname)s - %(message)s')

#function for teching JCD dynamic data
def fetch_JCDDynamic():
    #JCD API parameters
    params = {
        "contract": CONTRACT,
        "apiKey": API_KEY
    }
    
    try:
        #get the JCD data, parse it with .json()
        response = requests.get(STATION_URL, params=params)
        response.raise_for_status()
        stations_dynamic_data = response.json()
        
        #connect to db using the db_config
        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')
        #SQL command for inserting the dynamic station data into the station_status table
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
            :station_number, :status, :last_update, :empty_stands_number, :total_bikes, 
            :mechanical_bikes, :electrical_internal_battery_bikes, :electrical_removable_battery_bikes
        );
        """
        with engine.connect() as connection:
            #start the transection session
            transaction = connection.begin()
            try:
                #for data we get from the api:
                for data in stations_dynamic_data:
                    # Parse the lastUpdate field into a datetime object
                    last_update = datetime.strptime(data['lastUpdate'], '%Y-%m-%dT%H:%M:%SZ')
                    # Format the datetime object into a string that matches MySQL's datetime format
                    formatted_last_update = last_update.strftime('%Y-%m-%d %H:%M:%S')

                    availabilities = data['totalStands']['availabilities']
                    values_to_insert = {
                        'station_number': data['number'],
                        'status': data['status'],
                        'last_update': formatted_last_update,  # Use formatted_last_update here
                        'empty_stands_number': availabilities['stands'],
                        'total_bikes': availabilities['bikes'],
                        'mechanical_bikes': availabilities['mechanicalBikes'],
                        'electrical_internal_battery_bikes': availabilities['electricalInternalBatteryBikes'],
                        'electrical_removable_battery_bikes': availabilities['electricalRemovableBatteryBikes']
                    }
                    connection.execute(text(sql), values_to_insert)
                #commit the transaction session
                transaction.commit()
                print("Station status data inserted successfully")
            except:
                transaction.rollback()
                raise
    except RequestException as e:
        logging.error(f"Error fetching data from API: {e}")
        print("There was an issue fetching data from the API. Please check the JCD_error.log for more details.")
    except SQLAlchemyError as e:
        logging.error(f"Database operation failed: {e}")
        print("A database error occurred. Please check the JCD_error.log for more details.")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        traceback.print_exc()  # This will log the full traceback
        print("An unexpected error occurred. Check the JCD_error.log file")
    finally:
        # We're using a context manager (with engine.connect() as connection for database operations, 
        # which automatically takes care of closing the connection once the block is exited,
        # even if exceptions occur. This means there is no explicit cleanup required for the database
        # connection in the finally block. 
        logging.info("Cleanup completed. Exiting script.")
        pass

fetch_JCDDynamic()