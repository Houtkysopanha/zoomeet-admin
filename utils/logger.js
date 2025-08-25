// Production-safe logging utility
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args)
  },
  
  info: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  }
}
