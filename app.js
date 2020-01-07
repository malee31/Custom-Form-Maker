const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('*/css',express.static('public/css'));
app.use('*/js',express.static('public/js'));

app.use("/static", express.static(path.resolve(__dirname, "public")));

app.get("/css/styles.css", () => {
	res.sendFile(path.resolve(__dirname, "public/css/styles.css"));
});

app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname, "views/index.html"));
});

app.post('/', function (req, res) {
	test.pasteName();
	const info = req.body;
	if(Object.entries(info).length === 0 && info.constructor === Object)
	{
		res.sendStatus(422);
	}
	else
	{
		test.newRow(info.first, info.last, info.buildHours, info.hours, (info.probation && (info.probation.toUpperCase() === "YES" || info.probation.toUpperCase() === "TRUE")));
		res.send("Success\n" + JSON.stringify(req.body));
	}
})

app.listen(8080);
