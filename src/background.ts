import { getAuthorization, getBookData, getBookId, getStructure } from "./requests"
import { parseCookies } from "./helper"

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.type == "getAuthorization") {
        try {
            const url = new URL(request.launchUrl)
            const isbn = url.searchParams.get("eISBN")
            const data = await getAuthorization(request.launchUrl)
            console.log(data)
            const cfCookies = parseCookies(data.cookies)
            console.log(cfCookies)
            const bookId = await getBookId(isbn!)
            console.log(bookId)
            const bookData = await getBookData(bookId, data.auth)
            console.log(bookData)
            const version = bookData[0].books[0].version
            console.log(version)
            const structure = await getStructure(cfCookies["CloudFront-Key-Pair-Id"], cfCookies["CloudFront-Signature"], cfCookies["CloudFront-Policy"], bookId, version, data.auth)
            console.log(structure)
        }
        catch (e) {
            console.log(e)
        }
    }
    sendResponse();
})

