async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

async function setCaseStatus(id, status) {
  await api(`/api/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note: `UI → ${status}` }),
  });
  await refresh();
}

function renderCases(cases) {
  const root = document.getElementById("cases");
  root.innerHTML = "";
  if (!cases.length) {
    root.append(el("div", "empty", "No cases. Ingest receipts or run seed."));
    return;
  }

  for (const c of cases) {
    const row = el("div", "row");
    row.append(el("div", `sev ${c.severity}`, c.severity));

    const body = el("div");
    body.append(el("div", "title", c.title));
    body.append(
      el(
        "div",
        "meta",
        `${c.ruleId} · ${c.playerId}${c.matchId ? " · " + c.matchId : ""} · ${c.receiptIds.length} receipts`
      )
    );

    const actions = el("div", "case-actions");
    for (const s of ["held", "needs_pov", "resolved", "dismissed"]) {
      const b = el("button", null, s);
      b.type = "button";
      b.addEventListener("click", () => setCaseStatus(c.id, s));
      actions.append(b);
    }
    body.append(actions);
    row.append(body);
    row.append(el("div", `status ${c.status}`, c.status));
    root.append(row);
  }
}

function renderReceipts(receipts) {
  const root = document.getElementById("receipts");
  root.innerHTML = "";
  const list = [...receipts].reverse();
  if (!list.length) {
    root.append(el("div", "empty", "No receipts yet."));
    return;
  }

  for (const r of list) {
    const row = el("div", "row receipt");
    row.append(el("div", "sev low", r.type));
    const body = el("div");
    body.append(el("div", "title", r.playerId));
    body.append(
      el(
        "div",
        "meta",
        `${r.id} · ${r.source}${r.matchId ? " · " + r.matchId : ""}${
          r.amountLamports != null ? " · " + r.amountLamports + " lamports" : ""
        }`
      )
    );
    row.append(body);
    row.append(el("div", "status", new Date(r.ts).toLocaleTimeString()));
    root.append(row);
  }
}

async function refresh() {
  const [health, cases, receipts] = await Promise.all([
    api("/api/health"),
    api("/api/cases"),
    api("/api/receipts"),
  ]);
  document.getElementById("stats").textContent =
    `${health.receipts} receipts · ${health.openCases} open / ${health.cases} cases`;
  renderCases(cases.cases);
  renderReceipts(receipts.receipts);
}

document.getElementById("btn-refresh").addEventListener("click", refresh);
document.getElementById("btn-rescan").addEventListener("click", async () => {
  const btn = document.getElementById("btn-rescan");
  btn.disabled = true;
  try {
    await api("/api/rescan", { method: "POST", body: "{}" });
    await refresh();
  } finally {
    btn.disabled = false;
  }
});

refresh().catch((err) => {
  document.getElementById("stats").textContent = err.message;
});
