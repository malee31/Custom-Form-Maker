var canPost = true;

function loadInputs(ids)
{
	//Don't ask, I don't know either because the first parse gives typeof string while the second is object
	//Welp, with responseType="json", no need to parse twice anymore
	//const inputIds = JSON.parse(JSON.parse(ids));

	const inputIds = JSON.parse(ids);

	const mainForm = document.getElementsByName("mainForm")[0];

	const submitButton = document.getElementsByName("mainSubmit")[0];
	submitButton.removeAttribute("hidden");
	for(const index in inputIds)
	{
		var newInput = document.createElement("INPUT");
		var text = inputIds[index];
		newInput.setAttribute("name", sheetFormatHeaders(text));
		newInput.setAttribute("placeholder", text);
		newInput.setAttribute("type", "text");
		mainForm.insertBefore(newInput, submitButton);
	}
	console.log(inputIds);
	deleteIdGetter();
}

function sheetFormatHeaders(header)
{
	var formatted = header.toLowerCase().replace(/\s/g, "").replace(/\W/g, "").replace(/_/g, "");
	for(var i= 0; i < header.length; i++)
	{
		if(!isNaN(parseInt(formatted.substring(0, 1))))
		{
			formatted = formatted.substring(1);
		}
		else
		{
			break;
		}
	}
	return formatted;
}

function deleteIdGetter()
{
	const idGetter = document.getElementById("getId");
	idGetter.parentNode.removeChild(idGetter);
}

window.addEventListener("load", () => {

	let idGet = document.forms["idGetter"];

	idGet.addEventListener("submit", event => {
		event.preventDefault();
		
		if(canPost)
		{
			canPost = false;

			const req = new XMLHttpRequest();

			req.addEventListener("load", event => {
				if(event.target.status != 200)
				{
					canPost = true;
				}
				else
				{
					loadInputs(event.target.response);
				}
			});

			req.addEventListener("onerror", event => {
				console.log("There's been an error");
				console.log(event);
				canPost = true;
			});
		
			req.onerror = (err) => {
				console.log(err);
				canPost = true;
			}

			req.open("POST", window.location, true);

			req.responseType = "json";

			req.setRequestHeader("Content-Type", "application/json");

			const data = {"id": document.getElementsByName("sheetId")[0].value};

			console.log("Sending for Inputs from Id: " + JSON.stringify(data));

			req.send(JSON.stringify(data));
		}
	});


	let form = document.forms["mainForm"];
	
	form.addEventListener("submit", event => {
		event.preventDefault();

		var data = {};

		for(const input of form.elements)
		{
			if(input.nodeName === "INPUT")
			{
				data[input.name] = input.value;
			}
		}

		const req = new XMLHttpRequest();

		req.addEventListener("load", event => {
			alert(event.target.responseText);
		});

		req.addEventListener("error", event => {
			console.log("There's been an error");
			console.log(event);
		});
		
		req.open("POST", window.location, true);

		req.setRequestHeader("Content-Type", "application/json");

		console.log("Sending " + data);

		req.send(JSON.stringify(data));

		form.parentNode.removeChild(form);
	});
});
