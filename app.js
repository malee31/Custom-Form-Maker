const express = require('express');
const app = express();
const path = require("path");

const test = require("./spreadsheet.js");

app.use(express.urlencoded({extended: true}));

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
	test.testPost();
	test.pasteName();
	console.log(req.body);
	res.send("Success\n" + JSON.stringify(req.body));
})

app.listen(8080);
