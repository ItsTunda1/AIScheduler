from bottle import default_app, route, run, template, static_file, post, request, abort, response, error
import json
import random

# Deepseek
import deepseekDirect as chatbot

# Bart
#import summarize as sum





"""
Get data from chatbox.js & Send data to calender.js
"""
# Prompt for the objectives generator
obj_prompt = """
### Instructions:
You are a scheduling assistant. The user will give you events, and you will take structured notes.

Your output must have two parts:
1. **User preferences** — summarize user-stated goals (e.g., “late classes”, “avoid Mondays”).
2. **Event options** — list all provided events with ALL original time options exactly as written.

⚠️ VERY IMPORTANT RULES:
- NEVER modify, fix, or assume any time.
- If the user says “Class A: 11:00 or 4:00”, you must repeat it exactly.
- Even a 1-hour change is unacceptable.
- Do not "correct" times to match a pattern or make them evenly spaced.
- If unsure, copy the user’s wording exactly.

Your output should look like: (write titles exactly)
- User preferences:
  - [user’s stated goals]
- Event options:
  - Class A: 11:00 or 4:00
  - Class B: 4:00 or 7:00

### User Prompt:
{}
"""

# Prompt for the schedule generator
sch_prompt = """
### Instructions:
You are a scheduling assistant. The user will give you time blocks for several events, and your job is to organize them into a schedule that best fits their preferences.

You must:
- Use only the exact time options provided — do not change or add any times.
- Avoid hallucinating or inventing new events.
- Follow the user's objectives carefully and prioritize their preferences.
- If objectives conflict or a perfect schedule is impossible, explain the trade-off clearly.

Try to:
- Avoid overlapping events
- Space events out when requested
- Prioritize preferred times (e.g. “late classes”)

At the end, present:
1. A finalized schedule
2. A brief rationale explaining how user preferences were considered or where trade-offs were made

### Objectives:
{}

### User Prompt:
{}
"""
# API route to receive messages
@post('/api/chat')
def receive_message():
    # Get the message from the request body (JSON)
    data = request.json
    message = data.get('message')

    # You can process the message here (e.g., save to a database, send a response, etc.)
    #print(f"Received message: {message}")
    
    # Get Objectives
    obj_resp = str(chatbot.chat(obj_prompt.format(message))['message']['content'].split('</think>\n\n')[1])
    # Run the parser
    prefs, events = parse_schedule_input(obj_resp)
    #print("Preferences:", prefs)
    #print("Event Options:", events)

    # Make Schedule
    chat_resp = str(chatbot.chat(sch_prompt.format(obj_resp, message))['message']['content'].split('</think>\n\n')[1])
    #chat_resp = "no ai"

    selected_events = [{"day": "Friday", "start": "0:00 AM", "end": "12:00 PM", "event": "Meeting with Bob"},
                       {"day": "Sunday", "start": "12:00 PM", "end": "6:00 PM", "event": "Meeting with Bob"},]

    # Prepare the response containing both chat and calendar data
    response.content_type = 'application/json'
    return json.dumps({
        "status": "success",
        "message": message,
        "events": selected_events,
        "objectives": [prefs, events],
        "chatresp": chat_resp
    })

"""
Example:
Class A starts at either 12:00 or 3:00. Class B starts at either 3:00 or 5:00. I want late classes.
"""

def parse_schedule_input(text):
    # Normalize dashes and spacing
    text = text.replace(" -", "-")  # remove space before dashes
    parts = text.split("- ")
    parts = [p.strip() for p in parts if p.strip()]

    preferences = []
    events = []
    mode = None

    for part in parts:
        if "user preferences" in part.lower():
            mode = "preferences"
            continue
        elif "event options" in part.lower():
            mode = "events"
            continue

        if mode == "preferences":
            preferences.append(part)
        elif mode == "events":
            events.append(part)

    return preferences, events






@route('/')
def home():
    return template("index.html")

# Route to serve static files
@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')







application = default_app()
run(host='localhost', port=5500, debug=True)    #port is the same as the index.html