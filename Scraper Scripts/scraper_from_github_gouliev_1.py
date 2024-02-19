#!/usr/bin/python

import requests  # need to pip install
import math
import time
import DatabaseAccessor
lat = "53.34399"  # lat and long of Dublin city
long = "-6.26719"
api_key = "e857655954f34ae188982244bbb23b21"

def get_weather(api_key, lat, long):
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={long}&appid={api_key}&units=metric"  # all units metric #putting lat, long, and key into request

    response = requests.get(url).json()  # requesting api data

    temp = response['main']['temp']  # temp = 'temp' of dublin
    temp = math.floor(temp) #takes away decimal places, have this hashed for extra data, but up to team

    feels_like = response['main']['feels_like']  # feels_like = 'feels_like' of dublin
    feels_like = math.floor(feels_like)

    wind_speed = response['wind']['speed']  # wind_speed = 'wind_speed' of dublin
    wind_speed = math.floor(wind_speed)

    last_update = int(time.time()*1000)
    return {
    'temp': temp,
    'feels_like': feels_like,
    'wind_speed': wind_speed,
    'last_update': last_update

}

da = DatabaseAccessor
da.create_weather_table()
while True:  # infinite loop
    start_time = time.time()
    time.sleep(900.0 - ((time.time() - start_time) % 900.0))

    weather = get_weather(api_key, lat, long)  # access the dictionary
    da.push_to_weather(weather)
# fixed code by chat gpt with additional details and suggestions. Certainly! Here's an updated version of the code incorporating some of the suggested improvements:

```python
#!/usr/bin/python

import requests
import math
import time
import DatabaseAccessor

# Constants
LATITUDE = "53.34399"  # Latitude of Dublin city
LONGITUDE = "-6.26719"  # Longitude of Dublin city
API_KEY = "e857655954f34ae188982244bbb23b21"  # API key for OpenWeatherMap
REQUEST_INTERVAL_SECONDS = 900  # Request interval in seconds (15 minutes)

def get_weather(api_key, lat, long):
    """
    Fetch weather data from OpenWeatherMap API.

    Parameters:
        api_key (str): API key for OpenWeatherMap.
        lat (str): Latitude of the location.
        long (str): Longitude of the location.

    Returns:
        dict: Dictionary containing weather data.
    """
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={long}&appid={api_key}&units=metric"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()

        weather_data = {
            'temp': math.floor(data['main']['temp']),
            'feels_like': math.floor(data['main']['feels_like']),
            'wind_speed': math.floor(data['wind']['speed']),
            'last_update': int(time.time() * 1000)
        }
        return weather_data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None

def main():
    # Create weather table if it doesn't exist
    DatabaseAccessor.create_weather_table()

    while True:
        start_time = time.time()

        weather = get_weather(API_KEY, LATITUDE, LONGITUDE)
        if weather:
            DatabaseAccessor.push_to_weather(weather)

        # Calculate sleep time to maintain request interval
        elapsed_time = time.time() - start_time
        sleep_time = REQUEST_INTERVAL_SECONDS - (elapsed_time % REQUEST_INTERVAL_SECONDS)
        time.sleep(sleep_time)

if __name__ == "__main__":
    main()
```
#Changes made:
##1. Added docstring for `get_weather()` function.
####2. Implemented error handling for API requests using `try-except` block.
##3. Used constants for latitude, longitude, API key, and request interval.
##4. Improved variable names for better readability (`lat` and `long` changed to `LATITUDE` and `LONGITUDE`).
####5. Moved the main code execution into a `main()` function.
##6. Added check for `if __name__ == "__main__":` to ensure the script is executed directly.
##7. Improved sleep calculation to maintain the request interval accurately.
##8. Removed redundant comments and updated comments for clarity where necessary.

