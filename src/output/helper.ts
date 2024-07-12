import { HTMLFontFace } from "jspdf";

export function parseFontFace(css: string): HTMLFontFace[] {
    const fontFaces: HTMLFontFace[] = []
    const fontFaceRegex = /@font-face\s*{([^}]*)}/g
    const propertyRegex = /\s*([\w-]+)\s*:\s*([^;}]+)(?:;|\s*$|\s*})/g
  
    let match
    while ((match = fontFaceRegex.exec(css)) !== null) {
        const fontFace: Partial<HTMLFontFace> = {
            src: []
        };
    
        const fontFaceContent = match[1]
        let propertyMatch
        while ((propertyMatch = propertyRegex.exec(fontFaceContent)) !== null) {
            const [, property, value] = propertyMatch
            switch (property) {
            case 'font-family':
                fontFace.family = value.replace(/['"]/g, '')
                break;
            case 'font-style':
                if (value === 'italic' || value === 'oblique' || value === 'normal') {
                    fontFace.style = value
                }
                break;
            case 'font-stretch':
                if (isValidStretch(value)) {
                    fontFace.stretch = value as HTMLFontFace['stretch']
                }
                break;
            case 'font-weight':
                if (isValidWeight(value)) {
                    fontFace.weight = parseWeight(value)
                }
                break;
            case 'src':
                const sources = value.split(',').map(src => src.trim())
                for (const source of sources) {
                    const urlMatch = source.match(/url\(['"]?(.+?)['"]?\)/)
                    const formatMatch = source.match(/format\(['"]?(.+?)['"]?\)/)
                    if (urlMatch && formatMatch && formatMatch[1].toLowerCase() === "ttf") {
                        fontFace.src!.push({
                            url: urlMatch[1],
                            format: 'truetype'
                        })
                    }
                }
                break
            }
        }
    
        if (fontFace.family && fontFace.src!.length > 0) {
            fontFaces.push(fontFace as HTMLFontFace)
        }
    }
  
    return fontFaces
}
  
function isValidStretch(value: string): boolean {
    return [
        "ultra-condensed", "extra-condensed", "condensed", "semi-condensed",
        "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded"
    ].includes(value)
}

function isValidWeight(value: string): boolean {
    return [
        "normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"
    ].includes(value) || (!isNaN(Number(value)) && Number(value) >= 100 && Number(value) <= 900)
}

function parseWeight(value: string): HTMLFontFace['weight'] {
    if (value === "normal") return "normal"
    if (value === "bold") return "bold"
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue >= 100 && numValue <= 900) {
        return numValue as HTMLFontFace['weight']
    }
    return value as HTMLFontFace['weight']
}