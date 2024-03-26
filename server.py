from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Initialize the number
number = 0

@app.route('/')
def index():
    return render_template('index.html', number=number)

@app.route('/click', methods=['POST'])
def click():
    global number
    number += 1
    # Broadcast the updated number to all connected clients
    return jsonify({'number': number})

if __name__ == '__main__':
    # Run the Flask app on all network interfaces (0.0.0.0) instead of localhost
    app.run(host='0.0.0.0', port=5000, debug=True)


