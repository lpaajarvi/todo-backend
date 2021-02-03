-- TODO APP DATABASE CONTENT CREATION MYSQL COMMANDS FOR FRESH INSTALL
--
-- Authors Elias Puukari & Lauri Pääjärvi
-- Last update on 2020-12-20
--
-- These database entries also work as user test cases for this app.
--
-- TEST CASE A1
-- Add one task with minutes and due values
INSERT INTO task (title,minutes,due)
VALUES
(
    "Simple task",
    60,
    "2021-12-01"
)
;

-- TEST CASE A2
-- Add task with minutes, without due date
INSERT INTO task (title,minutes)
VALUES
(
    "Set minutes - default due",
    45
)
;

-- TEST CASE A3
-- Add task with due date, without minutes
INSERT INTO task (title,due)
VALUES
(
    "Set due - default minutes",
    "2021-12-02"
)
;

-- TEST CASE A4
-- Add task without due date, without minutes
INSERT INTO task (title)
VALUES
(
    "Default due - default minutes"
)
;

-- TEST CASE A5
-- Add task marked as done
INSERT INTO task (title, isCompleted)
VALUES
(
    "This task is marked as done",
    1
)
;

-- TEST CASE B6
-- Add one task with minutes and due values and three subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Add task with subtasks",
    0,
    "2021-12-03"
)
;

INSERT INTO subtask (title,minutes,maintask_id)
VALUES
(
    "First subtask",
    15,
    6
),
(
    "Second subtask",
    15,
    6
),
(
    "Third subtask",
    45,
    6
)
;

-- TEST CASE B7
-- Add task with minutes, without due, with two subtasks
INSERT INTO task (title, minutes)
VALUES
(
    "No due date and default minute value",
    0
)
;
INSERT INTO subtask (title,minutes,maintask_id)
VALUES
(
  "B7 subtask 1",
  60,
  7

),
(
  "B7 subtask 2",
  75,
  7
)
;

-- TEST CASE B8
-- Add task with due date, without minutes and four subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Test case B8",
    0,
    "2021-12-02"
)
;
INSERT INTO subtask (title,minutes,maintask_id)
VALUES
(
  "TestCase B8 subtask 1",
  60,
  8
),
(
  "TestCase B8 subtask 2",
  75,
  8
),
(
  "TestCase B8 subtask 3",
  60,
  8
),
(
  "Test Case B8 subtask 4",
  75,
  8
)
;

-- TEST CASE B9
-- Add task without due date, without minutest and six subtasks
INSERT INTO task (title,minutes)
VALUES
(
    "No due or minutes and six subtasks",
    0
)
;
INSERT INTO subtask (title,minutes,maintask_id)
VALUES
(
    "Case B9 - Subtask 1",
    15,
    9
),
(
    "Case B9 - Subtask 2",
    15,
    9
),
(
    "Case B9 - Subtask 3",
    15,
    9
),
(
    "Case B9 - Subtask 4",
    15,
    9
),
(
    "Case B9 - Subtask 5",
    75,
    9
),
(
    "Case B9 - Subtask 6",
    45,
    9
)
;

-- TEST CASE B10
-- Add task with minutes, due and six subtasks with minutes and four of them marked as done
INSERT INTO task (title,minutes,due)
VALUES
(
    "Some subtasks marked as done",
    0,
    "2021-12-04"
)
;
INSERT INTO subtask (title,minutes,maintask_id,isCompleted)
VALUES
(
    "Test case B10 - Subtask 1",
    15,
    10,
    1
),
(
    "Test case B10 - Subtask 2",
    45,
    10,
    0
),
(
    "Test case B10 - Subtask 3",
    240,
    10,
    1
),
(
    "Test case B10 - Subtask 4",
    15,
    10,
    1
),
(
    "Test case B10 - Subtask 5",
    75,
    10,
    0
),
(
    "Test case B10 - Subtask 6",
    45,
    10,
    1
)
;

-- TEST CASE C11
-- Add several archived tasks with different type of values
INSERT INTO task (title,minutes,due,isCompleted,isArchived)
VALUES
(
    "Lorem ipsum one",
    0,
    "2021-12-15",
    0,
    1
),
(
    "Lorem ipsum two",
    90,
    "2021-12-06",
    0,
    1
),
(
    "Dolot rolot liirum laarum",
    15,
    "2021-12-22",
    1,
    1
),
(
    "General generator text",
    0,
    "2021-12-19",
    1,
    1
)
;

-- TEST CASE C12
-- Add several subtasks to archived tasks
INSERT INTO subtask (title,minutes,maintask_id,isCompleted)
VALUES
(
    "A subtask",
    45,
    11,
    0
),
(
    "B subtask",
    15,
    11,
    1
),
(
    "C subtask",
    15,
    14,
    1
),
(
    "D subtask",
    15,
    14,
    0
),
(
    "E subtask",
    75,
    14,
    0
)
;

