window.addEventListener("load", () => {
	document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(elem => {
		elem.addEventListener("change", () => {
			labelCheckedUpdate(elem, true);
		})
	})
});

function labelCheckedUpdate(element, rippleRadios = false) {
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
		document.querySelectorAll(`input[name='${element.name}']`).forEach(elem => labelCheckedUpdate(elem));
	}
}