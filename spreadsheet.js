const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const credentials = require('./private/SpreadsheetPlaygroundCredentials.json');
const sheetID = require('./private/SpreadsheetID.json');

module.exports = {
	pasteName: testSheet,
	newRow: testNewRow,
	getHeaders: getHeaders
}

async function getHeaders(id)
{
	const doc = new GoogleSpreadsheet(id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];
	const topCells = await promisify(sheet.getCells)({
		'min-row' : 1,
		'max-row' : 1,
		'min-col' : 1,
		'max-col' : sheet.colCount,
		'return-empty' : false,
	});
	var headers = {};
	var counter = 1;
	for(const cell of topCells)
	{
		headers[counter] = cell.value;
		counter++;
	}
	//Reprocessed client-side to sanitize their values to the actual properties
	return JSON.stringify(headers);
}

async function testSheet()
{
	//Testing things here then splitting them off into functions
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];

	console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);
}

async function getCell(x, y)
{
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];
	return await promisify(sheet.getCells)({
		'min-row' : y,
		'max-row' : y,
		'min-col' : x,
		'max-col' : x,
		'return-empty' : true,
	});
}

async function testRows()
{
	//returns rows for resolved Promise
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];

	const rows = await promisify(sheet.getRows)();
	return rows;
}

// async function testCells()


//Actual testing
//testSheet().then(() => {
//		console.log("testSheet() complete")
//	},
//	(err) => {
//		console.log(`Error: ${err}`);
//	}
//);

async function testNewRow(first, last, buildhrs, hrs, prob)
{
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];

	sheet.addRow({
		"first": first,
		"lastname": last,
		"buildseasonhours": buildhrs,
		"teamhours": hrs,
		"probation": prob
	}, (err, row) => {
		return (err) ? err : JSON.stringify(row);
	})
}
