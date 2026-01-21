export const formatAuthors = (authorsStr: string | string[] | undefined | null): string => {
  try {
    if (!authorsStr) return "Unknown Author";
    if (Array.isArray(authorsStr)) return authorsStr.join(", ");
    if (typeof authorsStr === 'string' && authorsStr.startsWith("[")) {
      return JSON.parse(authorsStr).join(", ");
    }
    return String(authorsStr);
  } catch (e) {
    return String(authorsStr);
  }
};

export const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (date: string | number | Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isFuture = (date: string | number | Date): boolean => {
  return new Date(date) > new Date();
};

export const proxyImage = (url: string | undefined | null): string => {
  if (!url) return '';
  if (url.includes('google.com')) {
    return `https://images-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=3600&url=${encodeURIComponent(url)}`;
  }
  return url;
};
