import jsPDF from 'jspdf'

export class Builder {
    private pages: Document[]

    constructor() {
        this.pages = []
    }

    async generate() {
        console.log("generating")

        const doc = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "letter",
        })
    
        doc.html(this.pages[0].documentElement, {
            margin: [10, 0, 10, 0],
            html2canvas: {
                allowTaint: true,
                useCORS: true,
            },
            width: 215.9,
            windowWidth: 900,
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
        for (const d in details) {
            details[d].remove()
        }

        this.pages.push(dom)
    }
}