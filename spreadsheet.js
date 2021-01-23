const {GoogleSpreadsheet} = require('google-spreadsheet');
const {promisify} = require('util');
const sheetError = require('./sheetError.js');

const credentials = require("./private/SpreadsheetPlaygroundCredentials.json");
// const credentials = {
// 	"type": process.env.type,
// 	"project_id": process.env.project_id,
// 	"private_key_id": process.env.private_key_id,
// 	"private_key": process.env.private_key,
// 	"client_email": process.env.client_email,
// 	"client_id": process.env.client_id,
// 	"auth_uri": process.env.auth_uri,
// 	"token_uri": process.env.token_uri,
// 	"auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
// 	"client_x509_cert_url": process.env.client_x509_cert_url
// }

const CONFIG_SHEET_NAME = ".config";

module.exports = {
	newRow: fillRow,
	getHeaders: getSheetHeaders,
}

/**
 * Initializes a GoogleSpreadsheet object from a specified id and loads their worksheets.
 * @async
 * @param {string} formId Id of the target Google Spreadsheet meant for inputted data.
 * @returns {GoogleSpreadsheet} Google Spreadsheet object with all worksheets loaded in
 */
async function getWorksheets(formId) {
	const doc = new GoogleSpreadsheet(formId);
	await doc.useServiceAccountAuth(credentials);
	await doc.loadInfo();
	if(!doc.sheetCount >= 1) throw "No worksheets";
	return doc;
}

/**
 * Retrieves the labels/headers at the top row of the main sheet
 * @async
 * @param {string} id String that is the id of the spreadsheet on Google Spreadsheets
 * @returns {Object} Returns JSON object containing the header names paired with whether they are required inputs
 */
async function getSheetHeaders(id) {
	const doc = await getWorksheets(id);
	return await getRequirements(doc, false);
}

/**
 * Formats the name of the requirement headers into object keys used by the google-sheets api
 * along with whether they are required in the form to continue.
 * @param {Object[]} requirements Array of Objects with a string name key and string required key.
 * 	corresponding to a column header and required key for whether it is required to submit the form.
 * @returns {Object} Returns singular object containing sanitized column names in order
 * 	as keys and their required status as its value.
 */
function processRequirements(requirements) {
	const headers = {};
	for(const headerCol of requirements) {
		if(headerCol.required !== "EXCLUDE") {
			// Removes all leading numbers in the header as well as spacing and non-alphanumerical characters and underscores
			const formatted = headerCol.name.toLowerCase().replace(/\s/g, "").replace(/\W/g, "").replace(/_/g, "").replace(/^\d*/, "");
			headers[formatted] = headerCol.required;
		}
	}
	return headers;
}

/**
 * Retrieves the labels/headers at the top row of the main sheet along with their requirement status.
 *
 * @param {GoogleSpreadsheet} doc Google Spreadsheet to get requirements from
 * @param {boolean} [keepExcluded = false] Determines whether or not the returned object will include excluded headers.
 * @returns {Object} Returns JSON object with key value pairs of header name and whether it is a required input.
 */
async function getRequirements(doc, keepExcluded) {
	const config = getConfig(doc);
	// const colNames = await valueLookup(config, "COLUMNS", false);
	await config.loadCells({
		"startColumnIndex": 0,
		"startRowIndex": 0,
		"endColumnIndex": config.columnCount,
		"endRowIndex": 1
	});

	const topCells = [];
	for(let columnNum = 0; columnNum < config.columnCount; columnNum++) {
		const cellValue = config.getCell(0, columnNum).value;
		if(cellValue === null) break;
		topCells.push({
			name: cellValue,
			required: "",
			defaultValue: ""
		});
	}

	/*const requirementStart = await valueLookup(config, "REQUIREMENT", false);
	const requirementCells = await promisify(config.getCells)({
		'min-col': 1,
		'max-col': config.colCount,
		'min-row': requirementStart[1],
		'max-row': requirementStart[1],
		'return-empty': false
	});

	const defaultStart = await valueLookup(config, "DEFAULT", false);
	const defaultCells = await promisify(config.getCells)({
		'min-col': 1,
		'max-col': config.colCount,
		'min-row': defaultStart[1],
		'max-row': defaultStart[1],
		'return-empty': false,
	});

	let combineData = [];
	let adjustment = 0;
	for(let topCellNum = 0; topCellNum < topCells.length; topCellNum++) {
		combineData[topCellNum - adjustment] = {
			name: topCells[topCellNum].value,
			required: "",
			defaultValue: ""
		};

		for(let requirementCellNum = 0; requirementCellNum < requirementCells.length; requirementCellNum++) {
			if(requirementCells[requirementCellNum].col === topCells[topCellNum].col) {
				if(!keepExcluded && requirementCells[requirementCellNum].value === "EXCLUDE") {
					combineData.pop();
					adjustment++;
					break;
				}
				combineData[topCellNum - adjustment].required = requirementCells[requirementCellNum].value;

				for(const defaultCell of defaultCells) {
					if(defaultCell.col === topCells[topCellNum].col) {
						combineData[topCellNum - adjustment].defaultValue = defaultCell.value;
						break;
					}
				}
				break;
			}
		}

		for(const defaultCell of defaultCells) {
			if(defaultCell.col === topCells[topCellNum].col) {
				combineData[topCellNum - adjustment].defaultValue = defaultCell.value;
				break;
			}
		}
	}*/

	//This just overwrites the COLUMN label with the title of the Google Sheets
	topCells[0] = {
		name: doc.title
	};
	//console.log(combineData);
	return topCells;
}

