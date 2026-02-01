import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// CONFIGURATION
// ============================================

// Rate limiting
const RATE_LIMIT = 60; // 60 requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute window

// Ban duration (24 hours)
const BAN_DURATION_MS = 24 * 60 * 60 * 1000;

// Rate limit violations before auto-ban
const RATE_LIMIT_STRIKES = 3;

// Secret bypass key (add ?bypass=YOUR_SECRET to unban yourself)
const BYPASS_SECRET = "aira-owner-2024";

// Whitelisted IPs (owner IPs - never ban these)
const WHITELISTED_IPS: string[] = [
  // Add your home/office IPs here if known
];

// ============================================
// IN-MEMORY STORES
// ============================================

// Rate limiting store
const ipStore = new Map<string, { count: number; start: number }>();

// Banned IPs store
const bannedIPs = new Map<string, { timestamp: number; reason: string }>();

// Rate limit strike counter (for repeat offenders)
const rateLimitStrikes = new Map<string, number>();

// ============================================
// CLOUD PROVIDER CIDR BLOCKS (Attack sources)
// These are commonly abused hosting providers
// ============================================
const BLOCKED_CIDRS = [
  // OVH (France) - Heavily abused for attacks
  "51.38.0.0/16", "51.68.0.0/16", "51.75.0.0/16", "51.77.0.0/16", "51.79.0.0/16",
  "51.83.0.0/16", "51.89.0.0/16", "51.91.0.0/16", "51.161.0.0/16", "51.178.0.0/16",
  "51.195.0.0/16", "51.210.0.0/16", "51.222.0.0/16", "54.36.0.0/16", "54.37.0.0/16",
  "54.38.0.0/16", "54.39.0.0/16", "135.125.0.0/16", "139.99.0.0/16", "141.94.0.0/16",
  "141.95.0.0/16", "144.217.0.0/16", "145.239.0.0/16", "147.135.0.0/16", "149.56.0.0/16",
  "158.69.0.0/16", "164.132.0.0/16", "167.114.0.0/16", "176.31.0.0/16", "178.32.0.0/16",
  "188.165.0.0/16", "192.95.0.0/16", "192.99.0.0/16", "198.27.0.0/16", "198.50.0.0/16",

  // Hetzner (Germany) - Common attack source
  "5.9.0.0/16", "23.88.0.0/16", "46.4.0.0/16", "78.46.0.0/16", "78.47.0.0/16",
  "85.10.0.0/16", "88.99.0.0/16", "88.198.0.0/16", "94.130.0.0/16", "95.216.0.0/16",
  "95.217.0.0/16", "116.202.0.0/16", "116.203.0.0/16", "135.181.0.0/16", "136.243.0.0/16",
  "138.201.0.0/16", "142.132.0.0/16", "144.76.0.0/16", "148.251.0.0/16", "157.90.0.0/16",
  "159.69.0.0/16", "162.55.0.0/16", "167.235.0.0/16", "168.119.0.0/16", "176.9.0.0/16",
  "178.63.0.0/16", "188.40.0.0/16", "195.201.0.0/16", "213.133.0.0/16", "213.239.0.0/16",

  // Contabo (Germany)
  "5.189.128.0/17", "62.171.128.0/17", "66.94.96.0/19", "79.143.176.0/20",
  "89.163.128.0/17", "161.97.0.0/16", "167.86.64.0/18", "178.238.224.0/20",
  "193.164.128.0/18", "194.163.128.0/18", "207.180.192.0/18",

  // DigitalOcean
  "45.55.0.0/16", "64.227.0.0/16", "67.205.128.0/17", "68.183.0.0/16",
  "104.131.0.0/16", "104.236.0.0/16", "107.170.0.0/16", "128.199.0.0/16",
  "134.122.0.0/16", "134.209.0.0/16", "137.184.0.0/16", "138.68.0.0/16",
  "138.197.0.0/16", "139.59.0.0/16", "142.93.0.0/16", "143.110.0.0/16",
  "143.198.0.0/16", "146.190.0.0/16", "157.230.0.0/16", "157.245.0.0/16",
  "159.65.0.0/16", "159.89.0.0/16", "159.203.0.0/16", "161.35.0.0/16",
  "164.90.0.0/16", "165.22.0.0/16", "165.227.0.0/16", "167.71.0.0/16",
  "167.172.0.0/16", "174.138.0.0/16", "178.62.0.0/16", "178.128.0.0/16",
  "188.166.0.0/16", "206.81.0.0/16", "206.189.0.0/16",

  // Linode
  "45.33.0.0/16", "45.56.64.0/18", "45.79.0.0/16", "50.116.0.0/16",
  "69.164.192.0/18", "74.207.224.0/19", "96.126.96.0/19", "97.107.128.0/17",
  "139.144.0.0/16", "139.162.0.0/16", "143.42.0.0/16", "172.104.0.0/15",
  "173.230.128.0/17", "173.255.192.0/18", "178.79.128.0/17", "198.58.96.0/19",

  // Vultr
  "45.32.0.0/16", "45.63.0.0/17", "45.76.0.0/15", "64.176.0.0/16",
  "66.42.32.0/19", "78.141.192.0/18", "95.179.128.0/17", "104.156.224.0/19",
  "108.61.0.0/16", "136.244.64.0/18", "139.180.128.0/17", "140.82.0.0/16",
  "144.202.0.0/16", "149.28.0.0/16", "149.248.0.0/16", "155.138.128.0/17",
  "167.179.64.0/18", "207.148.64.0/18", "209.250.224.0/19", "216.128.128.0/17",

  // Alibaba Cloud
  "8.208.0.0/12", "47.74.0.0/15", "47.88.0.0/14", "47.92.0.0/14",
  "101.132.0.0/14", "106.14.0.0/15", "112.124.0.0/14", "114.55.0.0/16",
  "115.28.0.0/15", "116.62.0.0/15", "118.31.0.0/16", "119.23.0.0/16",
  "120.24.0.0/14", "120.55.0.0/16", "120.76.0.0/14", "121.40.0.0/14",
  "139.196.0.0/14", "139.224.0.0/14", "140.205.0.0/16", "182.92.0.0/16",

  // Tencent Cloud
  "43.129.0.0/16", "43.130.0.0/15", "43.132.0.0/14", "43.136.0.0/13",
  "49.51.0.0/16", "62.234.0.0/16", "81.68.0.0/14", "101.32.0.0/14",
  "106.52.0.0/14", "111.230.0.0/15", "118.24.0.0/15", "119.28.0.0/15",
  "121.4.0.0/14", "129.211.0.0/16", "134.175.0.0/16", "140.143.0.0/16",
  "148.70.0.0/16", "150.109.0.0/16", "152.136.0.0/16", "162.62.0.0/16",
  "175.24.0.0/14", "182.254.0.0/16", "193.112.0.0/16", "212.64.0.0/16",
];

