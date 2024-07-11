import jsPDF, { HTMLFontFace } from 'jspdf'
import { parseFontFace } from './helper'
import { PDFDocument } from 'pdf-lib'

export class Builder {
    private pages: Document[]
    private fontCache: {[key: string]: HTMLFontFace[]}

    constructor() {
        this.pages = []
        this.fontCache = {}
    }

    async generate() {
        const fonts = Object.values(this.fontCache).flat()
        
        const mergedPdf = await PDFDocument.create()
        for (let i = 0; i < this.pages.length; i++) {
            await new Promise<void>((resolve) => {
                const doc = new jsPDF({
                    orientation: "p",
                    unit: "mm",
                    format: "letter",
                })
                doc.html(this.pages[i].documentElement, {
                    margin: [10, 0, 10, 0],
                    width: 215.9,
                    windowWidth: 900,
                    fontFaces: fonts,
                    autoPaging: "text",
                    callback: async function (doc) {
                        const arrayBuffer = doc.output("arraybuffer")
                        const pdf = await PDFDocument.load(arrayBuffer)
                        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
                        copiedPages.forEach((page) => {
                            mergedPdf.addPage(page)
                        })
                        resolve()
                    },
                })
            })
        }

        const bytes = await mergedPdf.save()
        const url = URL.createObjectURL(new Blob([bytes]))
        window.open(url, '_blank')!.focus()
    }

    async generateSingle() {
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

    async addPage(src: string, href: string) {
        let dom = new DOMParser().parseFromString(src, "text/html")

        // forge location
        let base = dom.createElement("base")
        base.href = href

        let head = dom.head
        head.prepend(base)

        // strip details
        let details = dom.getElementsByTagName("details")
        for (let i = details.length - 1; i >= 0; i--) {
            details[i].remove();
        }

        // replace small caps
        let smallcaps = dom.getElementsByClassName("smallcaps") as any
        for (let i = smallcaps.length - 1; i >= 0; i--) {
            smallcaps[i].className = ""
            try {
                smallcaps[i].style = "text-transform: uppercase"
            } catch {
                console.log("error inline styling element")
            }
        }

        // get fonts
        let links = dom.getElementsByTagName("link")
        for (const l in links) {
            if (links[l].rel === "stylesheet") {
                if (this.fontCache[links[l].href] === undefined) {
                    const stylesheet = await (await fetch(links[l].href)).text()
                    this.fontCache[links[l].href] = parseFontFace(stylesheet)
                }
            }
        }

        this.pages.push(dom)
    }
}