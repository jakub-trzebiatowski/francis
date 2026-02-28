# Security

## Reporting a vulnerability

Open a private GitHub Security Advisory at  
**Settings → Security → Advisories → New draft advisory**.

Do not open a public issue for security-sensitive reports.

---

## Credentials inventory

The table below lists every secret the system uses, where it lives, and what
it grants.

| Credential | Stored in | Grants |
|---|---|---|
| `SUPABASE_JWT_SECRET` | `console/.env.local` (local only) | Signs/verifies all Supabase JWTs — forging any user session |
| `SUPABASE_SERVICE_ROLE_KEY` | `console/.env.local` (local only) | Full Supabase DB access, bypasses all RLS |
| `SUPABASE_SECRET_KEY` | `console/.env.local` (local only) | Supabase Management API (control-plane) |
| `POSTGRES_PASSWORD` | `console/.env.local` (local only) | PostgreSQL superuser login |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `console/.env.local` + GitHub Secret | Supabase anon access (RLS-governed) |
| `NEXT_PUBLIC_SUPABASE_URL` | `console/.env.local` + GitHub Secret | Identifies the Supabase project endpoint |
| `WIF_PROVIDER` | GitHub Secret | WIF pool provider resource name (identifier, not a key) |
| `CI_SERVICE_ACCOUNT` | GitHub Secret | Identifies the `francis-ci` GCP SA (identifier, not a key) |
| `SESSION_ID` | Cloud Run Job env at runtime | Identifies a single session per job execution |

---

## Key rotation procedures

### 1. Supabase JWT secret (`SUPABASE_JWT_SECRET`)

**Impact if compromised:** an attacker can forge valid session tokens for any
user, including service-role level.

**Rotation steps:**

