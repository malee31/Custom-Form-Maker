const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const sheetError = require('./sheetError.js');

const credentials = require('./private/SpreadsheetPlaygroundCredentials.json');

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
	}, sheetError.genericErr);

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
	await test();
	return JSON.stringify(headers);
}

async function getCell(formId, x, y, sheetName)
{
	//change index number to access different sheet
	var sheet = await getWorksheets(formId).then(worksheets => {
		return worksheets;
	}, sheetError.genericErr);

	sheet = await (sheetName ? getSheetByName(sheet, sheetName) : getMain(sheet));
	
	return await promisify(sheet.getCells)({
		'min-row' : y,
		'max-row' : y,
		'min-col' : x,
		'max-col' : x,
		'return-empty' : true,
	});
}

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
		return allCells[Object.keys(allCells).length - 1].row;
	}, sheetError.genericErr);
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

async function test()
{
	console.log("With naming");
	console.log(await getCell("1n-hg18uCMywzbPlJ7KV1kXPkH3frWr7Hx8RAnTQP4UQ", 1, 1).then(cell => cell));
	console.log("Without naming");
	console.log(await getCell("1n-hg18uCMywzbPlJ7KV1kXPkH3frWr7Hx8RAnTQP4UQ", 1, 1, ".config").then(cell => cell));
}
