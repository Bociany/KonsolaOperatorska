import requests
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
	return render_template("index.html")

@app.route('/radios')
def radios():
	return requests.get('http://localhost:8080/radios').text