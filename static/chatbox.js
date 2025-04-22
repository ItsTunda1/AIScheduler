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





// Loading Animation Functionality

function stopLoading() {
    const dots = document.querySelectorAll('.dot');
    const content = document.querySelector('.content');
    const text = content.textContent
    content.textContent = ""

    // Stop the animation by setting the 'animation' to 'none'
    dots.forEach((dot, index) => {
        // Set a delay for each dot's animation (e.g., index * 200ms)
        const delay = index * 200; // 200ms delay for each dot
      
        // Use setTimeout to delay the addition of the animation
        setTimeout(() => {
            // Linear animation
            dot.style.animation = `flyRight 1s ease-out forwards, fadeOut 1s ease ${delay / 1000}s forwards`;
        }, delay); // Delay is in milliseconds
    });

    // After animation finishes, reveal content
    let fade_delay = 800;
    setTimeout(() => {
        document.querySelector('.loader-container').style.display = 'none';
        content.classList.remove('hidden');
        content.classList.add('reveal');
    }, fade_delay); // Adjust this timeout to match your animation duration

    // Type out the content like CHATGPT LOL :> hehe (classy css)
    let letter_delay = 50;
    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            content.textContent += text[i];
        }, letter_delay * i + 0.75*fade_delay);
    }
}
  
// Trigger the loading stop after a delay
setTimeout(stopLoading, 1000);

// Add keyframes dynamically for flyRight
const style = document.createElement('style');
style.textContent = `
@keyframes flyRight {
to {
    transform: translateX(300px);
    opacity: 0;
}
}`;
document.head.appendChild(style);  