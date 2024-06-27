import jsPDF from 'jspdf'
import { sanitizePath } from '../helper'
import { getAsset } from '../requests'

export class Builder {
    private kpId: string
    private signature: string
    private policy: string
    private bookId: string
    private version: string
    private assetCache: {[key: string]: string}
    private pages: Document[]

    constructor(kpId: string, signature: string, policy: string, bookId: string, version: string) {
        this.kpId = kpId
        this.signature = signature
        this.policy = policy
        this.bookId = bookId
        this.version = version
        this.assetCache = {}
        this.pages = []
    }

    async generate() {
        console.log("generating")

        const doc = new jsPDF({
            orientation: "p",
            unit: "px",
            format: "letter",
        })
    
        doc.html(this.pages[0].documentElement, {
            html2canvas: {
                width: 2550,
                height: 3000,
                windowWidth: 2550,
                windowHeight: 3000
            },
            windowWidth: 2550,
            width: 2550,
            callback: function (doc) {
                const blob = doc.output("bloburl")
                chrome.tabs.create({url: blob.toString()})
            },
        })
    }

    async addPage(src: string) {
        let dom = new DOMParser().parseFromString(src, "text/html")

        // retrieve css
        let links = dom.getElementsByTagName("link")
        for (const l in links) {
            if (this.assetCache[links[l].href] === undefined) {
                const original = await getAsset(this.kpId, this.signature, this.policy, this.bookId, this.version, sanitizePath(links[l].href))
                const processed = await this.processStylesheet(original)
                const url = URL.createObjectURL(new Blob([processed]))
                this.assetCache[links[l].href] = url
            }
            links[l].href = this.assetCache[links[l].href]
        }

        // retrieve images
        let imgs = dom.getElementsByTagName("img")
        for (const i in imgs) {
            if (this.assetCache[imgs[i].src] === undefined) {
                const imgAsset = await getAsset(this.kpId, this.signature, this.policy, this.bookId, this.version, sanitizePath(imgs[i].src))
                const url = URL.createObjectURL(new Blob([imgAsset]))
                this.assetCache[imgs[i].src] = url
            }
            imgs[i].src = this.assetCache[imgs[i].src]
        }

        this.pages.push(dom)
    }

    private async processStylesheet(
        stylesheet: string,
    ): Promise<string> {
        const urlRegex = /url\(['"]?([^'"()]+)['"]?\)/g
        const matches = stylesheet.matchAll(urlRegex)
        let lastIndex = 0
        let result = ''
      
        for (const match of matches) {
            const [fullMatch, url] = match
            const { index } = match

            const s = url.split(".")
            if (s[s.length-1] === "woff" || s[s.length-1] === "ttf" || s[s.length-1] === "eot") continue

            if (index === undefined) continue
            
            result += stylesheet.slice(lastIndex, index)
            
            if (this.assetCache[url] != undefined) {
                const newAsset = await getAsset(this.kpId, this.signature, this.policy, this.bookId, this.version, sanitizePath(url))
                const processedUrl = URL.createObjectURL(new Blob([newAsset]))
                this.assetCache[url] = processedUrl
            }
            result += `url(${this.assetCache[url]})`
        
            lastIndex = index + fullMatch.length
        }
        result += stylesheet.slice(lastIndex)
        return result;
    }
}