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
    ],
    extraDays: [] // Will be loaded from localStorage
};

// Load extra days from localStorage
function loadExtraDays() {
    const savedExtraDays = localStorage.getItem('extraDays');
    if (savedExtraDays) {
        scheduleData.extraDays = JSON.parse(savedExtraDays).map(day => ({
            ...day,
            date: new Date(day.date)
        }));
    }
}

// Save extra days to localStorage
function saveExtraDays() {
    localStorage.setItem('extraDays', JSON.stringify(scheduleData.extraDays));
}

// Function to calculate the current week in the 4-week cycle
function getCurrentWeek() {
    const startDate = new Date("2024-01-01T00:00:00+02:00"); // Start date (Week 1) in CEST
    const today = new Date();
    
    // Calculate the difference in days
    const diffInTime = today - startDate;
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    const weeksSinceStart = Math.floor(diffInDays / 7);
    const currentWeek = weeksSinceStart % 4; // Modulo 4 to get current week in the cycle

    return currentWeek;
}

// Function to get the current calendar week number (ISO 8601 standard)
function getCurrentCalendarWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    
    return weekNumber;
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

        // Add extra work days for this week
        const startDate = new Date("2024-01-01T00:00:00+02:00");
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + weekIndex * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const extraDaysThisWeek = scheduleData.extraDays.filter(day => 
            day.date >= weekStart && day.date <= weekEnd
        );

        if (extraDaysThisWeek.length > 0) {
            table += `<tr><td colspan="3"><strong>Extra Work Days:</strong></td></tr>`;
            extraDaysThisWeek.forEach(day => {
                const formattedDate = day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                table += `<tr>
                    <td>${formattedDate}</td>
                    <td>${day.shift}</td>
                    <td>-</td>
                </tr>`;
            });
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

// New function to add an extra work day
function addExtraWorkDay(date, shift) {
    const extraDay = {
        date: new Date(date),
        shift: shift
    };
    scheduleData.extraDays.push(extraDay);
    scheduleData.extraDays.sort((a, b) => a.date - b.date);
    saveExtraDays(); // Save to localStorage
    updateExtraWorkDaysDisplay();
    displayFullSchedule(); // Refresh the main schedule display
}

function updateExtraWorkDaysDisplay() {
    const extraWorkDaysElement = document.getElementById('extraWorkDays');
    extraWorkDaysElement.innerHTML = '<h3>Extra Work Days</h3>';

    if (scheduleData.extraDays.length === 0) {
        extraWorkDaysElement.innerHTML += '<p>No extra work days scheduled.</p>';
        return;
    }

    let table = `<table>
        <tr>
            <th>Date</th>
            <th>Shift</th>
            <th>Action</th>
        </tr>`;

    scheduleData.extraDays.forEach((day, index) => {
        const formattedDate = day.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        table += `<tr>
            <td>${formattedDate}</td>
            <td>${day.shift}</td>
            <td><button onclick="deleteExtraWorkDay(${index})">Delete</button></td>
        </tr>`;
    });

    table += '</table>';
    extraWorkDaysElement.innerHTML += table;
}

function deleteExtraWorkDay(index) {
    // Remove the selected day from the schedule
    scheduleData.extraDays.splice(index, 1);
    
    // Save updated schedule to localStorage
    saveExtraDays();
    
    // Update the display
    updateExtraWorkDaysDisplay();
    displayFullSchedule(); // Refresh the main schedule display
}


// Function to handle form submission for adding extra work days
function handleExtraWorkDaySubmit(event) {
    event.preventDefault();
    const dateInput = document.getElementById('extraWorkDate');
    const shiftInput = document.getElementById('extraWorkShift');

    const date = dateInput.value;
    const shift = shiftInput.value;

    if (date && shift) {
        addExtraWorkDay(date, shift);
        dateInput.value = '';
        shiftInput.value = '';
    }
}

// Function to remove past extra work days
function removePastExtraDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of the day
    scheduleData.extraDays = scheduleData.extraDays.filter(day => day.date >= today);
    saveExtraDays();
}

// Initialize schedule display on page load
window.onload = function() {
    loadExtraDays(); // Load extra days from localStorage
    removePastExtraDays(); // Remove past extra days
    displayFullSchedule();
    displayCalendarWeek();
    checkWorkThisWeek();
    updateExtraWorkDaysDisplay();
    
    // Add event listeners for buttons
    document.getElementById("toggleButton").addEventListener("click", toggleUpcomingWeeks);
    document.getElementById("checkDataButton").addEventListener("click", checkData);
    document.getElementById("extraWorkForm").addEventListener("submit", handleExtraWorkDaySubmit);
    
    // Initialize dataCheck container
    document.getElementById('dataCheck').style.display = 'none';

    // Update the display every day at midnight
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            removePastExtraDays();
            displayFullSchedule();
            displayCalendarWeek();
            checkWorkThisWeek();
            updateExtraWorkDaysDisplay();
        }
    }, 60000); // Check every minute
};
