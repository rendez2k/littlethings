/*
 * Generate a VAPID key pair for Web Push — no dependencies.
 * Run: node scripts/generate-vapid.mjs
 *
 * - Put the PUBLIC key in NEXT_PUBLIC_VAPID_PUBLIC_KEY (client + Vercel).
 * - Put the PRIVATE key in the Supabase function secret VAPID_PRIVATE_KEY.
 * Keep the private key secret — never commit it or ship it to the browser.
 */
import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;

const keyPair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
  'sign',
  'verify',
]);

const rawPublic = new Uint8Array(await subtle.exportKey('raw', keyPair.publicKey));
const jwkPrivate = await subtle.exportKey('jwk', keyPair.privateKey);

const publicKey = Buffer.from(rawPublic).toString('base64url');
const privateKey = jwkPrivate.d; // already base64url

console.log('\nVAPID keys generated. Store these safely.\n');
console.log('Public  (NEXT_PUBLIC_VAPID_PUBLIC_KEY):');
console.log(publicKey);
console.log('\nPrivate (VAPID_PRIVATE_KEY — Supabase function secret, keep private):');
console.log(privateKey);
console.log('');
