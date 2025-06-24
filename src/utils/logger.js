/**
 * Structured Logger for Forge Apps
 * Provides consistent logging with context and structured data
 */
export class Logger {
  constructor(component) {
    this.component = component;
    this.logLevel = "info"; // Can be overridden by config
  }

  /**
   * Set log level dynamically
   */
  setLogLevel(level) {
    this.logLevel = level;
  }

  /**
   * Log levels in order of severity
   */
  static levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return Logger.levels[level] >= Logger.levels[this.logLevel];
  }

  /**
   * Format log message with structured data
   */
  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      component: this.component,
      message,
      ...data,
    };

    // For Forge, we'll use console with structured data
    return JSON.stringify(logEntry, null, 2);
  }

  /**
   * Debug level logging
   */
  debug(message, data = {}) {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, data));
    }
  }

  /**
   * Info level logging
   */
  info(message, data = {}) {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, data));
    }
  }

  /**
   * Warning level logging
   */
  warn(message, data = {}) {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, data));
    }
  }

  /**
   * Error level logging
   */
  error(message, data = {}) {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, data));
    }
  }

  /**
   * Log API calls for debugging
   */
  logApiCall(method, url, statusCode, duration, data = {}) {
    this.info("API Call", {
      api: {
        method,
        url,
        statusCode,
        duration: `${duration}ms`,
      },
      ...data,
    });
  }

  /**
   * Log AI model calls for analytics
   */
  logAICall(model, tokens, cost, duration, data = {}) {
    this.info("AI Model Call", {
      ai: {
        model,
        tokens,
        cost,
        duration: `${duration}ms`,
      },
      ...data,
    });
  }

  /**
   * Log user actions for analytics
   */
  logUserAction(action, userId, issueKey, data = {}) {
    this.info("User Action", {
      user: {
        action,
        userId,
        issueKey,
      },
      ...data,
    });
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext) {
    const childLogger = new Logger(`${this.component}.${additionalContext}`);
    childLogger.setLogLevel(this.logLevel);
    return childLogger;
  }

  /**
   * Static convenience method for quick logging
   */
  static error(message, data = {}) {
    const logger = new Logger("Global");
    logger.error(message, data);
  }

  static info(message, data = {}) {
    const logger = new Logger("Global");
    logger.info(message, data);
  }

  static warn(message, data = {}) {
    const logger = new Logger("Global");
    logger.warn(message, data);
  }
}
