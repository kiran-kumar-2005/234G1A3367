const fs = require("fs");
const path = require("path");
const logFile = path.join(__dirname, "app.log");
function formatLog(level, message) {
  return `[${new Date().toISOString()}] [${level}] ${message}\n`;
}
const logger = {
  info: (message) => {
    const log = formatLog("INFO", message);
    process.stdout.write(log);
    fs.appendFileSync(logFile, log);
  },
  warn: (message) => {
    const log = formatLog("WARN", message);
    process.stdout.write(log);
    fs.appendFileSync(logFile, log);
  },
  error: (message) => {
    const log = formatLog("ERROR", message);
    process.stderr.write(log);
    fs.appendFileSync(logFile, log);
  },
};
module.exports = logger;