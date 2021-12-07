const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const requestPromise = require("request-promise");

const app = express();
const port = process.env.PORT || 3000;

// Setup handlebars engine and views location
const viewsPath = path.join(__dirname, "./templates/views");
app.set("view engine", "hbs");
app.set("views", viewsPath);

const upload = multer({ dest: "./uploads" });
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

app.get("", (req, res) => {
  res.render("index");
});

app.post("/receiveFile", upload.single("myfile"), (req, res) => {
  const file = req.file;
  let jsonFile = JSON.parse(fs.readFileSync(file.path));

  const options = {
    url: "http://localhost:3001/receiveFile",
    json: true,
    body: jsonFile,
  };

  requestPromise
    .post(options)
    .then((body) => {
      const pathToFile = path.join(
        __dirname,
        `./downloads/${Date.now().toString()}.json`
      );
      fs.writeFileSync(pathToFile, JSON.stringify(body.jsonFile));
      res.render("result", {
        resultMessage:
          "Success! Click the button below to download your result file",
        processingTimeMillis: body.resultTime,
        pathToFile,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/downloadFile", (req, res) => {
  const pathToDownload = req.body.pathToFile;
  res.download(req.body.pathToFile);
});

app.listen(port);
