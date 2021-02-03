// HELPER FUNCTIONS FOR TODO APP
// These helper functions create metadata content, sort arrays etc.

function isNotNegative(number) {
  return number >= 0 ? true : false;
}

function createMetadata(obj) {
  // First we present the variables of metadata.
  let minutesTotal = 0;
  let minutesDone = 0;
  let minutesLeft = 0;
  let subtasksTotal = 0;
  let subtasksDone = 0;
  let subtasksLeft = 0;
  let percentDone = 0;
  if (obj.subtasks.length < 1) {
    // If there are no subtasks, use main task infos.
    minutesTotal = obj.minutes;
    if (obj.isCompleted) {
      minutesDone += obj.minutes;
    }
  } else {
    // If there is subtasks, we go here and go through given object and count the metadatas.
    for (let i = 0; i < obj.subtasks.length; i++) {
      minutesTotal += parseInt(obj.subtasks[i].minutes);
      if (obj.subtasks[i].isCompleted) {
        minutesDone += parseInt(obj.subtasks[i].minutes);
        subtasksDone++;
      }
    }
    subtasksTotal = obj.subtasks.length;
    subtasksLeft = subtasksTotal - subtasksDone;
  }
  // Define final values before returning.
  minutesLeft = minutesTotal - minutesDone;
  percentDone = (minutesDone / minutesTotal) * 100;
  let metaObject = {
    minutes_total: parseInt(minutesTotal),
    minutes_done: parseInt(minutesDone),
    minutes_left: parseInt(minutesLeft),
    subtasks_total: parseInt(subtasksTotal),
    subtasks_done: parseInt(subtasksDone),
    subtasks_left: parseInt(subtasksLeft),
    percentage_done: parseInt(percentDone.toFixed(2)),
  };
  // Return object that holds the metadata for single task.
  return metaObject;
}

let myFunctions = {
  // Combine main- and subtasks into one array that the frontend can use.
  combineArrays: (main, sub) => {
    let array = main;
    array.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    for (let i = 0; i < main.length; i++) {
      array[i].subtasks = [];
      for (let j = 0; j < sub.length; j++) {
        if (sub[j].maintask_id === main[i].id) {
          array[i].subtasks.push(sub[j]);
        }
      }
      array[i].meta = createMetadata(array[i]);
    }
    // // In case we would use this property in array
    // array.push({ total_time_left: `${totalTime(array)}` });
    return array;
  },
  // Date formatting function
  // Copy pasted from https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
  formatDate: (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  },
  // Update edited tasks, doublecheck for (possible) frontend leaks.
  updateEditedTask: (task) => {
    // If there are subtasks in the object, we set main task minutes to 0.
    if (task.subtasks.length > 0) {
      task.minutes = 0;
      let howManySubsDone = 0;
      // Count how many of the subtasks are done.
      for (let i = 0; i < task.subtasks.length; i++) {
        if (task.subtasks[i].isCompleted) {
          howManySubsDone = howManySubsDone + 1;
        }
      }
      // Doublecheck task completion info, in case frontend has leaked.
      if (task.subtasks.length === howManySubsDone) {
        task.isCompleted = 1;
      } else {
        task.isCompleted = 0;
      }
    }
    return task;
  },
  // Validate edited task, this is a triplecheck since MySql database for this app includes limitations what can be added, and frontend does it's own validations too.
  validateEditedTask(task) {
    let titleOkay = false;
    let minutesOkay = false;
    let subIsArray = false;
    if (task.title.length < 500 && typeof task.title === "string") {
      titleOkay = true;
    } else {
      throw new Error(
        "Task title cannot be over 500 characters long, because of the limitations of the database."
      );
    }
    if (typeof task.minutes === "number" && isNotNegative(task.minutes)) {
      minutesOkay = true;
    } else {
      throw new Error("Task minutes shouldn't have negative value.");
    }
    if (Array.isArray(task.subtasks)) {
      subIsArray = true;
    } else {
      throw new Error(
        "Third parameter should be an array of subtasks. Empty array would be fine too if there are no subtasks."
      );
    }
    if (titleOkay && minutesOkay && subIsArray) {
      return task;
    } else throw new Error("Task validation failed.");
  },
};

module.exports = myFunctions;
