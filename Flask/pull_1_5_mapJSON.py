from functions import fetch_stations_coordinates, calculate_distances, save_mapping_to_json

#Imports functions from functions.py to 
def main():
    stations_data = fetch_stations_coordinates()
    if stations_data is not None:
        closest_stations = calculate_distances(stations_data)
        save_mapping_to_json(closest_stations)
        print("JSON file with closest stations created successfully.")

if __name__ == "__main__":
    main()