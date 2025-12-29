const logger = {
  info: (message, meta) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  warn: (message) => {
    console.warn(`[WARN] ${message}`);
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta || '');
    }
  },
};

export default logger;

