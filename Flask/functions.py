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
import seaborn as sns

# create flask app, static files for static directory
app = Flask(__name__, static_url_patj='')
app.config.from_object('config')

def connect_to_database(host, username, password, port, db):
    # implement code here
    # host: username: etc
    pass

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database(host, username, password, port)
    return db


