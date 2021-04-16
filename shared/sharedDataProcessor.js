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
 * @property {string} multiple Assembled from InputData.allowMultiple. Used for file inputs
 */

class InputDataManager {
	/**
	 * @constructor InputDataManager
	 * @param {RawInputData|InputData|Object} [baseObject = {}] If provided, an instance will be constructed from the pre-existing properties of baseObject
	 */
	constructor(baseObject = {}) {
		this.data = {};
		this.displayName = baseObject.displayName || "";
		this.data.name = baseObject.name || "";
		this.data.type = baseObject.type || "text";
		this.updateSubtype();
		this.data.required = baseObject.required || false;
		this.data.defaultValue = baseObject.defaultValue || "";
		this.data.placeholderText = baseObject.placeholderText || "";
		this.data.choices = baseObject.choices || [];
		this.data.allowMultiple = baseObject.allowMultiple || false;
	}

	set displayName(newVal) { this.data.displayName = newVal; }
	set name(newVal) { this.data.name = newVal.toString(); }
	set type(newVal) {
		const oldType = this.data.subtype;
		this.data.type = rawTypeFilter(newVal.toString());
		this.updateSubtype();
		if(this.subtype !== oldType) console.warn(`Changing between incompatible types may cause problems\nChange detected from subtypes ${oldType} to ${this.subtype}`);
	}
	set required(newVal) { this.data.required = Boolean(newVal); }
	set defaultValue(newVal) { this.data.defaultValue = newVal.toString(); }
	set placeholderText(newVal) { this.data.placeholderText = newVal.toString(); }
	set choices(newVal) {
		if(!Array.isArray(newVal)) throw "Not an Array. Property 'choices' requires an array of InputDataChoice objects";
		// TODO: Double check contents of array and clean up their properties
		this.data.choices = newVal;
	}
	set allowMultiple(newVal) { this.data.allowMultiple = Boolean(newVal); }

	get displayName() { return this.data.displayName; }
	get name() { return this.data.name; }
	get type() { return this.data.type; }
	get required() { return this.data.required; }
	get defaultValue() { return this.data.defaultValue; }
	get placeholderText() { return this.data.placeholderText; }
	get choices() { return this.data.choices; }
	get allowMultiple() {return this.data.allowMultiple;}

	updateSubtype() {
		switch(this.type) {
			case "radio":
			case "checkbox":
				this.subtype = "select";
				break;
			case "file":
				this.subtype = "file";
				break;
			default:
				this.subtype = "text";
		}
	}

	/**
	 * Converts all the saved properties in the instance into a clean RawInputData object ready to be saved or processed further
	 * @returns {RawInputData} An input data object created using this instance's internal properties
	 */
	toCleanObject() {
		/** @type RawInputData */
		const cleanObject = {
			name: this.name,
			displayName: this.displayName,
			type: this.type,
			required: this.required
		};
		switch(this.type) {
			case "radio":
			case "checkbox":
				// TODO: Convert each choice back into objects once the class for it is written
				cleanObject.choices = this.choices;
				break;
			case "file":
				cleanObject.allowMultiple = this.allowMultiple;
				break;
			default:
				cleanObject.defaultValue = this.defaultValue;
				cleanObject.placeholderText = this.placeholderText;
		}
		return cleanObject;
	}

	/**
	 * Converts all the saved properties in the instance into a clean InputData object ready to be rendered
	 * @param {string} [uuid = ""] Unique ID to assign to the input data when rendering
	 * @return {InputData} An input data object created using this instance's internal properties with additional properties for rendering purposes
	 */
	toProcessedObject(uuid = "") {
		const processed = this.toCleanObject();
		typeFilter(processed);
		processed.uuid = uuid;
		processed.attributes = {};
		processed.attributes.required = this.required ? "required" : "";
		switch(this.subtype) {
			case "select":
				break;
			case "file":
				processed.attributes.multiple = this.allowMultiple ? "multiple" : "";
				break;
			case "text":
			default:
				processed.attributes.value = attributePair("value", processed.defaultValue);
				processed.attributes.placeholder = attributePair("placeholder", processed.placeholderText);
		}
		return processed;
	}
}

if(typeof module !== "undefined") module.exports = {
	cleanData,
	cleanDataBare,
	typeFilter,
	InputDataManager
};

