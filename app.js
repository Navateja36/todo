let tasks = []; // Holds tasks
let timerIntervals = []; // Holds active timers for tasks

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from localStorage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks) {
        tasks = savedTasks; // Load saved tasks
        renderTasks(); // Render loaded tasks
    }
}

// Function to render tasks on the page
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear the list

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task');
        taskItem.innerHTML = `<span>${task.text} - Due: ${task.date} ${task.time}</span>`;

        const timerDisplay = document.createElement('span');
        timerDisplay.classList.add('task-time');
        taskItem.appendChild(timerDisplay);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        const deleteText = document.createElement('span');
        deleteText.textContent = 'Delete'; // Set text to "Delete"
        deleteText.classList.add('delete-text');
        deleteText.addEventListener('click', () => {
            deleteTask(task, taskItem);
        });

        actionsDiv.appendChild(deleteText);
        taskItem.appendChild(actionsDiv);
        taskList.appendChild(taskItem);

        // Update timer every second
        const interval = setInterval(() => updateTimer(task, timerDisplay), 1000);
        timerIntervals.push({ task, interval }); // Store the interval for this task
    });
}

// Function to update the countdown timer
function updateTimer(task, timerDisplay) {
    const currentTime = new Date();
    const taskDeadline = new Date(task.date);
    const taskTime = task.time.split(':');
    taskDeadline.setHours(taskTime[0]);
    taskDeadline.setMinutes(taskTime[1]);

    const remainingTime = taskDeadline - currentTime;
    if (remainingTime <= 0) {
        timerDisplay.textContent = "Time’s up!";
        task.alarmActive = true;
        playSound(); // Play sound when the time is up
    } else {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        timerDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }
}

// Function to play the alarm sound
function playSound() {
    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.play(); // Play the sound when the time is up
}

// Function to stop the timer and sound
function stopTimer(task) {
    const taskInterval = timerIntervals.find(item => item.task === task);
    if (taskInterval) {
        clearInterval(taskInterval.interval); // Stop the interval
        timerIntervals = timerIntervals.filter(item => item !== taskInterval); // Remove from timerIntervals
    }
    task.alarmActive = false; // Set alarmActive to false
    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.pause(); // Stop the sound
    alarmSound.currentTime = 0; // Reset the sound to the beginning
}

// Function to delete a task
function deleteTask(taskToDelete, taskItem) {
    // Stop the timer if it's running
    const taskInterval = timerIntervals.find(item => item.task === taskToDelete);
    if (taskInterval) {
        clearInterval(taskInterval.interval); // Stop the interval
        timerIntervals = timerIntervals.filter(item => item !== taskInterval); // Remove from intervals
    }

    // Stop the alarm sound if it's playing
    const alarmSound = document.getElementById('alarm-sound');
    if (alarmSound && !alarmSound.paused) {
        alarmSound.pause(); // Stop the sound
        alarmSound.currentTime = 0; // Reset the sound to the beginning
    }

    // Remove the task from the list and re-render
    tasks = tasks.filter(task => task !== taskToDelete);
    saveTasks(); // Save the updated tasks
    taskItem.remove(); // Remove the task from the DOM
}

// Function to add a task
document.getElementById('add-task').addEventListener('click', function() {
    const taskInput = document.getElementById('task-input');
    const taskDate = document.getElementById('task-date').value;
    const taskTime = document.getElementById('task-time').value;

    if (taskInput.value && taskTime) {
        const newTask = {
            text: taskInput.value,
            date: taskDate || null, // Make date optional
            time: taskTime,
            alarmActive: false // Flag to check if alarm is active
        };
        tasks.push(newTask);
        taskInput.value = ''; // Clear task input field
        document.getElementById('task-date').value = ''; // Clear task date input
        document.getElementById('task-time').value = ''; // Clear task time input
        saveTasks();
        renderTasks();
    } else {
        alert('Please enter a task and a time.');
    }
});

// Initial render of tasks when the page loads
window.onload = function() {
    loadTasks();
};

// Function to display all saved notes (same as in your original code)
function displayNotes() {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesContainer = document.getElementById('saved-notes');
    notesContainer.innerHTML = '';

    savedNotes.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.innerHTML = `
            <p class="note-date">${note.date}</p>
            <p>${note.text.replace(/\n/g, '<br>')}</p>  <!-- Converts line breaks to <br> -->
            <img src="edit.svg" class="action-icon" onclick="editNote(${index})" alt="">
            <img src="delete.svg" class="action-icon" onclick="deleteNote(${index})" alt="">
        `;
        notesContainer.appendChild(noteDiv);
    });
}

// Load the notes when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    displayNotes();
});

// Save note to localStorage when the "Save Note" button is clicked
document.getElementById('save-note').addEventListener('click', function () {
    const noteInput = document.getElementById('note-input').value;
    if (noteInput.trim()) {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
        const newNote = { date: formattedDate, text: noteInput };
        savedNotes.unshift(newNote); // Add the new note at the beginning
        localStorage.setItem('notes', JSON.stringify(savedNotes));

        document.getElementById('note-input').value = ''; // Clear input
        displayNotes(); // Re-render notes
    } else {
        alert('Please enter a note.');
    }
});

// Function to edit a note
function editNote(index) {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToEdit = savedNotes[index];
    const newNoteText = prompt("Edit your note:", noteToEdit.text);  // Edit only the text, not the whole object
    if (newNoteText !== null) {
        noteToEdit.text = newNoteText; // Update only the text property
        savedNotes[index] = noteToEdit; // Update the note in the array
        localStorage.setItem('notes', JSON.stringify(savedNotes)); // Save updated notes
        displayNotes(); // Re-display all notes
    }
}

// Function to delete a note
function deleteNote(index) {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    savedNotes.splice(index, 1); // Remove the note at the specified index
    localStorage.setItem('notes', JSON.stringify(savedNotes)); // Save updated notes
    displayNotes(); // Re-display all notes
}
