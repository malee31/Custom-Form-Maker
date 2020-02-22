const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const sheetError = require('./sheetError.js');

const credentials = require('./private/SpreadsheetPlaygroundCredentials.json');

const configSheetName = ".config";

module.exports = {
	newRow: fillRow,
	getHeaders: getSheetHeaders,
	debug: test
}

/*Example codes
	console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);
*/

async function getSheetHeaders(id)
{
	test();

	var sheet = await getWorksheets(id).then(async sheets => {
		return await getMain(sheets);
	}, sheetError.genericErr);

	//Headers are reprocessed client-side to format their values to the actual column name properties
	var headers = {};
	var counter = 1;

	const topCells = await promisify(sheet.getCells)({
		'min-row' : 1,
		'max-row' : 1,
		'min-col' : 1,
		'max-col' : sheet.colCount,
		'return-empty' : false,
	});

	for(const cell of topCells)
	{
		headers[counter] = cell.value;
		counter++;
	}
	
	return JSON.stringify(headers);
}

async function getCell(formId, x, y, sheetName)
{
	var sheet = await getWorksheets(formId).then(worksheets => {
		return worksheets;
	}, sheetError.genericErr);

	sheet = await (sheetName ? getSheetByName(sheet, sheetName) : getMain(sheet));
	
	return await promisify(sheet.getCells)({
		'min-col' : x,
		'max-col' : x,
		'min-row' : y,
		'max-row' : y,
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
		'return-empty' : (returnEmpty ? true : false),
	});
}

async function valueLookup(sheet, value, returnMultiple)
{
	returnMultiple = returnMultiple ? true : false;

	const cells = await getAllCells(sheet, false);

	var result = cells.filter(cell => {return cell.value == value;});

	if(!returnMultiple && result.length >= 2)
	{
		result = result.slice(0, 2);
	}

	for(var matchedCell = 0; matchedCell < result.length; matchedCell++)
	{
		result[matchedCell] = [result[matchedCell].col, result[matchedCell].row];
	}

	console.log(result);

	return result;
}

async function offsetLookup(sheet, value, offsetCol, offsetRow, returnMultiple)
{
	returnMultiple = returnMultiple ? true : false;
	
	var matches = await valueLookup(sheet, value, returnMultiple);
	
	for(var matchPair = 0; matchPair < matches.length; matchPair++)
	{
		matches[matchPair][0] = matches[matchPair][0] + offsetCol;
		matches[matchPair][1] = matches[matchPair][1] + offsetRow;
		if(matches[matchPair][0] < 1 || matches[matchPair][1] < 1)
		{
			console.log("Potential Error: This Offset Pair is invalid - " + matches[matchPair]);
		}
	}

	return matches;
}

async function parseValue(sheet, col, row)
{
	return cell = await promisify(sheet.getCells)({
		'min-col' : col,
		'max-col' : col,
		'min-row' : row,
		'max-row' : row,
		'return-empty' : true,
	}).then(cell => {
		return cell[0].value;
	}, err => {
		console.log("Cell parseValue error: "+ err);
	});
}

//With the updates, this is now useless but will be kept as a relic lol
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
		return cell[0].value;
	}, err => {
		console.log("There is no Main at .config!B1. Error: "+ err);
		return "Main";
	});
	return getSheetByName(spreadsheets, main);
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
	console.log("Testing: ");
	const sheets = await getWorksheets("1n-hg18uCMywzbPlJ7KV1kXPkH3frWr7Hx8RAnTQP4UQ");

	var val = await offsetLookup(sheets[0], "1", 1, 0, true);

	console.log("Test val evaluates to " + val);


	var cont = await parseValue(sheets[0], 1, 2);

	console.log("Test cont evaluates to " + cont);

	console.log("End of Test.");
}
