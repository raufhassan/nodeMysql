var mysql = require("mysql");
const express = require("express");
//const logger 	    = require('morgan');
const bodyParser = require("body-parser");
//const passport      = require('passport');
const pe = require("parse-error");
const cors = require("cors");

const routes = require("./routes/routes");
const app = express();

const CONFIG = require("./config/config");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//DATABASE
const models = require("./models");
models.sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to SQL database:", CONFIG.db_name);
  })
  .catch((err) => {
    console.error("Unable to connect to SQL database:", CONFIG.db_name, err);
  });
if (CONFIG.app === "dev") {
  models.sequelize.sync(); //creates table if they do not already exist
  // models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
// CORS
/* var sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "africanadian",
});

sql.connect(function (err) {
  if (err) {
    console.log("error");
  } else {
    console.log("connected to database");
  }
}); */
app.use(cors());

app.use("/routes/", routes);

app.use("/", function (req, res) {
  res.statusCode = 200; //send the appropriate status code
  res.json({ status: "success", message: "default api working", data: {} });
});

// con.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

//This is here to handle all the uncaught promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Uncaught Error", pe(error));
});
