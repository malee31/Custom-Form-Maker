/**
 *
 * Sets a cookie with a value.
 *
 * @params {string} name The name of the cookie to be set.
 * @params {string} value The value to assign to a cookie.
 */
function setCookie(name, value)
{
	document.cookie = name + "=" + value;
}

/**
 *
 * Returns an object with every cookie in name: value format in default cookie order.
 *
 * @returns {object} returns an object containing every document.cookie in name: value format.
 */
function getCookies()
{
	var cookies = {};
	document.cookie.split("; ").forEach(cookie => {
		cookies[cookie.substring(0, cookie.indexOf("="))] = cookie.substring(cookie.indexOf("=") + 1);
	});
	return cookies;
}


/**
 *
 * Given a case-sensitive key value, this function returns the value of a cookie with the name of key.
 *
 * @params {(string|number)} key case-sensitive string containing the exact name of a cookie.
 * @returns {string} returns the value of the cookie with the name stored in the parameter key. If not found, logs a problem and returns "Error 404".
 */
function cookieValue(key)
{
	//Just in case a number was used as a key
	key = "" + key;

	for(cookie of document.cookie.split("; "))
	{
		const cookieName = cookie.substring(0, cookie.indexOf("="));
		if(cookieName === key) return cookie.substring(cookieName.length + 1);
	}

	console.log("Error 404: Cookie " + key + " not found");
	return "Error 404";
}
