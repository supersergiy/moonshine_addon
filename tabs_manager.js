/* 
 * --------------------------------------------------
 * Keep list of tabs outside of request callback
 * --------------------------------------------------
 */
 var tabManager = function () {
	var tabs = {};

	// Get all existing tabs
	chrome.tabs.query({}, function(results) {
	    results.forEach(function(tab) {
	        tabs[tab.id] = tab;
	    });
	});

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
}