chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    asyncEventHandler(request, sendResponse)
    return true
})

async function asyncEventHandler(request: any, sendResponse: (response?: any) => void) {
    if (request.type == "openBook") {
        try {
            await openBook(request.launchUrl)
            sendResponse()
        }
        catch (e) {
            console.log(e)
        }
    }
}

async function openBook(launchUrl: string) {
    const tab = await chrome.tabs.create({ url: launchUrl })
    const url = new URL(launchUrl)
    const isbn = url.searchParams.get("eISBN")

    await new Promise<void>((resolve) => {
        chrome.webRequest.onCompleted.addListener(
            function listener(details) {
                if (details.statusCode === 200) {
                    const injectionScript = (eISBN: string) => {
                        const script = document.createElement("script")
                        script.src = chrome.runtime.getURL("js/content.js")

                        let mountPoint = document.createElement("div")
                        mountPoint.id = "contentroot"
                        document.body.insertAdjacentElement("afterbegin", mountPoint)

                        script.onload = () => {
                            window.renderContent(eISBN)
                        }

                        document.body.appendChild(script)
                    }
                
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id!},
                        func: injectionScript,
                        args: [isbn!],
                    })
    
                    chrome.webRequest.onCompleted.removeListener(listener)
                    resolve()
                }
            },
            { urls: ['https://ebooks.cenreader.com/v1/reader/*.html'], tabId: tab.id },
        )
    })
}