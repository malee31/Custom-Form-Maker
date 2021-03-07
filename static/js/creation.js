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
const GeneratedData = {
	name: "Custom Form",
	headers: []
};

window.addEventListener("load", () => {
	creationOverlay.addEventListener("submit", createToolOverride);
	form.addEventListener("submit", e => e.preventDefault());
});

let uuidCount = 0;

function uuidCounter() {
	return "" + uuidCount++;
}

function createToolOverride(e) {
	e.preventDefault();
	requestTemplate(creationInputs.template.value).then(template => {
		console.log("Template received");
		const data = makeData();
		data.displayName = creationInputs.labelValue.value;
		data.type = creationInputs.template.value;
		typeFilter(data);
		data.placeholderText = creationInputs.placeholder.value;
		data.defaultValue = creationInputs.defaultValue.value;
		const rendered = parseHTMLString(ejs.render(template, {inputOptions: cleanData(data, uuidCounter())}));
		const renderWrapper = createRenderWrapper();
		while(rendered.length) {
			renderWrapper.prepend(attachEditListener(rendered[0], renderWrapper.querySelector(".edit-controls-wrapper"), renderWrapper));
		}
		form.append(renderWrapper);
		console.log("Rendered");
		updateListeners();
		GeneratedData.headers.push(data);
	});
	console.log("Add");
}

function attachEditListener(previewRender, editControls, wrapper) {
	previewRender.addEventListener("click", e => {
		if(!wrapper.classList.contains("edit-mode")) {
			wrapper.classList.add("edit-mode");
			editControls.classList.remove("dimensionless");
		}
	});

	return previewRender;
}

function createRenderWrapper() {
	const renderWrapperClone = renderWrapperTemplate.content.cloneNode(true);
	const wrapper = renderWrapperClone.querySelector(".render-wrapper");
	const editControlsWrapper = renderWrapperClone.querySelector(".edit-controls-wrapper");
	const closeEditorButton = renderWrapperClone.querySelector(".close-editor-button");

	closeEditorButton.addEventListener("click", e => {
		wrapper.classList.remove("edit-mode");
		editControlsWrapper.classList.add("dimensionless");
	});

	return wrapper;
}

function parseHTMLString(HTMLString = "") {
	const mockDOM = document.createElement("body");
	mockDOM.innerHTML = HTMLString;
	return mockDOM.childNodes;
}

function insertRendered(renderedString = "") {
	const insertList = parseHTMLString(renderedString);
	while(insertList.length) form.append(insertList[0]);
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

const loadedTemplates = {};

async function requestTemplate(templateType) {
	if(!loadedTemplates[templateType]) {
		const request = new XMLHttpRequest();
		await new Promise((resolve, reject) => {
			request.addEventListener("load", res => {
				loadedTemplates[templateType] = res.target.response;
				resolve();
			});
			request.addEventListener("error", reject);
			request.open("GET", `${window.location.origin}/templates?type=${encodeURIComponent(templateType)}`);
			request.send();
		});
	}
	return loadedTemplates[templateType];
}