const typePathMap = {
	"text": "/partials/formComponents/textInput",
	"password": "/partials/formComponents/passwordInput",
	"color": "/partials/formComponents/colorInput",
	"radio": "/partials/formComponents/radioInput",
	"checkbox": "/partials/formComponents/checkboxInput",
	"datetime-local": "/partials/formComponents/dateTimeInput",
	"date": "/partials/formComponents/dateInput",
	"month": "/partials/formComponents/monthInput",
	"week": "/partials/formComponents/weekInput",
	"email": "/partials/formComponents/emailInput",
	"tel": "/partials/formComponents/telInput",
	"url": "/partials/formComponents/urlInput",
	"time": "/partials/formComponents/timeInput",
	"number": "/partials/formComponents/numberInput",
	"range": "/partials/formComponents/rangeInput",
	"file": "/partials/formComponents/fileInput"
};

/**
 * Coerces input type strings into the set of available types and sets the path of partial as well.
 * Affects InputData.type and InputData.path
 * @param {RawInputData|InputData|{type: string}} [inputData] Object to filter types and component path of
 * @param {RawInputData|InputData} [assignTo = inputData] Object to assign the selected types and paths to. Defaults to inputData
 * @returns {RawInputData|InputData|{type: string, path: string}} Returns assignTo parameter value after mutating
 */
function typeFilter(inputData, assignTo = inputData) {
	assignTo.type = rawTypeFilter(inputData.type);
	assignTo.path = typePathMap[assignTo.type];
	return assignTo;
}

/**
 * Coerces input data type strings into the set of available types. Honestly overkill
 * @param {string|*} [typeString=  ""] Type string to coerce into a defined type. If a nonstring is passed as an argument, its toString() method will be called
 * @returns {string} A valid input type to render
 */
function rawTypeFilter(typeString = "") {
	typeString = typeString.toString().toLowerCase().replace(/[^a-z]/g, "");
	switch(typeString) {
		case "password":
			return "password";
		case "color":
			return "color";
		case "radio":
		case "choice":
		case "multiplechoice":
			return "radio";
		case "check":
		case "checkbox":
			return "checkbox";
		case "datetime":
		case "datetimelocal":
			return "datetime-local";
		case "date":
		case "calendar":
			return "date";
		case "month":
			return "month";
		case "week":
			return "week";
		case "email":
			return "email";
		case "telephone":
		case "phone":
		case "tel":
			return "tel";
		case "website":
		case "site":
		case "link":
		case "url":
			return "url";
		case "time":
			return "time";
		case "num":
		case "number":
		case "int":
		case "integer":
			return "number";
		case "range":
		case "slider":
			return "range";
		case "file":
		case "upload":
			return "file";
		case "text":
		default:
			return "text";
	}
}

/**
 * Escapes text for use in HTML. Does not escape quotes.
 * @param {string} [text = ""] Text to escape
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
 * @param {string} [text = ""] Text to escape
 * @param {boolean} [isDouble = false] If true, escapes double quote. Else, escapes single quotes
 * @returns {string} Escaped text
 */
function quoteEscape(text = "", isDouble = false) {
	if(isDouble) return text.replace(/"/g, "&quot;");
	return text.replace(/'/g, "&#39;");
}

/**
 * Cleans up raw input data and sets defaults for their properties
 * @param {RawInputData} inputData Data to be cleaned up and assigned an id and other information
 * @param {string} [uuid = ""] Unique ID to assign to data
 * @param {boolean} [keepDerived = true] Whether to include data that can be regenerated at runtime. Set to false to optimize data size
 * @returns {InputData} The resulting data
 */
function cleanData(inputData, uuid = "", keepDerived = true) {
	if(typeof inputData !== "object") {
		console.warn(inputData);
		throw "Input data is not an object";
	}
	return new InputDataManager(inputData).toProcessedObject(uuid);
}

/**
 * Cleans up raw input data and sets defaults for their properties
 * @param {RawInputData} inputData Data to be cleaned up and assigned an id and other information
 * @returns {RawInputData} The resulting data (cleaned)
 */
function cleanDataBare(inputData) {
	if(typeof inputData !== "object") {
		console.warn(inputData);
		throw "Input data is not an object";
	}
	return new InputDataManager(inputData).toCleanObject();
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