import { getAsset, getAuthorization, getBookData, getBookId, getStructure } from "./requests"
import { parseCookies } from "./helper"

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    asyncEventHandler(request, sendResponse)
    return true
})

async function asyncEventHandler(request: any, sendResponse: (response?: any) => void) {
    if (request.type == "getAuthorization") {
        try {
            const url = new URL(request.launchUrl)
            const isbn = url.searchParams.get("eISBN")
            const data = await getAuthorization(request.launchUrl)
            const cfCookies = parseCookies(data.cookies)
            const bookId = await getBookId(isbn!)
            const bookData = await getBookData(bookId, data.auth)
            const version = bookData[0].books[0].version
            const structure = await getStructure(cfCookies["CloudFront-Key-Pair-Id"], cfCookies["CloudFront-Signature"], cfCookies["CloudFront-Policy"], bookId, version, data.auth)
            sendResponse(structure)
        }
        catch (e) {
            console.log(e)
        }
    }
    if (request.type == "getAsset") {
        try {
            const res = await getAsset(request.kpId, request.signature, request.policy, request.bookId, request.version, request.path)
            sendResponse(res)
        }
        catch (e) {
            console.log(e)
            sendResponse(e)
        }
    }
}