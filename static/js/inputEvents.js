window.addEventListener("load", updateListeners);

function updateListeners() {
	document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(elem => {
		elem.addEventListener("change", labelCheckedUpdate);
		labelCheckedUpdate(elem);
	});

	document.querySelectorAll("input[type='color']").forEach(elem => {
		elem.addEventListener("input", colorSync);
	});

	document.querySelectorAll("input[data-bindto]").forEach(elem => {
		elem.addEventListener("input", reverseColorSync);
	});
}

function labelCheckedUpdate(element, rippleRadios = true) {
	element = element.target || element;
	let elementLabel = element.parentElement;
	while(elementLabel.tagName.toUpperCase() !== "LABEL") {
		if(elementLabel.tagName.toUpperCase() === "BODY") {
			// No corresponding label wrapped around it. Searching by id + for bind
			if(element.id) elementLabel = document.querySelector(`label[for='${element.id}']`);
			// If label not found, do nothing
			if(!elementLabel || elementLabel.tagName.toUpperCase() !== "LABEL") return;
		} else {
			elementLabel = elementLabel.parentElement;
		}
	}

	if(element.checked) {
		elementLabel.classList.add("label-checked");
	} else {
		elementLabel.classList.remove("label-checked");
	}

	if(rippleRadios && element.type.toUpperCase() === "RADIO") {
		document.querySelectorAll(`input[name='${element.name}']`).forEach(elem => labelCheckedUpdate(elem, false));
	}
}

function colorSync(element) {
	element = element.target || element;
	document.querySelector(`input[type="text"][data-bindto="${element.dataset.bindfrom}"]`).value = element.value.toUpperCase();
}

function reverseColorSync(element) {
	element = element.target || element;
	let cleanValue = element.value.toUpperCase().replaceAll(/[^A-F0-9]/g, "");
	element.value = `#${cleanValue.substring(cleanValue.length - 6, cleanValue.length)}`
	if(element.value.length !== 7) {
		element.classList.add("error-border");
		return;
	}
	element.classList.remove("error-border");
	document.querySelector(`input[type="color"][data-bindfrom="${element.dataset.bindto}"]`).value = element.value.toUpperCase();
}