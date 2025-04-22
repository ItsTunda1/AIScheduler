// Listen for the Enter key press event on the chatbox
document.getElementById("chatbox").addEventListener("keydown", function(event) {

    // Check if the Enter key (keyCode 13) is pressed and the Shift key is not pressed
    if (event.key === "Enter" && !event.shiftKey) {
        //Check if loading is done before submitting
        if (done_loading == true) {
            event.preventDefault();  // Prevent default "Enter" behavior (creating a new line)

            // Get the message from the chatbox
            let message = document.getElementById("chatbox").value.trim();

            if (message) {
                //Start loading
                startLoading();

                // Send the message to the server (Python backend)
                sendMessageToServer(message);
                console.log("Message (js): " + message)

                // Clear the chatbox after sending the message
                document.getElementById("chatbox").value = "";
            }
        }
    }
});

function updateChat(chat_resp) {
    // Show it to the user
    document.querySelector('.content').textContent = chat_resp;
    stopLoading();
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
let done_loading = true;

// Helper function to delay (stop loading)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function stopLoading() {
    //Wait at least 1 sec
    await delay(300);

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
            //dot.style.animation = "none";
            // Linear animation
            dot.style.animation = `slideRight${index + 1} 1s ease-out, fadeOut 1s ease ${delay / 1000}s forwards`;
        }, delay); // Delay is in milliseconds
    });

    // After animation finishes, reveal content
    let fade_delay = 800;
    setTimeout(() => {
        //content.classList.remove('hidden');
        content.classList.add('reveal');
    }, fade_delay); // Adjust this timeout to match your animation duration

    // Type out the content like CHATGPT LOL :> hehe (classy css)
    let letter_delay = 50;
    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            content.textContent += text[i];

            // Remove the dots
            if (letter_delay * i >= 200) {
                const loader = document.querySelector('.loader-container');
                // Start fade out animation
                loader.classList.add('fade-out');
                content.classList.remove('hidden');
            }

            //Set the loading to be done on the last letter
            if (i == text.length - 1) {
                //Hide loading
                loader.style.visibility = 'hidden';
                done_loading = true;
            }
        }, letter_delay * i + 0.75*fade_delay);
    }
}

function startLoading() {
    //Set done loading to false
    done_loading = false;

    const loader = document.querySelector('.loader-container');
    const content = document.querySelector('.content');
    const dots = document.querySelectorAll('.dot');

    //Show loading
    loader.style.visibility = 'visible';

    // Reset states
    content.classList.remove('reveal');
    content.classList.add('hidden');
    loader.style.display = 'block';
    loader.classList.remove('fade-out');

    // Trigger spin (orbit animation is already in CSS)
    dots.forEach((dot, index) => {
    dot.style.animation = `orbit${index + 1} 0.6s linear infinite`;
    });
}

// Reset states
const loader = document.querySelector('.loader-container');
const content = document.querySelector('.content');
const dots = document.querySelectorAll('.dot');
content.classList.remove('reveal');
content.classList.add('hidden');
loader.style.display = 'block';
loader.classList.remove('fade-out');