from bottle import default_app, route, run, template, static_file, post, request, abort, response, error
import json
import re

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
  - Event A: 11:00 or 4:00
  - Event B: 4:00 or 7:00

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
1. A finalized schedule, seperated by newlines, with the title ### Final Schedule: Events labeled as [Event]: [Start] - [End]
Example:
- Math: Sunday - 12:00 PM - 3:00 PM
- Club: Friday - 4:00 PM - 6:00 PM
2. A brief rationale explaining how user preferences were considered or where trade-offs were made

### Objectives:
{}

### User Prompt:
{}
"""
# API route to receive messages
@post('/api/objectives')
def receive_message_obj():
    # Get the message from the request body (JSON)
    data = request.json
    message = data.get('message')
    
    # Get Objectives
    obj_resp = str(chatbot.chat(obj_prompt.format(message))['message']['content'].split('</think>\n\n')[1])
    # Run the parser
    prefs, events = parse_schedule_input(obj_resp)
    #prefs, events = ["", ""]

    # Prepare the response containing both chat and calendar data
    response.content_type = 'application/json'
    return json.dumps({
        "status": "success",
        "message": message,
        "objectives": [prefs, events],
    })

# API route to receive messages
@post('/api/schedule')
def receive_message_sch():
    # Get the message from the request body (JSON)
    data = request.json
    message = data.get('message')
    obj_resp = data.get('objectives')

    # Make Schedule
    chat_resp = str(chatbot.chat(sch_prompt.format(obj_resp, message))['message']['content'].split('</think>\n\n')[1])

    # Parse the event times
    selected_events = ParseEvents(chat_resp)

    # Reformat as dictionary
    formatted = [{"day": day, "start": start, "end": end, "event": event} for event, day, start, end in selected_events]
    print(formatted)

    # Prepare the response containing both chat and calendar data
    response.content_type = 'application/json'
    return json.dumps({
        "status": "success",
        "message": message,
        "events": formatted,
        "chatresp": chat_resp
    })

"""
Examples:
==============
Class A starts at either 12:00 or 3:00. Class B starts at either 3:00 or 5:00. I want late classes.
I can have calc2 at 3:00 PM or 4:00 PM. I can have W131 at 12:00 PM or 6:00 PM. Each class is 3 hours long. I want late classes.
I can have calc2 at 3:00 PM or 4:00 PM. I can have W131 at 12:00 PM or 7:00 PM. Each class is 3 hours long. I want classes after 12:00 PM. Both classes are on Wednesday. The I have a 3rd class called AI that is only on Mondays at 1:00 PM.
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


def ParseEvents(chat_resp):
    #events = []
    events_raw_plus = chat_resp.split("### Final Schedule:\n")
    if (len(events_raw_plus) > 1):
        # Use regex to split whenever a new dash-prefixed line starts
        entries = re.split(r'-\s*', events_raw_plus[1])

        # The first entry might be text before the first dash — skip it if needed
        # So we keep everything *after* the first item, and re-add the dash
        schedule_raw = ["- " + entry.strip() for entry in entries[1:]]
        
        # Remove extra lines (if any) after last item
        last_item = schedule_raw.pop()

        # If it has extra cut it off and replace
        last_item_parsed = last_item.split("\n")
        if (len(last_item_parsed) > 1):
            last_item = last_item_parsed[0]
        schedule_raw.append(last_item)

        # Get day
        schedule = []
        for item in schedule_raw:
            split = item.split(": ")
            if (len(split) > 1):
                schedule.append(split[0])
                schedule.append(split[1])
            else:
                schedule.append(item)

        # Remove leading "-"
        schedule_cleaned = [re.sub(r'^\s*-\s*', '', item) for item in schedule]
        print("sch cleaned", schedule_cleaned)

        # Recombine end times (every other)
        schedule_fulltimes = []
        for i in range(len(schedule_cleaned)):
            item = schedule_cleaned[i]
            if (i % 4 == 0):
                name = item
            elif (i % 4 == 1):
                day = item
            elif (i % 4 == 2):
                start = item
            else:
                end = item
                schedule_fulltimes.append([name, day, start, end])
        print("sch times", schedule_fulltimes)
        return schedule_fulltimes





@route('/')
def home():
    return template("index.html")

# Route to serve static files
@route('/static/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='./static')







application = default_app()
run(host='localhost', port=5500, debug=True)    #port is the same as the index.html