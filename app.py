from flask import Flask, jsonify, redirect, url_for, request
app = Flask(__name__)

@app.get("/")
def hello():
    return "Hello World from Regular Snails"

@app.route('/login', methods=['POST', 'GET'])
def login():
        return "Login page - work in progress :)", 400


if __name__ == "__main__":
    app.run(port=3000)