from bottle import default_app, route, run, template, static_file, post, request, abort, response, error
import json
import random

# Deepseek
import deepseekDirect as chatbot



"""
Send data to calender.js
"""
# Example events
event_pool = [
    {"date": "2025-04-01", "event": "Meeting with Bob"},
    {"date": "2025-04-02", "event": "Doctor's Appointment"},
    {"date": "2025-04-03", "event": "Project Deadline"},
    {"date": "2025-04-04", "event": "Family Dinner"},
    {"date": "2025-04-05", "event": "Gym Session"},
    {"date": "2025-04-06", "event": "Coffee with Alice"},
]





"""
Get data from chatbox.js
"""
# API route to receive messages
@post('/api/chat')
def receive_message():
    # Get the message from the request body (JSON)
    data = request.json
    message = data.get('message')

    # You can process the message here (e.g., save to a database, send a response, etc.)
    print(f"Received message: {message}")

    # Send data to calender.js
    # Get calendar data
    selected_events = random.sample(event_pool, 3)  # Random events
    
    # Send a message to the bot
    chat_resp = str(chatbot.chat(message)['message']['content'].split('</think>\n\n')[1])

    # Prepare the response containing both chat and calendar data
    response.content_type = 'application/json'
    return json.dumps({
        "status": "success",
        "message": message,
        "events": selected_events,
        "chatresp": chat_resp
    })







@route('/')
def home():
    return template("index.html")

# Route to serve static files
@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')







application = default_app()
run(host='localhost', port=5500, debug=True)    #port is the same as the index.html