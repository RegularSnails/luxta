from flask import Flask, jsonify, redirect, url_for, request, render_template, session, flash

app = Flask(__name__)
app.secret_key='secret123'

@app.get("/")
def hello():
    return "Hello World from Regular Snails"

users = {
    "alex": "password123",
    "admin": "adminpass"
}

@app.route('/login', methods=['POST', 'GET'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    if username in users and users[username] == password:
        session['username'] = username
        flash('Login successful!', 'success')
        return redirect(url_for('dashboard'))
    else:
        flash('Invalid credentials', 'danger')
        return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(port=3000, debug=True)
