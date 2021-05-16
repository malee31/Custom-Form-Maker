// TODO: Add validation for file inputs since making hidden fields required throws an error

window.addEventListener("load", updateListeners);

/**
 * Updates all input types with their corresponding listener functions
 */
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

	document.querySelectorAll("input[type='file']").forEach(elem => {
		elem.addEventListener("change", filePreviewSync);
	});
}

/**
 * Listen to clicks on radio or checkbox inputs and apply styles accordingly
 * @param {Element} element A checkbox or radio input reference
 * @param {boolean} [rippleRadios = true] For radio buttons, whether to update related radio button's checked state (and styles)
 */
function labelCheckedUpdate(element, rippleRadios = true) {
	element = grabElem(element);
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

/**
 * When the text input for colors changes, change the color input for colors to match
 * @param {Element} element The text input to bind to the color input
 */
function colorSync(element) {
	element = grabElem(element);
	document.querySelector(`input[type="text"][data-bindto="${element.dataset.bindfrom}"]`).value = element.value.toUpperCase();
}

/**
 * Same as colorSync but in the opposite direction
 * @param {Element} element The color input to bind to the text input
 */
function reverseColorSync(element) {
	element = grabElem(element);
	let cleanValue = element.value.toUpperCase().replaceAll(/[^A-F0-9]/g, "");
	element.value = `#${cleanValue.substring(cleanValue.length - 6, cleanValue.length)}`
	if(element.value.length !== 7) {
		element.classList.add("error-border");
		return;
	}
	element.classList.remove("error-border");
	document.querySelector(`input[type="color"][data-bindfrom="${element.dataset.bindto}"]`).value = element.value.toUpperCase();
}

const fileTypes = ["image/apng", "image/bmp", "image/gif", "image/jpeg", "image/pjpeg", "image/png", "image/svg+xml", "image/tiff", "image/webp", "image/x-icon"];

/**
 * Listener function that handles synchronizing a file input's files and the previews shown
 * @param {HTMLElement} element File input to listen to
 */
function filePreviewSync(element) {
	element = grabElem(element);
	const preview = document.querySelector(`div[data-bindto="${element.dataset.bindfrom}"]`);
	preview.classList.remove("file-preview-hide");
	while(preview.firstChild) {
		// TODO: Properly release memory with URL.revokeObjectURL()
		preview.removeChild(preview.firstChild);
	}

	if(element.files.length === 0) preview.classList.add("file-preview-hide");
	for(const file of element.files) {
		const filePreview = document.createElement('div');
		filePreview.classList.add("file-preview-item");
		filePreview.title = file.name;
		const previewText = document.createElement("p");
		previewText.classList.add("file-preview-text");
		previewText.textContent = `${file.name} [${fileSize(file.size)}]`;
		filePreview.appendChild(previewText);

		if(fileTypes.includes(file.type)) {
			const previewImage = document.createElement("img");
			previewImage.classList.add("file-preview-image");
			previewImage.src = URL.createObjectURL(file);
			filePreview.appendChild(previewImage);
		}

		preview.appendChild(filePreview);
	}
}

/**
 * Convert a number of bytes into a more human-readable format of KB or MB when needed
 * @param {number} bytes Bytes to convert into KB or MB
 * @return {string} String with the number of bytes converted to KB or MB with one decimal place. Displays as "10.1 KB" or "11.9 MB"
 */
function fileSize(bytes) {
	if(bytes < 1024) return `${bytes} bytes`;
	else if(bytes >= 1024 && bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	else if(bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Grabs the element reference from an Event instance or returns input untouched
 * @param {Event|HTMLElement} elem Element or Event to get element from
 * @return {EventTarget|HTMLElement} Returns the Target of an event or the element given as a parameter
 */
function grabElem(elem) {
	return elem instanceof Event ? elem.target : elem;
}