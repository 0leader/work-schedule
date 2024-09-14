// Schedule data (Mohamed's and Emma's shifts for 4 weeks)
const scheduleData = {
    weeks: [
        // Week 1
        {
            Sunday: { mohamed: "09:45-17:00", emma: "12:00-15:00" }
        },
        // Week 2
        {
            Saturday: { mohamed: "11:15-17:15", emma: "09:45-15:00" },
            Sunday: { mohamed: "12:00-17:15", emma: "09:45-16:00" }
        },
        // Week 3
        {
            holiday: true
        },
        // Week 4
        {
            Saturday: { mohamed: "11:15-17:15", emma: "09:45-15:00" },
            Sunday: { mohamed: "12:00-15:00", emma: "09:45-17:15" }
        }
    ]
};

// Function to calculate the current week in the 4-week cycle
function getCurrentWeek() {
    const startDate = new Date("2024-09-14"); // Updated start date
    const today = new Date();
    const diffInTime = today - startDate;
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
    const currentWeek = Math.floor(diffInDays / 7) % 4; // Modulo 4 to get current week in the cycle

    return currentWeek;
}

// Function to get the current calendar week number (ISO 8601 standard)
function getCurrentCalendarWeek() {
    const now = new Date();
    const januaryFourth = new Date(now.getFullYear(), 0, 4); // Jan 4th is always in week 1 according to ISO 8601
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1;
    
    // ISO 8601: Week starts on Monday (getDay() returns 0 for Sunday)
    const dayOfWeek = (now.getDay() + 6) % 7 + 1; // Get day of the week (Monday=1, Sunday=7)

    const jan4WeekDay = (januaryFourth.getDay() + 6) % 7 + 1;
    const firstWeekOffset = jan4WeekDay <= 4 ? -jan4WeekDay + 1 : 7 - jan4WeekDay + 1;

    const isoWeekNumber = Math.ceil((dayOfYear + firstWeekOffset) / 7);
    
    return isoWeekNumber;
}


// Function to display the schedule for a specific week
function displayWeekSchedule(weekIndex, weekElementId, weekName) {
    const weekElement = document.getElementById(weekElementId);
    weekElement.innerHTML = `<h2>${weekName}</h2>`;

    const week = scheduleData.weeks[weekIndex];
    
    if (week.holiday) {
        weekElement.innerHTML += `<p style="font-size: 24px; color: #FF69B4;">HOOOOLIDAYYYYYYYYYYY!!!</p>`;
    } else {
        let table = `<table>
            <tr>
                <th>Day</th>
                <th>Your Shift</th>
                <th>Emma's Shift</th>
            </tr>`;
        
        for (const [day, schedule] of Object.entries(week)) {
            table += `<tr>
                <td><strong>${day}</strong></td>
                <td>${schedule.mohamed || "No shift"}</td>
                <td>${schedule.emma || "No shift"}</td>
            </tr>`;
        }

        table += `</table>`;
        weekElement.innerHTML += table;
    }
}

// Function to display the work schedule for the current week and the next 3 weeks
function displayFullSchedule() {
    const currentWeekIndex = getCurrentWeek();

    // Show the current week
    displayWeekSchedule(currentWeekIndex, "currentWeek", `Week ${currentWeekIndex + 1} (Current Week)`);

    // Show the next 3 weeks (using modulo to loop back to week 1 after week 4)
    displayWeekSchedule((currentWeekIndex + 1) % 4, "nextWeek1", `Week ${((currentWeekIndex + 1) % 4) + 1}`);
    displayWeekSchedule((currentWeekIndex + 2) % 4, "nextWeek2", `Week ${((currentWeekIndex + 2) % 4) + 1}`);
    displayWeekSchedule((currentWeekIndex + 3) % 4, "nextWeek3", `Week ${((currentWeekIndex + 3) % 4) + 1}`);
}

// Function to toggle upcoming weeks visibility
function toggleUpcomingWeeks() {
    const upcomingWeeks = document.getElementById("upcomingWeeks");
    const toggleButton = document.getElementById("toggleButton");

    if (upcomingWeeks.style.display === "none") {
        upcomingWeeks.style.display = "block";
        toggleButton.textContent = "Hide Upcoming Weeks";
    } else {
        upcomingWeeks.style.display = "none";
        toggleButton.textContent = "Show Upcoming Weeks";
    }
}

// Function to display the current calendar week
function displayCalendarWeek() {
    const weekNumber = getCurrentCalendarWeek();
    const calendarWeekElement = document.getElementById("calendarWeek");
    calendarWeekElement.innerHTML = `<strong>Current Calendar Week: ${weekNumber}</strong>`;
}

// Function to check if you have work this week
function checkWorkThisWeek() {
    const currentWeekIndex = getCurrentWeek();
    const currentWeek = scheduleData.weeks[currentWeekIndex];
    const hasWork = !currentWeek.holiday && Object.values(currentWeek).some(day => day.mohamed);
    
    const workStatusElement = document.getElementById('workStatus');
    workStatusElement.innerHTML = `<h3>Work Status This Week:</h3>
        <p>${hasWork ? 'You have work this week.' : currentWeek.holiday ? 'HOOOOLIDAYYYYYYYYYYY!!!' : 'You do not have work this week.'}</p>`;
}

// Function to check and display/hide the full schedule data
function checkData() {
    const dataContainer = document.getElementById('dataCheck');
    const checkDataButton = document.getElementById('checkDataButton');
    
    if (dataContainer.style.display === 'none' || dataContainer.innerHTML === '') {
        dataContainer.style.display = 'block';
        dataContainer.innerHTML = '<h3>Schedule Data:</h3>';
        
        scheduleData.weeks.forEach((week, index) => {
            dataContainer.innerHTML += `<h4>Week ${index + 1}:</h4>`;
            if (week.holiday) {
                dataContainer.innerHTML += '<p>HOOOOLIDAYYYYYYYYYYY!!!</p>';
            } else {
                for (const [day, schedule] of Object.entries(week)) {
                    dataContainer.innerHTML += `<p><strong>${day}:</strong><br>
                        Mohamed: ${schedule.mohamed || 'No shift'}<br>
                        Emma: ${schedule.emma || 'No shift'}</p>`;
                }
            }
        });
        
        checkDataButton.textContent = 'Hide Data';
    } else {
        dataContainer.style.display = 'none';
        checkDataButton.textContent = 'Check Data';
    }
}

// Initialize schedule display on page load
window.onload = function() {
    displayFullSchedule();
    displayCalendarWeek();
    checkWorkThisWeek();
    
    // Add event listeners for buttons
    document.getElementById("toggleButton").addEventListener("click", toggleUpcomingWeeks);
    document.getElementById("checkDataButton").addEventListener("click", checkData);
    
    // Initialize dataCheck container
    document.getElementById('dataCheck').style.display = 'none';
};