const sheetIdInput = document.getElementById("sheetId");
const createIdInput = document.getElementById("createId");
const createButton = document.getElementById("create");
const submitButton = document.getElementById("submit");

sheetIdInput.addEventListener("input", e => {
	mutuallyExclusiveInputListener(e.target.value, createIdInput);
});

createIdInput.addEventListener("input", e => {
	mutuallyExclusiveInputListener(e.target.value, sheetIdInput);
});

function mutuallyExclusiveInputListener(value, mutuallyExclusiveWith) {
	if(value.trim().length !== 0) {
		mutuallyExclusiveWith.style.backgroundColor = "#888";
		mutuallyExclusiveWith.disabled = "disabled";
	} else {
		mutuallyExclusiveWith.style.backgroundColor = "";
		mutuallyExclusiveWith.disabled = "";
	}
}

submitButton.addEventListener("click", e => {
	e.preventDefault();
	toggleLoader(true);
	if(sheetIdInput.value) window.location = `${window.location.origin}/form/${sheetIdInput.value.trim()}`;
	else if(createIdInput.value) window.location = `${window.location.origin}/created/${createIdInput.value.trim()}`;
	else {
		toggleLoader(false);
		toggleErrorBox(true, "Sheet ID or Pre-existing Form ID Required", "Please enter in a Sheet ID or Pre-existing Form ID");
	}
});

createButton.addEventListener("click", e => {
	toggleLoader(true);
	if(createIdInput.value) {
		e.preventDefault();
		window.location = `${window.location.origin}/create?edit=${createIdInput.value.trim()}`;
	}
});