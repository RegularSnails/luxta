from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def hello():
    return "Hello World from Regular Snails"

@app.get("/status")
def status():
    return jsonify(ok=True, team="Regular Snails", msg="My first API")

# api added
@app.get("/jtrejomyapi")
def my_api():
    return "This is the new HTTP API function"

# photography assitance type idea 
def calc_avg_brightness(brightness_values):
    if not brightness_values:
        return 0
    return sum(brightness_values) / len(brightness_values)

@app.get("/brightness")
def brightnessEndp():
    # example data, setting up for situation presented
    
    values = [100, 180, 200]
    avg = calc_avg_brightness(values)
    return jsonify(avg_brightness=avg)


if __name__ == "__main__":
    app.run(port=3000)
