
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


//chrome.tabs.query({active: true}, function (id){     
        //blocked_requests = chrome.extension.getBackgroundPage().blocked_requests_from_tab[id[0].id]
       // tableCreate2();
       //var table=document.createElement("table"); 
       /*var my_table = "<table cellspacing='0'> <thead><tr><th>Type</th><th>Domain</th><th>Count</th></tr></thead>";
       my_table += "<tbody>"


        //for (var i = 0; i < 4; i++) {
            //for (var dn in blocked_requests[tp]){
                //my_table += "<tr>"
                //my_table += "<td>" + i + "</td>"
                //my_table += "<td>" + i + "</td>"
                //my_table += "<td>" + i + "</td>"
                //my_table += "</tr>"
            //}
        //}

        for (var tp in blocked_requests) {
            for (var dn in blocked_requests[tp]){
                my_table += "<tr>"
                my_table += "<td>" + tp + "</td>"
                my_table += "<td>" + dn + "</td>"
                my_table += "<td>" + Object.size(blocked_requests[tp][dn]) + "</td>"
                my_table += "</tr>"
            }
        }


        my_table += "<\/tbody>"
        my_table += "<\/table>"
        document.write(my_table)

table += "<tr>"
                    table += "<td>" + tp + "</td>"
                    table += "<td>" + dn + "</td>"
                    table += "<td>" + Object.size(blocked_requests[tp][dn] + "</td>"
                    table += "</tr>"

        */
    //}
//);

tmp = chrome.extension.getBackgroundPage().count
chrome.extension.getBackgroundPage().count = tmp + 1

// Uncomment when want +request+ buttons
/*
$(document).ready(function(){
    chrome.tabs.query(
      {currentWindow: true, active : true},
      function(tabArray) {
            setTimeout(function() {
                var objTo = document.getElementById('container')
                
                var divtest = document.createElement("div");
                table = '<table cellspacing=\'0\' align="middle"><thead><tr> <th>Type</th> <th>Domain</th> <th>Count</th> <th>Request</th> </tr> <tbody>'

                blocked_requests = chrome.extension.getBackgroundPage().blocked_requests_from_tab[tabArray[0].id]
                if (blocked_requests !== undefined){
                    var count = 0
                    var buttonId = {}
                    for (var tp in blocked_requests) {
                        for (var dn in blocked_requests[tp]){
                            count += 1
                            table += "<tr>"
                            table += "<td>" + tp + "</td>"
                            table += "<td>" + dn + "</td>"
                            table += "<td>" + Object.size(blocked_requests[tp][dn]) + "</td>"
                            table += "<td>" + '<button id="' + "reqButton" + count + '" class="requestButton">Request</button>' + "</td>"
                            table += "</tr>"
                            buttonId[tp + dn] = "reqButton" + count
                        }
                    }


                    table += '</tbody></table>'
                    divtest.innerHTML = table
                    objTo.appendChild(divtest)
                    
                    count = 0
                    console.log(chrome.extension.getBackgroundPage().blocked_requests_from_tab)
                    Object.keys(blocked_requests).forEach(function (tp) {
                        Object.keys(blocked_requests[tp]).forEach(function (dn){
                            console.log(tp + " and " + dn)
                            objTo.querySelector("#" + buttonId[tp + dn]).addEventListener("click", function() {
                                chrome.extension.getBackgroundPage().GB.sendUrlReport(dn, "content")
                            })
                        })
                    })
               
                }

            }, 300)
        })
      }
    )*/

$(document).ready(function(){
    chrome.tabs.query(
      {currentWindow: true, active : true},
      function(tabs) {
        var objTo = document.getElementById('dynamic_placeholder')        
        var divtest = document.createElement("div");
        content_html = ""

        if (tabs[0].url.startsWith("http://moonshine.cs.princeton.edu")) {
            if (tabs[0].url.startsWith("http://moonshine.cs.princeton.edu/www.google.com")){
                content_html = '<br><a class="myButton" id="not_found_button">' + "Can't find what I want" + '</a><br><br>'

                divtest.innerHTML = content_html
                objTo.appendChild(divtest)

                objTo.querySelector("#not_found_button").addEventListener("click", function() {
                    chrome.extension.getBackgroundPage().reportSearchFail(tabs[0].id)
                    window.close()
                })

            }
            else{
                content_html = ""    
                button_list = ["Webpage Absent", "Corrupted Content", "Not Work Related", "Ive done this before", "Other Problem"]

                for (i = 0; i < button_list.length; i++) {
                    curr_button = button_list[i]
                    content_html += '<a class="myButton" id="' + curr_button.replace(new RegExp(' ', 'g'), "") + '">' + curr_button + '</a><br><br>'
                }
                
                divtest.innerHTML = content_html
                objTo.appendChild(divtest)

                console.log(objTo.querySelector("exception_buttons"))
                for (i = 0; i < button_list.length; i++){
                    key = button_list[i].replace(new RegExp(' ', 'g'), "")
                    console.log("#" + key)
                    objTo.querySelector("#" + key).addEventListener("click", function() {
                        reportPageProblem(key)
                        window.close()
                    })

                }
            }
        }
        else{ 
            chrome.runtime.sendMessage({type: "urlQuery", url: tabs[0].url}, function(response) {
                if (response.purpose != "workSites") {
                    content_html += "<h2>Report Needed External Content</h2>"
                    content_html += "<select>"

                    for (failed_query in chrome.extension.getBackgroundPage().GB.failedSearches){
                        content_html += "<option>" + failed_query + "</opiton>"
                    }

                    content_html += "</select>"
                    content_html += '<a class="myButton" id=SubmitMissing>' + "Submit" + '</a><br><br>'
                    divtest.innerHTML = content_html
                    objTo.appendChild(divtest)
                    objTo.querySelector("#" + "SubmitMissing").addEventListener("click", function() {
                        reportNeededExternalContent(tabs[0].url)
                        window.close()
                    })
                }
                else {
                    content_html += "<h2>Current Webpage is classified as Work</h2>"
                    divtest.innerHTML = content_html
                    objTo.appendChild(divtest)
                }
                
            });
        }

   })
})

var MOONSHINE_URL = "http://moonshine20.pspxthvkvp.us-west-2.elasticbeanstalk.com"//"http://moonshine.3gu38medap.us-west-2.elasticbeanstalk.com"
function extractDomain(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];

    return domain;
}

function reportPageProblem(errorCode) {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {
        curr_url = tabs[0].url.replace("http://moonshine.cs.princeton.edu/", "");
        tab_id = tabs[0].id

        var xhr = new XMLHttpRequest();
        console.log("sending exception report for " + extractDomain(curr_url))

        xhr.open("GET", MOONSHINE_URL + "/add_exception?url=" + curr_url + "&reason=" + errorCode, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            chrome.extension.getBackgroundPage().GB.exceptionSites[curr_url] = errorCode;
            console.log(curr_url)
            chrome.tabs.update(tab_id, {url: "http://" + curr_url});
            
          }
        }
        xhr.send();
    });
}

function reportNeededExternalContent(url) {
    var xhr = new XMLHttpRequest();
    console.log("sending needed content report for " + extractDomain(url))

    xhr.open("GET", MOONSHINE_URL + "/add_exception?url=" + curr_url + "&reason=" + errorCode, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        chrome.extension.getBackgroundPage().GB.exceptionSites[curr_url] = errorCode;
        console.log(curr_url)
        chrome.tabs.update(tab_id, {url: "http://" + curr_url});
        
      }
    }
    xhr.send();
}






