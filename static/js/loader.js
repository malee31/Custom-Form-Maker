/**
 * Toggles the loading wheel by hiding or showing it
 * @param {boolean} [show = false] Whether to show or hide the loader. Defaults to hiding it
 */
function toggleLoader(show) {
	const loader = document.querySelector(".loadWheel");
	if(typeof show !== "boolean") show = loader.style.visibility === "hidden";
	loader.style.visibility = show ? "visible" : "hidden";
}