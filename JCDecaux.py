#Import the requests library, enabling HTTP requests to call the JCDeaux API
import requests
#Import the schedule library, enabling pre-scheduled periodical function calls
import schedule
#Import the time library, which is used to delay/ pause the script for a pre-determined amount of time
#This prevents the server from being overwhelmed with requests
import time

#Define a new function to fetch the dynamic data and print it in the console
def fetch_and_print_dynamic_data():

    #set the url variable to the desired endpoint, including my API key as a request parameter
    url = "https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=c71f6872f9359536542e7afa8526e69e34d20922"
    
    #Use a try block for error handling
    try:
        #use a get request on the url and store the response in the 'response' variable
        response = requests.get(url)
        #Raises an exception for 4XX/5XX errors
        response.raise_for_status()
        #Parses the JSON response content and converts it into a Python dictionary stored in the variable data
        data = response.json()
        #For now we'll just print the data in console, later we need to alter this so that data can be represented in a html component
        print(data)

    #Catches any exceptions thrown by the requests library and stores the exception object in e
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")

# Use the Schedule library to schedule the script every 5 minutes
schedule.every(5).minutes.do(fetch_and_print_dynamic_data)

# Run the scheduler in an infinite loop
while True:
    #Enters an infinite loop that continually checks if there's a scheduled task ready to run (using schedule.run_pending())
    schedule.run_pending()
    #wait for one second to check again if there is a scheduled task ready to run
    time.sleep(1)

#Note: 
    #to keep the script running even after you log out from the server/ close the terminal
    #On the Ubuntu command line, type 
    #nohup python script_name.py &
    #However, if the instance is stopped, the script will also stop


