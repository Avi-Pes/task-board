"use strict"

function Task(taskText, taskTitle, endDate, endTime, isImportant = false, taskColor) {
    this.id = `task_${Math.ceil(Math.random() * 9999999)}`;
    this.text = taskText;
    this.title = taskTitle;
    this.date = endDate;
    this.time = endTime;
    this.isImportant = isImportant
    this.color = taskColor
}
