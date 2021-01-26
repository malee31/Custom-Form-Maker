/**
 * Sets a cookie with a value.
 * @param {string} name The name of the cookie to be set.
 * @param {string} value The value to assign to a cookie.
 */
function setCookie(name, value) {
	document.cookie = name + "=" + value;
}

/**
 * Returns an object with every cookie in name: value format in default cookie order.
 * @returns {object} returns an object containing every document.cookie in name: value format.
 */
function getCookies() {
	const cookies = {};
	document.cookie.split(/;\s?/).forEach(cookie => {
		cookie = cookie.split('=');
		cookies[cookie[0]] = cookie[1];
	});
	return cookies;
}

/**
 * Given a case-sensitive key value, this function returns the value of a cookie with the name of key.
 * @param {(string|number)} key case-sensitive string containing the exact name of a cookie. Numbers will be converted to strings
 * @returns {string} returns the value of the cookie with the name stored in the parameter key. If not found, logs a problem and returns "Error 404".
 */
function cookieValue(key) {
	let value = getCookies()[key.toString()];
	if(!value) return value;

	console.log("Error 404: Cookie " + key + " not found");
	return "Error 404";
}