// ============================================
// CIDR MATCHING FUNCTIONS
// ============================================

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return 0; // Invalid IP
  }
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);
  return (ipNum & mask) === (rangeNum & mask);
}

function isCloudProviderIP(ip: string): boolean {
  // Skip check for localhost/internal IPs
  if (ip === "unknown" || ip.startsWith("127.") || ip.startsWith("192.168.") ||
      ip.startsWith("10.") || ip.startsWith("172.16.") || ip === "::1") {
    return false;
  }
  return BLOCKED_CIDRS.some(cidr => isIpInCidr(ip, cidr));
}

// ============================================
// HONEYPOT TRAP PATHS (Silent bot traps)
// These paths are NEVER linked anywhere - only scanners find them
// ============================================
const HONEYPOT_PATHS = [
  "/internal-admin-check",
  "/wp-config.php",
  "/backup.sql",
  "/db-backup",
  "/.git/config",
  "/config.php",
  "/admin/config",
  "/server-status",
];

// ============================================
// BLOCKED PATHS (WordPress scanners, etc.)
// ============================================
const BLOCKED_PATHS = [
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wp-content",
  "/wp-includes",
  "/.env",
  "/phpmyadmin",
  "/admin.php",
  "/administrator",
  "/cgi-bin",
  "/shell",
  "/backdoor",
  "/.htaccess",
  "/.htpasswd",
];

