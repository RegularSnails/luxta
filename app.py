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

# ---- new function to test ----
def average(numbers):
    """Return the average of a list of numbers."""
    if not numbers:
        raise ValueError("List cannot be empty")
    return sum(numbers) / len(numbers)

@app.get("/average")
def average_route():
    nums = [10, 20, 30]
    return jsonify(numbers=nums, average=average(nums))

if __name__ == "__main__":
    app.run(port=3000)
