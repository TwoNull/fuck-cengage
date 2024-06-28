export function sanitizePath(path: string): string {
    const parts = path.split('/');
  
    return parts.slice(3, parts.length).join('/');
}

export function sanitizeCssPath(path: string): string {
    const parts = path.split('/')
  
    return parts.slice(1, parts.length).join('/');
}