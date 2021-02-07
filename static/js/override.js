const mainForm = document.forms["mainForm"];
const errBox = document.getElementById("errorBox");
let disableSubmit = false;

/**
 * Toggles the error window by hiding or showing it. Also sets the text if provided.
 * @param {boolean} [show] Determines whether to show the loader or hide it. Will default to toggle mode
 * @param {string} [title] The name of the error used as the title.
 * @param {string} [desc] Additional description about the error.
 */
function toggleErrorBox(show, title, desc) {
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
	if(desc) document.getElementById("errorDesc").innerText = desc;
}

/**
 * Handles all the overriding of the mainForm.
 */
function mainFormOverride() {
	mainForm.addEventListener("submit", event => {
		event.preventDefault();
		if(disableSubmit) return;

		const data = {};

		for(const input of mainForm.querySelectorAll("input")) {
			if(input.name) data[input.name] = input.value;
		}

		const req = new XMLHttpRequest();
		req.addEventListener("load", event => {
			if(event.target.status !== 422) {
				mainForm.parentNode.removeChild(mainForm);
			}

			toggleLoader(false);
			disableSubmit = false;

			toggleErrorBox(true, event.target.status === 200 ? "Thank You!" : ("Status code " + event.target.status), event.target.responseText);
		});

		req.addEventListener("error", event => {
			console.log("There's been an error");
			console.log(event);
		});

		//console.log("Sending " + data);
		req.open("POST", `${window.location.origin}/submit`, true);
		req.setRequestHeader("Content-Type", "application/json");
		req.send(JSON.stringify(data));

		toggleLoader(true);
		disableSubmit = true;
	});
}

// Overrides all the forms and handles redirects once the window loads.
window.addEventListener("load", mainFormOverride);