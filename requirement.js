const excludeStrings = ["EXCLUDE", "EXCLUDED", "OMIT", "OMITTED", "REMOVE", "REMOVED"];
const requiredStrings = ["REQUIRE", "REQUIRED", "YES", "TRUE", "Y", "T", "ON"];

/**
 * @typedef RequirementObject
 * @property {string} name Name of input
 * @property {string} [displayName] Name for label of input. Defaults to name property
 * @property {string} defaultValue Default value for input. Defaults to empty string
 * @property {boolean} required Whether or not the input is required
 * @property {boolean} excluded Whether or not the input should be excluded from the form
 */

class Requirement {
	/**
	 * Creates a requirement object
	 * @class Requirement
	 * @memberOf module:requirement
	 * @param {string} [name = ""] Name of column
	 * @param {boolean|number|string} [required = false] Whether the input is a required question. Non-booleans will be coerced into booleans (All numbers are true except 0 and strings will be matched to specific values)
	 * @param {boolean|number|string} [excluded = false] Whether the input should be excluded from the form. Non-booleans will be coerced into booleans (All numbers are true except 0 and strings will be matched to specific values)
	 * @param {string} [defaultValue = ""] Default value for the input
	 */
	constructor(name = "", required = false, defaultValue = "", excluded = false) {
		this.setRequired(required);
		this.setDefaultValue(defaultValue);
		this.setName(name);
		this.setExcluded(excluded);
	}

	/**
	 * Sets required state
	 * @param {boolean|number|string} [required = false] Whether the input is a required question. Non-booleans will be coerced into booleans (All numbers are true except 0 and strings will be matched to specific values)
	 * @returns {boolean} Returns the requirement state set
	 */
	setRequired(required) {
		this.required = Boolean(required);
		if(typeof required === "string") {
			this.required = requiredStrings.includes(required.trim().toUpperCase());
		}
		return this.required;
	}

	/**
	 * Sets excluded state
	 * @param {boolean|number|string} [excluded = false] Whether the input should be excluded from the form. Non-booleans will be coerced into booleans (All numbers are true except 0 and strings will be matched to specific values)
	 * @returns {boolean} Returns the excluded state set
	 */
	setExcluded(excluded) {
		this.excluded = Boolean(excluded);
		if(typeof excluded === "string") {
			this.excluded = excludeStrings.includes(excluded.trim().toUpperCase());
		}
		return this.excluded;
	}

	/**
	 * Sets the default value
	 * @param {string} [defaultValue = ""] The default value to set
	 * @param {boolean} [ignoreEmpty = false] If true, attempting to set the value to an empty string will be ignored
	 * @returns {string} Returns the default value set
	 */
	setDefaultValue(defaultValue="", ignoreEmpty=false) {
		if(!ignoreEmpty || defaultValue) this.defaultValue = defaultValue;
		return this.defaultValue;
	}

	/**
	 * Sets the name of the input
	 * @param {string} [name = ""] The default value to set
	 * @param {boolean} [ignoreEmpty = false] If true, attempting to set the value to an empty string will be ignored
	 * @returns {string} Returns the name set
	 */
	setName(name="", ignoreEmpty=false) {
		if(!ignoreEmpty || name) {
			if(!this.displayName || this.name === this.displayName) this.displayName = name;
			this.name = name;
		}
		return this.name;
	}

	/**
	 * Returns the requirement instance as a normal object
	 * @returns {RequirementObject} The instance as an object
	 */
	toObject() {
		return {
			name: this.name,
			displayName: this.displayName,
			defaultValue: this.defaultValue,
			required: this.required,
			excluded: this.excluded
		};
	}
}

class RequirementCollection {
	/**
	 * Initiates a collection for Requirement objects
	 * @class RequirementCollection
	 * @memberOf module:requirement
	 */
	constructor() {
		this.requirements = [];
	}

	/**
	 * Adds a pre-initiated Requirement object to the collection
	 * @param {Requirement} requirement Requirement object to add to collection
	 */
	addRequirement(requirement) {
		this.requirements.push(requirement);
	}

	/**
	 * Creates a new Requirement object and adds it to the collection
	 * @param {string} [name = ""] Name of column
	 * @param {boolean|number|string} [required = false] Whether the input is a required question. Non-booleans will be coerced into booleans (All numbers are true except 0 and strings will be matched to specific values)
	 * @param {boolean|number|string} [excluded = false] Whether the input should be excluded from the form. Non-booleans will be coerced into booleans (All numbers are true except 0 and strings will be matched to specific values)
	 * @param {string} [defaultValue = ""] Default value for the input
	 * @returns {Requirement} The newly initiated requirement object that has been added to the collection
	 */
	createRequirement(name = "", required = false, defaultValue = "", excluded = false) {
		let requirement = new Requirement(name, required, defaultValue, excluded);
		this.addRequirement(requirement);
		return requirement;
	}

	/**
	 * Converts all Requirement objects to RequirementObject objects in an array. JSON-able
	 * @param {boolean} [includeExcluded = false] Whether or not to filter out excluded inputs when converting
	 * @returns {RequirementObject[]} Array of normal objects with all the properties of the requirements in the collection
	 */
	toRequirementArray(includeExcluded = false) {
		const requirements = this.requirements.map(requirement => requirement.toObject());
		return (includeExcluded ? requirements : requirements.filter(requirement => !requirement.excluded));
	}
}

/**
 * Contains all the classes for managing requirements
 * @module requirement
 */
module.exports = {
	Requirement: Requirement,
	RequirementCollection: RequirementCollection
};