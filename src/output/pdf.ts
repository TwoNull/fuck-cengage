import jsPDF from 'jspdf'

export function generatePdf(src: string) {
    console.log("generating")
    const doc = new jsPDF({
        orientation: "p",
        unit: "px",
        format: "letter",
    })

    doc.html(src, {
        html2canvas: {
            width: 720,
            height: 930,
        },
        callback: function (doc) {
            const blob = doc.output("bloburl")
            chrome.tabs.create({url: blob.toString()})
        },
    })
}