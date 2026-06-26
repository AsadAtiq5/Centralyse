import * as fs from "fs";
import * as path from "path";

/**
 * Centralised environment configuration.
 *
 * Note: keys in the .env file are trimmed because at least one key
 * ("MAILINATOR_ADDRESS ") contains a trailing space.
 */

function readEnv(name: string, fallback = ""): string {
  // Try exact, then a trimmed-key match to tolerate stray whitespace in .env.
  if (process.env[name] !== undefined) {
    return String(process.env[name]).trim();
  }
  const match = Object.keys(process.env).find((k) => k.trim() === name);
  return match ? String(process.env[match]).trim() : fallback;
}

export const config = {
  baseURL: readEnv("BASE_URL", "https://secure.cygovdev.com/"),
  validEmail: readEnv("USER_EMAIL"),
  validPassword: readEnv("USER_PASSWORD"),
  invalidEmail: readEnv("INVALID_USER_EMAIL", "test@test.com"),
  invalidPassword: readEnv("INVALID_USER_PASSWORD", "tesr"),
  incorrectOtp: readEnv("INCORRECT_OTP", "000000"),
  mailinatorAddress: readEnv("MAILINATOR_ADDRESS"),
  forgotPasswordUnregisteredEmail: "assad@asdasd.com",
  isCI: !!process.env.CI,
};

/** Path to the shared test-data store. */
export const CLIENT_DATA_PATH = path.resolve(
  __dirname,
  "..",
  "Testdata",
  "Client",
  "client.json",
);

type ClientData = Record<string, unknown>;

/** Read the shared client test-data store. */
export function readClientData(): ClientData {
  try {
    return JSON.parse(fs.readFileSync(CLIENT_DATA_PATH, "utf-8")) as ClientData;
  } catch {
    return {};
  }
}

/** Merge and persist a value into the shared client test-data store. */
export function saveClientData(key: string, value: unknown): void {
  const data = readClientData();
  data[key] = value;
  fs.mkdirSync(path.dirname(CLIENT_DATA_PATH), { recursive: true });
  fs.writeFileSync(
    CLIENT_DATA_PATH,
    JSON.stringify(data, null, 2) + "\n",
    "utf-8",
  );
}
