const errBox = document.getElementById("errorBox");

/**
 * Toggles the error window by hiding or showing it. Also sets the text if provided.
 * @param {boolean} [show] Determines whether to show the loader or hide it. Will default to toggle mode
 * @param {string} [title] The name of the error used as the title.
 * @param {string} [desc] Additional description about the error.
 * @param {boolean} [innerHTMLMode = false] If set to a true value, will insecurely set the innerHTML of the description instead of the innerText
 */
function toggleErrorBox(show, title, desc, innerHTMLMode = false) {
	if(typeof show !== "boolean") show = errBox.style.opacity === "0";
	if(show) {
		errBox.style.display = "flex";
		errBox.style.opacity = "1";
	} else {
		errBox.style.opacity = "0";
		setTimeout(() => {
			errBox.style.display = "none";
		}, 500);
	}

	if(title) document.getElementById("errorName").innerText = title;
	if(desc) {
		if(innerHTMLMode) document.getElementById("errorDesc").innerHTML = desc;
		else document.getElementById("errorDesc").innerText = desc;
	}
}