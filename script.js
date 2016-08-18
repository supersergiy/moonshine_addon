//console.log(JSON.stringify(document.body.))


chrome.runtime.sendMessage({type: "urlQuery", url: document.URL}, function(response) {
	//if (response.purpose === "workSites") {
	//	chrome.extension.getBackgroundPage().GB.sendAccessReport(document.url, "webpage")
	//}
	console.log("Purpose of this page: " + response.purpose)
	

	if (response.allowedToVisit === false && response.fetchStatus !== "requested") {
		window.stop();

		var horrible_popup_html = '<div><dialog class="sergiy_popup_window"><font size=40><b>Moonshine Alert:</b><br></font>You have visited an unfeteched webpage from <br><font color="red">' + document.domain + '</font><br>Is this webpage work related?<br><button id="work" class="sergiy_popup_button" style="width:200px">Work Related</button><button id="notWork" class="sergiy_popup_button" style="background-color:#ffb3b3">Not Work Related</button><br><button id="couldBeBoth" class="sergiy_popup_button" style="background-color:#FFFF66">Could be both</button></dialog></div>'
		
		document.write(horrible_popup_html)

		var dialog = ""
		if (!document.querySelector("dialog")) {

			var myDialog = document.createElement("dialog"); 
			myDialog.className = 'sergiy_popup_window';

	        document.appendChild(myDialog);
	        dialog = document.querySelector("dialog")
	        
	    }
	    else {
	    	console.log("Here: " + JSON.stringify(document.querySelector("dialog")))
	    	
			dialog = document.querySelector("dialog")
	    }

	    console.log("dialog " + document.querySelector("dialog").innerHTML)
	    document.querySelector("dialog").innerHTML = '<font size="40"><b>Moonshine Alert:</b><br></font>You have visited an unfeteched webpage from <br><font color="red">' + document.domain + '</font><br>Is this webpage work related?<br><button id="work" class="sergiy_popup_button" style="width:200px">Work Related</button><button id="notWork" class="sergiy_popup_button" style="background-color:#ffb3b3">Not Work Related</button><br><button id="couldBeBoth" class="sergiy_popup_button" style="background-color:#FFFF66">Could be both</button>'


		var dialog = document.querySelector("dialog")
		
		dialog.querySelector("#work").addEventListener("click", function() { 
			chrome.runtime.sendMessage({type: "purposeReport", purpose: "workSites", domain: document.domain}, function(response) {})
		    console.log("Work reported");
		    dialog.close()
		    setTimeout(function() {location.replace(document.URL)}, 300)
		})
		dialog.querySelector("#notWork").addEventListener("click", function() {
			console.log("Not work reported");
			chrome.runtime.sendMessage({type: "purposeReport", purpose: "funSites", domain: document.domain}, function(response) {})
		    dialog.close()
		    setTimeout(function() {location.replace(document.URL)}, 300)
		})
		dialog.querySelector("#couldBeBoth").addEventListener("click", function() {
			console.log("couldBeBoth reported");
			chrome.runtime.sendMessage({type: "purposeReport", purpose: "couldBeBothSites", domain: document.domain}, function(response) {})
		    dialog.close()
		    setTimeout(function() {location.replace(document.URL)}, 300)
		})

		dialog.showModal()
	}
	else if (response.fetchStatus === "requested" && false) {
		window.stop();
		document.write('<div><dialog class="sergiy_popup_window"><font size=40><b>Moonshine Alert:</b><br></font>This webpage has been requested from the Admin. Please try again later.</dialog></div>')
		var dialog = document.querySelector("dialog")
		dialog.showModal()
	}
	else {
		console.log("Moonshine: URL approved!");
		
		if (response.redirectHere !== undefined) {
			window.stop();
			console.log("redirecting to " + JSON.stringify(response.redirectHere));
			setTimeout(function() {location.replace(response.redirectHere)}, 1)
		}

	}
})





