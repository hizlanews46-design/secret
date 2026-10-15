#!/usr/bin/env node
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const file = process.env.VAULTLINE_FILE || join(homedir(), ".vaultline", "vault.json");
const baseUrl = process.env.VAULTLINE_URL || "https://secret-iota-ten.vercel.app";
const usage = `vaultline init | login | run -- <command> [args...] | rotate <NAME>`;
const rl = process.stdin.isTTY ? createInterface({ input, output }) : null;
const pipedAnswers = process.stdin.isTTY ? [] : readFileSync(0, "utf8").split(/\r?\n/);
const ask = async (prompt) => { process.stdout.write(prompt); return rl ? rl.question("") : (pipedAnswers.shift() ?? ""); };
const keyFor = (passphrase, salt) => scryptSync(passphrase, salt, 32);
function load() { if (!existsSync(file)) throw new Error(`Vault file not found: ${file}. Run vaultline init first.`); return JSON.parse(readFileSync(file, "utf8")); }
function seal(value, passphrase) { const salt = randomBytes(16); const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", keyFor(passphrase, salt), iv); const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]); return { salt: salt.toString("base64url"), iv: iv.toString("base64url"), ciphertext: ciphertext.toString("base64url"), tag: cipher.getAuthTag().toString("base64url") }; }
function open(entry, passphrase) { const decipher = createDecipheriv("aes-256-gcm", keyFor(passphrase, Buffer.from(entry.salt, "base64url")), Buffer.from(entry.iv, "base64url")); decipher.setAuthTag(Buffer.from(entry.tag, "base64url")); return Buffer.concat([decipher.update(Buffer.from(entry.ciphertext, "base64url")), decipher.final()]).toString("utf8"); }
async function init() { const passphrase = await ask("Vault passphrase: "); const name = await ask("Variable name: "); const value = await ask("Variable value (never logged): "); mkdirSync(join(file, ".."), { recursive: true }); writeFileSync(file, JSON.stringify({ version: 1, entries: { [name]: seal(value, passphrase) } }, null, 2), { mode: 0o600 }); console.log(`Initialized encrypted vault at ${file}.`); }
async function login() { console.log(`Device login is intentionally not enabled until the server-side device-code flow is reviewed.\nOpen ${baseUrl}/login in a browser, then use a future approved CLI session endpoint.`); }
async function run(args) { const separator = args.indexOf("--"); if (separator < 0 || !args[separator + 1]) throw new Error("Usage: vaultline run -- <command> [args...]"); const passphrase = await ask("Vault passphrase: "); const vault = load(); const env = { ...process.env }; for (const [name, entry] of Object.entries(vault.entries ?? {})) env[name] = open(entry, passphrase); rl?.close(); const child = spawn(args[separator + 1], args.slice(separator + 2), { stdio: "inherit", env }); child.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 1)); }
async function rotate(name) { if (!name) throw new Error("Usage: vaultline rotate NAME"); const passphrase = await ask("Current vault passphrase: "); const vault = load(); if (!vault.entries?.[name]) throw new Error(`Variable not found: ${name}`); open(vault.entries[name], passphrase); const value = await ask("New variable value (never logged): "); vault.entries[name] = seal(value, passphrase); writeFileSync(file, JSON.stringify(vault, null, 2), { mode: 0o600 }); console.log(`Rotated ${name} in the local encrypted vault.`); }
try { const [command, ...args] = process.argv.slice(2); if (command === "init") await init(); else if (command === "login") await login(); else if (command === "run") await run(args); else if (command === "rotate") await rotate(args[0]); else console.log(usage); } catch (error) { console.error(error instanceof Error ? error.message : "Vaultline CLI failed."); process.exitCode = 1; } finally { rl?.close(); }
