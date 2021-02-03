const myFunctions = require("../myfunctions.js");

// MODEL CLASS AND CONSTRUCTOR FOR CREATING A TASK OBJECT
class Task {
  constructor(title, minutes, due, isCompleted, subtasks) {
    if (title.length < 500) {
      this.title = title;
    } else
      throw new Error(
        "Task title can't be over 500 characters long, because of the limitations of the database."
      );
    if (minutes > 0) {
      this.minutes = minutes;
    } else
      throw new Error(
        "Task minutes can't be negative, because the application databse wouldn't allow it."
      );
    if (
      isCompleted === 0 ||
      isCompleted === 1 ||
      isCompleted === true ||
      isCompleted === false
    ) {
      this.isCompleted = isCompleted;
    } else throw new Error("isCompleted must be be true or false.");
    // Validating date when creating a new task.
    // Again some double/triple checking.
    // It is possible that this converting to date object is not needed but let's assume it will reduce risk of some bugs, and not cause them.
    if (Date.parse(due) != NaN) {
      const tempDate = new Date(Date.parse(due));
      this.due = myFunctions.formatDate(tempDate);
    } else
      throw new Error(
        "Due date string is not really a date, or it may be needed to be converted to UTF-8."
      );
    // Validating subtask array.
    // We will only check if it is array, even empty array is fine, because some tasks have no subtasks but we need the array in task object so frontend can process it as wanted.
    if (Array.isArray(subtasks)) {
      this.subtasks = subtasks;
    } else
      throw new Error(
        "Third parameter should be an array of subtasks. Empty array would be fine too if there are no subtasks."
      );
  }
}

module.exports = Task;
