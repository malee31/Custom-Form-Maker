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
	//test();

	var sheet = await getWorksheets(id).then(async sheets => {
		return await getMain(sheets);
	}, sheetError.genericErr);

	//Array of objects containing the name of a column and what kind of field it is
	const headers = await getRequirements(id, false);

	console.log(headers);
	return JSON.stringify(headers);
}

/**
 * Formats the name of the requirement headers into object keys used by the google-sheets api
 * along with whether they are required in the form to continue.
 *
 * @params {{name: string, required: string}[]} requirements Array of Objects with a name key
 * 	corresponding to a column header and required key for whether it is required to submit the form.
 * @returns {Object.<string: string>} Returns singular object containing sanitized column names in order
 * 	as keys and their required status as its value.
 */
function processRequirements(requirements)
{
	var headers = {};
	for(var headerCol = 0; headerCol < requirements.length; headerCol++)
	{
		if(requirements[headerCol].required != "EXCLUDE")
		{
			var formatted = requirements[headerCol].name.toLowerCase().replace(/\s/g, "").replace(/\W/g, "").replace(/_/g, "");
			//removes all leading numbers in the header
			for(var i = 0; i < formatted.length; i++)
			{
				if(!isNaN(parseInt(formatted.substring(0, 1))))
				{
					formatted = formatted.substring(1);
				}
				else
				{
					break;
				}
			}
			headers[formatted] = requirements[headerCol].required;
		}
	}
	return headers;
}

async function getRequirements(id, keepExcluded)
{
	const config = await getWorksheets(id).then(async sheets => {
		return await getConfig(sheets);
	});

	const colNames = await valueLookup(config, "COLUMNS", false);
	const topCells = await promisify(config.getCells)({
		'min-col' : 1,
		'max-col' : config.colCount,
		'min-row' : colNames[1],
		'max-row' : colNames[1],
		'return-empty' : false,
	});

	const requirementStart = await valueLookup(config, "REQUIREMENT", false);
	const requirementCells = await promisify(config.getCells)({
		'min-col' : 1,
		'max-col' : config.colCount,
		'min-row' : requirementStart[1],
		'max-row' : requirementStart[1],
		'return-empty' : false,
	});

	var combineData = [];
	var adjustment = 0;
	for(var i = 0; i < topCells.length; i++)
	{
		combineData[i - adjustment] = {};
		combineData[i - adjustment].name = topCells[i].value;
		combineData[i - adjustment].required = "";
		for(var ii = 0; ii < requirementCells.length; ii++)
		{
			if(requirementCells[ii].col == topCells[i].col)
			{
				if(!keepExcluded && requirementCells[ii].value == "EXCLUDE")
				{
					combineData.pop();
					adjustment++;
					break;
				}
				combineData[i - adjustment].required = requirementCells[ii].value;
				break;
			}
		}
	}

	combineData.shift();
	console.log(combineData);
	return combineData;
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
	var sheet = await getWorksheets(userInput["formId"]).then(async worksheets => {
		return await getMain(worksheets);
	}, sheetError.worksheetErr);

	const requirements = await getRequirements(userInput["formId"]);

	delete userInput["formId"];

	/*for(var dataProp in userInput)
	{
		if(!requirements.hasOwnProperty(dataProp) || requirements[dataProp] == "EXCLUDE")
		{
			delete userInput[dataProp];
		}
	}

	console.log("USERINPUT FILTERED");	
	console.log(userInput);*/

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

	for(var matchedCell = 0; matchedCell < result.length; matchedCell++)
	{
		result[matchedCell] = [result[matchedCell].col, result[matchedCell].row];
	}

	if(!returnMultiple && result.length >= 1)
	{
		result = result[0];
	}

	return result;
}

async function offsetLookup(sheet, value, offsetCol, offsetRow, returnMultiple)
{
	returnMultiple = returnMultiple ? true : false;
	
	var matches = await valueLookup(sheet, value, returnMultiple);

	if(!returnMultiple)
	{
		return [matches[0] + offsetCol, matches[1] + offsetRow];
	}
	
	for(var matchPair = 0; matchPair < matches.length; matchPair++)
	{
		matches[matchPair][0] += offsetCol;
		matches[matchPair][1] += offsetRow;
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
	}, err => sheetError.specificErr(err, "Cell parseValue error"));
}

async function offsetParse(sheet, searchKey, colOffset, rowOffset, defaultVal)
{
	defaultVal = defaultVal || "";

	return await offsetLookup(sheet, searchKey, colOffset, rowOffset, false).then(async pos => {
		console.log("Position at :" + pos);
		return await parseValue(sheet, pos[0], pos[1], false).then(value => {
			return value;
		}, err => {
			console.log("Failed to offset and parse. Returning empty String or default value.");
			return defaultVal;
		});
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
	const main = await offsetParse(config, "DATA", 1, 0, "Main");
	console.log("Main sheet is called: " + main);
	return getSheetByName(spreadsheets, main);
}

function getSheetByName(spreadsheets, name)
{
	console.log("Now in getSheets");
	for(var i = 0; i < spreadsheets.length; i++)
	{
		/*console.log(spreadsheets[i].title);
		console.log("Comparing " + name + " to " + spreadsheets[i].title);*/
		if(spreadsheets[i].title === name)
		{
			console.log(spreadsheets[i].title);
			return spreadsheets[i];
		}
	}
	console.log("Sheet not found by name. Defaulting to first sheet.");
	return spreadsheets[0];
}

async function test()
{
	console.log("Testing: ");
	const testId = "1n-hg18uCMywzbPlJ7KV1kXPkH3frWr7Hx8RAnTQP4UQ";
	const sheets = await getWorksheets(testId);

	console.log("End of Test.");
}
