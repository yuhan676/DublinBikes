from flask import Flask, render_template
import pandas as pd
import matplotlib as mp
import requests
import sqlalchemy as sqla
import datetime as dt
import numpy as mp
import sys
import os
import traceback as tb
import json
# import seaborn as sns
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# # create flask app, static files for static directory
# app = Flask(__name__, static_url_patj='')
# app.config.from_object('config')

def connect_db():
    #!!remember to move these credentials out before submitting!!
    db_type = 'mysql'  # Change to 'mysql' for MySQL/MariaDB
    username = 'admin'
    password = 'DublinBike2024%'
    hostname = 'database-dublinbike.c1g2mg4aerll.eu-north-1.rds.amazonaws.com'
    port = '3306'  # Use '3306' for MySQL/MariaDB
    default_db = 'mysql'  # Use 'mysql' for MySQL/MariaDB
    db_name = 'dublinbike_db'
    return create_engine(f'{db_type}://{username}:{password}@{hostname}:{port}/{db_name}')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database(host, username, password, port)
    return db

def get_station_names():
        sql = "SELECT name FROM station;"
        try:
            with engine.connect() as conn:
                result = conn.execute(sql)
                # Fetch all the results and extract the 'name' column into a list
                station_names = [row['name'] for row in result.fetchall()]
                return station_names
        except Exception as e:
            print(f"An error occurred: {traceback.format_exc()}")
            return []


