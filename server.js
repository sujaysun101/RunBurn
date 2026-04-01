require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { expressWebhookHandler } = require("./handlers/workflow-run");
const { getServiceRoleClient } = require("./services/db");
const { getMonthlySpend } = require("./services/cost-calculator");
const { queue } = require("./services/queue");

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({
  verify: (req, _res, buffer) => {
    req.rawBody = buffer;
  }
}));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "runburn-api"
  });
});

app.get("/api/installations/:installationId/spend/:month", async (req, res) => {
  try {
    const supabase = await getServiceRoleClient();
    const totals = await getMonthlySpend(supabase, req.params.installationId, req.params.month);
    res.json({ data: totals });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.post("/webhook", async (req, res) => {
  await expressWebhookHandler(req, res);
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

app.listen(port, () => {
  queue.start();
  console.log(`[runburn] api listening on port ${port}`);
});
