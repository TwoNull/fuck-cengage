import axios from "axios"

const CENGAGE_APPID = "43a266a6-ff71-473d-896a-7b33b60f901c"

export async function getBookId(isbn: string) {
    const res = await axios.get(`https://hapi.hapicen.com/ap/books/appId/${CENGAGE_APPID}/reference/${isbn}?type=cengageISBN`)
    if (res.status === 200) {
        return res.data
    }
    return null
}

export async function getBookData(bookId: string, auth: string) {
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
            'authorization': auth,
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

export async function getStructure(kpId: string, signature: string, policy: string, bookId: string, version: string, auth: string) {
    const res = await axios.get(`https://ebooks.cenreader.com/v1/reader/read/${bookId}/${version}/structure.json`, {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Cookie': `CloudFront-Key-Pair-Id=${kpId}; CloudFront-Policy=${policy}; CloudFront-Signature=${signature}`,
            'Referer': 'https://ebooks.cenreader.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'X-GT-Client-Name': 'wr3',
            'X-GT-Client-Version': '6c15ed2',
            'X-GT-Locale': 'en',
            'authorization': auth,
            'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
        }
    })
    if (res.status === 200) {
        return res.data
    }
    return null
}