import mime from 'mime-types'

export function parseCookies(headers: string[]): {[key: string]: string} {
    let cookies: {[key: string]: string} = {}
    for (let i = 0; i < headers.length; i++) {
        const kv = headers[i].split(';')[0]
        const [name, value] = kv.split('=')

        cookies[name] = value
    }
    return cookies
}
  
export function sanitizePath(path: string): string {
    const parts = path.split('/');
  
    return parts.slice(3, parts.length).join('/');
}

export function sanitizeCssPath(path: string): string {
    const parts = path.split('/')
  
    return parts.slice(1, parts.length).join('/');
}