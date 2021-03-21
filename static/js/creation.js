console.log("Creation script attached");

const form = document.forms["mainForm"];
const renderWrapperTemplate = document.getElementById("render-wrapper-template");
const choiceEditorTemplate = {
	main: document.getElementById("choice-editor-template"),
	choice: document.getElementById("choice-option-template")
};
const creationOverlay = document.getElementById("creation-overlay");
const creationInputs = {
	template: creationOverlay.querySelector("#template-type"),
	labelValue: creationOverlay.querySelector("#label-value"),
	defaultValue: creationOverlay.querySelector("#default-value"),
	placeholder: creationOverlay.querySelector("#placeholder-text"),
	requiredInput: creationOverlay.querySelector("#required-checkbox")
};

let uuidCounter = 0;
const loadedTemplates = {};
const dataMap = {};
const GeneratedData = {
	name: "Custom Form",
	headers: []
};

window.addEventListener("load", () => {
	form.addEventListener("submit", e => e.preventDefault());
	creationOverlay.addEventListener("submit", createToolOverride);
	formTitleListeners(document.getElementById("fileTitle"));
	createToolHideToggleListener();
});

function formTitleListeners(formTitleElem) {
	formTitleElem.addEventListener("input", e => {
		GeneratedData.name = e.target.innerText.replace(/\s/g, " ");
	});
	editableListeners(formTitleElem);
}

function createToolHideToggleListener() {
	document.getElementById("hide-creation-overlay-button").addEventListener("click", e => {
		const overlayContainer = document.getElementById("creation-overlay-container");
		if(e.target.classList.contains("hide-creation-overlay")) {
			e.target.classList.remove("hide-creation-overlay");
			overlayContainer.classList.remove("hide-creation-overlay");
			document.querySelector("main").classList.add("control-pad");
		} else {
			e.target.classList.add("hide-creation-overlay");
			overlayContainer.classList.add("hide-creation-overlay");
			document.querySelector("main").classList.remove("control-pad");
		}
	});
}

function createToolOverride(e) {
	if(e) e.preventDefault();
	console.log("Creating New Input");
	const data = fetchCreateToolValues();
	requestTemplate(creationInputs.template.value).then(template => {
		const uuid = generateUUID();
		const rendered = parseHTMLString(ejs.render(template, {inputOptions: cleanData(data, uuid)}))[0];
		const elementMap = createRenderWrapper();
		elementMap.renderWrapper.dataset.uuid = uuid;
		switch(data.type) {
			case "radio":
			case "checkbox":
				elementMap.additionalControls.append(createOptionEditor());
				attachOptionListeners(elementMap);
		}
		addEditElementReferences(elementMap);
		attachEditListeners(rendered, elementMap);

		elementMap.renderPreview.append(rendered);
		formAppend(elementMap.renderWrapper);
		elementMap.data = data;
		dataMap[uuid] = elementMap;
		GeneratedData.headers.push(uuid);
		console.log("New Input Added");
	});
}

function fetchCreateToolValues(targetObj = makeData()) {
	targetObj.displayName = creationInputs.labelValue.value;
	targetObj.type = creationInputs.template.value;
	typeFilter(targetObj);
	targetObj.placeholderText = creationInputs.placeholder.value;
	targetObj.defaultValue = creationInputs.defaultValue.value;
	targetObj.required = creationInputs.requiredInput.checked;
	return targetObj;
}

function fetchEditorValues(elementMap) {
	const editorElements = elementMap.editorElements;
	const editingHeader = elementMap.data;
	editingHeader.displayName = editorElements.labelValue.value;
	editingHeader.placeholderText = editorElements.placeholderValue.value;
	editingHeader.defaultValue = editorElements.defaultValue.value;
	editingHeader.required = editorElements.requiredValue.checked;
	delete editingHeader.choices;
	if(elementMap.additionalControls.querySelector(".choice-container")) {
		editingHeader.choices = [];
		for(const choice of elementMap.additionalControls.querySelectorAll(".choice-editor")) {
			editingHeader.choices.push({
				"value": choice.value,
				"default": false
			});
		}
	}
	return editingHeader;
}

function updatePreview(elementMap) {
	const updatedData = fetchEditorValues(elementMap);
	requestTemplate(updatedData.type).then(template => {
		const rendered = parseHTMLString(ejs.render(template, {inputOptions: cleanData(updatedData, elementMap.renderWrapper.dataset.uuid)}))[0];
		while(elementMap.renderPreview.firstChild) elementMap.renderPreview.firstChild.remove();
		elementMap.renderPreview.append(rendered);
		setAllTabIndex(rendered, -1);
		attachEditOpenerListeners(rendered, elementMap);
		updateListeners();
	});
}

function setAllTabIndex(elem, val = 0) {
	for(const input of elem.querySelectorAll("input, button")) {
		input.tabIndex = val;
	}
}

function requestTemplate(templateType) {
	return new Promise((resolve, reject) => {
		if(loadedTemplates[templateType]) resolve(loadedTemplates[templateType]);

		const request = new XMLHttpRequest();
		request.addEventListener("load", res => {
			loadedTemplates[templateType] = res.target.response;
			resolve(loadedTemplates[templateType]);
		});
		request.addEventListener("error", reject);
		request.open("GET", `${window.location.origin}/templates?type=${encodeURIComponent(templateType)}`);
		request.send();
	});
}

