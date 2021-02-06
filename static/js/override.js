let disableSubmit = false;

/**
 * Toggles the error window by hiding or showing it. Also sets the text if provided.
 * @param {boolean} show Determines whether to show the loader or hide it.
 * @param {string} [title] The name of the error used as the title.
 * @param {string} [desc] Additional description about the error.
 */
function toggleErrorBox(show, title, desc) {
	const errBox = document.getElementById("errorBox");

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
	let form = document.forms["mainForm"];

	form.addEventListener("submit", event => {
		event.preventDefault();
		if(disableSubmit) return;

		const data = {};

		for(const input of form.querySelectorAll("input")) {
			data[input.name] = input.value;
		}

		const req = new XMLHttpRequest();
		req.addEventListener("load", event => {
			if(event.target.status !== 422) {
				form.parentNode.removeChild(form);
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
		req.open("POST", window.location.origin, true);
		req.setRequestHeader("Content-Type", "application/json");
		req.send(JSON.stringify(data));

		toggleLoader(true);
		disableSubmit = true;
	});
}

// Overrides all the forms and handles redirects once the window loads.
// window.addEventListener("load", mainFormOverride);