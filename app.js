const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname + "/public/html/index.html"));
});

app.post('/', function (req, res) {
	test.testPost();
	test.pasteName();
	console.log(req.body);
	res.send("Success\n" + JSON.stringify(req.body));
})

app.listen(8080);