function createRenderWrapper() {
	const renderWrapperClone = renderWrapperTemplate.content.cloneNode(true);
	const renderElements = {
		renderWrapper: renderWrapperClone.querySelector(".render-wrapper"),
		renderPreview: renderWrapperClone.querySelector(".render-preview"),
		editorWrapper: renderWrapperClone.querySelector(".edit-controls-wrapper"),
		closeEditor: renderWrapperClone.querySelector(".close-editor-button"),
		additionalControls: renderWrapperClone.querySelector(".additional-edit-controls")
	}

	renderElements.closeEditor.addEventListener("click", () => {
		renderElements.renderWrapper.classList.remove("edit-mode");
		renderElements.editorWrapper.classList.add("dimensionless");
		setAllTabIndex(renderElements.editorWrapper, -1);
	});

	return renderElements;
}

function createOptionEditor() {
	return choiceEditorTemplate.main.content.cloneNode(true);
}

function attachOptionListeners(elementMap) {
	elementMap.additionalControls.querySelector(".add-option-button").addEventListener("click", () => {
		const newOptionEditor = choiceEditorTemplate.choice.content.cloneNode(true);
		const newChoiceEditor = newOptionEditor.querySelector(".choice-editor");
		newChoiceEditor.addEventListener("input", () => {
			updatePreview(elementMap);
		});
		elementMap.additionalControls.querySelector(".choice-container").append(newOptionEditor);
		newChoiceEditor.focus();
	});
}

function attachEditListeners(previewRender, elementMap) {
	attachEditOpenerListeners(previewRender, elementMap);
	setAllTabIndex(previewRender, -1);

	const updatePreviewForWrapper = () => {
		updatePreview(elementMap)
	};
	elementMap.editorElements.labelValue.addEventListener("input", updatePreviewForWrapper);
	elementMap.editorElements.defaultValue.addEventListener("input", updatePreviewForWrapper);
	elementMap.editorElements.placeholderValue.addEventListener("input", updatePreviewForWrapper);
	elementMap.editorElements.requiredValue.addEventListener("change", updatePreviewForWrapper);
}

function attachEditOpenerListeners(previewRender, elementMap) {
	previewRender.addEventListener("click", () => {
		if(!elementMap.renderWrapper.classList.contains("edit-mode")) {
			elementMap.renderWrapper.classList.add("edit-mode");
			elementMap.editorWrapper.classList.remove("dimensionless");
			setAllTabIndex(elementMap.editorWrapper, 0);
		}
	});
}

function addEditElementReferences(renderMap) {
	renderMap.editorElements = {
		labelValue: renderMap.editorWrapper.querySelector(".label-editor"),
		defaultValue: renderMap.editorWrapper.querySelector(".default-value-editor"),
		placeholderValue: renderMap.editorWrapper.querySelector(".placeholder-editor"),
		requiredValue: renderMap.editorWrapper.querySelector(".required-editor")
	};
}

function editableListeners(editableElem) {
	editableElem.addEventListener("input", e => {
		editableContentFilter(e.target, e.target.innerText.replace(/\s(?!$)\s*/g, " ").replace(/ $/, String.fromCharCode(160)), true, /\s{2}/.test(e.target.innerText) ? -1 : 0);
	});
	editableElem.addEventListener("blur", e => {
		editableContentFilter(e.target, e.target.innerText.replace(/\s+/g, " ").trim(), false);
	});
	editableElem.addEventListener("paste", e => {
		const savedSelection = cutSelection();
		const clippedText = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
		e.target.innerText = `${e.target.innerText.substring(0, savedSelection.start)}${clippedText}${e.target.innerText.substring(savedSelection.end)}`;
		restoreSelection(e.target, savedSelection, clippedText.length);
		e.preventDefault();
	});
}

function cutSelection() {
	const selection = window.getSelection();
	const currentRange = selection.rangeCount ? selection.getRangeAt(0) : {};
	const savedRange = {
		start: currentRange.startOffset || 0,
		end: currentRange.endOffset || 0
	};
	selection.removeAllRanges();
	return savedRange;
}

function restoreSelection(targetElem, restorePosition, offset = 0, collapse = false) {
	const selection = window.getSelection();
	const newRange = document.createRange();
	if(!targetElem.firstChild) targetElem.appendChild(document.createTextNode(""));
	const targetChild = targetElem.firstChild;
	while(targetElem.childNodes.length > 1) targetElem.removeChild(targetElem.lastChild);
	newRange.setStart(targetChild, Math.min(restorePosition.start + offset, targetChild.length));
	newRange.setEnd(targetChild, Math.min((collapse ? restorePosition.start : restorePosition.end) + offset, targetChild.length));
	selection.addRange(newRange);
}

function editableContentFilter(targetElem, filteredText, restore = true, offset = 0) {
	const savedRange = cutSelection();
	targetElem.innerText = filteredText;
	if(restore) restoreSelection(targetElem, savedRange, offset);
}

function makeData() {
	return {
		name: "",
		displayName: "",
		defaultValue: "",
		placeholderText: "",
		type: "text",
		subtype: null,
		required: false,
		attributes: {}
	};
}

function parseHTMLString(HTMLString = "") {
	const mockDOM = document.createElement("body");
	mockDOM.innerHTML = HTMLString;
	return mockDOM.childNodes;
}

function formAppend(newNode) {
	form.append(newNode);
	updateListeners();
}

function generateUUID() {
	return `Pseudo-UUID-${uuidCounter++}`;
}

function finalizeGeneratedData() {
	for(let uuidNum = 0; uuidNum < GeneratedData.headers.length; uuidNum++) {
		const uuid = GeneratedData.headers[uuidNum];
		if(typeof uuid === "object") {
			console.log("Already finalized.");
			console.log(uuid);
			continue;
		}
		GeneratedData.headers[uuidNum] = dataMap[uuid].data;
	}
	return GeneratedData;
}