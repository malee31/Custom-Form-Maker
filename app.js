const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname + "/public"));
});

app.post('/', function (req, res) {
	test.testPost();
	test.pasteName();
	console.log(req.body.testInput);
	res.send("Success");
})

app.listen(8080);
