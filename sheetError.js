module.exports = {
	sheetIdErr: sheetIdError,
	worksheetErr: worksheetError,
	genericErr: genericError,
	specificErr: specificError,
	unexpectedErr: unexpectedError,
	handledErr: handledError,
	nonErr: nonErrorError,
	throwErr: throwError
}

function sheetIdError(err, optionalText)
{
	errorLog(`Invalid Sheet ID${optionalErrDetail(optionalText)}:`, err);
}

function worksheetError(err, optionalText)
{
	errorLog(`Invalid Worksheet${optionalErrDetail(optionalText)}`, err);
}

function genericError(err, optionalText)
{
	errorLog(`Generic Error${optionalErrDetail(optionalText)}`, err, "\nGet more specific with error handling to debug.");
}

function specificError(err, errorMessage)
{
	errorLog(`Definite <${optionalErrDetail(errorMessage)}>`, err);
}

function unexpectedError(err, optionalText)
{
	errorLog(`Unexpected Error in Bagging Area${optionalErrDetail(optionalText)}`, err);
}

function optionalErrDetail(detail)
{
	return (detail ? detail : "");
}

function handledError(handledText)
{
	console.log(handledText);
}

function nonErrorError(errText)
{
	console.log(errText);
}

function throwError(errText, optionalText)
{
	if(optionalText) console.log(optionalText);
	throw errText;
}

function errorLog(name, text, detail)
{
	console.log("\x1b[31m%s:\x1b[0m %s \x1b[32m%s\x1b[0m", name, text, optionalErrDetail(detail))
}
