// Listen for the Enter key press event on the chatbox
document.getElementById("chatbox").addEventListener("keydown", function(event) {
    // Check if the Enter key (keyCode 13) is pressed and the Shift key is not pressed
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();  // Prevent default "Enter" behavior (creating a new line)

        // Get the message from the chatbox
        let message = document.getElementById("chatbox").value.trim();

        if (message) {
            // Send the message to the server (Python backend)
            sendMessageToServer(message);
            console.log("Message (js): " + message)

            // Clear the chatbox after sending the message
            document.getElementById("chatbox").value = "";
        }
    }
});

function updateChat(chat_resp) {
    // Show it to the user
    document.getElementById("responsebox").value = chat_resp;
}

// Function to send the message to the Python server (API)
function sendMessageToServer(message) {
    fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })  // Send the message as JSON
    })
    .then(response => response.json())
    .then(data => {
        console.log("Message sent successfully:", data);
        console.log("Bot Response:", data.chatresp)
        updateChat(data.chatresp)
        
        // Call the function from calendar.js to update the calendar with the events
        updateCalendar(data.events);  // This will update the calendar with the events received
    })
    .catch(error => console.error("Error sending message:", error));
}