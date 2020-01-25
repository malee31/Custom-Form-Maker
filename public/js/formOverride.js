var canPost = true;

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

			document.cookie = "id=" + data.id;

			console.log("Sending for Inputs from Id: " + JSON.stringify(data));

			req.send(JSON.stringify(data));
		}
	});


	let form = document.forms["mainForm"];
	
	form.addEventListener("submit", event => {
		event.preventDefault();

		var data = {};
		
		//var cookie = document.cookie;
		
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
