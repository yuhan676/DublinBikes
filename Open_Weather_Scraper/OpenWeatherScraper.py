# import requests to create HTTP requests
import requests  
# import schedule to schedule tasks
import schedule  
# import time for handling time dependent functions and queries
import time      
# import math for mathematical operations
import math      
# import winfo to securely attain key and url
from winfo import API_KEY, URL1, URL2
# import traceback format
import traceback

def fetch_openweather_current():
    # fetching URL from winfo for security
    url = winfo.URL1
    
    # Parametres for API request
    params = {
        # City and country code for Dublin, Ireland
        "q": "Dublin.ie", 
        # API key for accessing the OpenWeatherMap API
        "appid": winfo.API_KEY,  
        # Specify units as metric (for Celsius)
        "units": "metric"  
    }
    try:
        # Make a GET request to the OpenWeatherMap API
        response = requests.get(url, params=params)
        # exception for http errors
        response.raise_for_status()
        
        # Parse the JSON response into a Python dictionary
        data = response.json()
        
        # Extract specific weather data from the response
        # Current temperature
        temperature = math.floor(data["main"]["temp"])   
        # Feels like temperature
        feels_like = math.floor(data["main"]["feels_like"])   
        # Minimum temperature
        min_temp = math.floor(data["main"]["temp_min"])  
        # Maximum temperature
        max_temp = math.floor(data["main"]["temp_max"])   
        # Weather description, rain, moderate rain
        description = data["weather"][0]["description"] 
        # Wind speed
        wind_speed = math.floor(data["wind"]["speed"])             
        
        # Print the fetched weather data
        print("\nOpenWeatherMap Current Weather Data:")
        print("Temporary text, that will be replaced later")
    
    except requests.RequestException as e:
        # Handle any errors that occur during the request
        print(f"Error fetching current weather data from OpenWeatherMap: {e}")
        # Print the traceback information
        print(traceback.format_exc())  


# Define a function to fetch 5-day weather forecast data from the OpenWeatherMap API
def fetch_openweather_forecast():
    # fetching url from winfo for security
    url = winfo.URL2
    
    # Define the parameters for the API request; city, accessing api key from winfo, and units specified as metric to display Celsius
    params = {
        "q": "Dublin.ie",  
        "appid": winfo.API_KEY,  
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
        
    except requests.RequestException as e:
        # Handle any errors that occur during the request
        print(f"Error fetching 5-day forecast data from Open Weather: {e}")
        # Print the traceback information
        print(traceback.format_exc())  

# function that fetches weather data from OpenWeather API, and compares with Met Eireann 
# official severe weather warning specifications, to display extreme weather notifications
def fetch_openweather_extreme():
    # Fetch the URL from winfo 
    url = winfo.URL2

    # parametres for the API request
    params = {
        "q": "Dublin.ie",
        "appid": winfo.API_KEY,
        "units": "metric"
    }
    try:
        # a Get request to the OpenWeather API
        response = requests.get(url, params=params)
        
        # exception for any HTTP errors (4xx or 5xx)
        response.raise_for_status()

        # Parse the JSON response into a Python dictionary
        data = response.json()

        # For loop to iterate via weather data to display severe weather warnings in accordance with Met Eireann
        for forecast in data["list"]:
            wind_speed = forecast["wind"]["speed"]
            gust_speed = forecast["wind"].get("gust", 0)
            rain_3h = forecast.get("rain", {}).get("3",0)
            temp_min = forecast["main"]["temp_min"]
            temp_max = forecast["main"]["temp_max"]

            # check for specific extreme weather conditions
            if wind_speed > 80 or gust_speed > 130:
                print("temporary print, will be replaced later")

            # check for extreme rain conditions
            if rain_3h > 50:
                print("temporary text")

            # check for extreme temperature conditions
            if temp_min < -10 or temp_max > 30:
                print("temporary text")
                
    except requests.RequestsException as e:
        print(f"Error fetching weather data: {e}")
        # Print the traceback information
        print(traceback.format_exc())  

# Main scheduling task function
def main():
    # Schedule the current weather to run every 5 minutes
    schedule.every(5).minutes.do(fetch_openweather_current)
    
    # Schedule the forecast to run every 10 minutes
    schedule.every(10).minutes.do(fetch_openweather_forecast)

    # schedule for extreme weather function to run every 15 minutes
    schedule.every(15).minutes.do(fetch_openweather_extreme)

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
