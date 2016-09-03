var tabs = {};
var count = 0;

// Get all existing tabs
chrome.tabs.query({}, function(results) {
    results.forEach(function(tab) {
        tabs[tab.id] = tab;
    });
});

blocked_requests_from_tab = {}

// Create tab event listeners
function onUpdatedListener(tabId, changeInfo, tab) {
    tabs[tab.id] = tab;
}
function onRemovedListener(tabId) {
    delete tabs[tabId];
}

// Subscribe to tab events
chrome.tabs.onUpdated.addListener(onUpdatedListener);
chrome.tabs.onRemoved.addListener(onRemovedListener);

/************************************************************/
/*******************Tab manager ends*************************/
/************************************************************/


console.log("Moonshine started!\n")
GB.updateFetchedList();
GB.getUserName();
console.log("Username is " + GB.userName)

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


ALARM_NAME = 'getNewListAlarm';
if (!chrome.alarms.get(ALARM_NAME, function(a) { })) {
        console.log(Date.now() + ": Alarm created");
        chrome.alarms.create(ALARM_NAME, {delayInMinutes: 1, periodInMinutes: 1});
        chrome.alarms.getAll(function(alarms) {
    });
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == ALARM_NAME) {
        GB.updateFetchedList();
        /*for (var tb in blocked_requests_from_tab) {
            console.log("Tab: " + tb )
            for (var tp in blocked_requests_from_tab[tb]) {
                console.log("type: " + tp)
                for (var dn in blocked_requests_from_tab[tb][tp]){
                    console.log("domain: " + dn + " hits: " + Object.size(blocked_requests_from_tab[tb][tp][dn]))
                }
            }
        }*/
        
    }
});



/*chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
    console.log("Url updated to " + changedInfo.url)
    if (changedInfo.url && GB.getUrlPurpose(changedInfo.url) === "workSites") {
        //console.log("Work access reported!")
       // GB.sendAccessReport(changedInfo.url, 'webpage') //send requests to prefetched content for analysis
    }
});*/

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    
    if (request.type === "purposeReport") {
        GB.handleNewUrl(request.domain, request.purpose, "webpage")
    }
    else if (request.type === "urlQuery") {
        response = {
                        allowedToVisit: GB.allowedToVisit(request.url), 
                        fetchStatus: GB.getUrlFetchStatus(request.url), 
                        purpose: GB.getUrlPurpose(request.url)
                    }

        if (response.allowedToVisit === true && response.purpose === "workSites") {
            redirectHere = GB.getUrlRedirection(request.url)
            if (redirectHere !== null) {
                response['redirectHere'] = redirectHere
            }
        }
        sendResponse(response);
    }

  });

function getDomain(url) {
  url = url.replace(/https?:\/\/(www.)?/i, '');
  if (url.indexOf('/') === -1) {
    return url;
  }

  return url.split('/')[0];
}

