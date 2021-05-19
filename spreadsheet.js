const { GoogleSpreadsheet } = require('google-spreadsheet');
const { RequirementCollection } = require("./requirement.js");
const sheetError = require('./sheetError.js');

const RESULT_SHEET_TITLE = "Form Results";
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
 * Retrieves the labels/headers at the top row of the main sheet along with their requirement status.
 * @async
 * @param {GoogleSpreadsheetWorksheet} sheet Google Spreadsheet to load cells from
 * @param {number} [minRow = 0] Zero-indexed row number minimum
 * @param {number} [minCol = 0] Zero-indexed column number minimum
 * @param {number} [maxRow = doc.rowCount] Zero-indexed row number maximum
 * @param {number} [maxCol = doc.columnCount] Zero-indexed column number maximum
 */
async function loadCells(sheet, minRow = 0, minCol = 0, maxRow, maxCol) {
	maxRow = maxRow || sheet.rowCount;
	maxCol = maxCol || sheet.columnCount;
	return await sheet.loadCells({
		"startRowIndex": Math.min(minRow, sheet.rowCount - 1),
		"startColumnIndex": Math.min(minCol, sheet.columnCount - 1),
		"endRowIndex": Math.min(maxRow, sheet.rowCount),
		"endColumnIndex": Math.min(maxCol, sheet.columnCount)
	});
}

/**
 * Retrieves the labels/headers at the top row of the main sheet along with their requirement status.
 * @async
 * @param {GoogleSpreadsheet} doc Google Spreadsheet to get requirements from
 * @param {boolean} [keepExcluded = false] Determines whether or not the returned object will include excluded headers.
 * @returns {Promise<Object>} Returns object containing metadata and an array of objects with the column name, default values, and whether or not they are required
 */
async function getRequirements(doc, keepExcluded = false) {
	const sheet = doc.sheetsByIndex[0];
	const topCells = new RequirementCollection();
	await loadCells(sheet, 0, 0, 1);
	for(let columnNum = 0; columnNum < sheet.columnCount; columnNum++) {
		const cellValue = sheet.getCell(0, columnNum).value;
		if(cellValue === null) continue;
		topCells.createRequirement(cellValue);
	}

	return {
		name: doc.title,
		headers: topCells.toRequirementArray(keepExcluded)
	};
}

/**
 *
 * @param {number} [columnCount = 1] Number of columns for the sheet
 * @param {number} [rowCount = 2] Number of rows for the sheet
 * @return {{title: string, tabColor: {red: number, green: number, blue: number}, gridProperties: {frozenRowCount: number, columnCount: number, rowCount: number}}} Some preset properties to give each result sheet
 */
function createPropertyUpdate(columnCount = 1, rowCount = 2) {
	return {
		title: RESULT_SHEET_TITLE,
		gridProperties: {
			columnCount: columnCount,
			rowCount: rowCount,
			frozenRowCount: 1
		},
		tabColor: {
			red: 0.016,
			green: 0.549,
			blue: 0.988
		}
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
		if(doc.sheetsByTitle[RESULT_SHEET_TITLE]) {
			console.log(`Updating existing result sheet to match [${sheetId}/${RESULT_SHEET_TITLE}]`);
			const sheet = doc.sheetsByTitle[RESULT_SHEET_TITLE];

			await loadCells(sheet, 0, 0, 1);
			const top = [];
			for(let columnNum = 0; columnNum < sheet.columnCount; columnNum++) {
				const cellValue = sheet.getCell(0, columnNum).value;
				if(cellValue !== null) {
					top.push(cellValue);
				}
			}
			const newHeaders = headers.filter(val => !top.includes(val));

			await sheet.updateProperties(createPropertyUpdate(sheet.columnCount + newHeaders.length, sheet.rowCount));
			await loadCells(sheet, 0, 0, 1);

			for(let adding = 1; adding <= newHeaders.length; adding++) {
				const cell = sheet.getCell(0, sheet.columnCount - adding);
				cell.value = newHeaders[newHeaders.length - adding];
			}
			await sheet.saveUpdatedCells();
		} else {
			const properties = createPropertyUpdate(headers.length);
			properties.headerValues = headers;
			await doc.addSheet(properties);
		}
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
	const resultSheet = sheets.sheetsByTitle[RESULT_SHEET_TITLE];

	// Pre-processing
	delete userInput["formId"];
	for(const dataProp in userInput) {
		// Concatenates arrays from checkboxes and HTML escapes commas in values
		if(Array.isArray(userInput[dataProp]))
			userInput[dataProp] = userInput[dataProp].map(val => val.replace(/,/g, "&comma;")).join(",");
	}
	if(!resultSheet) sheetError.throwErr("Results Sheet Missing", `The sheet titled ${RESULT_SHEET_TITLE} does not exist`);

	try {
		console.log(`Pushing onto sheet: ${JSON.stringify(userInput)}`);
		await resultSheet.addRow(userInput);
	} catch(err) {
		console.error(err);
	}
}