console.log("Creation script attached");

const form = document.forms["mainForm"];
const renderWrapperTemplate = document.getElementById("render-wrapper-template");
const creationOverlay = document.getElementById("creation-overlay");
const creationInputs = {
	template: creationOverlay.querySelector("#template-type"),
	labelValue: creationOverlay.querySelector("#label-value"),
	defaultValue: creationOverlay.querySelector("#default-value"),
	placeholder: creationOverlay.querySelector("#placeholder-text")
};

let uuidCounter = 0;
const loadedTemplates = {};
const GeneratedData = {
	name: "Custom Form",
	headers: []
};

window.addEventListener("load", () => {
	creationOverlay.addEventListener("submit", createToolOverride);
	form.addEventListener("submit", e => e.preventDefault());
	const fileTitle = document.getElementById("fileTitle");
	fileTitle.addEventListener("input", e => {
		GeneratedData.name = e.target.innerText.replace(/\s/g, " ");
	});
	editableListeners(fileTitle);
});

function editableListeners(editableElem) {
	editableElem.addEventListener("keydown", e => {
		editableContentFilter(e.target, e.target.innerText.replace(/\s/g, " "));
	});
	editableElem.addEventListener("blur", e => {
		editableContentFilter(e.target, e.target.innerText.replace(/\s/g, " "), false);
	});
	editableElem.addEventListener("paste", e => {
		// TODO: Manually implement pasting so that text/plain format is enforced
		// return e.clipboardData.getData("text/plain").replace(/\s/g, " ");
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

function createToolOverride(e) {
	if(e) e.preventDefault();
	console.log("Creating New Input");
	const data = fetchCreateToolValues();
	requestTemplate(creationInputs.template.value).then(template => {
		const rendered = parseHTMLString(ejs.render(template, {inputOptions: cleanData(data, generateUUID())}))[0];
		const {renderWrapper, editor, replace} = createRenderWrapper();
		attachEditListener(rendered, editor, renderWrapper);

		replace.replaceWith(rendered);
		formAppend(renderWrapper);
		GeneratedData.headers.push(data);
		console.log("New Input Added");
	});
}

function fetchCreateToolValues(targetObj = makeData()) {
	targetObj.displayName = creationInputs.labelValue.value;
	targetObj.type = creationInputs.template.value;
	typeFilter(targetObj);
	targetObj.placeholderText = creationInputs.placeholder.value;
	targetObj.defaultValue = creationInputs.defaultValue.value;
	return targetObj;
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
		editor: renderWrapperClone.querySelector(".edit-controls-wrapper"),
		closeEditor: renderWrapperClone.querySelector(".close-editor-button"),
		replace: renderWrapperClone.querySelector(".render-replace")
	}

	renderElements.closeEditor.addEventListener("click", () => {
		renderElements.renderWrapper.classList.remove("edit-mode");
		renderElements.editor.classList.add("dimensionless");
	});

	return renderElements;
}

function attachEditListener(previewRender, editControls, wrapper) {
	previewRender.addEventListener("click", () => {
		if(!wrapper.classList.contains("edit-mode")) {
			wrapper.classList.add("edit-mode");
			editControls.classList.remove("dimensionless");
		}
	});

	return previewRender;
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