from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def hello():
    return "Hello World from Regular Snails"

@app.get("/")
def ian():
    return "This is a super secret message!"

@app.get("/status")
def status():
    return jsonify(ok=True, team="Regular Snails", msg="My first API")

if __name__ == "__main__":
    app.run(port=3000)
