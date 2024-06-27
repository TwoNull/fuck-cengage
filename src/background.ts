import { getAuthorization, getBookData, getBookId, getStructure } from "./requests"
import { parseCookie } from "./helper"

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.type == "getAuthorization") {
        try {
            const url = new URL(request.launchUrl)
            const isbn = url.searchParams.get("eISBN")
            const data = await getAuthorization(request.launchUrl)
            console.log(data)
            let cfCookies: {[key: string]: {value: string; expires: Date | null}} = {}
            for (let i = 0; i < data.cookies.length; i++) {
                const {name, value, expires} = parseCookie(data.cookies[i])
                cfCookies[name] = {value, expires}
            }
            console.log(cfCookies)
            const bookId = await getBookId(isbn!)
            console.log(bookId)
            const bookData = await getBookData(bookId, data.auth)
            console.log(bookData)
            const version = bookData[0].books[0].version
            console.log(version)
            const structure = await getStructure(cfCookies["CloudFront-Key-Pair-Id"].value, cfCookies["CloudFront-Signature"].value, bookId, version, Math.floor(cfCookies["CloudFront-Signature"].expires!.getTime() / 1000).toString())
            console.log(structure)
        }
        catch (e) {
            console.log(e)
        }
    }
    sendResponse();
})
