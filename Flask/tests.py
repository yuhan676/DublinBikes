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

    def setUp(self):
        """
        Set up the test client.
        """
        # Set the application configuration to testing mode
        app.config['TESTING'] = True
        
        # Create a test client for making requests to the Flask app
        self.app = app.test_client()

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

    def test_current_search(self):
        """
        Test current search functionality.
        This method tests the functionality of the current search feature by using the GET method.
        """
        # Perform a current search (replace 'search_criteria' with your actual search criteria)
        search_criteria = "current_search_criteria"
        response = self.app.get(f"/search?criteria={search_criteria}")

        # Validate the response
        self.assertEqual(response.status_code, 200)  # Assuming 200 is the expected status code
        self.assertIn("expected_content", response.data)  # Check if the expected content is in the response

    # Test method to test future search functionality
    def test_future_search(self):
        """
        Test future search functionality.
        This method tests the functionality of the future search feature by using the POST method.
        """
        # Perform a future search (replace 'search_data' with your actual search data)
        search_data = {"future_criteria": "future_search_criteria"}
        response = self.app.post("/search", json=search_data)

        # Validate the response
        self.assertEqual(response.status_code, 200)  # Assuming 200 is the expected status code
        self.assertIn("expected_content", response.data)  # Check if the expected content is in the response

    # Test method to test invalid search functionality
    def test_invalid_search(self):
        """
        Test invalid search functionality.
        This method tests the functionality of the invalid search feature by using the PUT method.
        """
        # Perform an invalid search (replace 'invalid_data' with your actual invalid search data)
        invalid_data = {"invalid_criteria": "invalid_search_criteria"}
        response = self.app.put("/search", json=invalid_data)

        # Validate the response
        self.assertEqual(response.status_code, 400)  # Assuming 400 is the expected status code for an invalid request

# Entry point of the script
if __name__ == "__main__":
    # Running the test case
    unittest.main()
