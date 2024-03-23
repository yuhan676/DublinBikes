from functions import save_weather_to_json, fetch_weather_data

def main():
    try:
        # Connect to the databse
        weather_data = fetch_weather_data()
        
        # Save the weather data to a JSON file
        save_weather_to_json(weather_data, 'weather_data.json')
        print("Weather data saved to weather_data.json")
    # error exception
    except Exception as e:
        print("Error fetching or saving weather data:", e)

if __name__ == "__main__":
    main()
