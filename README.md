# Dublin Bikes Project Group 25
The repository is for the Dublin bikes app. Please refer to the report for development progress. 

* The project scrapped data from JCDecaux and open weather API to get data bikes data for 2 months (starting from 27/2/2024).
* The Scrapper ran in an EC2 instance and stored data in an RDS
* An ML model was developed with data and deployed on a flask instance

# Project Outlook

<img width="1467" alt="Screenshot 2024-04-17 at 12 20 49" src="https://github.com/yuhan676/DublinBikes/assets/157690180/245e03e9-8fe6-4c37-abff-fb6365e6d6e3">
Decide whether you are renting or returning, you'd like to do it now or in the future, then click on the 'Find Closest station to Simulated User location' button to find the closest station to you, or manually type in a station name!
<img width="1470" alt="Screenshot 2024-04-17 at 13 58 17" src="https://github.com/yuhan676/DublinBikes/assets/157690180/c53250ef-79d5-4b5e-8175-b8b7c3f77878">
The user location, the station of interest and its closest 4 stations are shown on map! Click on the selection box on the left to see their location and availability information in the past day/ week! 
You can also click on the weather toggle to see updated weather status!
<img width="1470" alt="Screenshot 2024-04-17 at 14 01 05" src="https://github.com/yuhan676/DublinBikes/assets/157690180/562a5187-985c-4560-933c-f78d72f108e5">
Want to travel in the future? No problem! See the predicted station availability and predicted weather information to plan your trip!

# Key elements of project in this repository
## /Scrapers
* contains the config files for scrapers (*jcdinfo.py*, *winfo.py*)
* contains the config file for RDS database connection (*db_config.py)
* contains the 3 scraper python files that are running on crontab to store data in RDS instance (*JCDDynamic.py*, *JCDStatic.py*, *OWDynamic.py)

## /Database/Yuhan_database
* contains the python files used to create database and schemas in the RDS instance

## /Flask
* contains all the necessary code for running the applciation on flask
key files:
* ** app.py ** : contains all the flask endpoint for handling user queries (e.g. fetching appropriate data from RDS and sending it back to ajax handler in index.js)
* ** functions.py** : contains some of the python functions utilised by app.py
* ** Static_dublin.csv ** : contains the static information of Dublin Bike stations, used to calculate the closest stations to user and the closest five station for each station
* ** pull_1_5_mapJSON.py **: contains a python function that maps each station name to its 5 closest stations' numbers (including itself)

### /Template
* ** indx.html **: the html page of the application

### /predictive_models/.ipynb_checkpoints/
* contains the linear regression predictive model for each station. When user inputs a future timepoint and a station name, the {stationNumber}_model_current_weather_for_each_station.pickle file is called to give it the input of the weather prediction data of that future time point in an array [feels-like temperature, minimum temperature, maximum temperature, windspeed, windgust] and outputs an array of [electrical_internal_batter_bikes, mechanical_bikes, electrical_removable_battery_bikes, empty_stand_number and total_bikes, total_bikes]. This array is checked for any need apply extreme values corrections before used to populate the left panel and right panel for displaying predicted bike station status.
### /Static
* Style.css (all styling for webpage)
* graph.js (javascript for plotting availability graph)
* index. js (contains all js functionality for app display and user interactions, except for those functionality related to the map)
* map.js (contains all js functionality relatedto map display and google API functionalities)

### /Static/image
* contains all of the icons and images used for styling image display