// Suspicious user agents (attack tools, scrapers)
const BAD_AGENTS = [
  "curl",
  "python",
  "wget",
  "axios",
  "node-fetch",
  "java/",
  "go-http-client",
  "libwww-perl",
  "wordpress",
  "wpscan",
  "sqlmap",
  "nikto",
  "scanbot",
  "scraper",
  "crawler",
  "masscan",
  "nmap",
  "zgrab",
  "censys",
  "shodan",
  "dirbuster",
  "gobuster",
  "nuclei",
  "httpx",
];

// Good bots to allow (search engines)
const GOOD_BOTS = [
  "googlebot",
  "bingbot",
  "duckduckbot",
  "yandexbot",
  "slurp", // Yahoo
  "baiduspider",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "applebot",
  "msnbot",
];

// ============================================
// BAN FUNCTIONS
// ============================================

function isBanned(ip: string): { banned: boolean; reason?: string } {
  const record = bannedIPs.get(ip);
  if (!record) return { banned: false };

  const now = Date.now();
  if (now - record.timestamp > BAN_DURATION_MS) {
    // Ban expired, remove it
    bannedIPs.delete(ip);
    return { banned: false };
  }

  return { banned: true, reason: record.reason };
}

function banIP(ip: string, reason: string): void {
  bannedIPs.set(ip, { timestamp: Date.now(), reason });
  console.log(`[SECURITY BAN] IP ${ip} banned for 24h. Reason: ${reason}`);
}

