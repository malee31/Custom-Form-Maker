//ExpressJS imports
const express = require('express');
const path = require("path");
const favicon = require('serve-favicon');
const app = express();

//Imports module imports from spreadsheet.js
const sheet = require("./spreadsheet.js");
const sheetError = require("./sheetError.js");

//Allows parsing of data in requests
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Use EJS Templating Engine with certain options set
app.set('view engine', 'ejs');
app.set('view options', {root: path.resolve(__dirname, "views")});

//Serves static file like local js and css
app.use("/static", express.static(path.resolve(__dirname, "static")));
app.use(favicon(path.resolve(__dirname, "static/img/favicon.ico")));

// Renders HTML file when the page is accessed
app.get("/", (req, res) => {
	res.render(path.resolve(__dirname, "views/pages/index"));
});

app.post("/", (req, res) => {
	const info = req.body;

	//Invalid Request error on empty POST request
	if(Object.entries(info).length === 0 && info.constructor === Object) {
		//Unprocessable Entity
		res.sendStatus(422);
	} else if(info.id) {
		//Runs if we are retrieving spreadsheet form
		sheet.getHeaders(info.id).then(headers => {
			console.log(headers);
			//console.log(headers);
			//returns the headers to site as a json file to be parsed
			res.json(JSON.stringify(headers));
		}).catch(err => {
			console.log(err);
			//Unprocessable Entity - caused usually by invalid spreadsheet ids
			res.sendStatus(422);
		});
	} else {
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
	res.redirect(`/?id=${req.params.sheetId}`);
});

// Error 404
app.use((req, res) => {
	res.status(404).render(path.resolve(__dirname, "views/pages/404.ejs"));
});

app.listen(process.env.PORT || 3000);