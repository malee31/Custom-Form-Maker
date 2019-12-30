const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const credentials = require('./SpreadsheetPlaygroundCredentials.json');
const sheetID = require('./SpreadsheetID.json');

async function testSheet()
{
	//Testing things here then splitting them off into functions
	const doc = new GoogleSpreadsheet(sheetID.id);
	await promisify(doc.useServiceAccountAuth)(credentials);
	const data = await promisify(doc.getInfo)();
	//change index number to access different sheet
	const sheet = data.worksheets[0];

	console.log(`Title: ${sheet.title}\nRows: ${sheet.rowCount}`);

	const cells = await promisify(sheet.getCells)({
		'min-row' : 1,
		'max-row' : 3,
		'min-col' : 1,
		'max-col' : 2,
		'return-empty' : true,
	});

	for(const cell of cells)
	{
		console.log(cell.value);
	}
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
testSheet().then(() => {
		console.log("testSheet() complete")
	},
	(err) => {
		console.log(`Error: ${err}`);
	}
);

testRows().then((rows) => {
		/*Code for printing a certain column out of each row*/
		rows.forEach(row => {
			/* This is for sheet 1 testing
            console.log(row.score);*/
			if(row.first === "Marvin")
			{
				console.log(`${row.first} ${row.lastname} is now ${row.first} ${row.lastname + row.lastname}`);
				row.lastname += row.lastname;
				row.save();
			}
		});
	},
	(err) => {
		console.log(`Error: ${err}`);
	}
);