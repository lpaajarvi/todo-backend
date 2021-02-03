// REQUIREMENTS
const express = require("express");
const database = require("../database/crudpromises.js");
const myFunctions = require("../myfunctions.js");
const Task = require("../model/task.js");
const Subtask = require("../model/subtask.js");
const { connection } = require("../database/crudpromises.js");

// DEFINE VARIABLES
var router = express.Router();
router.use(express.json());

// These middleware functions help us make http requests.
// We are sending application/json data to frontend.

// HTTP GET ALL - /api/
router.get("/", async (req, res) => {
  try {
    let tasks = await database.findMain();
    let subtasks = await database.findSub();
    let combinedTasks = await myFunctions.combineArrays(tasks, subtasks);
    res.statusCode = 200;
    res.json(combinedTasks);
  } catch (err) {
    res.statusCode = 500;
    res.json(err);
  }
});

// HTTP GET ALL - /api/archived/
router.get("/archived", async (req, res) => {
  try {
    let tasks = await database.findArchivedMain();
    let subtasks = await database.findArchivedSub();
    let combinedTasks = await myFunctions.combineArrays(tasks, subtasks);
    res.statusCode = 200;
    res.json(combinedTasks);
  } catch (err) {
    res.statusCode = 500;
    res.json(err);
  }
});

// HTTP DELETE TASKS
router.delete("/:dataid([0-9]+)", async (req, res) => {
  try {
    let deleting = await database.delete(req.params.dataid);
    res.statusCode = 204;
    res.json(deleting);
  } catch (err) {
    res.statusCode = 500;
    res.json(err);
  }
});

// HTTP DELETE SUBTASKS
router.delete("/subtask:dataid([0-9]+)", async (req, res) => {
  try {
    let deleting = await database.deleteSubtask(req.params.dataid);
    res.statusCode = 204;
    res.json(deleting);
  } catch (err) {
    res.statusCode = 500;
    res.json(err);
  }
});

// HTTP POST - /api/tasks/{object}
// This basic post is used to add a new task (may include subtasks as well)
router.post("/", async (req, res) => {
  let temp = req.body;
  let task;
  let subtasks = [];

  let continues = true;

  // In case there are subtasks to be added, they need to be validated, if they fail, the rest of the process fails too and not even basic task will be added
  if (temp.subtasks !== undefined) {
    if (temp.subtasks.length > 0) {
      try {
        for (let i = 0; i < temp.subtasks.length; i++) {
          let currentSubtask = new Subtask(
            temp.subtasks[i].title,
            temp.subtasks[i].minutes,
            temp.subtasks[i].isCompleted
          );
          subtasks.push(currentSubtask);
        }
      } catch (err) {
        continues = false;
        res.statusCode = 400;
        res.json(err);
      }
    }
  }
  try {
    task = new Task(
      temp.title,
      temp.minutes,
      temp.due,
      temp.isCompleted,
      temp.subtasks
    );
  } catch (err) {
    continues = false;
    res.statusCode = 400;
    res.json(err);
  }
  if (continues) {
    try {
      let result = await database.add(task);
      res.statusCode = 201;
      res.json(result);
    } catch (err) {
      res.statusCode = 500;
      res.json(err);
    }
  }
});

// HTTP POST - MODIFY
// Takes task object (which may or may not contain nested subtask-objects) and puts it into database.
router.post("/modify/", async (req, res) => {
  let task = req.body;
  try {
    if (myFunctions.validateEditedTask(task)) {
      task = myFunctions.updateEditedTask(task);
      console.log(
        "Modified database entry was validated and updated, now sending to database."
      );
      let result = await database.edit(task);
      res.statusCode = 200;
      res.json(result);
    }
  } catch (err) {
    res.statusCode = 500;
    res.json(err);
  }
});

// HTTP PUT - ACTION ARCHIVE OR COMPLETE
// We use this route to send simple http put request in case user only wants to update isCompleted or isArchived values in database.
router.put(
  "/put/:action([ac]):trueOrFalse([+-]):dataid([0-9]+)",
  async (req, res) => {
    try {
      let result = await database.archiveOrComplete(
        req.params.action,
        req.params.trueOrFalse,
        req.params.dataid
      );
      res.statusCode = 200;
      res.json(result);
    } catch (err) {
      res.statusCode = 500;
      res.json(err);
    }
  }
);

module.exports = router;
