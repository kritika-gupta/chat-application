import os
import time
import json
from classes import *

from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "kritika123"
socketio = SocketIO(app)

# global data to be shared among all users
firstChannel = Channel(name="Home")
channel_dict = {"Home":firstChannel}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("new channel")
def add_channel(data):
    name = data["name"]

    # unique channel name
    if name not in channel_dict:
        channel = Channel(name=name)
        channel_dict[name] = channel
        channel_json = json.dumps(channel.__dict__, default=lambda o: o.__dict__)
        emit("channel added", channel_json, broadcast=True)
    else:
        emit("duplicate channel", name)

@socketio.on("connect")
def connect():
    for channel in channel_dict:
        channel_json = json.dumps(channel_dict[channel].__dict__, default=lambda o: o.__dict__)
        emit("channel added", channel_json)
        
@socketio.on("send message")
def new_message(data):
    channel = channel_dict[data["channel"]]
    channel.add_message(content=data["content"], sender=data["sender"])

    emit("get message", data, broadcast=True)

@app.route("/channel/<string:name>")
def channel(name):
    if name not in channel_dict:
        name = firstChannel.name
    return json.dumps(obj=channel_dict[name].__dict__, default=lambda o: o.__dict__)
