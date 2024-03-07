from functions import connect_db, fetch_dummy_data, write_json_to_file
def main():

    connect_db()
    # Mapping of table names to output JSON file names
    tables_to_files = {
        'station': 'dummy_JCDStatic.json',
        'station_status': 'dummy_JCDDynamic.json',
        'CurrentWeather': 'dummy_WeaCurrent.json',
        'FiveDayPrediction': 'dummy_WeaPredict.json',
        'ExtremeWeather': 'dummy_WeaExtreme.json'
    }

    # Iterate over the mapping to fetch data and write to files
    for table_name, file_name in tables_to_files.items():
        data = fetch_dummy_data(table_name)
        if data is not None:
            write_json_to_file(data, file_name)
            print(f'{table_name} data successfully written to {file_name}')
        else:
            print(f"Failed to fetch data from table '{table_name}'")


if __name__ == "__main__":
    main()


