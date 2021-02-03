const mysql = require("mysql");
const conf = require("./conf.js");

let connection = null;

// DEFINE DATABASE TABLE NAMES
const mainTaskTable = "task";
const subTaskTable = "subtask";

// EXPORT FUNCTIONS
let connectionFunctions = {
  // CONNECT TO POOL
  //
  // Here we create a connection pool to use in case there are simultaneous users in the backend application host, Heroku in this case.
  //
  // When this function is called in routers.js a connection is maintained until the connection is released and the close function is called.
  // However, when using pool, we can maintain the connection sustainably in host servers.
  connect: () => {
    connection = mysql.createPool(conf);
  },

  // ADD FUNCTION
  // Uses Node.js transaction even if only one task is added and no subtasks, but the need for it comes from the subtasks;
  // it is important that the whole transaction rollbacks, if even one of the subtasks fail, so there will be no data missing.
  add: (task) => {
    return new Promise((resolve, reject) => {
      if (connection) {
        let initialQuery =
          "INSERT INTO task (title, minutes, due, isCompleted) VALUES (?, ?, ?, ?)";
        connection.getConnection(function (conn_err, conn) {
          if (conn_err) {
            throw conn_err;
          }
          conn.beginTransaction(function (error) {
            if (error) {
              throw error;
            }
            conn.query(
              initialQuery,
              [task.title, task.minutes, task.due, task.isCompleted],
              (err) => {
                if (err) {
                  return conn.rollback(function () {
                    throw err;
                  });
                }
                // If there are subtasks in data
                if (task.subtasks.length > 0) {
                  // We need to set variable so we can insert all subtasks to refer the task that was just added
                  conn.query(`SET @lastid = @@identity`),
                    (err) => {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                    };
                  // Doublecheck for leaks through subtask objects array, then set default value (15 min) if [i].minutes value is less than 1.
                  for (let i = 0; i < task.subtasks.length; i++) {
                    if (task.subtasks[i].minutes < 1) {
                      task.subtasks[i].minutes = 15;
                    }
                    // Insert task object subtasks into database.
                    conn.query(
                      "INSERT INTO subtask (maintask_id, title, minutes, isCompleted) VALUES (@lastid, ?, ?, ?)",
                      [
                        task.subtasks[i].title,
                        task.subtasks[i].minutes,
                        task.subtasks[i].isCompleted,
                      ]
                    ),
                      (err) => {
                        if (err) {
                          return conn.rollback(function () {
                            throw err;
                          });
                        }
                      };
                  }
                  // Our mysql works in a way that there will be 0 put into place of task.minutes where the id has subtasks, in which case those are actually used as minutes_total etc metadata.
                  conn.query("UPDATE task SET minutes = 0 WHERE ID = @lastid"),
                    (err) => {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                    };
                }
                conn.commit(function (commit_err) {
                  if (commit_err) {
                    return conn.rollback(function () {
                      throw commit_err;
                    });
                  }
                  console.log("New entry added to database.");
                });
                conn.release();
              }
            );
            resolve("New entry added to database.");
          });
        });
      } else {
        reject("Database connection failed. Could not add entry to database.");
      }
    });
  },

  // ARCHIVE OR COMPLETE FUNCTION
  // Here we have received a http PUT request with regular expression referencing database table items and their values.
  archiveOrComplete: (action, trueOrFalse, dataid) => {
    return new Promise((resolve, reject) => {
      let sql_trueOrFalse = trueOrFalse === "+" ? 1 : 0;
      let sql_column = action === `a` ? `isArchived` : `isCompleted`;
      let query = `UPDATE task SET ${sql_column} = ${sql_trueOrFalse} WHERE id = ${dataid}`;
      if (connection) {
        connection.getConnection(function (conn_err, conn) {
          if (conn_err) {
            throw conn_err;
          }

          conn.beginTransaction(function (error) {
            if (error) {
              throw error;
            }

            conn.query(
              query,

              (err) => {
                if (err) {
                  return conn.rollback(function () {
                    throw err;
                  });
                }
                // If this database entry gets value isCompleted=1 we will make sure that its subtasks are marked as completed (or uncompleted in case of c-).
                if (action === "c") {
                  conn.query(
                    `UPDATE subtask SET ${sql_column} = ${sql_trueOrFalse} WHERE maintask_id = ${dataid}`,
                    (err) => {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                    }
                  );
                }
              }
            );
            conn.commit(function (commit_err) {
              if (commit_err) {
                return conn.rollback(function () {
                  throw commit_err;
                });
              }
            });
            conn.release();
            resolve(
              `Database entry with id ${dataid} property ${sql_column} set to ${sql_trueOrFalse}`
            );
            console.log(
              `Database entry with id ${dataid} property ${sql_column} set to ${sql_trueOrFalse}`
            );
          });
        });
      } else {
        reject(
          `Could not perform the ${sql_column} ${sql_trueOrFalse} action to database entry with id ${dataid}.`
        );
      }
    });
  },

  // DELETE FUNCTION
  delete: (id) => {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(
          "DELETE FROM task WHERE id = ?",
          [id],
          (err, result) => {
            if (err) {
              throw err;
            }
            console.log(`Deleted entry with id ${id} from database.`);
            resolve(`Deleted entry with id ${id} from database.`);
          }
        );
      } else {
        reject(
          `Database connection failed. Could not delete entry with id ${id}.`
        );
      }
    });
  },

  // DELETE SUBTASK FUNCTION
  deleteSubtask: (id) => {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(
          "DELETE FROM subtask WHERE id = ?",
          [id],
          (err, result) => {
            if (err) {
              throw err;
            } else {
              console.log(`Subtask with ID number ${id} deleted`);
              resolve(`Subtask with ID number ${id} deleted`);
            }
          }
        );
      } else {
        reject(`Connection failed. Could not delete subtask with id ${id}`);
      }
    });
  },

  // EDIT FUNCTION
  // We use this function to update the whole task entry in database, along with its relations to other tables in database.
  // To prevent conflicts between transactions with frontend and backend we double- or triplecheck user given values and reliably update it on database.
  edit: (task) => {
    return new Promise((resolve, reject) => {
      if (connection) {
        let initialQuery = `UPDATE task SET
        created = ?,  
        title = ?,
        minutes = ?,
        due = ?,
        isCompleted = ?,
        isArchived = ?
        WHERE ID = ?`;

        connection.getConnection(function (conn_err, conn) {
          if (conn_err) {
            throw conn_err;
          }
          conn.beginTransaction(function (error) {
            if (error) {
              throw error;
            }
            conn.query(
              initialQuery,
              [
                // NOTE!
                // This query snippet
                //
                // // // created = '${task.created}+INTERVAL xx SECOND'_____
                //
                // is a workaround: it doesn't actually change anything BUT it will
                // still cause tables auto updated MODIFIED column be updated, like we want.
                // This is needed in the case where subtasks will be modified, but the main task stays the same.
                // We could loose this +INTERVAL xx SECOND part if we created a "hard coded" procedure in the mysql database.
                `${task.created}+INTERVAL xx SECOND`,
                task.title,
                task.minutes,
                task.due,
                task.isCompleted,
                task.isArchived,
                task.id,
              ],
              (err) => {
                if (err) {
                  return conn.rollback(function () {
                    throw err;
                  });
                }

                let deleteQuery = `DELETE FROM subtask WHERE maintask_id = '${task.id}'`;
                // the case if there are subtasks
                if (task.subtasks.length > 0) {
                  //
                  // Concerning sql-injections, just some thoughts:
                  //
                  // We are not quite sure if we should protect in-app variables from sql-injections.
                  // It's clear that we have escaped query values in direct user given variables, but can these also be injected? Does innodb/mysql have any self protection between backend connections reliability? Even when using connection pools?
                  //
                  // Anyways...
                  //
                  // We need to set variable so we can insert all subtasks to refer the task that was just added
                  //
                  // conn.query(`SET @lastid = @@identity`),
                  //   (err) => {
                  //     if (err) {
                  //       return conn.rollback(function () {
                  //         throw err
                  //       })
                  //     }
                  //
                  // Go through all subtask "subtask_id" values that are not undefined.
                  // Then add them to a string to use it directly in a query.
                  let preservedSubtasks = "";
                  for (let i = 0; i < task.subtasks.length; i++) {
                    let subt = task.subtasks[i];
                    if (subt.subtask_id !== undefined) {
                      preservedSubtasks += subt.subtask_id + ",";
                    }
                  }
                  if (preservedSubtasks !== "") {
                    preservedSubtasks = preservedSubtasks.slice(0, -1);
                  }
                  let additionalQuery = ` AND id NOT IN (${preservedSubtasks})`;
                  if (preservedSubtasks !== "") {
                    deleteQuery += additionalQuery;
                  }
                  conn.query(deleteQuery),
                    (err) => {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                    };
                  for (let i = 0; i < task.subtasks.length; i++) {
                    if (task.subtasks[i].minutes < 1) {
                      task.subtasks[i].minutes = 15;
                    }
                    let subt = task.subtasks[i];
                    if (subt.subtask_id !== undefined) {
                      conn.query(
                        `UPDATE subtask SET
                     title = "${subt.title}",
                     minutes = "${subt.minutes}",
                     isCompleted = ${subt.isCompleted}
                     WHERE ID = ${subt.subtask_id}`
                      ),
                        (err) => {
                          if (err) {
                            return conn.rollback(function () {
                              throw err;
                            });
                          }
                        };
                    } else {
                      // If current task includes new subtasks, we commit them here to database.
                      conn.query(
                        `INSERT INTO subtask (maintask_id, title, minutes, isCompleted) VALUES ('${task.id}', '${subt.title}', '${subt.minutes}', ${subt.isCompleted})`
                      ),
                        (err) => {
                          if (err) {
                            return conn.rollback(function () {
                              throw err;
                            });
                          }
                        };
                    }
                  }

                  // Again in case if there are subtasks in the subtask array, we keep the main task minutes as 0.
                  conn.query(
                    `UPDATE task SET minutes = 0 WHERE ID = '$(task.id)'`
                  ),
                    (err) => {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                    };
                } else {
                  conn.query(deleteQuery),
                    (err) => {
                      if (err) {
                        return conn.rollback(function () {
                          throw err;
                        });
                      }
                    };
                }

                // our sql db works in a way that there will be 0 put into place of task.minutes where the id has subtasks, in which
                // case those are actually used as minutes_total etc metadata
                conn.commit(function (commit_err) {
                  if (commit_err) {
                    return conn.rollback(function () {
                      throw commit_err;
                    });
                  }
                });
                conn.release();
              }
            );
            resolve("Edited database entry.");
            // Here we finally log this to backend console after succesful transaction in betweem backend and database.
            console.log("Edited database entry.");
          });
        });
      } else {
        reject("Connection failed. Could not edit database entry.");
      }
    });
  },

  // FIND MAIN TASKS FROM DATABASE
  //
  // This function gets main table from database and returns it as an json of todo task entries.
  //
  // We have implemented this in a bit of a lazy manner, but we don't want to accidentally break an app that actually works...
  // By lazy manner I mean that we could get a database query with proper sql table joins and get all info with one function.
  // Now we are using separate functions to pick up the tables.
  findMain: () => {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(
          `SELECT * FROM ${mainTaskTable} WHERE isArchived=0`,
          (err, tasks) => {
            let result = JSON.parse(JSON.stringify(tasks));
            resolve(result);
            console.log("Database query was implemented.");
          }
        );
      } else {
        reject("Connection failed. Could not perform database query.");
      }
    });
  },
  findSub: () => {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(
          `SELECT subtask.id AS subtask_id, maintask_id, subtask.title, subtask.minutes, subtask.isCompleted FROM ${subTaskTable} INNER JOIN task ON maintask_id = task.id WHERE task.isArchived=0`,
          (err, subtasks) => {
            let result = JSON.parse(JSON.stringify(subtasks));
            resolve(result);
          }
        );
      } else {
        reject("Connection failed. Could not perform database query.");
      }
    });
  },
  findArchivedMain: () => {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(
          `SELECT * FROM ${mainTaskTable} WHERE isArchived=1`,
          (err, tasks) => {
            let result = JSON.parse(JSON.stringify(tasks));
            resolve(result);
          }
        );
      } else {
        reject("Connection failed. Could not perform database query.");
      }
    });
  },
  findArchivedSub: () => {
    return new Promise((resolve, reject) => {
      if (connection) {
        connection.query(
          `SELECT subtask.id AS subtask_id, maintask_id, subtask.title, subtask.minutes, subtask.isCompleted FROM ${subTaskTable} INNER JOIN task ON maintask_id = task.id WHERE task.isArchived=1`,
          (err, subtasks) => {
            let result = JSON.parse(JSON.stringify(subtasks));
            resolve(result);
          }
        );
      } else {
        reject("Connection failed. Could not perform database query.");
      }
    });
  },
  close: () => {
    connection.end(() => console.log("Closing database connection."));
    process.exit();
  },
};

module.exports = connectionFunctions;
