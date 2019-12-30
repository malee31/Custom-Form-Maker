const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const credentials = require('./SpreadsheetPlaygroundCredentials.json');
const sheetID = require('./SpreadsheetID.json');

async function openSheet()
{
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];
	console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);
}

async function testRows()
{
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];

	const rows = await promisify(sheet.getRows)();

	/*Code for printing a certain column out of each row*/
	rows.forEach(row => {
		/* This is for sheet 1 testing
		console.log(row.score);*/
		if(row.first === "Marvin")
		{
			console.log(`${row.first} ${row.lastname} is now ${row.first} ${row.lastname + row.lastname}`);
			row.lastname += row.lastname;
			row.save();
		}
	});
}

openSheet();
testRows();