chrome.webRequest.onSendHeaders.addListener(async function(details){
    let url_pattern = "https://api.azrbac.mspim.azure.com/api/v2/privilegedAccess/";
    
    if(details.url.startsWith(url_pattern)){
        let header = details.requestHeaders
        let auth = header.find(x => x.name.toLowerCase() == "authorization");
        if (auth && auth.value){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                        message: "copyText",
                        textToCopy: auth.value
                    }, function(response) {})
            });
        }
    }
}, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders"]);