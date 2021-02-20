const mainForm = document.forms["mainForm"];
let disableSubmit = false;

/**
 * Collects all the data from form elements and assigns them to an object
 * @param {Object} targetObject Object reference to assign the form data to
 * @param {HTMLFormElement} form The form to collect data from
 */
function collectFormData(targetObject, form) {
	for(const input of form.querySelectorAll("input")) {
		if(!input.dataset.columnname || targetObject[input.dataset.columnname]) continue;
		if(input.type === "checkbox") {
			targetObject[input.dataset.columnname] = [];
			form.querySelectorAll(`input[type="checkbox"][name=${input.name}]`)
				.forEach(item => {
					if(item.checked) targetObject[input.dataset.columnname].push(item.value);
				});
		} else if(input.type === "radio") {
			form.querySelectorAll(`input[type="radio"][name=${input.name}]`)
				.forEach(item => {
					if(item.checked) targetObject[input.dataset.columnname] = item.value;
				});
		} else {
			targetObject[input.dataset.columnname] = input.value;
		}
	}
}

/**
 * Handles all the overriding of the mainForm.
 */
function mainFormOverride() {
	mainForm.addEventListener("submit", event => {
		event.preventDefault();
		if(disableSubmit) return;

		const data = {formId: document.getElementById("formId").value};

		collectFormData(data, mainForm);

		const req = new XMLHttpRequest();
		req.addEventListener("load", event => {
			if(event.target.status === 200) {
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