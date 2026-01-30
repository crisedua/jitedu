// Robust API retry logic with exponential backoff
export class APIRetryError extends Error {
  constructor(message, statusCode, retryAfter) {
    super(message);
    this.name = 'APIRetryError';
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const isRetryableError = (error) => {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes that should be retried
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error.statusCode);
};

export const parseAPIError = (error, response) => {
  let message = 'Error desconocido';
  let statusCode = 0;
  let retryAfter = null;
  
  if (response) {
    statusCode = response.status;
    retryAfter = response.headers.get('Retry-After');
    
    switch (statusCode) {
      case 401:
        message = 'Clave API inválida o expirada';
        break;
      case 403:
        message = 'Acceso denegado. Verifica tus permisos de API';
        break;
      case 429:
        message = 'Límite de peticiones alcanzado. Intenta más tarde';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'Error del servidor. Reintentando automáticamente...';
        break;
      default:
        message = `Error HTTP ${statusCode}`;
    }
  } else if (error.name === 'TypeError') {
    message = 'Error de conexión. Verifica tu internet';
  }
  
  return new APIRetryError(message, statusCode, retryAfter);
};