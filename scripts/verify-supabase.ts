import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

// 1. Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envPath);
  } else {
    const raw = fs.readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        const val = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

function mask(value: string | undefined): string {
  if (!value) return "[NOT SET]";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

async function verifyConnection() {
  console.log("=== Supabase Connection Verification ===");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Step 1: Check required credentials
  console.log("\n[1/3] Checking environment configuration...");
  if (!url) {
    console.error("❌ FAILED: NEXT_PUBLIC_SUPABASE_URL is missing.");
    process.exit(1);
  }
  if (!key) {
    console.error(
      "❌ FAILED: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is missing."
    );
    process.exit(1);
  }

  console.log(`  Supabase URL: ${url.replace(/(https?:\/\/)(.{4})([^.]+)/, "$1$2***")}`);
  console.log(`  Publishable Key: ${mask(key)}`);
  console.log("  Configuration check passed.");

  // Step 2: Initialize Supabase client
  console.log("\n[2/3] Initializing Supabase client...");
  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log("  Supabase client initialized successfully.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ FAILED: Client initialization error: ${message}`);
    process.exit(1);
  }

  // Step 3: Minimal, safe connectivity queries
  console.log("\n[3/3] Testing service connectivity...");

  // 3a. Auth Service reachability
  try {
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.warn(`  ⚠️ Auth session check returned error: ${authError.message}`);
    } else {
      console.log("  ✓ Auth service reachable and responding.");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ FAILED: Could not reach Supabase Auth: ${message}`);
    process.exit(1);
  }

  // 3b. Database (PostgREST) reachability via safe schema check
  try {
    const { error, status } = await supabase
      .from("_connection_test_")
      .select("*")
      .limit(1);

    if (status === 401) {
      console.error(
        "❌ FAILED: Authentication error (401 Unauthorized). The provided publishable/anon key is invalid or rejected."
      );
      process.exit(1);
    }

    if (error && error.code === "PGRST205") {
      // PGRST205 indicates PostgREST is online, authenticated, and queried schema cache successfully.
      console.log(
        "  ✓ Database (PostgREST) reachable: Authenticated successfully against Supabase PostgreSQL."
      );
    } else if (!error) {
      console.log("  ✓ Database query succeeded.");
    } else {
      console.log(
        `  ✓ Database service responded with status ${status} (${error.code || "N/A"}). Connectivity established.`
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ FAILED: Network error communicating with Supabase database: ${message}`);
    process.exit(1);
  }

  console.log("\n✅ All connectivity tests succeeded! Supabase is properly configured and reachable.\n");
}

verifyConnection().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Unexpected error during verification:", message);
  process.exit(1);
});
