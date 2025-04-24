


// Function to adjust the size of existing time blocks
function adjustTimeBlockHeights() {
    // Loop through each day in the calendar
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
        const dayCell = document.querySelector(`.gridcell[data-day="${day}"]`);

        

        // Loop through each time block in the grid cell for that day
        const timeBlocks = dayCell.querySelectorAll('.time-block');

        if (dayCell) {
            let dayStart = 0;
            if (timeBlocks.length > 0)
                dayStart = convertTo24Hour(timeBlocks[0].getAttribute('data-start'))

            for (let i = 0; i < timeBlocks.length; i++) {
                block = timeBlocks[i];

                const startTime = block.getAttribute('data-start');
                const endTime = block.getAttribute('data-end');

                // Convert the start and end times to 24-hour format numbers
                const startHour = convertTo24Hour(startTime);
                const endHour = convertTo24Hour(endTime);

                // Calculate the duration of the time block
                const duration = endHour - startHour;

                // Calculate block height as a percentage
                const blockHeightPercentage = (duration / 8) * 100/3 - 2; // Divide by 3 idk why ( and the minus 2 is for spacing of the day cell)

                // Calculate the top offset based on the block's start time
                const offsetFromDayStart = startHour*11.2;  // 11.2 is for offset
                let topOffsetPercentage = (offsetFromDayStart / 24) * 100/12;

                // Set the block height based on the calculated percentage
                block.style.height = `${blockHeightPercentage}%`;
                block.style.top = `${topOffsetPercentage}%`;
            }
        }
    });
}

// Helper function to convert time to 24-hour format (for example: 9:00 AM -> 9)
function convertTo24Hour(time) {
    const [hour, minute] = time.split(':');
    const period = time.slice(-2).toUpperCase(); // AM or PM

    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 < 12)
        hour24 += 12;
    if (period === 'AM' && hour24 == 12)
        hour24 += 12;

    hour24 += parseInt(minute) / 60;

    return hour24;
}

// Call the function to adjust time block heights
adjustTimeBlockHeights();





// Function to update the calendar with events
function updateCalendar(events) {
    console.log("Events:", events)

    //For every day, delete old
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    days.forEach(day => {
        const dayCell = document.querySelector(`.gridcell[data-day="${day}"]`);
        // Delete old
        dayCell.replaceChildren();
    });

    // Add each new item
    events.forEach(event => {
        //Create the time block
        const timeBlock = document.createElement("div");
        timeBlock.classList.add("time-block");
        st = event.start;
        end = event.end;
        timeBlock.setAttribute("data-start", st);
        timeBlock.setAttribute("data-end", end);
        timeBlock.textContent = event.event;
        const day = event.day;
        const dayCell = document.querySelector(`.gridcell[data-day="${day}"]`);
        // Add new
        dayCell.appendChild(timeBlock);
    });

    adjustTimeBlockHeights();
}