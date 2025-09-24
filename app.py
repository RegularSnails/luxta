from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def hello():
    return "Hello World from Regular Snails"

@app.get("/luca")
def luca():
    return "Luca's first API should be working."

@app.get("/luca.json")
def luca_json():
    return jsonify(ok=True, owner="Luca", team="Regular Snails")

if __name__ == "__main__":
    app.run(port=3000)

