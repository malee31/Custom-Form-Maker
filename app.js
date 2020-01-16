const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('*/css',express.static('public/css'));
app.use('*/js',express.static('public/js'));

//Not used... I used the one above which probably isn't right. Will fix later.
app.use("/static", express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname, "views/index.html"));
});

app.post("/", (req, res) => {
	test.pasteName();
	const info = req.body;
	if(Object.entries(info).length === 0 && info.constructor === Object)
	{
		res.sendStatus(422);
	}
	else if(info.id)
	{
		test.getHeaders(info.id).then(headers => {
			//console.log(headers);
			res.json(headers);
		},
		err => {
			console.log(`Error: ${err}`);
		});
	}
	else
	{
		console.log(info);
		test.newRow(info).then(output => {
			console.log(output);
		},
		err => {
			console.log(`Error while adding rows: ${err}`);
		});
		res.send("Success\n" + JSON.stringify(info));
	}
});

app.listen(8080);
