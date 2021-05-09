const { GoogleSpreadsheet } = require('google-spreadsheet');
const { RequirementCollection } = require("./requirement.js");
const sheetError = require('./sheetError.js');

const credentials = !Boolean(process.env.VARIABLE_MODE)
	?
	require("./private/credentials.json")
	:
	{
		"type": process.env.type,
		"project_id": process.env.project_id,
		"private_key_id": process.env.private_key_id,
		"private_key": process.env.private_key,
		"client_email": process.env.client_email,
		"client_id": process.env.client_id,
		"auth_uri": process.env.auth_uri,
		"token_uri": process.env.token_uri,
		"auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
		"client_x509_cert_url": process.env.client_x509_cert_url
	};

const CONFIG_SHEET_NAME = ".config";
const RESULT_SHEET_TITLE = "Form Results";

/**
 * Handles wrangling with Google Spreadsheet API functions
 * @module spreadsheet
 */
module.exports = {
	newRow: fillRow,
	getHeaders: getSheetHeaders,
	createResultSheet: makeResultSheet
}

/**
 * Initializes a GoogleSpreadsheet object from a specified id and loads their worksheets.
 * @async
 * @param {string} formId Id of the target Google Spreadsheet meant for inputted data.
 * @returns {Promise<GoogleSpreadsheet>} Google Spreadsheet object with all worksheets loaded in
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
 * @returns {Promise<Object[]>} Returns Array of JSON objects containing the header names and whether they are required inputs along with their default values
 */
async function getSheetHeaders(id) {
	const doc = await getWorksheets(id);
	return getRequirements(doc);
}

/**
 * Returns the sheet labeled as the main sheet from an array of worksheets based on the config sheet.
 * @async
 * @param {GoogleSpreadsheet} doc Google Spreadsheet to get Main worksheet from
 * @param {boolean} [defaultToFirst = true] Whether to default to the first sheet if a main sheet is not found
 * @returns {GoogleSpreadsheetWorksheet} The main worksheet
 */
