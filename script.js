let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function addTask() {
    var taskName = document.getElementById("input").value;

    if (taskName == "") {
        alert("Please input Task name");
        return;
    }

    var now = new Date();
    var currentDate = now.toLocaleDateString();
    var currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    tasks.push({
        TaskName: taskName,
        taskDate: `${currentDate} - ${currentTime}`,
        isDone: false
    });

    saveTasks();
    readTasks();

    document.getElementById("input").value = "";
}

function readTasks() {
    var tasksContainer = document.getElementsByClassName("tasks")[0];

    tasksContainer.innerHTML = "";

    for (var index = 0; index < tasks.length; index++) {

        tasksContainer.innerHTML += `
        
        <div id="task" class="${tasks[index].isDone ? "completed" : ""}">

            <div class="task-info">
                <h2>${tasks[index].TaskName}</h2>
                <span class="task-time">
                    <i class="bi bi-clock"></i> ${tasks[index].taskDate || ''}
                </span>
            </div>

            <div class="action-btns">
                <button class="btn edit" onclick="updateTask(${index})">
                    <i class="bi bi-pencil-square"></i>
                </button>

                <button class="btn delete" onclick="deleteTask(${index})">
                    <i class="bi bi-trash"></i>
                </button>

                <button class="btn done" onclick="doneTask(${index})">
                    <i class="bi bi-check2-circle"></i>
                </button>
            </div>

        </div>
        
        `;
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(index) {
    var confirmed = confirm(
        "Are you sure you want to delete? " +
        tasks[index].TaskName
    );

    if (confirmed) {
        tasks.splice(index, 1);
        saveTasks();
        readTasks();
    }
}

function updateTask(index) {
    var newName = prompt(
        "Input new task name?",
        tasks[index].TaskName
    );

    if (newName == null || newName.trim() == "") {
        return;
    }

    tasks[index].TaskName = newName.trim();
    saveTasks();
    readTasks();
}

function doneTask(index) {
    tasks[index].isDone = !tasks[index].isDone;
    saveTasks();
    readTasks();
}

readTasks();
