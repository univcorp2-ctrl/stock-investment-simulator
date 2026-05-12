import express from "express";
import { fetchStooqHistory, normalizeStooqSymbol } from "./stooq";
import { isValidIsoDate, todayIso, yearsAgoIso } from "./validation";

const app = express();
const port = Number(process.env.PORT ?? 3001);

function readQuery(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/history", async (request, response) => {
  try {
    const symbol = readQuery(request.query.symbol) ?? "AAPL.US";
    const from = readQuery(request.query.from) ?? yearsAgoIso(5);
    const to = readQuery(request.query.to) ?? todayIso();

    if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
      response.status(400).json({ error: "from and to must be ISO dates like 2020-01-01" });
      return;
    }

    if (from > to) {
      response.status(400).json({ error: "from must be earlier than or equal to to" });
      return;
    }

    const normalizedSymbol = normalizeStooqSymbol(symbol);
    const prices = await fetchStooqHistory(normalizedSymbol, from, to);

    if (prices.length === 0) {
      response.status(404).json({ error: `No price data found for ${normalizedSymbol}` });
      return;
    }

    response.json({ symbol: normalizedSymbol.toUpperCase(), from, to, prices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(502).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
