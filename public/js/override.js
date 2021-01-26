let canPost = true;
let disableSubmit = false;
toggleLoader(false);

/**
 * Toggles the loading wheel by hiding or showing it
 * @param {boolean} [show = false] Whether to show or hide the loader. Defaults to hiding it
 */
function toggleLoader(show = false) {
	const loader = document.getElementsByClassName("loadWheel")[0];
	const idSubmit = document.getElementsByName("submit")[0];
	canPost = !show;

	if(show) {
		loader.style.visibility = "visible";
		if(idSubmit) idSubmit.value = "Loading...";
	} else {
		loader.style.visibility = "hidden";
		if(idSubmit) idSubmit.value = "Submit";
	}
}

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
 * Handles all the overriding of the id getter form
 * @param {Event} event Event object passed in from addEventListener.
 */
function idGetOverride(event) {
	event.preventDefault();

	const idInput = document.getElementsByName("sheetId")[0];
	if(!canPost && idInput.value === "") return;

	toggleLoader(true);
	const req = new XMLHttpRequest();
	req.addEventListener("load", event => {
		toggleLoader(false);
		if(event.target.status !== 200) {
			console.log(event);
			toggleErrorBox(true, `Status Code ${req.status}: ${req.statusText}`, (req.status === 422) ? "The ID is invalid." : "An error has occurred. Try again later.");
			toggleLoader(false);
			return;
		}
		const resp = JSON.parse(event.target.response);
		const defaultCookie = cookieValue("defaultVals").split(",");

		for(let inputIndex = 0; inputIndex < Math.min(resp.length, defaultCookie.length); inputIndex++) {
			if(defaultCookie[inputIndex] !== "") resp[inputIndex + 1].defaultValue = defaultCookie[inputIndex];
		}

		loadInputs(resp);
	});

	req.addEventListener("error", event => {
		console.log("There's been an error");
		console.log(event);
		toggleLoader(false);
	});

	req.onerror = (err) => {
		console.log(err);
		toggleErrorBox(true, "An Error Occurred", "Try again later.");
		toggleLoader(false);
	}

	req.open("POST", window.location, true);
	req.setRequestHeader("Content-Type", "application/json");

	const data = {"id": idInput.value};
	setCookie("id", data.id);

	req.responseType = "json";
	req.send(JSON.stringify(data));

	const defaultInput = document.getElementsByName("defaultVals")[0].value;

	if(defaultInput.toLowerCase() === "clear" || cookieValue("defaultVals") === "Error 404") setCookie("defaultVals", "");
	else if(defaultInput !== "") setCookie("defaultVals", defaultInput);
}


/**
 * When redirected from /forms/:id, this handles the simulated manual input to send the ID POST request
 */
function redirectedHandler() {
	if(window.location.search === "") return;
	document.getElementsByName("sheetId")[0].value = window.location.search.substring(window.location.search.indexOf("id=") + 3).split("&")[0];
	document.getElementsByName("submit")[0].click();
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
		data["formId"] = cookieValue("id");

		for(const input of form.elements) {
			if(input.nodeName === "INPUT") {
				data[input.name] = input.value;
			}
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
		req.open("POST", window.location, true);
		req.setRequestHeader("Content-Type", "application/json");
		req.send(JSON.stringify(data));

		toggleLoader(true);
		disableSubmit = true;
	});
}

// Overrides all the forms and handles redirects once the window loads.
window.addEventListener("load", () => {
	document.forms["idGetter"].addEventListener("submit", idGetOverride);
	redirectedHandler();
	mainFormOverride();
});