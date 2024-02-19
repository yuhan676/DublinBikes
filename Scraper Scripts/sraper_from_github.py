# Made with love by Karl
# Contact me on Telegram: @karlpy

import requests
import csv
import lxml.html as lh

import config

from util.UnitConverter import ConvertToSystem
from util.Parser import Parser
from util.Utils import Utils

# configuration
stations_file = open('stations.txt', 'r')
URLS = stations_file.readlines()
# Date format: YYYY-MM-DD
START_DATE = config.START_DATE
END_DATE = config.END_DATE

# set to "metric" or "imperial"
UNIT_SYSTEM = config.UNIT_SYSTEM
# find the first data entry automatically
FIND_FIRST_DATE = config.FIND_FIRST_DATE


def scrap_station(weather_station_url):

    session = requests.Session()
    timeout = 5
    global START_DATE
    global END_DATE
    global UNIT_SYSTEM
    global FIND_FIRST_DATE

    if FIND_FIRST_DATE:
        # find first date
        first_date_with_data = Utils.find_first_data_entry(weather_station_url=weather_station_url, start_date=START_DATE)
        # if first date found
        if(first_date_with_data != -1):
            START_DATE = first_date_with_data
    
    url_gen = Utils.date_url_generator(weather_station_url, START_DATE, END_DATE)
    station_name = weather_station_url.split('/')[-1]
    file_name = f'{station_name}.csv'

    with open(file_name, 'a+', newline='') as csvfile:
        fieldnames = ['Date', 'Time',	'Temperature',	'Dew_Point',	'Humidity',	'Wind',	'Speed',	'Gust',	'Pressure',	'Precip_Rate',	'Precip_Accum',	'UV',   'Solar']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        # Write the correct headers to the CSV file
        if UNIT_SYSTEM == "metric":
            # 12:04 AM	24.4 C	18.3 C	69 %	SW	0.0 km/h	0.0 km/h	1,013.88 hPa	0.00 mm	0.00 mm	0	0 w/m²
            writer.writerow({'Date': 'Date', 'Time': 'Time',	'Temperature': 'Temperature_C',	'Dew_Point': 'Dew_Point_C',	'Humidity': 'Humidity_%',	'Wind': 'Wind',	'Speed': 'Speed_kmh',	'Gust': 'Gust_kmh',	'Pressure': 'Pressure_hPa',	'Precip_Rate': 'Precip_Rate_mm',	'Precip_Accum': 'Precip_Accum_mm',	'UV': 'UV',   'Solar': 'Solar_w/m2'})
        elif UNIT_SYSTEM == "imperial":
            # 12:04 AM	75.9 F	65.0 F	69 %	SW	0.0 mph	0.0 mph	29.94 in	0.00 in	0.00 in	0	0 w/m²
            writer.writerow({'Date': 'Date', 'Time': 'Time',	'Temperature': 'Temperature_F',	'Dew_Point': 'Dew_Point_F',	'Humidity': 'Humidity_%',	'Wind': 'Wind',	'Speed': 'Speed_mph',	'Gust': 'Gust_mph',	'Pressure': 'Pressure_in',	'Precip_Rate': 'Precip_Rate_in',	'Precip_Accum': 'Precip_Accum_in',	'UV': 'UV',   'Solar': 'Solar_w/m2'})
        else:
            raise Exception("please set 'unit_system' to either \"metric\" or \"imperial\"! ")

        for date_string, url in url_gen:
            try:
                print(f'Scraping data from {url}')
                history_table = False
                while not history_table:
                    html_string = session.get(url, timeout=timeout)
                    doc = lh.fromstring(html_string.content)
                    history_table = doc.xpath('//*[@id="main-page-content"]/div/div/div/lib-history/div[2]/lib-history-table/div/div/div/table/tbody')
                    if not history_table:
                        print("refreshing session")
                        session = requests.Session()

                # parse html table rows
                data_rows = Parser.parse_html_table(date_string, history_table)

                # convert to metric system
                converter = ConvertToSystem(UNIT_SYSTEM)
                data_to_write = converter.clean_and_convert(data_rows)
                    
                print(f'Saving {len(data_to_write)} rows')
                writer.writerows(data_to_write)
            except Exception as e:
                print(e)



for url in URLS:
    url = url.strip()
    print(url)
    scrap_station(url)

# imoproved code by chat gpt
import requests
import csv
import lxml.html as lh
from datetime import datetime
import time
from util.UnitConverter import ConvertToSystem
from util.Parser import Parser
from util.Utils import Utils

def scrap_station(session, weather_station_url, start_date, end_date, unit_system):
    # Function to scrape data from a single weather station URL
    try:
        url_gen = Utils.date_url_generator(weather_station_url, start_date, end_date)
        station_name = weather_station_url.split('/')[-1]
        file_name = f'{station_name}.csv'

        with open(file_name, 'a+', newline='') as csvfile:
            fieldnames = ['Date', 'Time', 'Temperature', 'Dew_Point', 'Humidity', 'Wind', 'Speed', 'Gust', 'Pressure', 'Precip_Rate', 'Precip_Accum', 'UV', 'Solar']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            for date_string, url in url_gen:
                print(f'Scraping data from {url}')
                html_string = session.get(url).content
                doc = lh.fromstring(html_string)
                history_table = doc.xpath('//*[@id="main-page-content"]/div/div/div/lib-history/div[2]/lib-history-table/div/div/div/table/tbody')

                if history_table:
                    data_rows = Parser.parse_html_table(date_string, history_table)
                    converter = ConvertToSystem(unit_system)
                    data_to_write = converter.clean_and_convert(data_rows)
                    writer.writerows(data_to_write)
                    print(f'Saved {len(data_to_write)} rows to {file_name}')
                else:
                    print("No data found for the given date.")

    except Exception as e:
        print(f"Error scraping {weather_station_url}: {e}")

def main():
    stations_file = open('stations.txt', 'r')
    URLS = stations_file.readlines()
    stations_file.close()

    start_date = datetime.now()
    end_date = datetime.now()
    unit_system = "metric"  # or "imperial"

    session = requests.Session()

    while True:
        print("Waiting...")
        current_time = datetime.now()
        hour = current_time.minute

        try:
            if hour % 55 == 0:
                for url in URLS:
                    url = url.strip()
                    scrap_station(session, url, start_date, end_date, unit_system)
                print("Scraping complete.")

        except Exception as e:
            print("Error: ", e)

        time.sleep(50)

if __name__ == "__main__":
    main()

