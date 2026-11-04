import { generateKeyPairSync } from 'node:crypto';
import { mkdir, access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const production = process.argv.includes('--production');
if (process.argv.slice(2).some(arg => arg !== '--production')) throw new Error('Usage: node scripts/setup-dev-keys.mjs [--production]');
const directory = new URL(production ? '../.local/production-keys/' : '../.local/keys/', import.meta.url);
await mkdir(directory, { recursive: true });
const privateFile = new URL('privateKey.pem', directory);
const publicFile = new URL('publicKey.pem', directory);
const exists = async path => access(path).then(() => true, () => false);
const [hasPrivate, hasPublic] = await Promise.all([exists(privateFile), exists(publicFile)]);
if (hasPrivate !== hasPublic) throw new Error('Incomplete key pair; restore both files before continuing.');
if (!hasPrivate) {
    const keys = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    await writeFile(privateFile, keys.privateKey, { mode: 0o600, flag: 'wx' });
    await writeFile(publicFile, keys.publicKey, { mode: 0o600, flag: 'wx' });
    console.log('Created a new JWT key pair. Existing sessions must sign in again.');
}
console.log(`${production ? 'Production' : 'Development'} keys: ${fileURLToPath(directory)}`);
