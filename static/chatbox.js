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
    stopLoading(chat_resp);
}

// Function to send the message to the Python server (API)
// Gets Objectives
function sendMessageToServer(message) {
    // Objectives
    let objectives;
    fetch("/api/objectives", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message })  // Send the message as JSON
    })
    .then(response => response.json())
    .then(data => {
        console.log("Message sent successfully:", data);
        objectives = data.objectives
        console.log("Objectives:", objectives)
        //Add Objectives
        addItems(data.objectives)
    })
    .catch(error => console.error("Error sending message:", error));



    // Schedule
    fetch("/api/schedule", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message, objectives: objectives })  // Send the message as JSON
    })
    .then(response => response.json())
    .then(data => {
        console.log("Message sent successfully:", data);
        console.log("Bot Response:", data.chatresp)
        //Show Chat
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

async function stopLoading(text) {
    //Wait at least 0.3 sec
    await delay(300);

    const dots = document.querySelectorAll('.dot');
    const content = document.querySelector('.responsebox');     //Text Area
    content.textContent = "";

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
        //content_tmp.classList.add('reveal');
    }, fade_delay); // Adjust this timeout to match your animation duration

    // Type out the content like CHATGPT LOL :> hehe (classy css)
    let letter_delay = 20;
    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            content.textContent += text[i];

            // Remove the dots
            if (letter_delay * i >= 200) {
                const loader = document.querySelector('.loader-container');
                // Start fade out animation
                loader.classList.add('fade-out');
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
    const dots = document.querySelectorAll('.dot');

    //Show loading
    loader.style.visibility = 'visible';

    // Reset states
    loader.style.display = 'block';
    loader.classList.remove('fade-out');

    // Trigger spin (orbit animation is already in CSS)
    dots.forEach((dot, index) => {
    dot.style.animation = `orbit${index + 1} 0.6s linear infinite`;
    });
}

// Reset states
const loader = document.querySelector('.loader-container');
const dots = document.querySelectorAll('.dot');
loader.style.display = 'block';
loader.classList.remove('fade-out');






// Objective List Functions
function addItems(data) {
    const per_ul = document.getElementById("perList");

    if (data[0] !== "") {
        const li = document.createElement("li");
        li.textContent = data[0];
        per_ul.appendChild(li);
    }

    const event_ul = document.getElementById("eventList");

    if (data[1] !== "") {
        const li = document.createElement("li");
        li.textContent = data[1];
        event_ul.appendChild(li);
    }
}

function removeLastItem() {
    const per_ul = document.getElementById("perList");
    const per_lastItem = per_ul.lastElementChild;
    
    if (per_lastItem) {
        per_ul.removeChild(per_lastItem);
    }

    const event_ul = document.getElementById("eventList");
    const event_lastItem = event_ul.lastElementChild;
    
    if (event_lastItem) {
        event_lastItem_ul.removeChild(event_lastItem);
    }
}