// Initialize tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let mode = 'task';

// DOM elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const addWeatherBtn = document.getElementById('add-weather-btn');
const toggleModeBtn = document.getElementById('toggle-mode-btn');
const taskList = document.getElementById('task-list');

addTaskBtn.style.visibility = 'visible';
addWeatherBtn.style.visibility = 'hidden';

// Function to render tasks
function renderTasks() {
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task');
        if (task.completed) {
            taskDiv.classList.add('completed');
        }

        if (task.type == 'task') {
            // Mark as completed button
            const tdComplete = document.createElement('td');
            // Completed icon

            const completedIcon = document.createElement('button');
            completedIcon.style.cssText = "border: none; background-color: transparent;";
            completedIcon.onclick = () => toggleComplete(index);
            if (tasks[index].completed) {
                completedIcon.innerHTML = '<h4><i class="bi bi-check-square-fill"></i></h4>';
            } else {
                completedIcon.innerHTML = '<h4><i class="bi bi-check-square"></i></h4>';
            }
            tdComplete.appendChild(completedIcon);
            taskDiv.appendChild(tdComplete);
        }

        // Task content
        const tdTask = document.createElement('td');
        const taskText = document.createElement('span');
        taskText.value = task.text
        taskText.textContent = task.text;
        tdTask.appendChild(taskText);
        tdTask.style.cssText = "width: 90%;";
        taskDiv.appendChild(tdTask);

        // Edit icon
        if (task.type == 'task') {
            const tdEdit = document.createElement('td');
            const editIcon = document.createElement('button');
            editIcon.style.cssText = "border: none; background-color: transparent;";
            editIcon.innerHTML = `<h4><i class="bi bi-pencil-square"></i></h4>`;
            editIcon.onclick = () => {
                const temp = prompt("Edit task:", task.text);
                // Prevent an empty task added into list
                if (temp != '' && temp != null) {
                    isDiplucate = false;
                    if (temp != task.text) {
                        tasks.forEach(task => {
                            if (temp === task.text) {
                                alert('A duplicated task found in the list');
                                isDiplucate = true;
                            }
                        });
                        if (!isDiplucate) {
                            tasks[index].text = temp;
                            saveTasks();
                            renderTasks();
                            alert('Please verify that task has been updated')
                        }
                    }
                } else if (temp == '') {
                    alert('A blank task is not accepted');
                } else if (temp == null) {
                    // Do nothing
                }
            }
            tdEdit.appendChild(editIcon);
            taskDiv.appendChild(tdEdit);
        }

        // Delete icon
        if (mode == 'task') {
            const tdDelete = document.createElement('td');
            const deleteIcon = document.createElement('button');
            deleteIcon.style.cssText = "border: none; background-color: transparent;";
            deleteIcon.innerHTML = '<h4><i class="bi bi-x-lg"></i></h4>';
            deleteIcon.onclick = () => {
                if (confirm("Proceed to delete?"))
                    deleteTask(index);
            }
            tdDelete.appendChild(deleteIcon);
            taskDiv.appendChild(tdDelete);
        }
        // Append to task list division
        taskList.appendChild(taskDiv);
    });
}

// Function to add a task
function addTask() {
    const taskText = taskInput.value.trim();
    let isDiplucate = false;
    if (taskText === '$clear') {
        tasks = [];
        taskInput.innerHTML = '';
        saveTasks();
        renderTasks();
        taskInput.value = '';
        return;
    } else if (taskText === '') {
        alert('Please enter a task');
        navigator.clipboard.writeText(localStorage.getItem('tasks'));
        return;
    } else if (taskText.includes(`[{"text":`)) {
        tasks = JSON.parse(taskText);
        taskInput.innerHTML = '';
        saveTasks();
        renderTasks();
        taskInput.value = '';
        return;
    } else {
        tasks.forEach(task => {
            if (taskText === task.text) {
                alert('A duplicated task found in the list');
                isDiplucate = true;
            }
        });
        if (isDiplucate)
            return;
    }

    const newTask = {
        text: taskText,
        completed: false,
        type: 'task'
    };
    tasks.push(newTask);
    taskInput.value = ''; // Clear input field
    saveTasks();
    renderTasks();
}

// Function to toggle task completion
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Function to delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to add a task
function addWeatherInfo() {
    tasks = [];
    taskList.innerHTML = '';
    let promise = getWeatherForecast();
    promise.then(resolve, reject);
    function resolve(json) {
        const count = json.data.records[0].forecasts.length;
        for (let i = 0; i < count; i++) {
            let task = {
                text: `${json.data.records[0].forecasts[i].day}: ${json.data.records[0].forecasts[i].forecast.text}`,
                completed: false,
                type: 'weather'
            }
            tasks.push(task);
        }
        renderTasks();
    }
    function reject(reason) {
        console.log("Couldn't get the records! Reason: " + reason);
    }
}

// Event listener for adding task
addTaskBtn.addEventListener('click', addTask);
// Event listener for weather task
addWeatherBtn.addEventListener('click', addWeatherInfo);
// Event listener for switching mode
toggleModeBtn.addEventListener('click', () => {
    taskList.innerHTML = "";
    tasks = [];
    mode = (mode != 'task') ? 'task' : 'weather'
    if (mode == 'task') {
        addTaskBtn.style.visibility = 'visible';
        addWeatherBtn.style.visibility = 'hidden';
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskInput.style.visibility = 'visible';
        renderTasks();
    } else {
        addTaskBtn.style.visibility = 'hidden';
        addWeatherBtn.style.visibility = 'visible';
        taskInput.style.visibility = 'hidden';
        addWeatherInfo();
    }
});

// Get the input field
const input = document.getElementById('task-input');
input.addEventListener('keypress', function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter" && mode == 'task') {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        addTaskBtn.click();
    }
});

async function getWeatherForecast() {
    const url = 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook';
    try {
        // Fetch data from the API
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}
// Render tasks on page load
renderTasks();

