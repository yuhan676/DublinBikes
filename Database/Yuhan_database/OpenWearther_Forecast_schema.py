from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from db_config import db_type, username, password, hostname, port, db_name
import traceback

def main():
    try:
        # Create an engine to connect to the database
        engine = create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

        sql = """
        CREATE TABLE IF NOT EXISTS FiveDayPrediction (
            forecast_id INT AUTO_INCREMENT PRIMARY KEY,
            temp_min DECIMAL(5, 2) NOT NULL,
            temp_max DECIMAL(5, 2) NOT NULL,
            wind_speed DECIMAL(5, 2) NOT NULL,
            gust DECIMAL(5, 2) NOT NULL DEFAULT 0,
            rain_3h DECIMAL(5, 2) NOT NULL DEFAULT 0
        );
        """
        
        # Connect to the database using the engine
        with engine.connect() as connection:
            # Execute the SQL queries
            connection.execute(text(sql))
            print('Tables created successfully')
    except SQLAlchemyError as e:
        print(e)
        # using traceback for additional information about the stack trace, which can be helpful for debugging and understanding the context of the error.
        print(traceback.format_exc())

# Run the main function, when the script is executed
if __name__ == "__main__":
    main()

