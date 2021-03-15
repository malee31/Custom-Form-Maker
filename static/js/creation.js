console.log("Creation script attached");

const form = document.forms["mainForm"];
const renderWrapperTemplate = document.getElementById("render-wrapper-template");
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
const GeneratedData = {
	name: "Custom Form",
	headers: []
};
const dataMap = {};

window.addEventListener("load", () => {
	creationOverlay.addEventListener("submit", createToolOverride);
	form.addEventListener("submit", e => e.preventDefault());
	const fileTitle = document.getElementById("fileTitle");
	fileTitle.addEventListener("input", e => {
		GeneratedData.name = e.target.innerText.replace(/\s/g, " ");
	});
	editableListeners(fileTitle);

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
});

function createToolOverride(e) {
	if(e) e.preventDefault();
	console.log("Creating New Input");
	const data = fetchCreateToolValues();
	requestTemplate(creationInputs.template.value).then(template => {
		const uuid = generateUUID();
		const rendered = parseHTMLString(ejs.render(template, {inputOptions: cleanData(data, uuid)}))[0];
		const elementMap = createRenderWrapper();
		elementMap.renderWrapper.dataset.uuid = uuid;
		addEditElementReferences(elementMap);
		attachEditListeners(rendered, elementMap);

		elementMap.replace.replaceWith(rendered);
		formAppend(elementMap.renderWrapper);
		elementMap.data = data;
		dataMap[uuid] = elementMap;
		GeneratedData.headers.push(uuid);
		console.log("New Input Added");
	});
}

function editableListeners(editableElem) {
	editableElem.addEventListener("keydown", e => {
		editableContentFilter(e.target, e.target.innerText.replace(/\s/g, " "));
	});
	editableElem.addEventListener("blur", e => {
		editableContentFilter(e.target, e.target.innerText.replace(/\s/g, " "), false);
	});
	editableElem.addEventListener("paste", e => {
		const savedSelection = cutSelection();
		const clippedText = e.clipboardData.getData("text/plain").replace(/\s/g, " ");
		e.target.innerText = `${e.target.innerText.substring(0, savedSelection.start)}${clippedText}${e.target.innerText.substring(savedSelection.end)}`;
		savedSelection.start += clippedText.length;
		savedSelection.end += clippedText.length;
		restoreSelection(e.target, savedSelection);
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

function restoreSelection(targetElem, restorePosition, collapse = false) {
	const selection = window.getSelection();
	const newRange = document.createRange();
	if(!targetElem.firstChild) targetElem.appendChild(document.createTextNode(""));
	const targetChild = targetElem.firstChild;
	while(targetElem.childNodes.length > 1) targetElem.removeChild(targetElem.lastChild);
	newRange.setStart(targetChild, Math.min(restorePosition.start, targetChild.length));
	newRange.setEnd(targetChild, Math.min(collapse ? restorePosition.start : restorePosition.end, targetChild.length));
	selection.addRange(newRange);
}

function editableContentFilter(targetElem, filteredText, restore = true) {
	const savedRange = cutSelection();
	targetElem.innerText = filteredText;
	if(restore) restoreSelection(targetElem, savedRange);
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
	// For lookup by uuid
	elementMap = typeof elementMap === "string" ? dataMap[elementMap] : elementMap;
	const editorElements = elementMap.editorElements;
	const editingHeader = elementMap.data;
	editingHeader.displayName = editorElements.labelValue.value;
	editingHeader.placeholderText = editorElements.placeholderValue.value;
	editingHeader.defaultValue = editorElements.defaultValue.value;
	editingHeader.required = editorElements.requiredValue.checked;
	return editingHeader;
}

function updatePreview(elementMap) {
	const updatedData = fetchEditorValues(elementMap);
	requestTemplate(updatedData.type).then(template => {
		const rendered = parseHTMLString(ejs.render(template, {inputOptions: cleanData(updatedData, elementMap.renderWrapper.dataset.uuid)}))[0];
		elementMap.renderWrapper.querySelector(".pseudo-label").replaceWith(rendered);
		attachEditOpenerListeners(rendered, elementMap);
	});
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
		editorWrapper: renderWrapperClone.querySelector(".edit-controls-wrapper"),
		closeEditor: renderWrapperClone.querySelector(".close-editor-button"),
		replace: renderWrapperClone.querySelector(".render-replace")
	}

	renderElements.closeEditor.addEventListener("click", () => {
		renderElements.renderWrapper.classList.remove("edit-mode");
		renderElements.editorWrapper.classList.add("dimensionless");
	});

	return renderElements;
}

function attachEditOpenerListeners(previewRender, elementMap) {
	previewRender.addEventListener("click", () => {
		if(!elementMap.renderWrapper.classList.contains("edit-mode")) {
			elementMap.renderWrapper.classList.add("edit-mode");
			elementMap.editorWrapper.classList.remove("dimensionless");
		}
	});
}

function attachEditListeners(previewRender, elementMap) {
	attachEditOpenerListeners(previewRender, elementMap);

	const updatePreviewForWrapper = () => {updatePreview(elementMap)};
	elementMap.editorElements.labelValue.addEventListener("input", updatePreviewForWrapper);
	elementMap.editorElements.defaultValue.addEventListener("input", updatePreviewForWrapper);
	elementMap.editorElements.placeholderValue.addEventListener("input", updatePreviewForWrapper);
	elementMap.editorElements.requiredValue.addEventListener("change", updatePreviewForWrapper);
}

function addEditElementReferences(renderMap) {
	renderMap.editorElements = {
		labelValue: renderMap.editorWrapper.querySelector(".label-editor"),
		defaultValue: renderMap.editorWrapper.querySelector(".default-value-editor"),
		placeholderValue: renderMap.editorWrapper.querySelector(".placeholder-editor"),
		requiredValue: renderMap.editorWrapper.querySelector(".required-editor"),
	};
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
	return `Pseudo-UUID-${uuidCounter}`;
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