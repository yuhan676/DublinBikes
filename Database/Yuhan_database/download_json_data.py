import json
import pymysql
import sshtunnel

def download_data():
    try:
        # Define SSH tunnel parameters
        tunnel = sshtunnel.SSHTunnelForwarder(
            ('51.20.248.33', 22),  # EC2 instance's SSH IP and port
            ssh_username='ubuntu',
            ssh_private_key='C:/Users/riink/OneDrive/Desktop/UCD/COMP30830_software_engineering/AWS_keypair.pem',  # Path to your SSH private key
            remote_bind_address=('onedb-test.cfm2usmq8eoy.eu-north-1.rds.amazonaws.com', 3306)  # RDS instance's IP and port
        )

        tunnel.start()

        # Connect to the database through the SSH tunnel
        connection = pymysql.connect(
            host='127.0.0.1',  # localhost, as the tunnel forwards connections locally
            port=tunnel.local_bind_port,
            user='admin',  # Replace with your database username
            password='DublinBike2024%',  # Replace with your database password
            database='database-dublinbikes',  # Replace with your database name
            cursorclass=pymysql.cursors.DictCursor
        )

        # Define your SQL queries for each table
        sql_queries = {
            'CurrentWeather': "SELECT * FROM CurrentWeather",
            'ExtremeWeather': "SELECT * FROM ExtremeWeather",
            'FiveDayPrediction': "SELECT * FROM FiveDayPrediction"
        }

        for table_name, sql_query in sql_queries.items():
            with connection.cursor() as cursor:
                # Execute the SQL query
                cursor.execute(sql_query)

                # Fetch all rows
                rows = cursor.fetchall()

                # Convert the result into JSON format
                json_data = json.dumps(rows, indent=4)

                # Write JSON data to a file
                with open(f'{table_name}_data.json', 'w') as json_file:
                    json_file.write(json_data)

                print(f"Data downloaded successfully for table '{table_name}'")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Close the SSH tunnel and database connection
        tunnel.stop()
        connection.close()

if __name__ == "__main__":
    download_data()