/**
 * Retrieves a specific cell from a sheet based on sheet id, position, and sheet name.
 *
 * @param {string} formId String that is the id of the spreadsheet on Google Spreadsheets
 * @param {number} x The x position of the cell (Not zero indexed).
 * @param {number} y The y position of the cell (Not zero indexed).
 * @param {string} [sheetName] The name of the worksheet. Defaults to the main sheet.
 * @returns {Object} Returns JSON object with key value pairs of header name and whether it is a required input.
 */
async function getCell(formId, x, y, sheetName) {
	let sheet;
	try {
		sheet = await getWorksheets(formId);
	} catch(err) {
		sheetError.genericErr(err);
	}

	sheet = sheet.sheetsByTitle(sheetName) || await getMain(sheet);

	return await promisify(sheet.getCells)({
		'min-col': x,
		'max-col': x,
		'min-row': y,
		'max-row': y,
		'return-empty': true,
	});
}

/**
 * Fills a new row in the main sheet with form input after checking input. Returns 422 on failure.
 *
 * @param {Object} userInput JSON object containing user form input in key value pairs of sanitized header
 * 	names and inputted data.
 */
async function fillRow(userInput) {
	//change index number to access different sheet
	let sheet;
	try {
		sheet = await getMain(await getWorksheets(userInput["formId"]));
	} catch(err) {
		sheetError.worksheetErr(err);
	}

	const requirements = processRequirements(await getRequirements(userInput["formId"]));

	delete userInput["formId"];

	for(const dataProp in userInput) {
		if(!requirements.hasOwnProperty(dataProp) || requirements[dataProp] === "EXCLUDE") {
			delete userInput[dataProp];
		}
	}

	for(const mayRequire in requirements) {
		if(userInput[mayRequire].trim() === "" && requirements[mayRequire] === "REQUIRE") {
			return sheetError.throwErr("REQUIRED INPUT NONEXISTENT", "Required Input Missing");
		}
	}

	try {
		await sheet.addRow(userInput);
	} catch(err) {
		console.error(err);
	}

}

/**
 * Retrieves all worksheets from a specified form id.
 *
 * @param {Object} sheet A singular worksheet from any Google Sheet
 * @param {boolean} [returnEmpty = false] Determines whether to return cells containing no value.
 * @returns {Object[]} Array of all the cells in the given worksheet.
 */
async function getAllCells(sheet, returnEmpty) {
	return await promisify(sheet.getCells)({
		'min-row': 1,
		'max-row': sheet.rowCount,
		'min-col': 1,
		'max-col': sheet.colCount,
		'return-empty': Boolean(returnEmpty)
	});
}

/**
 * Returns the position of cells in a given sheet that match a given value. Not zero indexed.
 *
 * @param {Object} sheet A singular worksheet from any Google Sheet
 * @param {string} value The value to look for the position of.
 * @param {boolean} [returnMultiple = false] Determines whether to return array of multiple position
 * 	pair arrays or only one position pair array.
 * @returns {number[] | number[][]} Position of first match in column, row format (Not zero indexed) in an array.
 * 	If returnMultiple is true, multiple arrays are placed into one.
 */