function reportSearchFail(tabid) {
    console.log("search failed from tab " + tabid)

    chrome.tabs.sendMessage(tabid, { text: "get_search_query" }, function(query) {
        console.log("Query: " + JSON.stringify(query))
        GB.failedSearches[query] =  new Date
        console.log(JSON.stringify(GB.failedSearches))
    });
}
setTimeout(function() {
    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            //console.log(JSON.stringify(details))
            if (details.tabId === -1 || tabs[details.tabId] === undefined) { //the background page can do whatever it wants
                return {};   
            }
            else {
                requesterUrl = tabs[details.tabId].url

                if (GB.getUrlPurpose(details.url) === "workSites" && details.type === "main_frame") {
                    GB.sendAccessReport(details.url, "webpage")
                    return {}
                }

                if (GB.getUrlPurpose(requesterUrl) === "workSites" && details.type !== "main_frame") {
                    GB.sendAccessReport(details.url, "content")
                    return {}
                }

                if (details.url === requesterUrl) {
                    return {}
                }
                else if  (GB.getUrlPurpose(requesterUrl) === "funSites" && details.type !== "main_frame") { //want to allow fun websites to pull in content
                    return {}
                }
                else if (GB.allowedToVisit(details.url) === true && GB.getUrlPurpose(details.url) === "workSites") { //want to allow pull anything that's allowed to be a new tab
                    if (details.type === "main_frame") {
                        GB.sendAccessReport(details.url, 'webpage') //send requests to prefetched content for analysis
                    }
                    else {
                        GB.sendAccessReport(details.url, 'content') 
                    }
                    
                    return {}
                }
                else if (GB.allowedToVisit(details.url) === false) {
                    if (details.type !== "image") {
                        //GB.handleNewUrl(details.url, "workSites", "content")
                        return {}
                    }
                    //GB.handleNewUrl(details.url, "work", "content")
                    //console.log(GB.getUrlPurpose(requesterUrl))
                    //console.log(requesterUrl + " request blocked")
                    if (blocked_requests_from_tab[details.tabId] === undefined) {
                        blocked_requests_from_tab[details.tabId] = {};
                    }
                    if (blocked_requests_from_tab[details.tabId][details.type] === undefined) {
                        blocked_requests_from_tab[details.tabId][details.type] = {}
                    }
                    if (blocked_requests_from_tab[details.tabId][details.type] === undefined) {
                        blocked_requests_from_tab[details.tabId][details.type] = {}
                    }
                    domain = getDomain(details.url)

                    if (blocked_requests_from_tab[details.tabId][details.type][domain] === undefined) {
                        blocked_requests_from_tab[details.tabId][details.type][domain] = {}
                    }

                    blocked_requests_from_tab[details.tabId][details.type][domain][details.url] = true;

                    return {cancel: true};
                }
            }
        },
        {urls: ["<all_urls>"]},
        ["blocking"]);
    }, 500);
  

chrome.tabs.onCreated.addListener(function (tab) {
    if (tab.openerTabId === -1 || tabs[tab.openerTabId] === undefined) {
        return;
    }
    else {
        openerUrl = tabs[tab.openerTabId].url
        if (GB.getUrlPurpose(openerUrl) === "funSites" && GB.getUrlPurpose(tab.ur) === "unseen") {
            GB.handleNewUrl(tab.url, "funSites", "webpage")
        }
        else {
            console.log("Opener that is " + GB.getUrlPurpose(openerUrl))
        }
    }
    console.log(JSON.stringify(tab))
})       


setTimeout(
        function() {
            chrome.webRequest.onCompleted.addListener(
                function (details) {
                    if (details.statusCode === 404 && details.type === "main_frame") {
                        url = details.url
                        if (url[url.length - 1] === '/') {
                            url.pop()
                        }

                        tokens = details.url.split('/')
                        last_token = tokens.pop()
                        redirect_to = tokens.join('/')
                        page = ""
                        hash = ""
                        if (last_token.split('#').length !== 1) {
                            hash_array = last_token.split('#')
                            hash = hash_array.pop()
                            page = hash_array.join('#')
                        }
                        else {
                            hash = ""
                            page = last_token
                        }

                        if (!page.endsWith(".html")) {
                            page = page + ".html"
                            redirect_to = redirect_to + '/' + page
                            if (hash !== "") {
                                redirect_to = redirect_to + '#' + hash
                            }
                            chrome.tabs.update(details.tabId, {url: redirect_to});
                        }
                    }
                }, 
                {urls: ["*://moonshine.cs.princeton.edu/*"]}
            );
        }, 
        500)

/*
chrome.tabs.onCreated.addListener(function(tab) {
    if (!GB.allowedToVisit(tab.url)) {
        console.log(changedInfo)        
        setTimeout(function(){chrome.tabs.executeScript(tab.id, {file: "script.js"});},500);
         
        GB.handleMissingUrl(tab.url); 
    }
});*/

  
