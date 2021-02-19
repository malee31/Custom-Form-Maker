console.log("Creation script attached");
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

function makeInputOptions() {
	return {
		inputOptions: {
			attributes: {}
		}
	};
}