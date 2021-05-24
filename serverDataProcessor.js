const { v4: uuidv4 } = require("uuid");
const sharedDataProcessor = require("./shared/sharedDataProcessor.js");

module.exports = {
	cleanData,
	typeFilter: sharedDataProcessor.typeFilter
};

/**
 * Cleans up raw input data and sets defaults for their properties. Wrapper for sharedDataProcessor.cleanData that creates a uuid with the uuid library
 * @param {RawInputData} inputData Data to be cleaned up and assigned an id and other information
 * @returns {InputData} The resulting data
 */
function cleanData(inputData) {
	return sharedDataProcessor.cleanData(inputData, uuidv4());
}