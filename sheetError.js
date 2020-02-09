module.exports = {
	sheetIdErr: sheetIdError,
	worksheetErr: worksheetError,
	genericErr: genericError,
	specificErr: specificError,
	unexpectedErr: unexpectedError
}

function sheetIdError(err, optionalText)
{
	console.log(`Invalid Sheet ID${optionalErrDetail(optionalText)}: ${err}`);
}

function worksheetError(err, optionalText)
{
	console.log(`Invalid Worksheet${optionalErrDetail(optionalText)}: ${err}`);
}

function genericError(err, optionalText)
{
	console.log(`Generic Error${optionalErrDetail(optionalText)}: ${err}\nGet more specific with error handling to debug.`);
}

function specificError(err, errorMessage)
{
	console.log(`Definite <${optionalErrDetail(errorMessage)}>: ${error}`);
}

function unexpectedError(err, optionalText)
{
	console.log(`Unexpected Error in Bagging Area${optionalErrDetail(optionalText)}: ${error}`);
}

function optionalErrDetail(detail)
{
	return (detail ? ` (${detail})` : "");
}
