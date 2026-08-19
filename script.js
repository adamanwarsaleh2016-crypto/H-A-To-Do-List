let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function addTask() {
    var taskName = document.getElementById("input").value;

    if (taskName == "") {
        alert("Please input Task name");
        return;
    }

    tasks.push({
        TaskName: taskName,
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

            <h2>
                ${tasks[index].TaskName}
            </h2>

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
        
        `;
    }
}
function doneTask(index) {

    tasks[index].isDone = !tasks[index].isDone;

    saveTasks();
    readTasks();
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


// ⭐ DONE BUTTON
function doneTask(index) {

    if (tasks[index].isDone == false) {
        tasks[index].isDone = true;
    } else {
        tasks[index].isDone = false;
    }

    saveTasks();
    readTasks();
}


// تشغيل المهام المحفوظة
readTasks();