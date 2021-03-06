const express = require("express");
const path = require("path");
const app = express();

var fs = require("fs");
var pdf = require("html-pdf");
var options = { format: "A4",  "border": {
  "top": "2in",            // default is 0, units: mm, cm, in, px
  "right": "1in",
  "bottom": "2in",
  "left": "1.5in"
}, };

var bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, "build")));

app.use(bodyParser.json());

app.post("/pdf", (req, res) => {
  htmlBody = `
  <style>
  .RspDL { margin-top:25px; page-break-inside: avoid; font-size:11pt; }

      @page {
        size: A4; /* DIN A4 standard, Europe */
        margin:25px;
      }
      html {
        zoom:0.7;
          // width: 210mm;
          // height: 282mm;
          // overflow:visible;
      }
      body {
          padding-top:15mm;
          font-size:11pt;
      }
      h1 {
        font-size:24pt;
      }
  </style>
  <body style="font-family: Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;">
    <div style="width:100%; text-align:center;">
      <img style="width:500px;" src="https://i.imgur.com/uWmKFYV.png"/>
    </div>
    <div >`+
  req.body.favorites
    .map(
      favorite =>
        `<h1>
        ${favorite.file_number} &mdash; <br>${favorite.court.name}, ${favorite.date}
        </h1>
        ${favorite.content}`
    )
    .join("<br/>") + '</div></body>';

  // var writer = fs.createWriteStream('src/tmp/output.html');
  // writer.write(htmlBody);

  pdf
    .create(htmlBody,
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
