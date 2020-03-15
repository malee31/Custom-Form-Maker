//ExpressJS imports
const express = require('express');
const app = express();
const path = require("path");
const url = require('url');

//Imports module imports from spreadsheet.js
const sheet = require("./spreadsheet.js");
const sheetError = require("./sheetError.js");

//Allows parsing of data in requests
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Serves static file like local js and css
app.use("/static", express.static(path.resolve(__dirname, "public")));
app.use("/favicon.ico", express.static(path.resolve(__dirname, "public/img/favicon.ico")));

//Sends html file when the page is accessed
app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname, "views/index.html"));
});

app.post("/", (req, res) => {
	//sheet.pasteName();
	const info = req.body;

	//Invalid Request error on empty POST request
	if(Object.entries(info).length === 0 && info.constructor === Object)
	{
		//Unprocessable Entity
		res.sendStatus(422);
	}
	else if(info.id)
	{
		//Runs if we are retrieving spreadsheet form
		sheet.getHeaders(info.id).then(headers => {
			//console.log(headers);
			//returns the headers to site as a json file to be parsed
			res.json(headers);
		},
		err => {
			//Unprocessable Entity - caused usually by invalid spreadsheet ids
			res.sendStatus(422);
		});
	}
	else
	{
		//Submitting data
		//console.log(info);
		sheet.newRow(info).then(() => {
			console.log("A form was successfully completed.");
			res.send("Thank you for filling out the form!");
		}).catch(err => {
			sheetError.specificErr(err, "Adding Rows")
			res.sendStatus(422);
		});
	}
});

app.get("/form/:sheetId", (req, res) => {
	console.log(req.params);
	res.redirect(url.format({
		pathname: "/",
		query: {
			"id": req.params.sheetId
		}
	}));
});

// Error 404
app.use((req, res) => {
	res.status(404).sendFile(path.resolve(__dirname, "views/404.html"));
});

// Error 500
app.use((error, req, res, next) => {
	res.status(500).sendFile(path.resolve(__dirname, "views/500.html"));
});

app.listen(8080);
