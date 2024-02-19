# from youtube
import datetime as dt
import requests

BASE_URL = "http://api.openweathermap.org/data/2,5/weather?..."
API_KEY = "hahha"
## or
API_KEY = open('api_key', 'r').read()
CITY = "London"

def kelvin_to_celsius_farenheit(kelvin):
    celsius = kevin - 273.15
    farenheift = celsis * (9/5) + 32
    return celsius, fahrenheit

url = BASE_RUL + "appid=" + API_KEY + "&q=" + CITY

response = requests.url(url).sjon()
# print is probably not needed
print(response)
# bu default local london time
temp_kelvin = response['main']['temp']
temp_celsius, temp_farenheit = kelvin_to_celsius_farenheit(temp_kelvin)
feels_like_kelvin = response['main']['feels_like']
feels_like_celsius, feels_like_fahrenheit = kelvin_to_celsius(feels_like_kelvin)
humidity = response['main']['humidity']
description = response['weather'][0]['description']
sunrise_time = dt.datetime.utcfromtimestamp(response['sys']['sunrise'] + response['timezone'])
print(response)
# windspead, sunset_time etc
print(f"Temperature in {CITY}: {temp_celsius:.2f")

