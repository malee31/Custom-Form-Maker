/**
 * Formats the name of the headers into object keys used by the google-sheets api.
 *
 * @params {string} header Singular unformatted string which is the name of a column in the default data sheet.
 * @returns {string} Formatted string without whitespace, capitalization, leading numbers, or underscores.
 */
function sheetFormatHeaders(header)
{
	var formatted = header.toLowerCase().replace(/\s/g, "").replace(/\W/g, "").replace(/_/g, "");
	//removes all leading numbers in the header
	for(var i= 0; i < header.length; i++)
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
	return formatted;
}

/**
 *
 * Uses JSON received from a request to find the sheet with sheet id to load inputs in the main form.
 *
 * @params {string} ids Stringified JSON containing the unformatted column names for the sheet requested as their values in order.
 */
function loadInputs(ids)
{
	const inputIds = JSON.parse(ids);

	const mainForm = document.getElementsByName("mainForm")[0];

	const submitButton = document.getElementsByName("mainSubmit")[0]
	submitButton.removeAttribute("hidden");

	for(const name in inputIds)
	{
		mainForm.insertBefore(generateInput(name, inputIds[name]), submitButton);
	}

	//console.log(inputIds);

	idPrompt = document.getElementById("getId");
	idPrompt.parentNode.removeChild(idPrompt);
}

/**
 *
 * Given a column name, a new input is created with a formatted key and label using the column name the input corresponds to.
 *
 * @params {string} columnName Name of a column in the requested sheet.
 * @returns {object} formInput Contains an html input tag with proper attributes
 */
function generateInput(columnName, required)
{
	const formInput = document.createElement("INPUT");
	formInput.setAttribute("name", sheetFormatHeaders(columnName));
	formInput.setAttribute("placeholder", columnName);
	formInput.setAttribute("type", "text");
	if(required) formInput.setAttribute("required", "");
	return formInput;
}
