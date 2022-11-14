
console.log('PIM TOKEN GRABBER LOADED');

chrome.runtime.onMessage.addListener( // this is the message listener
    function(request, sender, sendResponse) {
        console.log('TOKEN GRABBER : message received')
        if (request.message === "copyText"){
            let token = request.textToCopy.split(" ")[1];
            console.log('TOKEN GRABBER : remove bearer and copy token to clipboard')
            copyToTheClipboard(token);
        }   
        return true;
    }
);


async function copyToTheClipboard(textToCopy){
    const el = document.createElement('textarea');
    el.value = textToCopy;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

