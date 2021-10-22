require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();

const PORT = process.env.PORT;
let isLogged = false;

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

diskStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, done) => {
      done(null, "uploads");
    },
    filename: (req, file, done) =>
      done(null, Date.now() + "-" + file.originalname),
  });

uploadImage = () =>
  multer({
    storage: diskStorage(`${__dirname}/uploads/`),
    fileFilter: (req, file, callback) => {
      const ext = file.mimetype;
      if (
        ext !== "image/png" &&
        ext !== "image/jpg" &&
        ext !== "image/gif" &&
        ext !== "image/jpeg"
      ) {
        return callback(new Error("Only image are allowed"), false);
      }
      callback(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  });

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

app.post("/products", uploadImage().single("file"), function (req, res) {
  if (!isLogged) {
    res.render("pages/login");
  }

  const { name, price, quantity } = req.body;
  connection.query(
    "INSERT INTO products SET ?",
    { name, imgUrl: `/uploads/${req.file.filename}`, price, quantity },
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
