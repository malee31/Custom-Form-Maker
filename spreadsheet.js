const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');

const credentials = require('./private/SpreadsheetPlaygroundCredentials.json');
const sheetID = require('./private/SpreadsheetID.json');

module.exports = {
	testPost: function () {
		console.log("yay");
	},
	pasteName: testSheet,
	newRow: testNewRow
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

	getCell(1, 1).then(
		(val) => {val[0].value = "FirstOrNot"; val[0].save();},
		(err) => {console.log(err);}
	);
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

testRows().then((rows) => {
		/*Code for printing a certain column out of each row*/
		rows.forEach(row => {
			/* This is for sheet 1 testing
            console.log(row.score);*/
			// if(row.first === "Marvin")
			// {
			// 	console.log(`${row.first} ${row.lastname} is now ${row.first} ${row.lastname + row.lastname}`);
			// 	row.lastname += row.lastname;
			// 	row.save();
			// }
		});
	},
	(err) => {
		console.log(`Error: ${err}`);
	}
);

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
