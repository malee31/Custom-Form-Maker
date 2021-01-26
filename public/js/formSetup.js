/**
 * Formats the name of the headers into object keys used by the google-sheets api.
 * @param {string} header Unformatted header name from the default data sheet.
 * @returns {string} Formatted string without whitespace, capitalization, leading numbers, or underscores.
 */
function sheetFormatHeaders(header) {
	return header.replace(/[\W_\s]/g, "").replace(/^\d+/, "").toLowerCase();
}

/**
 * Uses JSON received from a request to find the sheet with sheet id to load inputs in the main form.
 * @param {Object[]} ids Array of Objects containing the unformatted column names in order.
 */
function loadInputs(ids) {
	const mainForm = document.getElementsByName("mainForm")[0];
	mainForm.style.display = "flex";

	document.getElementById("fileTitle").innerText = ids.shift().name;

	for(const inputField of ids) {
		mainForm.insertBefore(generateInput(inputField.name, inputField.required, inputField.defaultValue), mainForm.lastChild);
	}

	let idPrompt = document.getElementById("getId");
	idPrompt.parentNode.removeChild(idPrompt);
}

/**
 * Given a column name, a new input is created with a formatted key and label using the column name the input corresponds to.
 * @param {string} columnName Name of a column in the requested sheet.
 * @param {boolean} [required = false] Whether the field is required to be filled out in order to submit
 * @param {string} [defaultValue] Text to autofill the field with when generating form
 * @returns {HTMLElement} formInput Contains an html input tag with proper attributes
 */
function generateInput(columnName, required = false, defaultValue) {
	const formInput = document.createElement("INPUT");
	formInput.setAttribute("name", sheetFormatHeaders(columnName));
	formInput.setAttribute("placeholder", columnName);
	formInput.setAttribute("type", "text");
	if(defaultValue) formInput.value = defaultValue;
	if(required) formInput.setAttribute("required", "");
	return formInput;
}