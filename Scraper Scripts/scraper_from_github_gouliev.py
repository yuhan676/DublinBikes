# import our scraper
from flask_react.models import Weather
#import modules needed for scraper to operate
from datetime import datetime
import time

while True:
        print("waiting...")
        currentTime = datetime.now()
        hour = currentTime.minute
        try:
            if hour % 55 == 0:
                Weather.insertData()
                print("Done")

        except Exception as e:

            print("Error: ", e)
        
        time.sleep(50)
# improved code by chat gpt
# Import our scraper
from flask_react.models import Weather
from datetime import datetime
import time

def scrape_and_insert_data():
    """
    Scrapes weather data and inserts it into the database.
    """
    try:
        # Call function to insert data into the database
        Weather.insertData()
        print("Data insertion successful")
    except Exception as e:
        print("Error inserting data:", e)

while True:
    print("Waiting...")
    try:
        current_time = datetime.now()
        minute = current_time.minute

        # Check if the minute is a multiple of 55
        if minute % 55 == 0:
            scrape_and_insert_data()
            print("Scraping and data insertion completed")
    except Exception as e:
        print("Error:", e)

    # Calculate time until the next execution
    time_to_sleep = 55 - (datetime.now().minute % 55)
    time.sleep(time_to_sleep * 60)  # Sleep for the calculated duration in seconds

