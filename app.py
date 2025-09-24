from flask import Flask, jsonify
app = Flask(__name__)

# Existing endpoints
@app.get("/")
def hello():
    return "Hello World from Regular Snails"

@app.get("/status")
def status():
    return jsonify(ok=True, team="Regular Snails", msg="My first API")

# add api function
@app.get("/jtrejomyapi")
def my_api():
    return "This is the new HTTP API function"

if __name__ == "__main__":
    app.run(port=3000)
