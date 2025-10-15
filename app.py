from flask import Flask, jsonify, render_template
app = Flask(__name__)

@app.get("/")
def home():
    return render_template('home.html')

@app.get("/status")
def status():
    return jsonify(ok=True, team="Regular Snails", msg="My first API")

if __name__ == "__main__":
    app.run(port=80)
