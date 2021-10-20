require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
let isLogged = false;

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Create Database Connection
const connection = mysql.createConnection({
  host: "us-cdbr-east-04.cleardb.com",
  port: "3306",
  user: "bd9d0c5ee3350c",
  password: "e51b2d53",
  database: "heroku_42f188ea598029f",
});
connection.connect();

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/")); //This line is necessary for us to use relative paths and access our resources directory

app.get("/", function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  connection.query(
    "SELECT * FROM products;",
    function (error, results, fields) {
      if (error) throw error;
      // connected!

      res.render("pages/main", {
        data: results,
      });
    }
  );
});

app.get("/products/add", function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  res.render("pages/form");
});

app.get("/login", function (req, res) {
  res.render("pages/login");
});

app.post("/login", function (req, res) {
  const { userName, password } = req.body;
  if (userName === "admin" && password === "admin") {
    isLogged = true;
    return res.redirect("/");
  }

  res.render("pages/login");
});

app.post("/products", function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }
  const { name, description, price, quantity } = req.body;

  connection.query(
    "INSERT INTO products SET ?",
    { name, description, price, quantity },
    function (error, results, fields) {
      if (error) throw error;
      return res.redirect("/");
    }
  );
});

app.get("/products/:id/delete", function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  connection.query(
    `DELETE FROM products WHERE id = ${req.params.id}`,
    function (error, results, fields) {
      if (error) throw error;
      return res.redirect("/");
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
