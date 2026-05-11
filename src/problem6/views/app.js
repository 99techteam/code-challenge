import { connect, JSONCodec } from "https://esm.sh/nats.ws@1.29.2";

const $ = (id) => document.getElementById(id);
const jc = JSONCodec();
const scores = new Map();
const seenEvents = new Set();
const pendingClicks = new Map();
let nc = null;

const apiUrl = `${location.origin}/api`;
const natsUrl = `ws://${location.hostname}:8080`;

const adjectives = ["swift","brave","calm","bold","keen","lucky","witty","silent","bright","sly","fierce","mighty","jolly","quick","sharp"];
const animals = ["fox","tiger","otter","wolf","panda","hawk","koala","lynx","raven","eagle","bear","cobra","whale","crane","yak"];
const randomName = () =>
  `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${animals[Math.floor(Math.random() * animals.length)]}-${Math.floor(Math.random() * 1000)}`;

const seedNames = () => {
  const names = new Set();
  while (names.size < 10) names.add(randomName());
  let order = 0;
  for (const name of names) {
    scores.set(name, { score: 0, firstAt: order++, bumped: false });
  }
};

const setStatus = (text, cls = "") => {
  $("statusText").textContent = text;
  $("status").className = `status ${cls}`;
};

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const render = () => {
  const top = [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score || a[1].firstAt - b[1].firstAt)
    .slice(0, 10);

  const tbody = $("rows");
  const medal = ["gold", "silver", "bronze"];
  const live = nc !== null;

  tbody.innerHTML = top
    .map(([user, { score, bumped }], i) => `
      <tr class="${medal[i] ?? ""} ${bumped ? "bump" : ""}">
        <td class="rank">${i + 1}</td>
        <td class="user">${escapeHtml(user)}</td>
        <td class="score">${score}</td>
        <td class="action"><button data-user="${escapeHtml(user)}"${live ? "" : " disabled"}>+1</button></td>
      </tr>
    `)
    .join("");
};

const bumpUser = (user) => {
  const entry = scores.get(user) ?? { score: 0, firstAt: Date.now(), bumped: false };
  entry.score += 1;
  entry.bumped = true;
  scores.set(user, entry);
  render();
  setTimeout(() => {
    const e = scores.get(user);
    if (e) { e.bumped = false; render(); }
  }, 1);
};

const onScore = async (user) => {
  if (!nc) return;
  bumpUser(user);
  pendingClicks.set(user, (pendingClicks.get(user) ?? 0) + 1);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "score", prefix: user }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.executionId) throw new Error(data.error ?? "submit failed");
  } catch (err) {
    setStatus(`submit failed: ${err.message}`, "err");
  }
};

const handleEvent = (e) => {
  if (seenEvents.has(e.executionId)) return;
  seenEvents.add(e.executionId);

  const user = e.prefix;
  if (!user || user === "default") return;

  const pending = pendingClicks.get(user) ?? 0;
  if (pending > 0) {
    pendingClicks.set(user, pending - 1);
    return;
  }
  bumpUser(user);
};

const consume = async () => {
  const sub = nc.subscribe("executions.>");
  for await (const m of sub) {
    try { handleEvent(jc.decode(m.data)); } catch (err) { console.error(err); }
  }
};

const doConnect = async () => {
  try {
    nc = await connect({ servers: natsUrl });
    setStatus("live", "ok");
    render();
    consume();
    nc.closed().then((err) => {
      setStatus(`disconnected${err ? ": " + err.message : ""}`, "err");
      nc = null;
      render();
    });
  } catch (err) {
    setStatus(`offline: ${err.message}`, "err");
  }
};

$("rows").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-user]");
  if (btn && !btn.disabled) onScore(btn.dataset.user);
});

seedNames();
render();
doConnect();
