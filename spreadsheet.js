const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const credentials = require('./SpreadsheetPlaygroundCredentials.json');
const sheetID = require('./SpreadsheetID.json');

async function openSheet()
{
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	const sheet = data.worksheets[0];
	console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);
}

openSheet();
