function loadInputs(inputIds)
{
	console.log(inputIds);
}

window.addEventListener("load", () => {

	let idGet = document.forms["idGetter"];

	idGet.addEventListener("submit", event => {
		event.preventDefault();
		
		const req = new XMLHttpRequest();

		req.addEventListener("load", event => {
			loadInputs(event.target.responseText);
		});

		req.addEventListener("error", event => {
			console.log("There's been an error");
			console.log(event);
		});
		
		req.open("POST", window.location, true);

		req.setRequestHeader("Content-Type", "application/json");

		const data = {"id": document.getElementsByName("sheetId")[0].value};

		console.log("Sending for Inputs " + JSON.stringify(data));

		req.send(JSON.stringify(data));
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
