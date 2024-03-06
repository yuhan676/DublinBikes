import json
import pymysql
import sshtunnel

def download_data():
    # Define SSH tunnel parameters
    tunnel = sshtunnel.SSHTunnelForwarder(
        ('51.20.248.33', 22),  # EC2 instance's SSH IP and port
        ssh_username='ubuntu',
        ssh_pkey='C:/Users/riink/OneDrive/Desktop/UCD/COMP30830_software_engineering/AWS_keypair.pem',
        remote_bind_address=('onedb-test.cfm2usmq8eoy.eu-north-1.rds.amazonaws.com', 3306)  # RDS instance's IP and port
    )

    try:
        # Start SSH tunnel
        tunnel.start()

        # Connect to the database through the SSH tunnel
        connection = pymysql.connect(
            host='127.0.0.1',  # localhost, as the tunnel forwards connections locally
            port=tunnel.local_bind_port,
            user='admin',  # Replace with your database username
            password='DublinBike2024%',  # Replace with your database password
            database='your_database_name',  # Replace with your database name
            cursorclass=pymysql.cursors.DictCursor
        )

        # Define your SQL query
        sql_query = "SELECT * FROM your_table"

        with connection.cursor() as cursor:
            # Execute the SQL query
            cursor.execute(sql_query)

            # Fetch all rows
            rows = cursor.fetchall()

            # Convert the result into JSON format
            json_data = json.dumps(rows, indent=4)

            # Write JSON data to a file
            with open('data.json', 'w') as json_file:
                json_file.write(json_data)

            print("Data downloaded successfully as 'data.json'")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Close the SSH tunnel and database connection
        tunnel.stop()
        connection.close()

if __name__ == "__main__":
    download_data()
