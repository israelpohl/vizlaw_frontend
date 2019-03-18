const express = require("express");
const path = require("path");
const app = express();

var fs = require("fs");
var pdf = require("html-pdf");
var options = { format: "Letter" };

var bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, "build")));

app.use(bodyParser.json());

app.post("/pdf", (req, res) => {
  pdf
    .create(
      req.body.favorites
        .map(
          favorite =>
            `<img width=500px src="https://i.imgur.com/uWmKFYV.png"/><h1>${
              favorite.slug
            }</h1>${favorite.content}`
        )
        .join("<br/>"),
      options
    )
    .toFile("src/tmp/results.pdf", function(err, file) {
      console.log("FILE", file);
      if (err) return console.log(err);
      res.sendStatus(200);
    });
});

app.get("/results.pdf", function(req, res) {
  res.sendFile(path.join(__dirname, "tmp", "results.pdf"));
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 3000);
