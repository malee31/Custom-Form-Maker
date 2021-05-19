/**
 * @fileOverview Main file for the project containing all the routes and handles file rendering and serving
 * @author Marvin Lee
 */

// ExpressJS imports
const express = require('express');
const path = require("path");
const favicon = require('serve-favicon');
const app = express();

// Handle Multipart Form Data
const multer = require("multer");
const upload = multer({
	dest: path.resolve(__dirname, "uploads")
});

// Imports module imports from spreadsheet.js
const sheet = require("./spreadsheet.js");
const sheetError = require("./sheetError.js");

// For cleaning up input data for rendering
const {cleanData, typeFilter} = require("./serverDataProcessor.js");

// Place to save created form JSON files
const {writeFile, readFile} = require("fs").promises;
const createdJSONPath = path.resolve(__dirname, "createdJSON");
const {v4: uuidv4} = require("uuid");
const processor = require("./shared/sharedDataProcessor.js");

// Allows parsing of data in requests
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Use EJS Templating Engine with certain options set
app.set('view engine', 'ejs');
app.set('view options', {root: path.resolve(__dirname, "views")});

//Serves static file like local js and css
app.use("/static", express.static(path.resolve(__dirname, "static")));
app.use("/shared", express.static(path.resolve(__dirname, "shared")));
app.use(favicon(path.resolve(__dirname, "static/img/favicon.ico")));

// Renders HTML file when the page is accessed
app.get("/", (req, res) => {
	if(req.query.id) res.redirect(`/form/${req.query.id}`);
	else res.render(path.resolve(__dirname, "views/pages/index"));
});

app.post("/", (req, res) => {
	const info = req.body;

	//Invalid Request error on empty POST request
	if(Object.entries(info).length === 0 && info.constructor === Object) {
		//Unprocessable Entity
		res.sendStatus(422);
	} else {
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
	}
});

app.post("/submit", upload.any(), async(req, res) => {
	const info = Object.assign({}, req.body);
	console.log("Submission Received");
	req.files.forEach(fileObj => {
		const objCopy = Object.assign({}, fileObj);
		objCopy.type = "file";
		info[objCopy.fieldname] = objCopy;
	});
	// console.log(info);
	try {
		if(info.formId === "N/A") return res.sendStatus(422);
		await sheet.newRow(info);
		console.log("A form was successfully completed.");
		res.status(200).send("Thank you for filling out the form!");
	} catch(err) {
		sheetError.specificErr(err, "Adding Rows")
		res.sendStatus(422);
	}
});

app.get("/form/:sheetId", async(req, res) => {
	const headerData = await sheet.getHeaders(req.params.sheetId);
	(req.query.default || "").split(/(?=\s*(?<=[^\\])),/).forEach((val, index) => {
		val = val.replace(/\\,/g, ",").trim();
		if(val && index < headerData.headers.length) headerData.headers[index].defaultValue = val;
	});

	headerData.headers = headerData.headers.map(header => cleanData(header));
	console.log(headerData);
	res.render(path.resolve(__dirname, "views/pages/form"), {formId: req.params.sheetId, formData: headerData});
});

app.get("/created/:createId", (req, res) => {
	const requestedCreated = path.resolve(createdJSONPath, `${req.params.createId}.json`);
	console.log(`Requesting ${requestedCreated}`);
	readFile(requestedCreated).then(data => {
		const jsonify = JSON.parse(data.toString());
		res.render(path.resolve(__dirname, "views/pages/form"), {
			formId: jsonify.sheetId,
			formData: {
				name: jsonify.name,
				headers: jsonify.headers.map(header => cleanData(header))
			}
		});
	}).catch(e => {
		if(e.code === "ENOENT") res.status(404).render(path.resolve(__dirname, "views/pages/404.ejs"));
		else console.log(e);
	});
});

app.get("/create", (req, res) => {
	res.render(path.resolve(__dirname, "views/pages/create"));
});

app.get("/edit/:createId", (req, res) => {
	const requestedCreated = path.resolve(createdJSONPath, `${req.params.createId}.json`);
	console.log(`Requesting Edit for ${requestedCreated}`);
	readFile(requestedCreated).then(data => {
		res.status(200).send(data.toString());
	}).catch(e => {
		if(e.code === "ENOENT") res.status(404).send(`Form not found\nPress OK to continue making a new form`);
		else res.status(400).send(`Something Went Wrong\n${e.toString()}`);
	});
});

app.get("/templates", (req, res) => {
	const requested = {type: req.query.type};
	if(!requested.type) return res.status(422).send("No template type requested");
	try {
		return res.set("Content-Type", "text/plain").sendFile(path.resolve(__dirname, "views", `${typeFilter(requested).path.substring(1)}.ejs`));
	} catch(err) {
		return res.status(500).send("Unable to read template. Check to see if the requested template type exists and try again later");
	}
});

app.post("/create/submit", async (req, res) => {
	const assignedID = req.body.editing || uuidv4();
	const data = {
		name: req.body.name,
		headers: [],
		sheetId: req.body.sheetId,
	};
	const dataHeaders = req.body.headers;
	const headerValues = [];
	for(const header of dataHeaders) {
		const cleaned = processor.cleanDataBare(header);
		data.headers.push(cleaned);
		headerValues.push(cleaned.name);
	}
	const createState = await sheet.createResultSheet(data.sheetId, headerValues);
	if(!createState.success) return res.status(400).send(`Sheet ID may be invalid or uneditable by server\n Error: ${createState.statusText}`);
	writeFile(path.resolve(createdJSONPath, `${assignedID}.json`), JSON.stringify(data)).then(() => {
		return res.status(200).send(`/created/${assignedID}`);
	}).catch(err => {
		return res.status(500).send(`Unable to save. Please try again\n${err.toString()}`);
	});
});

// Error 404
app.use((req, res) => {
	res.status(404).render(path.resolve(__dirname, "views/pages/404.ejs"));
});

app.listen(process.env.PORT || 3000);