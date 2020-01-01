const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.use(express.urlencoded());

app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname + "/index.html"));
});

app.post('/', function (req, res) {
	test.testPost();
	test.pasteName();
	/*console.log(req);
	console.log("Next: ");
	console.log(res);
	console.log("Fin");
	console.log(req.body);
	console.log("Bodied");*/
	console.log(req.body.testInput);
	res.send("Success");
})

app.listen(8080);
