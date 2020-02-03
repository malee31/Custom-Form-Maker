const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const credentials = require('./private/SpreadsheetPlaygroundCredentials.json');
const sheetID = require('./private/SpreadsheetID.json');

const configSheetName = ".config";

module.exports = {
	newRow: fillRow,
	getHeaders: getSheetHeaders
}

async function getSheetHeaders(id)
{
	//change index number to access different sheet
	//UNKNOWN async USAGE. Untested and probably unnecessary
	var sheet = await getWorksheets(id).then(sheets => {
		return sheets;
	}, genericError);

	sheet = await getMain(sheet);

	//console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);

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

/*async function getCell(x, y)
{
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = await getMain(data.worksheets);
	
	return await promisify(sheet.getCells)({
		'min-row' : y,
		'max-row' : y,
		'min-col' : x,
		'max-col' : x,
		'return-empty' : true,
	});
}*/

async function testRows()
{
	//returns rows for resolved Promise
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = await getMain(data.worksheets);

	const rows = await promisify(sheet.getRows)();
	return rows;
}

// async function testCells()
//testSheet().then(() => {
//		console.log("testSheet() complete")
//	},
//	(err) => {
//		console.log(`Error: ${err}`);
//	}
//);

async function fillRow(userInput)
{
	//change index number to access different sheet
	var sheet = await getWorksheets(userInput["formId"]).then(worksheets => {
		return worksheets;
	}, err => {
		console.log("Worksheets not found: " + err);
	});
	//console.log(userInput);

	sheet = await getMain(sheet);

	delete userInput["formId"];

	sheet.addRow(
		userInput
	, (err, row) => {
		return (err) ? err : JSON.stringify(row);
	})
}

async function getWorksheets(formId)
{
	const doc = new GoogleSpreadsheet(formId);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	return data.worksheets;
}

async function getAllCells(sheet, returnEmpty)
{
	return await promisify(sheet.getCells)({
		'min-row' : 1,
		'max-row' : sheet.rowCount,
		'min-col' : 1,
		'max-col' : sheet.colCount,
		'return-empty' : returnEmpty,
	});
}

async function getLastRow(sheet)
{
	//Note: Considers empty checkboxes or validation as nonempty so those aren't considered the last rows.
	return await getAllCells(sheet, false).then(allCells => {
		console.log(allCells);
		console.log(allCells[Object.keys(allCells).length - 1]);
		return allCells[Object.keys(allCells).length - 1].row;
	}, genericError);
}

function getConfig(spreadsheets)
{
	return getSheetByName(spreadsheets, configSheetName);
}

async function getMain(spreadsheets)
{
	console.log("Searching for main");
	const config = getConfig(spreadsheets);
	const main = await promisify(config.getCells)({
		'min-row' : 1,
		'max-row' : 1,
		'min-col' : 2,
		'max-col' : 2,
		'return-empty' : true,
	}).then(cell => {
		return cell.value;
	}, err => {
		console.log("There is no Main at .config!B1. Error: "+ err);
		return "Main";
	});

	return getSheetByName(spreadsheets, "Main");
}

function getSheetByName(spreadsheets, name)
{
	console.log("Now in getSheets");
	for(var i = 0; i < spreadsheets.length; i++)
	{
		if(spreadsheets[i].title === name)
		{
			console.log(spreadsheets[i].title);
			return spreadsheets[i];
		}
	}
	console.log("Sheet not found by name. Defaulting to first sheet.");
	return spreadSheets[0];
}

function genericError(err)
{
	console.log(error);
}
