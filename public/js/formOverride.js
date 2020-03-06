var canPost = true;
var disableSubmit = false;
toggleLoader(false);

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

window.addEventListener("load", () => {
	let idGet = document.forms["idGetter"];

	idGet.addEventListener("submit", event => {
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
					loadInputs(event.target.response);
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
		}
	});


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
});
