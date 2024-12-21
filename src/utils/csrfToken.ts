
export const getCsrfToken = (): string => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || '';
  };
  
export const setCsrfToken = (token: string): void => {
    document.cookie = `csrftoken=${token}; path=/; SameSite=Lax`;
  };