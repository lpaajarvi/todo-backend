// REQUIREMENTS
const express = require("express");
const database = require("./database/crudpromises.js");
const app = express();
const routers = require("./routes/routers.js");
const { response } = require("express");
let cors = require("cors");

// SETTINGS
app.use(express.static("public"));
app.use(cors());
app.use("/api", routers);

// DECLARATIONS
const port = process.env.PORT || 8080;

// BACKEND SERVER APPLICATION STARTING POINT
const server = app.listen(port, async () => {
  try {
    await database.connect();
  } catch (err) {
    console.log(err);
  } finally {
    console.log(`Listening on port ${server.address().port}`);
  }
});
