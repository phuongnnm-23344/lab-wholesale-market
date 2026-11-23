// Soft guard against confirming the same 相対 trade twice (double Enter is common at the counter):
// remembers the last confirmed entry for a few minutes in this browser tab. Never blocks — the
// person is only asked once more.
type Entry = { lotId: string; buyerId: string; qty: string; price: string };

const KEY = "last-aitai-trade";
const WINDOW_MS = 5 * 60 * 1000;

const signature = (e: Entry) => [e.lotId, e.buyerId, Number(e.qty), Number(e.price)].join("|");

export function rememberLastTrade(entry: Entry) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ sig: signature(entry), at: Date.now() }));
  } catch {
    // storage blocked: the guard simply does not apply
  }
}

export function isRepeatOfLastTrade(entry: Entry): boolean {
  try {
    const last = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { sig: string; at: number } | null;
    return Boolean(last && last.sig === signature(entry) && Date.now() - last.at < WINDOW_MS);
  } catch {
    return false;
  }
}
