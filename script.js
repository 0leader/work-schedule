// Import the required Firebase Firestore functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-jZ0sybleNZlTlYTPWPCm6nIiY8n6NbE",
  authDomain: "work-schedule-4c740.firebaseapp.com",
  projectId: "work-schedule-4c740",
  storageBucket: "work-schedule-4c740.appspot.com",
  messagingSenderId: "1098925804841",
  appId: "1:1098925804841:web:3c228f038c0890eb2d7b38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Function to create a Firestore instance with the API key
function getDbWithApiKey() {
  return getFirestore(app, {
    customHeaders: {
      'api_key': '1be1052a-7523-4c29-84f2-058fab61946e'
    }
  });
}

// Use this function to get the Firestore instance
const db = getDbWithApiKey();

// Schedule data (Mohamed's and Emma's shifts for 4 weeks)
const scheduleData = {
    weeks: [
        {
            Sunday: { mohamed: "09:45-17:00", emma: "12:00-15:00" }
        },
        {
            Saturday: { mohamed: "11:15-17:15", emma: "09:45-15:00" },
            Sunday: { mohamed: "12:00-17:15", emma: "09:45-16:00" }
        },
        {
            holiday: true
        },
        {
            Saturday: { mohamed: "11:15-17:15", emma: "09:45-15:00" },
            Sunday: { mohamed: "12:00-15:00", emma: "09:45-17:15" }
        }
    ],
    extraDays: [] // Will be loaded from Firestore
};

// Load extra days from Firestore
async function loadExtraWorkDaysFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "extraWorkDays"));
        scheduleData.extraDays = []; // Clear current data
        querySnapshot.forEach((doc) => {
            scheduleData.extraDays.push({
                id: doc.id,
                date: new Date(doc.data().date),
                shift: doc.data().shift
            });
        });
        updateExtraWorkDaysDisplay(); // Update the UI with new data
    } catch (error) {
        console.error("Error loading extra workdays: ", error);
        displayErrorMessage("Failed to load extra work days. Please try again later.");
    }
}

// Function to save extra workdays to Firestore
async function addExtraWorkDay(date, shift) {
    try {
        await addDoc(collection(db, "extraWorkDays"), {
            date: date,
            shift: shift
        });
        console.log("Extra workday added to Firebase!");
        loadExtraWorkDaysFromFirebase(); // Refresh the display after adding
    } catch (e) {
        console.error("Error adding workday: ", e);
        displayErrorMessage("Failed to add extra work day. Please try again.");
    }
}

// Function to delete extra workday from Firestore
async function deleteExtraWorkDay(id) {
    try {
        await deleteDoc(doc(db, "extraWorkDays", id));
        console.log("Extra workday deleted from Firebase!");
        loadExtraWorkDaysFromFirebase(); // Refresh the display after deleting
    } catch (e) {
        console.error("Error deleting workday: ", e);
        displayErrorMessage("Failed to delete extra work day. Please try again.");
    }
}

// Function to display error messages
function displayErrorMessage(message) {
    const errorElement = document.getElementById('errorMessages');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Function to calculate the current week in the 4-week cycle
function getCurrentWeek() {
    const startDate = new Date("2024-01-01T00:00:00+02:00");
    const today = new Date();
    const diffInTime = today - startDate;
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    const weeksSinceStart = Math.floor(diffInDays / 7);
    return weeksSinceStart % 4;
}

// Function to get the current calendar week number (ISO 8601 standard)
function getCurrentCalendarWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
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

    displayWeekSchedule(currentWeekIndex, "currentWeek", `Week ${currentWeekIndex + 1} (Current Week)`);
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

// Function to display extra work days
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

    scheduleData.extraDays.forEach((day) => {
        const formattedDate = day.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        table += `<tr>
            <td>${formattedDate}</td>
            <td>${day.shift}</td>
            <td><button onclick="deleteExtraWorkDay('${day.id}')">Delete</button></td>
        </tr>`;
    });

    table += '</table>';
    extraWorkDaysElement.innerHTML += table;
}

// Handle form submission for adding extra work days
document.getElementById('extraWorkForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const dateInput = document.getElementById('extraWorkDate').value;
    const shiftInput = document.getElementById('extraWorkShift').value;

    if (dateInput && shiftInput) {
        addExtraWorkDay(dateInput, shiftInput); // Add the day to Firebase
        document.getElementById('extraWorkDate').value = '';
        document.getElementById('extraWorkShift').value = '';
    } else {
        displayErrorMessage("Please enter both date and shift.");
    }
});

// Initialize schedule display on page load
window.onload = function() {
    loadExtraWorkDaysFromFirebase(); // Load extra days from Firebase
    displayFullSchedule(); 
    displayCalendarWeek();
    checkWorkThisWeek();
    
    document.getElementById("toggleButton").addEventListener("click", toggleUpcomingWeeks);
    document.getElementById("checkDataButton").addEventListener("click", checkData);
};

// Make functions globally accessible
window.deleteExtraWorkDay = deleteExtraWorkDay;
