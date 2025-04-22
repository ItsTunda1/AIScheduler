import ollama
import re



def chat(input):

    # Format the messages correctly
    messages = [{"role": "user", "content": input}]

    # Call the model and print the response
    response = ollama.chat(model="deepseek-r1", messages=messages)

    # Extract total_duration using regex
    total_duration_match = re.search(r"total_duration=(\d+)", str(response))
    total_duration = (int(total_duration_match.group(1)) / 1_000_000_000) if total_duration_match else None

    # Extract text from the message field (content)
    #message_match = re.search(r"message=Message\(role='assistant', content='(.*?)',", str(response), re.DOTALL)
    #message_text = message_match.group(1) if message_match else None

    # Clean up the message text by removing the <think> tags and extra newlines
    #message_text = re.sub(r"<think>\n*\s*</think>", "", message_text).strip()

    # Print the extracted values
    print("Total Duration:", total_duration)
    #print("Message Text:", message_text)
    #print(response)
    return response





if __name__ == "__main__":
    # Interactive loop
    print("Chatbot is running! Type 'exit' to quit.\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            break

        print(chat(user_input))