async function getMain(doc, defaultToFirst = true) {
	// console.log("Searching for main");
	const config = getConfig(doc);
	const main = await offsetParse(config, "DATA", 1, 0, "Main");
	// console.log("Main sheet is called: " + main);
	return doc.sheetsByTitle[main] || (defaultToFirst ? doc.sheetsByIndex[0] : undefined);
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
 * Retrieves the labels/headers at the top row of the main sheet along with their requirement status.
 * @async
 * @param {GoogleSpreadsheet} doc Google Spreadsheet to get requirements from
 * @param {boolean} [keepExcluded = false] Determines whether or not the returned object will include excluded headers.
 * @returns {Promise<Object>} Returns object containing metadata and an array of objects with the column name, default values, and whether or not they are required
 */
async function getRequirements(doc, keepExcluded = false) {
	const config = getConfig(doc) || getMain(doc);
	await loadCells(config, 0, 0, 3, config.columnCount);

	const topCells = new RequirementCollection();
	for(let columnNum = 1; columnNum < config.columnCount; columnNum++) {
		const cellValue = config.getCell(0, columnNum).value;
		if(cellValue === null) break;
		topCells.createRequirement(cellValue, config.getCell(1, columnNum).value, config.getCell(2, columnNum).value, config.getCell(1, columnNum).value);
	}

	return {
		name: doc.title,
		headers: topCells.toRequirementArray(keepExcluded)
	};
}

/**
 * Creates a sheet to add results onto
 * @param {string} sheetId Sheet ID of the spreadsheet to add a results sheet onto
 * @param {string[]} headers Headers for the sheet. Array of the column titles
 * @return {Promise<{success: boolean, statusText: string}>} Promise that returns whether the sheet was successfully created and a note if not
 */
async function makeResultSheet(sheetId, headers) {
	try {
		const doc = await getWorksheets(sheetId);
		if(doc.sheetsByTitle[RESULT_SHEET_TITLE]) await doc.deleteSheet(doc.sheetsByTitle[RESULT_SHEET_TITLE].sheetId);
		await doc.addSheet({
			title: RESULT_SHEET_TITLE,
			headerValues: headers,
			tabColor: {
				red: 0.016,
				green: 0.549,
				blue: 0.988,
				alpha: 1
			}
		});
		return {success: true, statusText: "Successfully created result sheet"};
	} catch (e) {
		return {success: false, statusText: `Code ${e.code}: ${e.message}`};
	}
}

/**
 * Fills a new row in the main sheet with form input after validating input. Rejects on fail.
 * @async
 * @param {Object} userInput JSON object containing user form input in key value pairs of sanitized header
 * 	names and inputted data.
 * @param {boolean} [legacyMode = false] Whether to run checks based on the old method of doing things through config sheets
 */
async function fillRow(userInput, legacyMode = false) {
	const sheets = await getWorksheets(userInput["formId"]);
	let resultSheet;

	// Pre-processing
	delete userInput["formId"];
	for(const dataProp in userInput) {
		// Concatenates arrays from checkboxes and HTML escapes commas in values
		if(Array.isArray(userInput[dataProp]))
			userInput[dataProp] = userInput[dataProp].map(val => val.replace(/,/g, "&comma;")).join(",");
	}

	if(legacyMode) {
		resultSheet = await getMain(sheets);
		const requirements = (await getRequirements(sheets)).headers;
		for(const dataProp in userInput) {
			if(!requirements.find(req => req.name === dataProp)) {
				console.log(`Deleted ${dataProp}: ${userInput[dataProp]}`);
				delete userInput[dataProp];
			}
		}

		// Checks to make sure that all required inputs have values
		if(!requirements.every(req => !req.required || userInput[req.name]))
			return sheetError.throwErr("REQUIRED INPUT NONEXISTENT", `Required Inputs Missing: \nUser Input: ${JSON.stringify(userInput)} \nRequired Inputs: ${JSON.stringify(requirements)}`);
	} else {
		resultSheet = sheets.sheetsByTitle[RESULT_SHEET_TITLE];
		if(!resultSheet) sheetError.throwErr("Results Sheet Missing", `The sheet titled ${RESULT_SHEET_TITLE} does not exist`);
	}

	try {
		console.log(`Pushing onto sheet: ${JSON.stringify(userInput)}`);
		await resultSheet.addRow(userInput);
	} catch(err) {
		console.error(err);
	}
}

/**
 * Retrieves the labels/headers at the top row of the main sheet along with their requirement status.
 * @async
 * @param {GoogleSpreadsheetWorksheet} doc Google Spreadsheet to load cells from
 * @param {number} [minRow = 0] Zero-indexed row number minimum
 * @param {number} [minCol = 0] Zero-indexed column number minimum
 * @param {number} [maxRow = doc.rowCount] Zero-indexed row number maximum
 * @param {number} [maxCol = doc.columnCount] Zero-indexed column number maximum
 */
async function loadCells(doc, minRow = 0, minCol = 0, maxRow, maxCol) {
	maxRow = maxRow || doc.rowCount;
	maxCol = maxCol || doc.columnCount;
	return await doc.loadCells({
		"startRowIndex": Math.min(minRow, doc.rowCount - 1),
		"startColumnIndex": Math.min(minCol, doc.columnCount - 1),
		"endRowIndex": Math.min(maxRow, doc.rowCount),
		"endColumnIndex": Math.min(maxCol, doc.columnCount)
	});
}

/**
 * Returns the position of cells in a given sheet that match a given value.
 * @async
 * @param {GoogleSpreadsheetWorksheet} sheet A singular worksheet from any Google Sheet
 * @param {string} value The value to look for the positions of.
 * @returns {number[][]} Position of first match in [row, column] format (Zero-indexed) in an array.
 */
async function valueLookup(sheet, value) {
	await loadCells(sheet);

	const result = [];
	for(let rowNum = 0; rowNum < sheet.rowCount; rowNum++) {
		for(let colNum = 0; colNum < sheet.columnCount; colNum++) {
			const cell = sheet.getCell(rowNum, colNum);
			if(cell.value === value) {
				result.push([rowNum, colNum]);
			}
		}
	}
	return result;
}

/**
 * Returns the position of cells in a given sheet that match a given value, offset by given offsets. Not zero indexed.
 * @async
 * @param {GoogleSpreadsheetWorksheet} sheet A singular worksheet from any Google Sheet
 * @param {string} value The value to look for the position of.
 * @param {number} offsetCol Value to offset returned position columns by.
 * @param {number} offsetRow Value to offset returned position rows by.
 * @returns {number[][]} Array of offset matches in [row, column] format (Zero-indexed).
 */
async function offsetLookup(sheet, value, offsetCol, offsetRow) {
	const matches = await valueLookup(sheet, value);
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
 * @async
 * @param {GoogleSpreadsheetWorksheet} sheet A singular worksheet from any Google Sheet
 * @param {number} col Column position of the cell to retrieve the value from.
 * @param {number} row Row position of the cell to retrieve the value from.
 * @returns {string} Value of the given cell.
 */
async function parseValue(sheet, col, row) {
	try {
		await loadCells(sheet, row, col, row + 1, col + 1);
		return sheet.getCell(row, col);
	} catch(err) {
		sheetError.specificErr(err, "Cell parseValue error");
	}
}

/**
 * Returns the value of a cell position in a given sheet.
 * @async
 * @param {GoogleSpreadsheetWorksheet} sheet A singular worksheet from any Google Sheet
 * @param {string} searchKey The value to look for the position of before offsetting.
 * @param {number} colOffset Value to offset returned position columns by.
 * @param {number} rowOffset Value to offset returned position rows by.
 * @param {string} [defaultVal = ""] Value to return in case the search key is not found.
 * @returns {string} Value of the given cell.
 */
async function offsetParse(sheet, searchKey, colOffset, rowOffset, defaultVal = "") {
	try {
		const res = (await offsetLookup(sheet, searchKey, colOffset, rowOffset))[0];
		return await parseValue(sheet, res[0], res[1]);
	} catch(err) {
		sheetError.handledErr("Failed to offset and parse. Returning empty String or default value.");
		return defaultVal;
	}
}