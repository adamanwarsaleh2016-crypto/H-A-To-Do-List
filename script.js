let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// طلب إذن الإشعارات عند تحميل الصفحة
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

function addTask() {
    var taskName = document.getElementById("input").value;
    var dueDateValue = document.getElementById("due-date").value;

    if (taskName.trim() == "") {
        alert("Please input Task name");
        return;
    }

    var now = new Date();
    var currentDate = now.toLocaleDateString();
    var currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    tasks.push({
        TaskName: taskName,
        taskDate: `${currentDate} - ${currentTime}`,
        dueDate: dueDateValue ? new Date(dueDateValue).getTime() : null, // حفظ الموعد المحدد بالمللي ثانية
        notifiedBefore: false, // لضمان عدم تكرار تنبيه اقتراب الموعد
        isDone: false
    });

    saveTasks();
    readTasks();

    document.getElementById("input").value = "";
    document.getElementById("due-date").value = "";
}

function readTasks() {
    var tasksContainer = document.getElementsByClassName("tasks")[0];
    tasksContainer.innerHTML = "";

    for (var index = 0; index < tasks.length; index++) {
        var formattedDueDate = "";
        if (tasks[index].dueDate) {
            var d = new Date(tasks[index].dueDate);
            formattedDueDate = ` | Due: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        tasksContainer.innerHTML += `
        <div id="task" class="${tasks[index].isDone ? "completed" : ""}">
            <div class="task-info">
                <h2>${tasks[index].TaskName}</h2>
                <span class="task-time">
                    <i class="bi bi-clock"></i> ${tasks[index].taskDate || ''}${formattedDueDate}
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

// دالة تفحص اقتراب وانتهاء المواعيد (بدون حذف)
function checkExpiredTasks() {
    var now = new Date().getTime();
    var warningTimeBefore = 10 * 60 * 1000; // تنبيه قبل الموعد بـ 10 دقائق
    var hasChanges = false;

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].dueDate) {
            var timeDiff = tasks[i].dueDate - now;

            // 1. تنبيه باقتراب الموعد (عند بقاء 10 دقائق أو أقل)
            if (timeDiff > 0 && timeDiff <= warningTimeBefore && !tasks[i].notifiedBefore) {
                sendNotification("تنبيه اقتراب الموعد ⏰", `المهمة "${tasks[i].TaskName}" موعدها يقترب!`);
                tasks[i].notifiedBefore = true;
                hasChanges = true;
            }

            // 2. عند وصول الموعد: إرسال إشعار وتمييز المهمة بأنها انتهت بدون حذفها
            if (now >= tasks[i].dueDate && !tasks[i].isExpired) {
                sendNotification("حان الموعد! 🔔", `وصل موعد المهمة: "${tasks[i].TaskName}"`);
                tasks[i].isExpired = true; // تعليم المهمة كمنتهية الموعد
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        saveTasks();
        readTasks();
    }
}

// تعديل دالة القراءة لإضافة تمييز بصري للمهام المنتهية الموعد
function readTasks() {
    var tasksContainer = document.getElementsByClassName("tasks")[0];
    tasksContainer.innerHTML = "";

    for (var index = 0; index < tasks.length; index++) {
        var formattedDueDate = "";
        if (tasks[index].dueDate) {
            var d = new Date(tasks[index].dueDate);
            formattedDueDate = ` | Due: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // إمكانية إضافة كلاس expired لتغيير مظهر المهمة عند انتهاء وقتها
        var statusClass = tasks[index].isDone ? "completed" : (tasks[index].isExpired ? "expired" : "");

        tasksContainer.innerHTML += `
        <div id="task" class="${statusClass}">
            <div class="task-info">
                <h2>${tasks[index].TaskName} ${tasks[index].isExpired ? '<span style="color: #ef4444; font-size: 0.8rem;">(منتهية)</span>' : ''}</h2>
                <span class="task-time">
                    <i class="bi bi-clock"></i> ${tasks[index].taskDate || ''}${formattedDueDate}
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
// دالة إرسال إشعار المتصفح
function sendNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/3239/3239952.png" // أيقونة إشعار سريعة
        });
    } else {
        alert(`${title}\n${body}`);
    }
}

// فحص المواعيد كل ثانيتين
setInterval(checkExpiredTasks, 2000);

readTasks();
checkExpiredTasks();
// طلب الإذن فور فتح الصفحة أو عند أول ضغطة
function requestNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("تم تفعيل إشعارات الويندوز بنجاح!");
                }
            });
        }
    }
}

// استدعاء طلب الإذن عند التحميل
requestNotificationPermission();
document.addEventListener("click", requestNotificationPermission);

// دالة إرسال إشعار الويندوز النظامي
function sendNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        // إنشاء إشعار الويندوز
        const notification = new Notification(title, {
            body: body,
            icon: "https://cdn-icons-png.flaticon.com/512/3239/3239952.png",
            requireInteraction: true // يظل الإشعار في قائمة الويندوز حتى تتفاعل معه
        });

        notification.onclick = function() {
            window.focus();
            this.close();
        };
    }
}

// دالة تفحص المواعيد (بدون حذف)
function checkExpiredTasks() {
    var now = new Date().getTime();
    var warningTimeBefore = 10 * 60 * 1000; // تنبيه قبل الموعد بـ 10 دقائق
    var hasChanges = false;

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].dueDate) {
            var timeDiff = tasks[i].dueDate - now;

            // 1. تنبيه اقتراب الموعد
            if (timeDiff > 0 && timeDiff <= warningTimeBefore && !tasks[i].notifiedBefore) {
                sendNotification("تنبيه اقتراب الموعد ⏰", `المهمة "${tasks[i].TaskName}" موعدها يقترب!`);
                tasks[i].notifiedBefore = true;
                hasChanges = true;
            }

            // 2. تنبيه حلول الموعد (بدون حذف)
            if (now >= tasks[i].dueDate && !tasks[i].isExpired) {
                sendNotification("حان الموعد! 🔔", `وصل موعد المهمة: "${tasks[i].TaskName}"`);
                tasks[i].isExpired = true;
                hasChanges = true;
            }
        }
    }

    if (hasChanges) {
        saveTasks();
        readTasks();
    }
}

// فحص المواعيد كل 3 ثوانٍ
setInterval(checkExpiredTasks, 3000);
