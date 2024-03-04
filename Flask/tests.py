# Importing necessary modules
from sqlalchemy import create_engine, text
import traceback
from functions import connect_db
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
        # connection parameters 
        # Change to 'mysql' for MySQL/MariaDB
        db_type = 'mysql'  
        username = 'admin'
        password = 'DublinBike2024%'
        hostname = 'database-dublinbike.c1g2mg4aerll.eu-north-1.rds.amazonaws.com'
        # Use '3306' for MySQL/MariaDB
        port = '3306'  
        # Use 'mysql' for MySQL/MariaDB
        default_db = 'mysql'  
        db_name = 'dublinbike_db'

        # Testing connection to the database
        connection = connect_db(hostname, username, password, port, default_db, db_name)

        # Asserting that the connection object is not None, indicating a successful connection
        self.assertIsNotNone(connection, "Failed to establish a connection to the database.")

    # note for myself, have to specify wcich functions to use from app either/or functions 
    def test_current_search(self):
        # use GET to test current search
        # use assertEqual from unittest
        pass

    def test_future_search(self):
        # use POST to test future search 
        # use assertEqual from unittest
        pass

    def test_invalid_search(self):
        # use http method PUT to test invalid search
        # user assertEqual from unittest
        pass 

# Entry point of the script
if __name__ == "__main__":
    # Running the test case
    unittest.main()



