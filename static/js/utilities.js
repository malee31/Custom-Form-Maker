const errBox = document.getElementById("errorBox");
const padElem = document.getElementById("pad");
const controlElem = document.getElementById("control");

/**
 * Toggles the loading wheel by hiding or showing it
 * @param {boolean} [show = false] Whether to show or hide the loader. Defaults to hiding it
 */
function toggleLoader(show) {
	const loader = document.querySelector(".loadWheel");
	if(!loader) return console.log(`No loader to toggle ${show ? "on" : "off"}`);
	if(typeof show !== "boolean") show = loader.style.visibility === "hidden";
	loader.style.visibility = show ? "visible" : "hidden";
}

/**
 * Toggles the error window by hiding or showing it. Also sets the text if provided. Doubles as a modal
 * @param {boolean} [show] Determines whether to show the loader or hide it. Will default to toggle mode
 * @param {string} [title] The name of the error used as the title.
 * @param {string} [desc] Additional description about the error.
 * @param {boolean} [innerHTMLMode = false] If set to a true value, will insecurely set the innerHTML of the description instead of the innerText
 */
function toggleErrorBox(show, title, desc, innerHTMLMode = false) {
	if(!errBox) return console.log(`No Error Box Element to Toggle ${show ? "on" : "off"}`);
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

if(padElem && controlElem) window.onresize = () => {
	padElem.style.height = `${Math.max(0, controlElem.clientHeight - window.innerHeight)}px`;
};