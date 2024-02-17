# import requests to create HTTP requests
import requests  
# import schedule to schedule tasks
import schedule  
# import time for handling time dependent functions and queries
import time      
# import math for mathematical operations
import math      
# import os to securly access API key
import os        

def fetch_openweather_current():
    # Fetch the API key from an environment variable named 'API_KEY'
    api_key = os.environ.get('API_KEY')

    url = "https://api.openweathermap.org/data/2.5/weather"
    
    # Parametres for API request
    params = {
        "q": "Dublin,ie",  
        # City and country code for Dublin, Ireland
        "appid": api_key,  
        # API key for accessing the OpenWeatherMap API
        "units": "metric"  
        # Specify units as metric (for Celsius)
    }
    
    try:
        # Make a GET request to the OpenWeatherMap API
        response = requests.get(url, params=params)
        # exception for http errors
        response.raise_for_status()
        
        # Parse the JSON response into a Python dictionary
        data = response.json()
        
        # Extract specific weather data from the response
        temperature = math.floor(data["main"]["temp"])             # Current temperature
        feels_like = math.floor(data["main"]["feels_like"])        # Feels like temperature
        min_temp = math.floor(data["main"]["temp_min"])            # Minimum temperature
        max_temp = math.floor(data["main"]["temp_max"])            # Maximum temperature
        description = data["weather"][0]["description"]            # Weather description
        wind_speed = math.floor(data["wind"]["speed"])             # Wind speed
        
        # Print the fetched weather data
        print("\nOpenWeatherMap Current Weather Data:")
        print(f"Temperature: {temperature}°C, Feels Like: {feels_like}°C, Min Temp: {min_temp}°C, Max Temp: {max_temp}°C, Description: {description}, Wind Speed: {wind_speed} m/s")
    
    except requests.RequestException as e:
        # Handle any errors that occur during the request
        print(f"Error fetching current weather data from OpenWeatherMap: {e}")

# Define a function to fetch 5-day weather forecast data from the OpenWeatherMap API
def fetch_openweather_forecast():
    # Fetch the API key from an environment variable named 'API_KEY'
    api_key = os.environ.get('API_KEY')

    url = "https://api.openweathermap.org/data/2.5/forecast"
    
    # Define the parameters for the API request; city, api_key and units specified as metric to display Celsius
    params = {
        "q": "Dublin,ie",  
        "appid": api_key,  
        "units": "metric"  
    }
    
    try:
        # Make a GET request to the OpenWeather API
        response = requests.get(url, params=params)
        
        # Raise an exception for any HTTP errors (4xx or 5xx)
        response.raise_for_status()
        
        # Parse the JSON response into a Python dictionary
        data = response.json()
        
        # Fetching specific weather data
        min_temp = math.floor(data["list"][0]["main"]["temp_min"])  
        max_temp = math.floor(data["list"][0]["main"]["temp_max"])  
        
        # print data to console temporarily, later this will be changed to be represented in HTML component
        print(data)
    
    except requests.RequestException as e:
        # Handle any errors that occur during the request
        print(f"Error fetching 5-day forecast data from Open Weather: {e}")

# Main scheduling task function
def main():
    # Schedule the current weather to run every 5 minutes
    schedule.every(5).minutes.do(fetch_openweather_current)
    
    # Schedule the forecast to run every 10 minutes
    schedule.every(10).minutes.do(fetch_openweather_forecast)

    # Run the scheduler in an infinite loop
    while True:
        schedule.run_pending()
        # pause for 1 second before checking for shceduled tasks again
        time.sleep(1)  

# Run the main function, when the script is executed
if __name__ == "__main__":
    main()
#Note: 
    # to keep the script running even after you log out from the server/ close the terminal
    # On the Ubuntu command line, type 
    # nohup python script_name.py &
    # However, if the instance is stopped, the script will also stop
