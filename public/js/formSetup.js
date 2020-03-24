/**
 * Formats the name of the headers into object keys used by the google-sheets api.
 *
 * @param {string} header Singular unformatted string which is the name of a column in the default data sheet.
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
 * @param {string} ids Stringified JSON containing the unformatted column names for the sheet requested as their values in order.
 */
function loadInputs(ids)
{
	//console.log(ids);

	const mainForm = document.getElementsByName("mainForm")[0];
	mainForm.style.display = "flex";

	const submitButton = mainForm.lastChild;

	document.getElementById("fileTitle").innerText = ids.shift().name;

	for(const inputField of ids)
	{
		//console.log(inputField);
		mainForm.insertBefore(generateInput(inputField.name, inputField.required, inputField.defaultValue), submitButton);
	}

	//console.log(ids);

	idPrompt = document.getElementById("getId");
	idPrompt.parentNode.removeChild(idPrompt);
}

/**
 *
 * Given a column name, a new input is created with a formatted key and label using the column name the input corresponds to.
 *
 * @param {string} columnName Name of a column in the requested sheet.
 * @returns {object} formInput Contains an html input tag with proper attributes
 */
function generateInput(columnName, required, defaultValue)
{
	const formInput = document.createElement("INPUT");
	formInput.setAttribute("name", sheetFormatHeaders(columnName));
	formInput.setAttribute("placeholder", columnName);
	formInput.setAttribute("type", "text");
	if(defaultValue != "") formInput.value = defaultValue;
	if(required == "REQUIRE") formInput.setAttribute("required", "");
	return formInput;
}
