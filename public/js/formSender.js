/*window.addEventListener("load", () => {
	for(let form of document.getElementsByTagName("form"))
	{
		form.addEventListener("submit", event => {
			event.preventDefault();

			const req = new XMLHttpRequest();
			const data = new FormData(form);

			req.addEventListener("load", event => {
				alert(event.target.responseText);
			});

			req.addEventListener("error", event => {
				console.log("There's been an error");
				console.log(event);
			});

			req.open("POST", window.location);
			
			console.log("Sending data")
			console.log(data);

			req.send(data);
		});
	}
});*/

window.addEventListener("load", () => {
	
	let form = document.forms["mainForm"];

	form.addEventListener("submit", event => {
		event.preventDefault();

		var data = {};

		console.log(form.elements);

		for(const input of form.elements)
		{
			if(input.nodeName === "INPUT")
			{
				data[input.name] = input.value;
				console.log("yay");
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

		console.log("Sending data");

		console.log(data);

		req.send(JSON.stringify(data));

		form.parentNode.removeChild(form);
	});
});
