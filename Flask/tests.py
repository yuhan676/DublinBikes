import unittest
from unittest.mock import MagicMock
from flask import jsonify
from functions import connect_db, get_station_names

class TestConnection(unittest.TestCase):
    """
    Test case class for testing database connection functionality.
    """

    def test_connection(self):
        """
        Test database connection.
        This method checks if the connection to the database is successfully established
        by calling the connection_test function with example connection parameters.
        """
        try:
            # Connection parameters 
            db_type = 'mysql'  
            username = 'admin'
            password = 'DublinBike2024%'
            hostname = 'database-dublinbike.c1g2mg4aerll.eu-north-1.rds.amazonaws.com'
            port = '3306'  
            default_db = 'mysql'  
            db_name = 'dublinbike_db'
            
            # Testing connection to the database
            connection = connect_db(hostname, username, password, port, default_db, db_name)

            # Asserting that the connection object is not None, indicating a successful connection
            self.assertIsNotNone(connection, "Failed to establish a connection to the database.")
        except SQLAlchemyError as e:
            print(f"Database error: {e}")

    def test_get_station_names(self):
        # Mocking the engine object
        engine_mock = MagicMock()
        
        # Mocking the connection object
        connection_mock = MagicMock()
        connection_mock.execute.return_value.fetchall.return_value = [{'name': 'Station 1'}, {'name': 'Station 2'}]
        
        # Setting up the engine to return the connection mock
        engine_mock.connect.return_value.__enter__.return_value = connection_mock

        # Calling the function with the mocked engine object
        station_names = get_station_names(engine_mock)

        # Asserting that the function returns the expected station names
        self.assertEqual(station_names, ['Station 1', 'Station 2'])

# Entry point of the script
if __name__ == "__main__":
    unittest.main()
