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

    my.workSites = {

    }

    my.funSites = {
        "facebook.com"         : "string",
        "google.com"           : "string",
        "gmail.com"            : "string",
        "youtube.com"          : "string",
        "^chrome:\/\/."        : "regex"
    }

    my.couldBeBothSites = {

    }

    my.requestedSites = {
    }

    my.prefetchedSites = {
    }

    my.allLists = {
        "workSites" : my.workSites, 
        "funSites"  : my.funSites, 
        "couldBeBothSites" : my.couldBeBothSites,
        "requestedSites" : my.requestedSites, 
        "prefetchedSites" : my.prefetchedSites
    }

    if (!SM.get("funSites")) {
        SM.put("funSites", JSON.stringify(my.funSites))
    }
    else {
        my.funSites = JSON.parse(SM.get("funSites"))
    }
    console.log("funSites" + ": " + JSON.stringify(my.funSites))
  
    
    my.doesStringMatchList = function(s, list) {
        for (item in list) {
            if (list[item] === "regex") {
                if (s.match(new RegExp(item))) {
                    return true;
                }
            }
            else if (list[item] === "string") {
                if (s.match(item)) {
                    return true;
                }
            }
            else {
                console.log("Unknown item type: " + list[item]);
            }
        }
        return false;
    }

    my.getUrlPurpose = function(site) {
        if (my.doesStringMatchList(site, my.workSites) || my.doesStringMatchList(site, my.prefetchedSites) || my.doesStringMatchList(site, my.requestedSites)) {
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

    my.getUrlFetchStatus = function(site) {
        var purpose = my.getUrlPurpose(site);

        if (purpose === "funSites") {
            return "noNeed"
        }
        else if (my.doesStringMatchList(site, my.prefetchedSites)) {
            return "fetched"
        }
        else if (my.doesStringMatchList(site, my.requestedSites)) {
            return "requested"
        }
        else {
            return "missing"
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

    my.sendUrlReport = function(site, kind) {
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

            xhr.open("GET", "http://moonshine.3gu38medap.us-west-2.elasticbeanstalk.com/request_" + kind + "_url?url=" + site, true);
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

        xhr.open("GET", "http://moonshine.3gu38medap.us-west-2.elasticbeanstalk.com/access_" + kind + "_url?url=" + site, true);

        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            //console.log("Response: " + xhr.responseText)
          }
        }
        xhr.send();
    }

    my.handleNewUrl = function (site, purpose, kind) {
        console.log("Handling new url ", site)
        if (purpose === "workSites") {
            my.workSites[extractDomain(site)] = "string";
            my.sendUrlReport(site, kind)
        }
        else if (purpose === "funSites") {
            my.funSites[extractDomain(site)] = "string";
            SM.put("funSites", JSON.stringify(my.funSites))
        }
        else if (purpose === "couldBeBothSites") {
            my.funSites[extractDomain(site)] = "string";
            SM.put("funSites", JSON.stringify(my.funSites))
            my.sendUrlReport(site, kind)

        }
    }


    /*my.removeBlockedSite = function (site) {
        my.blockedSites = JSON.parse(SM.get("prefetchedSites"));
        delete my.blockedSites[site];
        SM.put("prefetchedSites", JSON.stringify(my.blockedSites));
    }*/

    my.updateFetchedList = function () {
        var xhr = new XMLHttpRequest();

        xhr.open("GET", "http://moonshine.3gu38medap.us-west-2.elasticbeanstalk.com/get_worklist", true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            // JSON.parse does not evaluate the attacker's scripts.
            //var resp = JSON.parse(xhr.responseText);
            console.log("New prefetchedSites: " + xhr.responseText)
            my.prefetchedSites = JSON.parse(xhr.responseText)
          }
        }
        xhr.send();

        //flush out the fun sites to hardrive every time we update fetch list, so about every minute

    }


    return my;
}(SM));



