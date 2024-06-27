export function parseCookie(setCookieHeader: string): { name: string; value: string; expires: Date | null } {
    const parts = setCookieHeader.split(';').map(part => part.trim());
    const [nameValue, ...attributes] = parts;
  
    const [name, value] = nameValue.split('=');
    let expires: Date | null = null;
  
    for (const attr of attributes) {
      if (attr.toLowerCase().startsWith('expires=')) {
        const dateString = attr.split('=')[1];
        console.log(dateString)
        expires = new Date(dateString);
        break;
      }
    }
  
    return { name, value, expires };
  }
  