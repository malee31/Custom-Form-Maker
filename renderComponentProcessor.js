const {v4: uuidv4} = require("uuid");

module.exports = cleanData;

/**
 * @typedef InputComponent
 * @property {string} path Form input component path relative to the EJS root folder (views/)
 * @property {InputData} data Data to pass onto
 */

/**
 * @typedef RawInputData
 * @property {string} [displayName] Text for input field label. Defaults to name property value
 * @property {string} name Submission data name for input field. Used for column headers
 * @property {string} type Type of input the data is for
 * @property {boolean} [required] Whether this input field is a required input
 * @property {string} [defaultValue] Default value to set for the input field
 * @property {string} [placeholderText] Placeholder text for the input field
 * @property {InputDataChoice[]} [choices] Options for input types that use them such as checkboxes and radio buttons
 */

/**
 * @typedef InputData
 * @property {string} displayName Text for input field label. Defaults to name property value
 * @property {string} name Submission data name for input field. Used for column headers
 * @property {string} uuid Unique ID for each input. Use for ids and unique labels
 * @property {string} type Type of input the data is for
 * @property {string} path Form input component path relative to the EJS root folder (views/)
 * @property {boolean} required Whether this input field is a required input. Defaults to false
 * @property {string} defaultValue Default value to set for the input field. Defaults to empty string
 * @property {string} placeholderText Placeholder text for the input field. Defaults to empty string
 * @property {InputDataChoice[]} [choices] Options for input types that use them such as checkboxes and radio buttons
 * @property {Attributes} attributes Assembled attribute strings to be inserted directly into HTML in EJS. Values are escaped and attributes are automatically omitted if unnecessary
 */

/**
 * @typedef InputDataChoice
 * @property {string} value Value of the choice
 * @property {boolean} checked Whether the choice is selected by default
 */

/**
 * @typedef Attributes
 * @property {string} value Assembled from InputData.defaultValue
 * @property {string} placeholder Assembled from InputData.placeholderValue
 * @property {string} required Assembled from InputData.required
 */

/**
 * Coerces input type strings into the set of available types and sets the path of partial as well.
 * Affects InputData.type and InputData.path
 * @param {RawInputData|InputData} [inputData] Object to filter types and component path of
 * @param {RawInputData|InputData} [assignTo = inputData] Object to assign the selected types and paths to. Defaults to inputData
 */
function typeFilter(inputData, assignTo) {
	if(typeof assignTo !== "object") assignTo = inputData;
	switch(inputData.type?.toLowerCase().replace(/[\W]|_/g, "")) {
		case "password":
			assignTo.type = "password";
			assignTo.path = "/partials/formComponents/passwordInput";
			break;
		case "color":
			assignTo.type = "color";
			assignTo.path = "/partials/formComponents/colorInput";
			break;
		case "radio":
		case "choice":
		case "multiplechoice":
			assignTo.type = "radio";
			assignTo.path = "/partials/formComponents/radioInput";
			break;
		case "checkbox":
			assignTo.type = "checkbox";
			assignTo.path = "/partials/formComponents/checkboxInput";
			break;
		case "datetime":
		case "datetimelocal":
			assignTo.type = "datetime-local";
			assignTo.path = "/partials/formComponents/dateTimeInput";
			break;
		case "date":
		case "calendar":
			assignTo.type = "date";
			assignTo.path = "/partials/formComponents/dateInput";
			break;
		case "month":
			assignTo.type = "month";
			assignTo.path = "/partials/formComponents/monthInput";
			break;
		case "week":
			assignTo.type = "week";
			assignTo.path = "/partials/formComponents/weekInput";
			break;
		case "email":
			assignTo.type = "email";
			assignTo.path = "/partials/formComponents/emailInput";
			break;
		case "telephone":
		case "phone":
		case "tel":
			assignTo.type = "tel";
			assignTo.path = "/partials/formComponents/telInput";
			break;
		case "website":
		case "site":
		case "link":
		case "url":
			assignTo.type = "url";
			assignTo.path = "/partials/formComponents/urlInput";
			break;
		case "time":
			assignTo.type = "time";
			assignTo.path = "/partials/formComponents/timeInput";
			break;
		case "num":
		case "number":
		case "int":
		case "integer":
			assignTo.type = "number";
			assignTo.path = "/partials/formComponents/numberInput";
			break;
		case "range":
			assignTo.type = "range";
			assignTo.path = "/partials/formComponents/rangeInput";
			break;
		// case "file":
		// 	assignTo.type = "file";
		// 	assignTo.path = "/partials/formComponents/fileInput";
		// 	break;
		case "text":
		default:
			assignTo.type = "text";
			assignTo.path = "/partials/formComponents/textInput";
	}
}

/**
 * Escapes text for use in HTML. Does not escape quotes.
 * @param {string} [text=""] Text to escape
 * @returns {string} Escaped text
 */
function HTMLEscape(text = "") {
	return text
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/&/g, "&amp;");
}

/**
 * HTML escapes quotes
 * @param {string} [text=""] Text to escape
 * @param {boolean} [isDouble = false] If true, escapes double quote. Else, escapes single quotes
 * @returns {string} Escaped text
 */
function quoteEscape(text = "", isDouble = false) {
	if(isDouble) return text.replace(/"/g, "&quot;");
	return text.replace(/'/g, "&#39;");
}

const copyProps = ["name", "required", "defaultValue", "placeholderText", "choices"];

/**
 * Cleans up raw input data and sets defaults for their properties
 * @param {RawInputData} inputData Data to be cleaned up and assigned an id and other information
 * @returns {InputData} The resulting data
 */
function cleanData(inputData) {
	if(typeof inputData !== "object") {
		console.warn(inputData);
		throw "Input data is not an object";
	}

	const cleanData = {};
	for(const prop of copyProps) {
		cleanData[prop] = inputData[prop] || "";
	}
	typeFilter(inputData, cleanData);
	cleanData.displayName = inputData.displayName || inputData.name || "";
	cleanData.uuid = uuidv4();
	cleanData.required = Boolean(inputData.required);
	if(inputData.choices) cleanData.choices = inputData.choices;
	cleanData.attributes = attributeAssembly(inputData);
	return cleanData;
}

/**
 * Cleans up raw input data and sets defaults for their properties
 * @param {InputData} inputData Data to be cleaned up and assigned an id and other information
 * @returns {Attributes} All the pre-escaped assembled attributes ready to be inserted into HTML
 */
function attributeAssembly(inputData) {
	const attributes = {};
	attributes.value = attributePair("value", inputData.defaultValue);
	attributes.placeholder = attributePair("placeholder", inputData.placeholderText);
	attributes.required = inputData.required ? "required" : "";
	console.log(attributes);
	return attributes;
}

/**
 * Assembles a single attribute pair. Returns empty string if no value is given
 * @param {string} field Attribute name
 * @param {string} value Attribute value. Will be escaped
 * @returns {string} Attribute pair result
 */
function attributePair(field, value) {
	return value ? `${field}="${quoteEscape(HTMLEscape(value))}"` : "";
}