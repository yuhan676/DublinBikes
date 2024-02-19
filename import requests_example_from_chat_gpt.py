import requests

# Define the OpenWeather API endpoint
endpoint = "http://api.openweathermap.org/data/2.5/weather"

# Your API key obtained from OpenWeather
api_key = "fa4a1ef5fe110a5b66dbe8f58890b6f1"

# Latitude and longitude for Dublin, Ireland
latitude = "53.349805"
longitude = "-6.26031"

# Define the parameters required for the request
params = {
    "lat": latitude,
    "lon": longitude,
    "appid": api_key
}

# Send the GET request
response = requests.get(endpoint, params=params)

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Parse the JSON response
    data = response.json()
    # Now you can access the weather data in the 'data' dictionary
    print(data)
else:
    # If the request was unsuccessful, print the error status code
    print("Error:", response.status_code)
