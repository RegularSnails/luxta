from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def hello():
    return "Welcome to Luxta! Under development."

@app.get("/status")
def status():
    return jsonify(ok=True, team="Regular Snails", msg="My first API")

if __name__ == "__main__":
    app.run(port=3000)
