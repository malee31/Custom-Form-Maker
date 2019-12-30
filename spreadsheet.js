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
	const sheet = data.worksheets[1];
	console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);

	const rows = await promisify(sheet.getRows)();

	//Code for printing a certain column out of each row
	rows.forEach(row => {
		console.log(row.score);
		/* For sheet 1 testing
		if(row.first !== "Marvin")
		{
			console.log(row.lastname)
			row.save();
		}
		*/
	});
}

openSheet();
