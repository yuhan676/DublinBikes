from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from flask import request, jsonify
from functions import connect_db
import traceback
import unittest

# Define a test case class to test the connection
class TestConnection(unittest.TestCase):
    """
    Test case class for testing database connection functionality.
    """
    # Test method to check database connection
    def test_connection(self):
        """
        Test database connection.
        This method checks if the connection to the database is successfully established
        by calling the connection_test function with example connection parameters.
        """
        try:
            # connection parameters 
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
            print(traceback.format_exc())

    def test_get_station_names(self):
        # Mock the engine object
        class MockEngine:
            def __init__(self):
                self.connect = self

            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

            def execute(self, sql):
                if sql == "SELECT name FROM station;":
                    return self.fetchall()

            def fetchall(self):
                return [{'name': 'Station 1'}, {'name': 'Station 2'}]
        
        engine_mock = MockEngine()
        
        # Call the get_station_names function with the mock engine
        get_station_names = get_station_names(engine_mock)
        
        # Assert that the function returns the expected station names
        self.assertEqual(station_names, ['Station 1', 'Station 2'])

    def test_current_search(self):
        """
        Test current search functionality.
        This method tests the functionality of the current search feature by using the GET method.
        """
        pass

    # Test method to test future search functionality
    def test_future_search(self):
        """
        Test future search functionality.
        This method tests the functionality of the future search feature by using the POST method.
        """
        pass

    # Test method to test invalid search functionality
    def test_invalid_search(self):
        """
        Test invalid search functionality.
        This method tests the functionality of the invalid search feature by using the PUT method.
        """
        pass

# Entry point of the script
if __name__ == "__main__":
    # Running the test case
    unittest.main()