async function valueLookup(sheet, value, returnMultiple) {
	returnMultiple = Boolean(returnMultiple);

	const cells = await getAllCells(sheet, false);

	let result = cells.filter(cell => cell.value === value);

	for(let matchedCell = 0; matchedCell < result.length; matchedCell++) {
		result[matchedCell] = [result[matchedCell].col, result[matchedCell].row];
	}

	if(!returnMultiple && result.length >= 1) {
		result = result[0];
	}

	return result;
}

/**
 * Returns the position of cells in a given sheet that match a given value, offset by given offsets. Not zero indexed.
 *
 * @param {Object} sheet A singular worksheet from any Google Sheet
 * @param {string} value The value to look for the position of.
 * @param {number} offsetCol Value to offset returned position columns by.
 * @param {number} offsetRow Value to offset returned position rows by.
 * @param {boolean} [returnMultiple = false] Determines whether to return array of multiple position
 * 	pair arrays or only one position pair array.
 * @returns {number[] | number[][]} Position of first match in column, row format (Not zero indexed) in an array.
 * 	If returnMultiple is true, multiple arrays are placed into one.
 */
async function offsetLookup(sheet, value, offsetCol, offsetRow, returnMultiple) {
	returnMultiple = Boolean(returnMultiple);

	const matches = await valueLookup(sheet, value, returnMultiple);

	if(!returnMultiple) {
		return [matches[0] + offsetCol, matches[1] + offsetRow];
	}

	for(const matchPair of matches) {
		matchPair[0] += offsetCol;
		matchPair[1] += offsetRow;
		if(matchPair[0] < 1 || matchPair[1] < 1) {
			sheetError.nonErr("Potential Error: This Offset Pair is invalid - " + matchPair);
		}
	}

	return matches;
}

/**
 * Returns the value of a cell position in a given sheet.
 *
 * @param {Object} sheet A singular worksheet from any Google Sheet
 * @param {number} col Column position of the cell to retrieve the value from.
 * @param {number} row Row position of the cell to retrieve the value from.
 * @returns {string} Value of the given cell.
 */
async function parseValue(sheet, col, row) {
	try {
		return (await promisify(sheet.getCells)({
			'min-col': col,
			'max-col': col,
			'min-row': row,
			'max-row': row,
			'return-empty': true,
		}))[0].value;
	} catch(err) {
		sheetError.specificErr(err, "Cell parseValue error");
	}
}

/**
 * Returns the value of a cell position in a given sheet.
 *
 * @param {Object} sheet A singular worksheet from any Google Sheet
 * @param {string} searchKey The value to look for the position of before offsetting.
 * @param {number} colOffset Value to offset returned position columns by.
 * @param {string} defaultVal Value to return in case the search key is not found.
 * @param {number} rowOffset Value to offset returned position rows by.
 * @returns {string} Value of the given cell.
 */
async function offsetParse(sheet, searchKey, colOffset, rowOffset, defaultVal = "") {
	try {
		const res = await offsetLookup(sheet, searchKey, colOffset, rowOffset, false)
		return await parseValue(sheet, res[0], res[1]);
	} catch(err) {
		sheetError.handledErr("Failed to offset and parse. Returning empty String or default value.");
		return defaultVal;
	}

}

/**
 * Returns the row position of the lowest cell with a value in it.
 * With the API updates, this is now useless but will be kept as a relic lol
 * Note: Empty checkboxes or validation are counted as nonempty and can affect the value this returns.
 *
 * @param {Object} sheet A singular worksheet from any Google Sheet
 * @returns {number} Row position of the last cell with a value in it. Not zero indexed.
 */
async function getLastRow(sheet) {
	try {
		const cells = await getAllCells(sheet, false);
		return cells[Object.keys(cells).length - 1].row;
	} catch(err) {
		sheetError.genericErr(err);
	}
}

/**
 * Returns the sheet labeled as the config from an array of worksheets.
 * @param {GoogleSpreadsheet} doc Google Spreadsheet to get Config worksheet from
 * @returns {GoogleSpreadsheetWorksheet} The config worksheet
 */
function getConfig(doc) {
	return doc.sheetsByTitle[CONFIG_SHEET_NAME];
}

/**
 * Returns the sheet labeled as the main sheet from an array of worksheets based on the config sheet.
 * @param {GoogleSpreadsheet} doc Google Spreadsheet to get Main worksheet from
 * @returns {GoogleSpreadsheetWorksheet} The main worksheet
 */
async function getMain(doc) {
	console.log("Searching for main");
	const config = getConfig(doc);
	const main = await offsetParse(config, "DATA", 1, 0, "Main");
	console.log("Main sheet is called: " + main);
	return doc.sheetsByTitle[main];
}