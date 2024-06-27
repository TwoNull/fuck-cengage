import axios from "axios"

const CENGAGE_APPID = "43a266a6-ff71-473d-896a-7b33b60f901c"

export async function getBookId(isbn: string) {
    const res = await axios.get(`https://hapi.hapicen.com/ap/books/appId/${CENGAGE_APPID}/reference/${isbn}?type=cengageISBN`)
    if (res.status === 200) {
        return res.data
    }
    return null
}

export async function getAuthorization(launchUrl: string) {
    let authHeader: string = ""
    let cookies: string[] = []

    function reqListener(details: chrome.webRequest.WebRequestHeadersDetails) {
        console.log(details)
        for(let i = 0; i < details.requestHeaders!.length; i++) {
            if (details.requestHeaders![i].name === "authorization") {
                authHeader = details.requestHeaders![i].value!
            }
        }
    }

    const tab = await chrome.tabs.create({ url: launchUrl })

    await new Promise<void>((resolve) => {
        chrome.webRequest.onSendHeaders.addListener(
            reqListener,
            { urls: ['https://ebooks.cenreader.com/v1/reader/users/get-cloudfront-signed-cookies'], tabId: tab.id },
            ['requestHeaders']
        )
        chrome.webRequest.onHeadersReceived.addListener(
            function resListener(details) {
                console.log(details)
                if (details.statusCode === 200) {
                    for(let i = 0; i < details.responseHeaders!.length; i++) {
                        if (details.responseHeaders![i].name === "Set-Cookie") {
                            cookies.push(details.responseHeaders![i].value!)
                        }
                    }
                    chrome.webRequest.onSendHeaders.removeListener(reqListener)
                    chrome.webRequest.onHeadersReceived.removeListener(resListener)
                    resolve()
                }
            },
            { urls: ['https://ebooks.cenreader.com/v1/reader/users/get-cloudfront-signed-cookies'], tabId: tab.id },
            ['responseHeaders','extraHeaders']
        )
    })
   
    await chrome.tabs.remove(tab.id!)

    return {auth: authHeader, cookies: cookies}
}

export async function getBookData(bookId: string, authorization: string) {
    const res = await axios.get('https://hapi.hapicen.com/v2/reader/books/store', {
        params: {
            'metaType': 'web',
            'app_studio_id': CENGAGE_APPID,
            'app_id': CENGAGE_APPID,
            'book_id': bookId
        },
        headers: {
            'Host': 'hapi.hapicen.com',
            'Connection': 'keep-alive',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'X-GT-Client-Name': 'wr3',
            'sec-ch-ua-mobile': '?0',
            'authorization': authorization,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'X-GT-Locale': 'en',
            'Accept': 'application/json, text/plain, */*',
            'X-GT-Client-Version': '6c15ed2',
            'sec-ch-ua-platform': '"macOS"',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://ebooks.cenreader.com/',
            'Accept-Language': 'en-US,en;q=0.9'
        },
    })
    if (res.status === 200) {
        return res.data
    }
    return null
}

export async function getStructure(kpId: string, signature: string, bookId: string, version: string, expiry: string) {
    const res = await axios.get(`https://dmklkswnvk9qg.cloudfront.net/content/${bookId}/${version}/book-encrypted/structure.json`, {
        params: {
          'Expires': expiry,
          'Key-Pair-Id': kpId,
          'Signature': signature,
        },
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'X-GT-Client-Name': 'wr3',
          'X-GT-Client-Version': '6c15ed2',
          'X-GT-Locale': 'en',
          'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"'
        }
    });      
    if (res.status === 200) {
        return res.data
    }
    return null
}

export async function getAsset(kpId: string, signature: string, policy: string, bookId: string, version: string, path: string) {
    const res = await axios.get(`https://ebooks.cenreader.com/v1/reader/stream/${bookId}/${version}/${path}`, {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Cookie': `CloudFront-Key-Pair-Id=${kpId}; CloudFront-Policy=${policy}; CloudFront-Signature=${signature}`,
            'Referer': 'https://ebooks.cenreader.com/',
            'Sec-Fetch-Dest': 'iframe',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        }
    });
    if (res.status === 200) {
        return res.data
    }
    return null
}