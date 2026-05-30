"use client";
import { useEffect, useState } from "react";
import {
  Box, Container, Typography, Chip, Tab, Tabs,
  CircularProgress, Select, MenuItem, FormControl,
  InputLabel,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 30,
  Result: 20,
  Event: 10,
};

const TYPE_COLOR: Record<string, "error" | "warning" | "success"> = {
  Placement: "error",
  Result: "warning",
  Event: "success",
};

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
  score?: number;
}

function scoreNotification(notif: Notification): number {
  const typeWeight = TYPE_WEIGHT[notif.Type] ?? 0;
  const ageMs = Date.now() - new Date(notif.Timestamp).getTime();
  const ageMinutes = ageMs / 60000;
  return typeWeight + 10 / (ageMinutes + 1);
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("All");
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const url = filter === "All"
          ? "/api/notifications?limit=50"
          : `/api/notifications?limit=50&notification_type=${filter}`;
        const res = await fetch(url);
        const data = await res.json();
        const scored = (data.notifications || []).map((n: Notification) => ({
          ...n,
          score: scoreNotification(n),
        }));
        setNotifications(scored);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchData();
  }, [filter]);

  function markViewed(id: string) {
    setViewed((prev) => new Set([...prev, id]));
  }

  const priorityList = [...notifications]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topN);

  const displayList = tab === 0 ? notifications : priorityList;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", color: "white", pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#1e293b", px: 3, py: 2, display: "flex", alignItems: "center", gap: 2, boxShadow: 3 }}>
        <NotificationsIcon sx={{ color: "#38bdf8", fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: "#38bdf8" }}>
          Campus Notifications
        </Typography>
        <Chip
          label={`${notifications.filter(n => !viewed.has(n.ID)).length} New`}
          color="error"
          size="small"
          sx={{ ml: "auto" }}
        />
      </Box>

      <Container maxWidth="md" sx={{ mt: 3 }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 2,
            "& .MuiTab-root": { color: "#94a3b8" },
            "& .Mui-selected": { color: "#38bdf8" },
            "& .MuiTabs-indicator": { bgcolor: "#38bdf8" },
          }}
        >
          <Tab label="All Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Priority Inbox" icon={<StarIcon />} iconPosition="start" />
        </Tabs>

        {/* Controls */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: "#94a3b8" }}>Filter Type</InputLabel>
            <Select
              value={filter}
              label="Filter Type"
              onChange={(e) => setFilter(e.target.value)}
              sx={{ color: "white", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" } }}
            >
              {["All", "Placement", "Result", "Event"].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {tab === 1 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: "#94a3b8" }}>Top N</InputLabel>
              <Select
                value={topN}
                label="Top N"
                onChange={(e) => setTopN(Number(e.target.value))}
                sx={{ color: "white", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" } }}
              >
                {[5, 10, 15, 20].map((n) => (
                  <MenuItem key={n} value={n}>Top {n}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Notification List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress sx={{ color: "#38bdf8" }} />
          </Box>
        ) : displayList.length === 0 ? (
          <Typography sx={{ color: "#94a3b8", textAlign: "center", mt: 6 }}>
            No notifications found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {displayList.map((notif, idx) => {
              const isNew = !viewed.has(notif.ID);
              return (
                <Box
                  key={notif.ID}
                  onClick={() => markViewed(notif.ID)}
                  sx={{
                    bgcolor: isNew ? "#1e293b" : "#0f172a",
                    border: `1px solid ${isNew ? "#38bdf8" : "#334155"}`,
                    borderRadius: 2,
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "#1e3a5f" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                    {tab === 1 && (
                      <Typography sx={{ color: "#38bdf8", fontWeight: 700, minWidth: 32 }}>
                        #{idx + 1}
                      </Typography>
                    )}
                    <Chip label={notif.Type} color={TYPE_COLOR[notif.Type] ?? "default"} size="small" />
                    {isNew && (
                      <Chip label="NEW" size="small" sx={{ bgcolor: "#38bdf8", color: "#0f172a", fontWeight: 700 }} />
                    )}
                    {tab === 1 && (
                      <Chip
                        label={`Score: ${notif.score?.toFixed(1)}`}
                        size="small"
                        variant="outlined"
                        sx={{ color: "#94a3b8", borderColor: "#334155", ml: "auto" }}
                      />
                    )}
                  </Box>
                  <Typography fontWeight={isNew ? 600 : 400} sx={{ color: isNew ? "white" : "#94a3b8" }}>
                    {notif.Message}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                    {new Date(notif.Timestamp).toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}