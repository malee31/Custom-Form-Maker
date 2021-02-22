window.onresize = () => {
	document.getElementById("pad").style.height = `${Math.max(0, document.querySelector("#control").clientHeight - window.innerHeight)}px`;
	// document.querySelector("input[type=submit]").value = document.querySelector("#control").clientHeight + ", " + window.innerHeight;
};