-- TEST CASE C13
-- Add new task with many subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Gone in the wind",
    0,
    "2021-11-30"
)
;
INSERT INTO subtask (title,minutes,maintask_id,isCompleted)
VALUES
(
    "Hajoo softaas",
    480,
    15,
    1
)
;
INSERT INTO subtask (title,minutes,maintask_id)
VALUES
(
    "Collect yourself before you wreck yourself",
    135,
    15
),
(
    "Onpas hassut minuutit",
    666,
    15
),
(
    "Heh heh knowers know...",
    420,
    15
),
(
    "Jo kolmas hassu minuuttilukema",
    69,
    15
)
;

-- TEST CASE D14
-- Add new task without subtasks, with pointed test case ARCHIVE THIS TASK
INSERT INTO task (title,minutes,due)
VALUES
(
    "Archive this task",
    60,
    "2021-12-17"
)
;

-- TEST CASE D15
-- Add new task without subtasks, with pointed test case COMPLETE THIS TASK
INSERT INTO task (title,minutes,due)
VALUES
(
    "Complete this task",
    60,
    "2021-12-18"
)
;
-- TEST CASE D16
-- Add new task without subtasks, with pointed test case UNARCHIVE THIS TASK
INSERT INTO task (title,minutes,due,isArchived)
VALUES
(
    "Unarchive this task",
    60,
    "2021-12-14",
    1
)
;
-- TEST CASE D17
-- Add new task without subtasks, with pointed test case UN-COMPLETE
INSERT INTO task (title,minutes,due,isCompleted)
VALUES
(
    "Uncomplete this task",
    60,
    "2021-12-12",
    0
)
;
-- TEST CASE D18
-- Add new task with subtasks, with pointed test case complete subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Mark all subtasks done",
    0,
    "2021-12-06"
)
;
INSERT INTO subtask (title, minutes,maintask_id)
VALUES
(
    "Mark this done",
    90,
    20
),
(
    "This one too",
    90,
    20
),
(
    "Also this one",
    90,
    20
),
(
    "You get the point already...",
    90,
    20
),
(
    "And this is the last one",
    90,
    20
)
;
-- TEST CASE E19
-- Add new task to delete
INSERT INTO task (title,due)
VALUES
(
    "Delete this task",
    "2021-12-08"
)
;
-- TEST CASE E20
-- Add new task with subtasks to delete
INSERT INTO task (title,minutes,due)
VALUES
(
    "Delete this task with subtasks",
    0,
    "2021-12-08"
)
;
INSERT INTO subtask (title, minutes,maintask_id)
VALUES
(
    "This will be deleted",
    15,
    22
),
(
    "This will also be deleted",
    15,
    22
),
(
    "To be deleted",
    15,
    22
)
;
-- TEST CASE E21
-- Add new task with subtasks, delete some subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Delete some subtasks from this task",
    0,
    "2021-12-08"
)
;
INSERT INTO subtask (title, minutes,maintask_id)
VALUES
(
    "Delete this subtask",
    15,
    23
),
(
    "Also delete this subtask",
    15,
    23
),
(
    "Don't delete this subtask",
    15,
    23
)
;
-- TEST CASE E22
-- Add new task with subtasks, delete all subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Delete all subtasks from this task",
    0,
    "2021-11-12"
)
;
INSERT INTO subtask (title, minutes,maintask_id)
VALUES
(
    "Delete all of these subtasks",
    15,
    24
),
(
    "Delete this subtask",
    15,
    24
),
(
    "Delete this subtask too",
    15,
    24
)
;
-- TEST CASE F23
-- Add new task, change time
INSERT INTO task (title,minutes,due)
VALUES
(
    "Change time for this task",
    60,
    "2021-11-12"
)
;
-- TEST CASE F24
-- Add new task with subtasks, change time
INSERT INTO task (title,minutes,due)
VALUES
(
    "Change time for this task with subtasks",
    0,
    "2021-11-12"
)
;
INSERT INTO subtask (title, minutes, maintask_id)
VALUES
(
    "Placeholder",
    15,
    26
),
(
    "Holdplacers",
    15,
    26
),
(
    "Splodhelceres",
    15,
    26
)
;
-- TEST CASE F25
-- Add new task with subtasks, change time for subtasks
INSERT INTO task (title,minutes,due)
VALUES
(
    "Change subtask time from this task",
    0,
    "2021-11-12"
)
;
INSERT INTO subtask (title, minutes,maintask_id)
VALUES
(
    "Splacepolder",
    15,
    27
),
(
    "Change this subtasks time",
    60,
    27
),
(
    "Hplosldplacers",
    15,
    27
),
(
    "Splodhecreelceres",
    15,
    27
)
;
UPDATE task SET due="0000-00-00" WHERE due IS NULL
;
