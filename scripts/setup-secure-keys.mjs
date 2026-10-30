import crypto from 'node:crypto';
import fs from 'node:fs';

const newKey = crypto.randomBytes(32).toString('hex');
let envContent = fs.readFileSync('.env.local', 'utf8');

const oldKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
if (envContent.includes(oldKey)) {
  envContent = envContent.replace(
    `GAME_KEY_ENCRYPTION_KEY="${oldKey}"`,
    `# Cryptographically secure 256-bit CSPRNG encryption key\nGAME_KEY_ENCRYPTION_KEY="${newKey}"\nGAME_KEY_ENCRYPTION_KEY_PREVIOUS="${oldKey}"`
  );
  fs.writeFileSync('.env.local', envContent, 'utf8');
  console.log('SUCCESS: Generated CSPRNG key and updated .env.local with safe fallback.');
} else {
  console.log('Key already replaced or custom.');
}
