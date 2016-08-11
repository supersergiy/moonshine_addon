
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


$(document).ready(function(){
    chrome.tabs.query(
      {currentWindow: true, active : true},
      function(tabArray) {

            var objTo = document.getElementById('container')
            
            var divtest = document.createElement("div");
            table = '<table cellspacing=\'0\' align="middle"><thead><tr> <th>Type</th> <th>Domain</th> <th>Count</th> <th>Request</th> </tr> <tbody>'

            blocked_requests = chrome.extension.getBackgroundPage().blocked_requests_from_tab[tabArray[0].id]
            console.log(JSON.stringify(blocked_requests))
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

            Object.keys(blocked_requests).forEach(function (tp) {
                Object.keys(blocked_requests[tp]).forEach(function (dn){
                    console.log(tp + " and " + dn)
                    objTo.querySelector("#" + buttonId[tp + dn]).addEventListener("click", function() {
                        chrome.extension.getBackgroundPage().GB.sendUrlReport(dn, "content")
                    })
                })
            })
            /*for (var tp in [].blocked_requests) {
                for (var dn in blocked_requests[tp]){
                    console.log(tp + " and " + dn)
                    count += 1
                    objTo.querySelector("#" + "reqButton" + tmp).addEventListener("click", function() {
                        console.log("HELLO HELLO " + tmp);
                        chrome.extension.getBackgroundPage().GB.sendUrlReport(dn)
                    })
                }
            }*/

        })
      }
    )
    