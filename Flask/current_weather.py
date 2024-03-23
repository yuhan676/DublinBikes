from functions import save_mapping_to_json, connect_db

def main():
    try:
        # Connect to the database
        engine = connect_db()
        connection = engine.connect()

        # Execute query to fetch all rows from the CurrentWeather table
        query = "SELECT * FROM CurrentWeather"
        result = connection.execute(query)

        # Format fetched data into a list of dictionaries
        weather_data = [dict(row) for row in result]

        # Close the database connection
        connection.close()

        # Save the fetched data to a JSON file
        save_mapping_to_json(weather_data, 'weather_data.json')
        print("Weather data saved to weather_data.json")

    except Exception as e:
        print("Error fetching or saving weather data:", e)

if __name__ == "__main__":
    main()
