var canPost = true;
var disableSubmit = false;
toggleLoader(false);


/**
 *
 * Toggles the loading wheel by hiding or showing it
 *
 * @params {boolean} show Determines whether to show the loader or hide it.
 */
function toggleLoader(show)
{
	var loader = document.getElementsByClassName("loadWheel")[0];
	var idSubmit = document.getElementsByName("submit")[0];

	canPost = !show;

	if(show)
	{
		loader.style.visibility = "visible";
		if(idSubmit) idSubmit.value = "Loading...";
	}
	else
	{
		loader.style.visibility = "hidden";
		if(idSubmit) idSubmit.value = "Submit";
	}
}


/**
 *
 * Handles all the overriding of the id getter form
 *
 * @params {Event} event Event object passed in from addEventListerner.
 */
function idGetOverride(event)
{
	event.preventDefault();

	const idInput = document.getElementsByName("sheetId")[0];

	if(canPost && idInput.value !== "")
	{
		toggleLoader(true);

		const req = new XMLHttpRequest();

		req.addEventListener("load", event => {
			toggleLoader(false);
			if(event.target.status == 200)
			{
				var resp = JSON.parse(event.target.response);
				const defaultCookie = cookieValue("defaultVals").split(",");

				for(var inputIndex = 0; inputIndex < Math.min(resp.length, defaultCookie.length); inputIndex++)
				{
					if(defaultCookie[inputIndex] != "")
					{
						resp[inputIndex + 1].defaultValue = defaultCookie[inputIndex];
					}
				}

				loadInputs(resp);
			}
		});

		req.addEventListener("onerror", event => {
			console.log("There's been an error");
			console.log(event);
			toggleLoader(false);
		});
	
		req.onerror = (err) => {
			console.log(err);
			toggleLoader(false);
		}

		req.open("POST", window.location, true);

		req.responseType = "json";

		req.setRequestHeader("Content-Type", "application/json");

		const data = {"id": idInput.value};

		setCookie("id", data.id);

		//console.log("Sending for Inputs from Id: " + JSON.stringify(data));

		req.send(JSON.stringify(data));
	

		var defaultInput = document.getElementsByName("defaultVals")[0].value;

		if(defaultInput == "clear" || cookieValue("defaultVals") == "Error 404") setCookie("defaultVals", "");
		else if(defaultInput != "") setCookie("defaultVals", defaultInput);
	}
}


/**
 *
 * When redirected from /forms/:id, this handles the sending of the POST request by simulating manual input.
 *
 */
function redirectedHandler()
{
	if(window.location.search != "")
	{
		document.getElementsByName("sheetId")[0].value = window.location.search.substring(window.location.search.indexOf("id=")+3).split("&")[0];
		document.getElementsByName("submit")[0].click();
	}
}


/**
 *
 * Handles all the overriding of the mainForm.
 *
 */
function mainFormOverride()
{
	let form = document.forms["mainForm"];
	
	form.addEventListener("submit", event => {
		event.preventDefault();

		if(disableSubmit) return;

		var data = {};
		
		data["formId"] = cookieValue("id");

		for(const input of form.elements)
		{
			if(input.nodeName === "INPUT")
			{
				data[input.name] = input.value;
			}
		}

		const req = new XMLHttpRequest();

		req.addEventListener("load", event => {
			if(event.target.status != 422)
			{
				form.parentNode.removeChild(form);
			}

			toggleLoader(false);
			disableSubmit = false;

			alert(event.target.responseText);
		});

		req.addEventListener("error", event => {
			console.log("There's been an error");
			console.log(event);
		});
		
		req.open("POST", window.location, true);

		req.setRequestHeader("Content-Type", "application/json");

		//console.log("Sending " + data);

		req.send(JSON.stringify(data));

		toggleLoader(true);
		disableSubmit = true;
	});
}

// Overrides all the forms and handles redirects once the window loads.
window.addEventListener("load", () => {

	document.forms["idGetter"].addEventListener("submit", idGetOverride);

	redirectedHandler();

	mainFormOverride();
});
