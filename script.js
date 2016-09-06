console.log(document.domain)

var tabId;
chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
    console.log(res.tabId);
});


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log("!!!!" + msg)
})

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.text && (msg.text === "get_search_query")) {
        /* Call the specified callback, passing 
           the web-pages DOM content as argument */

    	sendResponse($("input[type='text']")[0].value);
    }
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.text && request.text === "aks_user_for_purpose") {
		    displayPurposeQuestionBox()
		}
	})


function displayPurposeQuestionBox() {
	window.stop();
	console.log("Displaying purpose box...")

	var horrible_popup_html = '<font size=40><b>Moonshine Alert:</b><br></font>You have visited an unfeteched webpage from <br><font color="red">' + document.domain + '</font><br>Is this webpage work related?<br>'
	work_buttons = {'developmentSites': 'Software Development', 'researchSites': 'Open Ended Research', 'appSites': 'Web Applications', 'otherWorkSites': 'Other Work'}


	for (b_id in work_buttons) {
		horrible_popup_html += '<button id="' + b_id + '" class="sergiy_popup_button" style="width:200px">' + work_buttons[b_id] + '</button>'
	}
	horrible_popup_html += '<button id="funSites" class="sergiy_popup_button" style="background-color:#ffb3b3">Not Work Related</button>'

	
	document.write('<div><dialog class="sergiy_popup_window">' + horrible_popup_html + '</div></dialog>')

	var dialog = ""
	if (!document.querySelector("dialog")) {

		var myDialog = document.createElement("dialog"); 
		myDialog.className = 'sergiy_popup_window';

        document.appendChild(myDialog);
        dialog = document.querySelector("dialog")
        
    }
    else {
		dialog = document.querySelector("dialog")
    }

    document.querySelector("dialog").innerHTML = horrible_popup_html


	var dialog = document.querySelector("dialog")
	

	dialog.querySelector("#" + 'researchSites').addEventListener("click", function() { 
		chrome.runtime.sendMessage({type: "purposeReport", purpose: "workSites", domain: document.domain, subtype: 'researchSites'}, function(response) {})
	    console.log(b_id + " reported");
	    dialog.close()
	    setTimeout(function() {location.replace(document.URL)}, 300)
	})

	dialog.querySelector("#" + 'appSites').addEventListener("click", function() { 
		chrome.runtime.sendMessage({type: "purposeReport", purpose: "workSites", domain: document.domain, subtype: 'appSites'}, function(response) {})
	    console.log(b_id + " reported");
	    dialog.close()
	    setTimeout(function() {location.replace(document.URL)}, 300)
	})

	dialog.querySelector("#" + 'otherWorkSites').addEventListener("click", function() { 
		chrome.runtime.sendMessage({type: "purposeReport", purpose: "workSites", domain: document.domain, subtype: 'otherWorkSites'}, function(response) {})
	    console.log(b_id + " reported");
	    dialog.close()
	    setTimeout(function() {location.replace(document.URL)}, 300)
	})

	dialog.querySelector("#" + 'developmentSites').addEventListener("click", function() { 
		chrome.runtime.sendMessage({type: "purposeReport", purpose: "workSites", domain: document.domain, subtype: 'developmentSites'}, function(response) {})
	    console.log(b_id + " reported");
	    dialog.close()
	    setTimeout(function() {location.replace(document.URL)}, 300)
	})

	dialog.querySelector("#funSites").addEventListener("click", function() {
		console.log("funSites reported");
		chrome.runtime.sendMessage({type: "purposeReport", purpose: "funSites", domain: document.domain, subtype: null}, function(response) {})
	    dialog.close()
	    setTimeout(function() {location.replace(document.URL)}, 300)
	})
	

	dialog.showModal()
}

chrome.runtime.sendMessage({type: "urlQuery", url: document.URL}, function(response) {
	//if (response.purpose === "workSites") {
	//	chrome.extension.getBackgroundPage().GB.sendAccessReport(document.url, "webpage")
	//}
	console.log("Purpose of this page: " + JSON.stringify(response))
	

	if (false && response.allowedToVisit === false && response.fetchStatus !== "requested") {
		displayPurposeQuestionBox()
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





