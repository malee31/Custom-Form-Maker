console.log("Creation script attached");

const GeneratedData = {
	name: "Custom Form",
	headers: []
};

window.addEventListener("load", () => {
	document.querySelectorAll("form").forEach(form => {
		form.addEventListener("submit", e => e.preventDefault());
	});
});

const form = document.querySelector("form");
const insertBefore = document.querySelector("input[type='submit']");

function parseHTMLString(HTMLString="") {
	const mockDOM = document.createElement( "body" );
	mockDOM.innerHTML = HTMLString;
	return mockDOM.childNodes;
}

function insertRendered(renderedString="") {
	const insertList = parseHTMLString(renderedString);
	while(insertList.length) form.insertBefore(insertList[0], insertBefore);
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