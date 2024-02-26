import requests
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from jcdinfo import API_KEY, CONTRACT,STATION_URL
from db_config import db_type, username,password,hostname,port,db_name


def fetch_JCDStatic():
    params = {
        "contract" : CONTRACT,
        "apiKey" : API_KEY
    }

    #Use a try block for error handling
    try:
        #use a get request on the url and store the response in the 'response' variable
        response = requests.get(STATION_URL, params)
        #Raises an exception for 4XX/5XX errors
        response.raise_for_status()
        #Parses the JSON response content and converts it into a Python dictionary stored in the variable data
        stations_data = response.json()
        # Create an engine to connect to the default database
        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

        # SQL insert statement
        sql = """
        INSERT INTO station (
            number, 
            name, 
            address, 
            position_lat, 
            position_lng, 
            banking, 
            bonus
        ) VALUES (
            :number, :name, :address, :position_lat, :position_lng, :banking, :bonus
        ) ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            address = VALUES(address),
            position_lat = VALUES(position_lat),
            position_lng = VALUES(position_lng),
            banking = VALUES(banking),
            bonus = VALUES(bonus);
        """
        with engine.connect() as connection:
            transaction = connection.begin()
            try:
                for data in stations_data:
                    values_to_insert = {
                        'number': data['number'],
                        'name': data['name'],
                        'address': data['address'],
                        'position_lat': data['position']['latitude'],
                        'position_lng': data['position']['longitude'],
                        'banking': int(data['banking']),
                        'bonus': int(data['bonus'])
                    }
                    connection.execute(text(sql), **values_to_insert)
                
                transaction.commit()
                print("JCD Static data inserted successfully")
            except:
                transaction.rollback()
                raise
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
        
fetch_JCDStatic()