1. Open the [Supabase dashboard](https://supabase.com/dashboard) → project
   `fyztwzkpdnqbauvwpwxq` → **Project Settings → API**.
2. Under **JWT Settings**, click **Generate new JWT secret**.  
   Confirm when prompted — all existing user sessions become invalid immediately.
3. Copy the new secret.
4. Update `console/.env.local`:
   ```
   SUPABASE_JWT_SECRET=<new-value>
   ```
5. Restart the local development server.
6. Redeploy the Cloud Run console service so it picks up the new Supabase
   public keys (a new deploy is sufficient; the service itself does not store
   the JWT secret).

---

### 2. Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`)

**Impact if compromised:** full read/write access to all database tables,
bypassing Row-Level Security.

**Rotation steps:**

1. Supabase rotates the service role key together with the anon key via
   **Project Settings → API → Reset API keys**.
2. After resetting, copy both new keys.
3. Update `console/.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<new-value>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<new-anon-value>
   ```
4. Update the GitHub Secret `NEXT_PUBLIC_SUPABASE_ANON_KEY`:  
   **GitHub → repo → Settings → Secrets and variables → Actions** →
   update the secret value.
5. Trigger a new deploy (push any commit to `main`) so CI rebuilds the console
   image with the new anon key baked in.

---

### 3. Supabase anon / publishable key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Impact if compromised:** low on its own (anon access is RLS-governed), but
rotate it together with the service role key (step 2 above) since Supabase
issues them as a pair.

**Rotation steps:** follow step 2 above.

---

### 4. Supabase Management API key (`SUPABASE_SECRET_KEY`)

**Impact if compromised:** attacker can modify the Supabase project
configuration via the Management API (e.g. change auth settings, create
service accounts).

**Rotation steps:**

1. Open the [Supabase dashboard](https://supabase.com/dashboard) →
   **Account → Access tokens**.
2. Revoke the compromised token.
3. Click **Generate new token** and copy it.
4. Update `console/.env.local`:
   ```
   SUPABASE_SECRET_KEY=<new-value>
   ```

---

### 5. Postgres password (`POSTGRES_PASSWORD`) and connection strings

**Impact if compromised:** direct superuser access to the Supabase PostgreSQL
instance.

**Rotation steps:**

1. Open **Project Settings → Database → Database password** in the Supabase
   dashboard.
2. Click **Reset database password** and copy the new password.
3. Update `console/.env.local` — replace the password in every connection
   string that contains it (`POSTGRES_URL`, `POSTGRES_PRISMA_URL`,
   `POSTGRES_URL_NON_POOLING`, and `POSTGRES_PASSWORD` itself).
4. If any other service (e.g. a migration runner) uses these connection strings,
   update those as well.

---

### 6. GCP CI service account / Workload Identity Federation

**Impact if compromised:** the `francis-ci` SA holds `roles/editor` +
`roles/iam.securityAdmin` on the GCP project, so a compromise gives an
attacker broad write access to all managed resources.

WIF does not use long-lived keys — GitHub Actions tokens are short-lived OIDC
tokens, so there is no single secret to rotate.  Containment instead means
revoking the SA's ability to be impersonated.

**If the WIF pool or provider is suspected to be misconfigured or abused:**

1. **Disable the WIF pool** immediately to stop all GitHub Actions deployments:
   ```bash
   gcloud iam workload-identity-pools update github-actions \
     --project=my-litellm-proxy-qwdbagj7 \
     --location=global \
     --disabled
   ```
2. Audit Cloud Audit Logs for recent SA impersonation calls:  
   **GCP Console → Logging → Logs Explorer** — filter on
   `resource.type="service_account"` and `protoPayload.methodName="GenerateAccessToken"`.
3. Remove the IAM binding that allows the WIF pool to impersonate `francis-ci`:
   ```bash
   terraform apply   # after removing google_service_account_iam_member.ci_wif_binding from wif.tf
   ```
   or directly via `gcloud iam service-accounts remove-iam-policy-binding`.
4. Re-enable the pool and recreate the binding (via Terraform) once the
   investigation is complete:
   ```bash
   gcloud iam workload-identity-pools update github-actions \
     --project=my-litellm-proxy-qwdbagj7 \
     --location=global \
     --no-disabled
   ```
5. Update the GitHub Secrets `WIF_PROVIDER` and `CI_SERVICE_ACCOUNT` if either
   value changed as part of remediation.

**If the `francis-ci` service account itself is compromised:**

1. Disable the SA immediately:
   ```bash
   gcloud iam service-accounts disable \
     francis-ci@my-litellm-proxy-qwdbagj7.iam.gserviceaccount.com \
     --project=my-litellm-proxy-qwdbagj7
   ```
2. Create a replacement SA in Terraform (`terraform/wif.tf`) with a new name,
   reassign all necessary IAM roles, and re-bind it to the WIF pool.
3. Run `terraform apply`.
4. Update `CI_SERVICE_ACCOUNT` in GitHub Secrets with the new SA email.
5. Delete the compromised SA:
   ```bash
   gcloud iam service-accounts delete \
     francis-ci@my-litellm-proxy-qwdbagj7.iam.gserviceaccount.com \
     --project=my-litellm-proxy-qwdbagj7
   ```

---

### 7. GitHub Secrets (`WIF_PROVIDER`, `CI_SERVICE_ACCOUNT`, `NEXT_PUBLIC_SUPABASE_*`)

These are updated via **GitHub → repo → Settings → Secrets and variables →
Actions**.  After updating a secret that is a Docker build arg
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), push a commit
to `main` to trigger a rebuild of the console image with the new value.

`WIF_PROVIDER` and `CI_SERVICE_ACCOUNT` are resource identifiers, not
cryptographic secrets.  Update them if the underlying GCP resources are
recreated (see section 6).

---

## Notes on `.env.local`

`console/.env.local` is listed in `.gitignore` and must never be committed.
It holds development-only credentials.  The production console image does not
use this file; it receives public configuration via Docker build args at CI
time and will receive runtime secrets via GCP Secret Manager once that
integration is added.

If `.env.local` is accidentally committed, treat all credentials it contains
as compromised and rotate every secret listed in this document.  Remove the
file from git history with `git filter-repo` before force-pushing.
