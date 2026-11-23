// ============================================================
// n8n Code Node: Step 2 - Validate GitHub Webhook Signature
// ============================================================
// n8n 2.x sandbox blocks both require() and globalThis.crypto
// → Pure JavaScript HMAC-SHA256 implementation, no modules needed
//
// NOTE ON RAW BODY:
// Preferred fix: In the Webhook node → Options → Raw Body: Enable
// → $input.first().json.rawBody will then contain the exact bytes
// If not enabled, the re-serialize fallback below works in most
// cases (preserves JSON key order as sent by GitHub).
// ============================================================

const WEBHOOK_SECRET = '';

// ── Pure JS SHA-256 ─────────────────────────────────────────

const SHA256_K = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
];

function sha256Bytes(data) {
  // data: Uint8Array → returns Uint8Array (32 bytes)
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const len = data.length;
  const blocks = Math.ceil((len + 9) / 64);
  const padded = new Uint32Array(blocks * 16);

  for (let i = 0; i < len; i++) {
    padded[i >> 2] |= data[i] << (24 - (i & 3) * 8);
  }
  padded[len >> 2] |= 0x80 << (24 - (len & 3) * 8);
  padded[blocks * 16 - 1] = len * 8; // bit length (fits 32 bits for payloads < 512MB)

  let h0=0x6a09e667, h1=0xbb67ae85, h2=0x3c6ef372, h3=0xa54ff53a;
  let h4=0x510e527f, h5=0x9b05688c, h6=0x1f83d9ab, h7=0x5be0cd19;

  for (let b = 0; b < blocks; b++) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) w[i] = padded[b * 16 + i];
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i-15],7) ^ rotr(w[i-15],18) ^ (w[i-15]>>>3);
      const s1 = rotr(w[i-2],17) ^ rotr(w[i-2],19)  ^ (w[i-2]>>>10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }

    let a=h0, b_=h1, c=h2, d=h3, e=h4, f=h5, g=h6, h=h7;

    for (let i = 0; i < 64; i++) {
      const S1  = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
      const ch  = (e & f) ^ (~e & g);
      const t1  = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0  = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
      const maj = (a & b_) ^ (a & c) ^ (b_ & c);
      const t2  = (S0 + maj) | 0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b_; b_=a; a=(t1+t2)|0;
    }

    h0=(h0+a)|0; h1=(h1+b_)|0; h2=(h2+c)|0; h3=(h3+d)|0;
    h4=(h4+e)|0; h5=(h5+f)|0;  h6=(h6+g)|0; h7=(h7+h)|0;
  }

  const out = new Uint8Array(32);
  [h0,h1,h2,h3,h4,h5,h6,h7].forEach((v,i) => {
    out[i*4]   = (v>>>24)&0xFF;
    out[i*4+1] = (v>>>16)&0xFF;
    out[i*4+2] = (v>>>8) &0xFF;
    out[i*4+3] =  v      &0xFF;
  });
  return out;
}

function strToUtf8(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80)       bytes.push(c);
    else if (c < 0x800) bytes.push((c>>6)|0xC0, (c&0x3F)|0x80);
    else                bytes.push((c>>12)|0xE0, ((c>>6)&0x3F)|0x80, (c&0x3F)|0x80);
  }
  return new Uint8Array(bytes);
}

function hmacSHA256Hex(key, message) {
  const BLOCK = 64;
  let k = strToUtf8(key);
  const m = strToUtf8(message);

  if (k.length > BLOCK) k = sha256Bytes(k);

  const ipad = new Uint8Array(BLOCK);
  const opad = new Uint8Array(BLOCK);
  for (let i = 0; i < BLOCK; i++) {
    ipad[i] = (i < k.length ? k[i] : 0) ^ 0x36;
    opad[i] = (i < k.length ? k[i] : 0) ^ 0x5C;
  }

  const inner = new Uint8Array(BLOCK + m.length);
  inner.set(ipad); inner.set(m, BLOCK);

  const innerHash = sha256Bytes(inner);
  const outer = new Uint8Array(BLOCK + 32);
  outer.set(opad); outer.set(innerHash, BLOCK);

  return Array.from(sha256Bytes(outer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── Main ───────────────────────────────────────────────────

const item = $input.first();
const headers = item.json.headers;
const body = item.json.body;

const signatureHeader = headers['x-hub-signature-256'];
if (!signatureHeader) {
  throw new Error('Security: Missing x-hub-signature-256 header');
}

// Resolve raw body in priority order
let rawBody;
if (item.json.rawBody) {
  rawBody = item.json.rawBody;
} else {
  // Fallback: re-serialize (works when JSON key order is preserved as-sent by GitHub)
  rawBody = JSON.stringify(body);
}

const expectedSig = 'sha256=' + hmacSHA256Hex(WEBHOOK_SECRET, rawBody);

if (!timingSafeEqual(signatureHeader, expectedSig)) {
  throw new Error('Security: Invalid webhook signature - request rejected');
}

return [{
  json: {
    headers,
    body,
    eventType: headers['x-github-event'],
    delivery: headers['x-github-delivery'],
  }
}];
