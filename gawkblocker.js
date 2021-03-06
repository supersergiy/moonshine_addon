var SM = (function () {

    var my = {};

    my.get = function (key) {
        return localStorage.getItem(key);
    }
    my.put = function (key, value) {
        return localStorage.setItem(key, value);
    }
    my.delete = function (key) {
        return localStorage.removeItem(key);
    }
    
    return my;

}());

var warningId = 'notification.warning';
var MOONSHINE_URL = "http://moonshine20.pspxthvkvp.us-west-2.elasticbeanstalk.com"//"http://moonshine.3gu38medap.us-west-2.elasticbeanstalk.com"

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

var GB = (function (SM) {
    var my = {};

    my.failedSearches = {}

    my.workSites = {
    }

    my.workTypes = ['developmentSites', 'researchSites', 'appSites', 'otherWorkSites']

    my.funSites = {
        "facebook.com"         : "string",
        "google.com"           : "string",
        "gmail.com"            : "string",
        "youtube.com"          : "string",
        "chrome:"              : "string"
    }

    my.couldBeBothSites = {
    }

    my.requestedSites = {
    }

    my.prefetchedSites = {
    }

    my.fetchedSites = {

    }

    my.exceptionSites = {
    }

    my.userName = "Default"

    if (!SM.get("funSites")) {
        SM.put("funSites", JSON.stringify(my.funSites))
    }
    else {
        my.funSites = JSON.parse(SM.get("funSites"))
    }
    console.log("funSites" + ": " + JSON.stringify(my.funSites))
  

    my.doesStringMatchList = function(s, list) {
        if (!s) {
            return "unseen"
        }
        for (item in list) {
            if (list[item] === "regex") {
                s_match = s.match("chrome:")
                i_match = item.match("chrome")

                if (i_match !== null) {
                    delete list[item]
                    list["chrome:"] = "chromeThing"

                    if (s_match && s_match.index === 0) {
                        return true;
                    }
                }
                else {
                    console.log("DEPRECATED REGEX IN A LIST: " + item)
                    console.log(item.match("chrome"))
                    console.log("chrome".match(item))
                }
            }
            else {
                item = extractDomain(item)
                match = s.replace(/http:\/\/|https:\/\//gi, "").match(item)

                if (match && match.index <= 4) {
                    return true;
                }
            }
        }
        return false;
    }

    my.getUrlPurpose = function(site) {
        if (my.doesStringMatchList(site, my.workSites) || my.doesStringMatchList(site, my.workSites) || my.doesStringMatchList(site, my.requestedSites)) {
            return "workSites";
        }
        else if (my.doesStringMatchList(site, my.funSites)) {
            return "funSites";
        }
        else if (my.doesStringMatchList(site, my.couldBeBothSites)) {
            return "couldBeBothSites"
        }
        else {
            return "unseen"
        }
    }

    my.getUrlSubtype = function(site) {
        if (my.getUrlPurpose(site) === "workSites"){
            console.log(extractDomain(site) + " " + my.workSites[extractDomain(site)])
            console.log(extractDomain in my.workSites)
            return my.workSites[extractDomain(site)]
        }
        else {
            return "notDefinedForFunSites"
        }
    }

    my.getUrlFetchStatus = function(site) {
        var purpose = my.getUrlPurpose(site);

        if (purpose === "funSites") {
            return "noNeed"
        }
        else if (my.doesStringMatchList(site, my.workSites)) {
            return "fetched"
        }
        else if (my.doesStringMatchList(site, my.requestedSites)) {
            return "requested"
        }
        else {
            return "missing"
        }
    }

    my.getUrlRedirection = function(site) {
        console.log("Checking redirection...")
        if (my.doesStringMatchList(site, my.fetchedSites) && !my.doesStringMatchList(site, my.exceptionSites) && my.getUrlSubtype[site] !== "string") {
            console.log("redirect url found: " + site)
            site_without_prefix = site.replace(/.*?:\/\//g, "");
            return "http://moonshine.cs.princeton.edu/" + site_without_prefix; //TODO: do this
        }
        else {
            //console.log(my.doesStringMatchList(site, my.prefetchedSites))
            //console.log(my.doesStringMatchList(site, my.exceptionSites))
        }
    }

    my.allowedToVisit = function(site) {
        var fetchStatus = my.getUrlFetchStatus(site)
        if (fetchStatus === "missing") {
            return false;
        }
        else {
            return true;
        }
    }

    my.sendUrlReport = function(site, kind, subtype) {
        console.log("Reporting url...")
        if (kind !== "webpage" && kind !== "content") {
            console.log("Bug detected! Kind is neither 'webpage' nor 'content'")
            return;
        }

        var fetchStatus = my.getUrlFetchStatus(site)
        if (fetchStatus === "requestedSites") {
            console.log("requested " + site + ", but already " + my.allowedToVisit(site))
        }
        else if (fetchStatus === "noNeed") {
            console.log("Bug detected! Trying to report website " + site + " with fetch status " + fetchStatus)
        }
        else {
            var xhr = new XMLHttpRequest();
            console.log("sending request for " + site)
            my.requestedSites[extractDomain(site)] = "string";

            request_report_url = MOONSHINE_URL + "/request_" + kind + "_url?user=" + JSON.stringify(my.userName) + "&url=" + encodeURIComponent(site) + "&subtype=" + JSON.stringify(subtype)
            xhr.open("GET", request_report_url, true);
            console.log(request_report_url)
            xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {
                // JSON.parse does not evaluate the attacker's scripts.
                //var resp = JSON.parse(xhr.responseText);
                console.log("Response: " + xhr.responseText)
              }
            }
            xhr.send();
        }
    }

    my.sendAccessReport = function (site, kind) {
        if (kind !== "webpage" && kind !== "content") {
            console.log("Bug detected! Kind is neither 'webpage' nor 'content'")
            return;
        }

        var xhr = new XMLHttpRequest();
        //console.log("sending request for " + site + " (" + kind + ")")
        my.requestedSites[extractDomain(site)] = "string";

        request_report_url = MOONSHINE_URL + "/access_" + kind + "_url?user=" + encodeURIComponent(my.userName) + "&url=" + encodeURIComponent(site)
        console.log(request_report_url)
        xhr.open("GET", request_report_url, true);
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            console.log("Response: " + xhr.responseText)
          }
        }
        xhr.send();
    }

    my.handleNewUrl = function (site, purpose, kind, subtype="string") {
        console.log("Handling new url ", site)
        if (purpose === "workSites") {
            my.workSites[extractDomain(site)] = subtype;
            my.sendUrlReport(site, kind, subtype)
        }
        else if (purpose === "funSites") {
            my.funSites[extractDomain(site)] = subtype;
            SM.put("funSites", JSON.stringify(my.funSites))
        }
        else if (purpose === "couldBeBothSites") {
            my.funSites[extractDomain(site)] = subtype;
            SM.put("funSites", JSON.stringify(my.funSites))
            my.sendUrlReport(site, kind, subtype)

        }
    }


    /*my.removeBlockedSite = function (site) {
        my.blockedSites = JSON.parse(SM.get("prefetchedSites"));
        delete my.blockedSites[site];
        SM.put("prefetchedSites", JSON.stringify(my.blockedSites));
    }*/

    my.updateFetchedList = function () {
        var xhr1 = new XMLHttpRequest();

        //send a request for fetch list
        xhr1.open("GET", MOONSHINE_URL + "/get_worklist", true);
        xhr1.onreadystatechange = function() {
          if (xhr1.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            console.log("New workSites: " + xhr1.responseText)
            my.workSites = JSON.parse(xhr1.responseText)
          }
        }
        xhr1.send();

        var xhr2 = new XMLHttpRequest();
        //send a request for exception list
        xhr2.open("GET", MOONSHINE_URL + "/get_exceptions", true);
        xhr2.onreadystatechange = function() {
          if (xhr2.readyState == 4) {
            console.log("New exceptionSites: " + xhr2.responseText)
            my.exceptionSites = JSON.parse(xhr2.responseText)
          }
        }
        xhr2.send();

        var xhr3 = new XMLHttpRequest();
        //send a request for exception list
        xhr3.open("GET", MOONSHINE_URL + "/get_fetchlist", true);
        xhr3.onreadystatechange = function() {
          if (xhr3.readyState == 4) {
            console.log("New fetchedSites: " + xhr3.responseText)
            my.fetchedSites = JSON.parse(xhr3.responseText)
          }
        }
        xhr3.send();
    }

    my.getUserName = function () {
        if (!SM.get("userName")) {
            my.userName = prompt("Please enter username", "GeorgeMartin");
            while (!/^[a-zA-Z]+$/.test(my.userName)) {
                my.userName = prompt("Please enter username (Please only use English letters)", "GeorgeMartin");
            }
            SM.put("userName", JSON.stringify(my.userName))
        }
        else {
            my.userName = JSON.parse(SM.get("userName"))
        }
    }



    return my;
}(SM));



