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
    const result: string[] = [];
  
    for (const part of parts) {
        if (part === '..') {
            result.pop();
        } else if (part !== '.') {
            result.push(part);
        }
    }
  
    return result.join('/');
}
  