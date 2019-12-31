const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/index.html"));
});

app.post('/', function (req, res) {
    test.testPost();
    test.pasteName();
    res.send("Success");
})

app.listen(8080);
