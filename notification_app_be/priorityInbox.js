const http = require("http");
const logger = require("../logging_middleware/logger");
const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzRnMWEzMzY3QHNyaXQuYWMuaW4iLCJleHAiOjE3ODAxMjA3MDgsImlhdCI6MTc4MDExOTgwOCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImFlNzg1YWFhLThhNTYtNDk0NS05YmNkLWE1NTRkNmFiOWM3NiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImtpcmFuIGt1bWFyIiwic3ViIjoiOGZhY2RlYjEtNDRkMS00YWVkLTlmNjgtMmE3ZGUyMDUzOWNhIn0sImVtYWlsIjoiMjM0ZzFhMzM2N0Bzcml0LmFjLmluIiwibmFtZSI6ImtpcmFuIGt1bWFyIiwicm9sbE5vIjoiMjM0ZzFhMzM2NyIsImFjY2Vzc0NvZGUiOiJTZGtqSkciLCJjbGllbnRJRCI6IjhmYWNkZWIxLTQ0ZDEtNGFlZC05ZjY4LTJhN2RlMjA1MzljYSIsImNsaWVudFNlY3JldCI6IlBaTmtycWNoS053WEV5eW4ifQ.xS67UkH0LGAutvNZFqDuXtb0nfPTK37dab_VWk5zZuI";
const TYPE_WEIGHT = {
  Placement: 30,
  Result: 20,
  Event: 10,
};
const TOP_N = 10;
const DECAY_INTERVAL_MS = 60 * 1000;
function fetchNotifications(url, token) {
  return new Promise((resolve, reject) => {
    logger.info(`Fetching notifications from: ${url}`);
    const options = {
      hostname: "4.224.186.213",
      path: "/evaluation-service/notifications",
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    http.request(options, (res) => {
      logger.info(`API Status Code: ${res.statusCode}`);
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error("Failed to parse response"));
        }
      });
    }).on("error", (err) => {
      logger.error(`Network error: ${err.message}`);
      reject(err);
    }).end();
  });
}
function scoreNotification(notif, now) {
  const typeWeight = TYPE_WEIGHT[notif.Type] ?? 0;
  const ageMs = now - new Date(notif.Timestamp);
  const ageIntervals = ageMs / DECAY_INTERVAL_MS;
  const recencyScore = 10 / (ageIntervals + 1);
  const total = typeWeight + recencyScore;
  logger.info(
    `Scored [${notif.ID.slice(0, 8)}] Type="${notif.Type}" weight=${typeWeight} recency=${recencyScore.toFixed(2)} total=${total.toFixed(2)}`
  );
  return total;
}
function getTopN(notifications, n) {
  logger.info(`Total notifications received: ${notifications.length}`);
  const now = new Date();
  const scored = notifications.map((notif) => ({
    ...notif,
    score: scoreNotification(notif, now),
  }));
  scored.sort((a, b) => b.score - a.score);
  logger.info(`Sorted. Picking top ${n}...`);
  return scored.slice(0, n);
}
function displayInbox(notifications) {
  logger.info("========================================");
  logger.info(`   PRIORITY INBOX — Top ${notifications.length} Notifications`);
  logger.info("========================================");
  notifications.forEach((notif, idx) => {
    const rank = String(idx + 1).padStart(2, "0");
    const time = new Date(notif.Timestamp).toLocaleString();
    logger.info(
      `#${rank} | [${notif.Type.padEnd(9)}] | Score: ${notif.score.toFixed(2)} | "${notif.Message}" | ${time}`
    );
  });
  logger.info("========================================");
}
async function main() {
  logger.info("=== Campus Priority Inbox — Stage 1 Started ===");
  try {
    const data = await fetchNotifications(API_URL, TOKEN);
    if (!data.notifications || !Array.isArray(data.notifications)) {
      logger.error(`Invalid API response: ${JSON.stringify(data)}`);
      process.exit(1);
    }
    const top = getTopN(data.notifications, TOP_N);
    displayInbox(top);
    logger.info("=== Stage 1 Complete ===");
  } catch (err) {
    logger.error(`Fatal: ${err.message}`);
    process.exit(1);
  }
}
main();