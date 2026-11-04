import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staged = process.argv.includes('--staged');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
// Default: the working-tree files a normal `git add -A` would include.
// --staged: every file currently in the index, including its actual staged contents.
const files = [...new Set(git(staged ? ['ls-files', '-z'] :
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean))];
const testKey = /^src\/test\/resources\/test(?:Private|Public)Key\.pem$/;
const forbidden = /(^|\/)(?:node_modules|target|dist|build|\.quinoa|\.agents|\.codex|\.local|\.idea|\.vscode|logs)(\/|$)|(^|\/)\.env(?:\..*)?$|\.(?:pem|key|p12|pfx|log|dump|backup)$/i;
const textFile = /\.(?:java|js|jsx|mjs|cjs|json|ya?ml|properties|sql|md|xml|html|css|env|example)$/i;
let count = 0;
const issues = [];
for (const file of files) {
    if (!staged && !existsSync(resolve(root, file))) continue;
    count++;
    if (forbidden.test(file) && file !== '.env.example' && !testKey.test(file)) {
        issues.push(`${file}: forbidden generated/local/secret file`);
    }
    const size = staged ? Number(git(['cat-file', '-s', `:${file}`]).trim()) : statSync(resolve(root, file)).size;
    if (size > 10 * 1024 * 1024) issues.push(`${file}: file exceeds 10 MiB; review before publishing`);
    if (!textFile.test(file) && !file.endsWith('.pem')) continue;
    if (size > 10 * 1024 * 1024) continue;
    const content = staged ? git(['show', `:${file}`]) : readFileSync(resolve(root, file), 'utf8');
    const rules = [
        ['private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
        ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
        ['database URL containing credentials', /(?:postgres(?:ql)?|redis(?:s)?):\/\/[^\s:@/]+:[^\s$<>{}]+@/],
        ['literal VNPay secret', /^\s*vnpay\.secretKey\s*=\s*(?!\$\{)\S+/],
    ];
    for (const [index, line] of content.split(/\r?\n/).entries()) {
        for (const [label, pattern] of rules) {
            if (pattern.test(line) && !(label === 'private key material' && testKey.test(file))) {
                issues.push(`${file}:${index + 1}: ${label}`);
            }
        }
    }
}
if (issues.length) {
    console.error(issues.join('\n')); // Never prints the secret value.
    process.exitCode = 1;
} else {
    console.log(`Repository check passed: ${count} ${staged ? 'index' : 'working-tree'} files. This is a targeted check, not a complete secret audit.`);
}
