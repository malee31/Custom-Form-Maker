console.log("Creation script attached");

const form = document.forms["mainForm"];
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

function createToolOverride(e) {
	e.preventDefault();
	requestTemplate(creationInputs.template.value).then(template => {
		console.log("Template received");
		const data = makeData();
		data.displayName = creationInputs.labelValue.value;
		data.type = creationInputs.template.value.toLowerCase();
		data.attributes.placeholder = `placeholder='${creationInputs.placeholder.value}'`;
		data.attributes.value = `value='${creationInputs.defaultValue.value}'`;
		insertRendered(ejs.render(template, {inputOptions: data}));
		console.log("Rendered");
		GeneratedData.headers.push(data);
	});
	console.log("Add");
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