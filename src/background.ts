import { getAuthorization } from "./requests"

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.type == "getAuthorization") {
        try {
            const data = await getAuthorization(request.launchUrl)
            console.log(data)
        }
        catch (e) {
            console.log(e)
        }
    }
    sendResponse();
})