from bottle import default_app, route, run, template, static_file, post, request, abort, response, error
import json
import random

# Deepseek
import deepseekDirect as chatbot





"""
Get data from chatbox.js & Send data to calender.js
"""
# Prompt for the objectives generator
obj_prompt = """
### Instructions:
You are a scheduling assistant. The user will give you time blocks of events and you will help take notes on important points.
Be very careful not modify the times provided or hallucinate any events.
Take notes and list the goals provided by the user as short bullet points.
Such goals could be; how often, late, or early they want a class. If they want classes on certian days. Short vs longer classes, etc.

### User Prompt:
{}
"""

# Prompt for the schedule generator
sch_prompt = """
### Instructions:
You are a scheduling assistant. The user will give you time blocks of events and you will help organize it based on their criteria.
Send the best schedule based on the criteria. Be very careful not modify the times provided or hallucinate any events.
List goals provided by the user under the "### Objectives:" flag.
Try to reduce any scheduling conflicts if possible.
If not possible tell the user about the dilemma.

### User Prompt:
{}

### Objectives:
"""
# API route to receive messages
@post('/api/chat')
def receive_message():
    # Get the message from the request body (JSON)
    data = request.json
    message = data.get('message')

    # You can process the message here (e.g., save to a database, send a response, etc.)
    print(f"Received message: {message}")
    
    # Send a message to the bot
    ai_resp = chatbot.chat(obj_prompt.format(message))
    print("AI response:", ai_resp)
    chat_resp = str(ai_resp['message']['content'].split('</think>\n\n')[1])
    #chat_resp = "no ai"

    selected_events = [{"day": "Friday", "start": "0:00 AM", "end": "12:00 PM", "event": "Meeting with Bob"},
                       {"day": "Sunday", "start": "12:00 PM", "end": "6:00 PM", "event": "Meeting with Bob"},]

    # Prepare the response containing both chat and calendar data
    response.content_type = 'application/json'
    return json.dumps({
        "status": "success",
        "message": message,
        "events": selected_events,
        "chatresp": chat_resp
    })

"""
Example:
Class A starts at either 12:00 or 3:00. Class B starts at either 3:00 or 5:00. I want late classes.
"""







@route('/')
def home():
    return template("index.html")

# Route to serve static files
@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')







application = default_app()
run(host='localhost', port=5500, debug=True)    #port is the same as the index.html