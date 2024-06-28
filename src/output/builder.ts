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
            unit: "px",
            format: "letter",
        })

        console.log(this.pages[0].URL)

        console.log(this.pages[0].location)

        console.log(this.pages[0].documentElement)
    
        doc.html(this.pages[0].documentElement, {
            html2canvas: {
                allowTaint: true,
                useCORS: true,
                width: 2550,
                height: 3000,
                windowWidth: 2550,
                windowHeight: 3000
            },
            windowWidth: 2550,
            width: 2550,
            callback: function (doc) {
                console.log("done")
                doc
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
        head.appendChild(base)

        this.pages.push(dom)
    }
}