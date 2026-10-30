# VORTEX GAMING — Disaster Recovery, Key Rotation & Incident Runbook

**Document Version:** 1.0.0  
**Effective Date:** October 2026  
**System:** VORTEX GAMING Digital Marketplace Platform  

---

## 1. Emergency Incident Response

### 1.1 Credential / Key Compromise Trigger
In the event that an administrator credential, `AUTH_SECRET`, or `GAME_KEY_ENCRYPTION_KEY` is suspected or confirmed leaked:
1. **Quarantine Immediately:**
   - Revoke public access to `/auth/admin-login` or enforce maintenance mode via reverse proxy (Cloudflare / NGINX).
   - Terminate all active admin sessions by cycling `AUTH_SECRET`.
2. **Generate New Encryption Keys:**
   ```bash
   node scripts/setup-secure-keys.mjs
   ```
3. **Execute Vault Key Rotation:**
   Follow Section 2 below to re-encrypt all customer game keys under the new primary key while maintaining decryption fallback.

---

## 2. Cryptographic Key Rotation Procedure

VORTEX GAMING uses dual-key envelope encryption (AES-256-GCM) with transparent fallback decryption.

### Step 1: Assign Previous Key
Copy the active key to `GAME_KEY_ENCRYPTION_KEY_PREVIOUS` in `.env.local`:
```env
GAME_KEY_ENCRYPTION_KEY_PREVIOUS="<current_64_char_hex_key>"
```

### Step 2: Provision New Primary Key
Generate and assign a new 256-bit CSPRNG key to `GAME_KEY_ENCRYPTION_KEY`:
```bash
node scripts/setup-secure-keys.mjs
```

### Step 3: Run Safe Re-Encryption Utility
Execute the migration script to decrypt existing keys with the fallback key and immediately re-encrypt under the new primary key:
```bash
node scripts/rotate-keys.mjs
```
The script will output:
`[VERIFIED] Rotation complete. X keys re-encrypted with 100% data integrity.`

### Step 4: Decommission Previous Key
Once all existing inventory and customer orders have been migrated, remove `GAME_KEY_ENCRYPTION_KEY_PREVIOUS` or archive securely in the offline vault.

---

## 3. Database & Data Store Restoration Procedure

### 3.1 Local Persistent Store Restoration (`.data/`)
To restore from an automated backup archive:
```powershell
# Windows
Expand-Archive -Path "backups\vortex_data_<timestamp>.zip" -DestinationPath ".data" -Force
```
```bash
# Linux
tar -xzf backups/vortex_data_<timestamp>.tar.gz -C .
```

### 3.2 PostgreSQL Database Restoration
To restore a PostgreSQL database from a `.dump` or `.sql` file:
```bash
pg_restore -d "$DATABASE_URL" -c -v backups/vortex_db_<timestamp>.dump
```
Verify table counts:
```sql
SELECT count(*) FROM users;
SELECT count(*) FROM orders;
SELECT count(*) FROM game_keys;
```

---

## 4. Administrator Provisioning & MFA Recovery

### 4.1 Initial Admin Provisioning
Demo administrator accounts (`admin@vortexgaming.com`) have been completely eradicated.
To provision a new verified administrator:
```javascript
import { provisionInitialAdmin } from './src/lib/auth/user-store';

const admin = await provisionInitialAdmin(
  'operator@vortexgaming.com',
  'ComplexPassword2026!#Secure',
  'System Administrator'
);
```
- Minimum password length: 12 characters.
- Must include uppercase, lowercase, digit, and special character.
- MFA is mandatory (`mfaEnabled: true`).

### 4.2 Admin MFA Reset
If an administrator loses their authenticator device, recovery requires:
1. Multi-party verification (at least two root infrastructure operators).
2. Reset via direct database query updating the admin record's MFA secret.

---

## 5. Stripe Webhook & Payment Failures

### 5.1 Webhook Signature Validation Failure
If Stripe webhooks return HTTP 400:
1. Check that `STRIPE_WEBHOOK_SECRET` matches the endpoint secret in Stripe Dashboard.
2. Verify that reverse proxy preserves raw payload bytes without JSON transformation.
3. Check `.data/processed-webhooks.json` to confirm replay defense is functioning.

### 5.2 Charge Refunds & Key Revocation
When a `charge.refunded` event is received:
- VORTEX GAMING webhook handler automatically marks associated game keys as `REVOKED`.
- If manual intervention is required, update key status in database:
  ```sql
  UPDATE game_keys SET status = 'REVOKED' WHERE order_id = '<order_id>';
  ```

---

## 6. Health & Monitoring Checklist

Daily automated checks:
- `GET /api/health` returns `200 OK` with status `"healthy"`.
- Disk backups exist in `backups/` from the last 24 hours.
- No unhandled errors or unredacted secrets in logs.