function addRateLimitStrike(ip: string): boolean {
  const strikes = (rateLimitStrikes.get(ip) || 0) + 1;
  rateLimitStrikes.set(ip, strikes);

  if (strikes >= RATE_LIMIT_STRIKES) {
    banIP(ip, `Exceeded rate limit ${RATE_LIMIT_STRIKES} times`);
    rateLimitStrikes.delete(ip);
    return true; // IP was banned
  }
  return false;
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.toLowerCase();
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";

  // Get real client IP (Vercel/Cloudflare passes it in various headers)
  const realIp = req.headers.get("x-real-ip")
    ?? req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.ip
    ?? "unknown";

  const ip = realIp;
  const now = Date.now();

  // ============================================
  // -1. BYPASS CHECK - Owner can unban themselves
  // Add ?bypass=aira-owner-2024 to any URL to unban your IP
  // ============================================
  const bypassKey = req.nextUrl.searchParams.get("bypass");
  if (bypassKey === BYPASS_SECRET) {
    // Remove this IP from ban list
    bannedIPs.delete(ip);
    rateLimitStrikes.delete(ip);
    ipStore.delete(ip);
    console.log(`[SECURITY] Bypass used - IP ${ip} unbanned and cleared`);
    // Redirect to same page without bypass param
    const cleanUrl = new URL(req.url);
    cleanUrl.searchParams.delete("bypass");
    return NextResponse.redirect(cleanUrl);
  }

  // ============================================
  // -0.5. WHITELIST CHECK - Never block whitelisted IPs
  // ============================================
  if (WHITELISTED_IPS.includes(ip)) {
    return NextResponse.next();
  }

  // ============================================
  // -0.4. WEBHOOK BYPASS - Always allow webhooks through (Stripe, etc.)
  // These need to work regardless of any other security rules
  // ============================================
  const isWebhookPath = path.startsWith("/api/stripe/webhook") ||
                        path.startsWith("/api/webhooks/") ||
                        path === "/api/stripe/webhook";
  if (isWebhookPath) {
    console.log(`[WEBHOOK] Allowing webhook request through: ${path} from IP: ${ip}`);
    return NextResponse.next();
  }

  // ============================================
  // 0. CHECK IF IP IS BANNED (first check - fastest rejection)
  // ============================================
  const banStatus = isBanned(ip);
  if (banStatus.banned) {
    console.log(`[SECURITY] Blocked banned IP: ${ip} (Reason: ${banStatus.reason})`);
    return new NextResponse("Your access has been temporarily blocked.", {
      status: 403,
      headers: { "X-Ban-Reason": "security" }
    });
  }

  // ============================================
  // 0.5. CLOUD PROVIDER FIREWALL
  // Block requests from known attack-source cloud providers
  // Bypass for: known good bots, webhooks, health checks
  // ============================================
  const isGoodBot = GOOD_BOTS.some(a => ua.includes(a));
  const isWebhook = path.startsWith("/api/stripe/webhook") || path.startsWith("/api/webhooks/");
  const isHealthCheck = path.startsWith("/api/health");

  if (!isGoodBot && !isWebhook && !isHealthCheck && isCloudProviderIP(ip)) {
    console.log(`[FIREWALL] Blocked cloud provider IP: ${ip} on path: ${path}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ============================================
  // 1. HONEYPOT TRAP - Instant ban for bots scanning hidden paths
  // ============================================
  if (HONEYPOT_PATHS.some(trap => path === trap || path.startsWith(trap + "/"))) {
    banIP(ip, `Honeypot trap triggered: ${path}`);
    // Return 404 to not reveal it's a trap
    return new NextResponse("Not Found", { status: 404 });
  }

  // ============================================
  // 2. BLOCKED PATHS (WordPress scanners, etc.) - Instant ban
  // ============================================
  if (BLOCKED_PATHS.some(prefix => path.startsWith(prefix))) {
    banIP(ip, `Accessed blocked path: ${path}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ============================================
  // 3. USER-AGENT FILTERING
  // ============================================
  const isBadAgent = BAD_AGENTS.some(a => ua.includes(a));
  const isEmptyUA = ua.length === 0;
  const isInternalPath = path.startsWith("/api/health") || path === "/favicon.ico" || isWebhook;

  if ((isBadAgent || isEmptyUA) && !isGoodBot && !isInternalPath) {
    banIP(ip, `Malicious user-agent: ${ua || "(empty)"}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ============================================
  // 4. RATE LIMITING
  // ============================================
  const record = ipStore.get(ip);

  if (!record) {
    ipStore.set(ip, { count: 1, start: now });
  } else {
    if (now - record.start < WINDOW_MS) {
      record.count++;

      if (record.count > RATE_LIMIT) {
        console.log(`[Security] Rate limit exceeded for IP: ${ip} (${record.count} requests)`);

        // Add strike and potentially ban
        const wasBanned = addRateLimitStrike(ip);

        return new NextResponse(
          wasBanned
            ? "Your access has been temporarily blocked due to excessive requests."
            : "Too Many Requests",
          {
            status: wasBanned ? 403 : 429,
            headers: { "Retry-After": "60" },
          }
        );
      }
    } else {
      // Reset window
      ipStore.set(ip, { count: 1, start: now });
    }
  }

  // ============================================
  // 5. GARBAGE COLLECTION (periodic cleanup)
  // ============================================
  if (Math.random() < 0.01) { // 1% chance per request
    const rateLimitCutoff = now - WINDOW_MS * 2;
    const banCutoff = now - BAN_DURATION_MS;

    // Clean rate limit store
    for (const [key, val] of ipStore.entries()) {
      if (val.start < rateLimitCutoff) {
        ipStore.delete(key);
      }
    }

    // Clean expired bans
    for (const [key, val] of bannedIPs.entries()) {
      if (val.timestamp < banCutoff) {
        bannedIPs.delete(key);
        console.log(`[Security] Ban expired for IP: ${key}`);
      }
    }

    // Clean old strike records
    for (const [key] of rateLimitStrikes.entries()) {
      if (!ipStore.has(key)) {
        rateLimitStrikes.delete(key);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.mp3|.*\\.ico).*)",
  ],
};

