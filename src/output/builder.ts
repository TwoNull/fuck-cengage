import jsPDF, { HTMLFontFace } from 'jspdf'
import { parseFontFace } from './helper'

export class Builder {
    private pages: Document[]
    private fontCache: {[key: string]: HTMLFontFace[]}

    constructor() {
        this.pages = []
        this.fontCache = {}
    }

    async generate() {
        console.log("generating")
        console.log(this.pages[0].documentElement)

        const fonts = Object.values(this.fontCache).flat()

        const doc = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "letter",
        })
    
        doc.html(this.pages[0].documentElement, {
            margin: [10, 0, 10, 0],
            width: 215.9,
            windowWidth: 900,
            fontFaces: fonts,
            autoPaging: "text",
            callback: function (doc) {
                console.log("done")
                const blob = doc.output("bloburl")
                console.log(blob.toString())
                window.open(blob, '_blank')!.focus()
            },
        })
    }

    async addPage(src: string) {
        let dom = new DOMParser().parseFromString(src, "text/html")

        // forge location
        let base = dom.createElement("base")
        base.href = "https://ebooks.cenreader.com/v1/reader/stream/86f62498-13f4-4c7a-805c-4c1eab84115b/14/content/bd_ch_25_sect_02_01.html"

        let head = dom.head
        head.prepend(base)

        // strip details
        let details = dom.getElementsByTagName("details")
        for (let i = details.length - 1; i >= 0; i--) {
            details[i].remove();
        }

        // get fonts
        let links = this.pages[0].getElementsByTagName("link")
        for (const l in links) {
            if (links[l].rel === "stylesheet") {
                if (this.fontCache[links[l].href] === undefined) {
                    const stylesheet = await (await fetch(base.href + "/../" + links[l].href)).text()
                    this.fontCache[links[l].href] = parseFontFace(stylesheet)
                }
            }
        }

        this.pages.push(dom)
    }
}