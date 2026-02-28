#!/usr/bin/env bash
# bootstrap-terraform.sh
#
# One-time project setup that must run BEFORE the first `terraform init`.
# Safe to re-run — every step is idempotent.
#
# What this does:
#   1. Creates the GCS bucket for Terraform remote state
#   2. Enables the Firebase API and adds Firebase to the GCP project
#   3. Creates the Firebase web app (gives us the API key for the client SDK)
#
# Everything else (Identity Platform config, Cloud Run, IAM, etc.) is managed
# by Terraform after this script runs. Steps 2-3 must precede `terraform apply`
# because google_identity_platform_config depends on Firebase being active on
# the project, which has no Terraform resource of its own.
#
# Note: the provider block in main.tf sets user_project_override = true so that
# client-billed APIs like identitytoolkit.googleapis.com bill correctly.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (gcloud auth login)
#   - Sufficient IAM permissions (Owner or Editor + Firebase Admin)
#
# Usage:
#   ./bootstrap-terraform.sh

set -euo pipefail

PROJECT="my-litellm-proxy-qwdbagj7"
BUCKET="francis-tf-state-qwdbagj7"
LOCATION="europe-west1"

# ── Helper ───────────────────────────────────────────────────────────────────

token() { gcloud auth print-access-token; }

gcp_api() {
  local method="$1"; local url="$2"; shift 2
  curl -sf -X "${method}" \
    -H "Authorization: Bearer $(token)" \
    -H "Content-Type: application/json" \
    -H "X-Goog-User-Project: ${PROJECT}" \
    "${url}" "$@"
}

# ── 1. Terraform state bucket ────────────────────────────────────────────────

echo "==> [1/3] Terraform state bucket"

if gcloud storage buckets describe "gs://${BUCKET}" --project="${PROJECT}" &>/dev/null; then
  echo "    gs://${BUCKET} already exists, skipping."
else
  gcloud storage buckets create "gs://${BUCKET}" \
    --project="${PROJECT}" \
    --location="${LOCATION}" \
    --uniform-bucket-level-access
  echo "    Created gs://${BUCKET}."
fi

# ── 2. Enable Firebase on the GCP project ───────────────────────────────────

echo "==> [2/3] Firebase project initialisation"

gcloud services enable firebase.googleapis.com \
  --project="${PROJECT}" \
  --quiet

STATE=$(gcp_api GET "https://firebase.googleapis.com/v1beta1/projects/${PROJECT}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('state',''))")

if [[ "${STATE}" == "ACTIVE" ]]; then
  echo "    Firebase already active on project, skipping."
else
  echo "    Adding Firebase to project (this may take ~30 s)…"
  OP=$(gcp_api POST "https://firebase.googleapis.com/v1beta1/projects/${PROJECT}:addFirebase" -d '{}' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])")
  # Poll until done
  for i in $(seq 1 12); do
    sleep 5
    DONE=$(gcp_api GET "https://firebase.googleapis.com/v1beta1/${OP}" \
      | python3 -c "import sys,json; print(json.load(sys.stdin).get('done', False))")
    [[ "${DONE}" == "True" ]] && break
    echo "    Waiting… (${i}/12)"
  done
  echo "    Firebase activated."
fi

# ── 3. Firebase web app ──────────────────────────────────────────────────────

echo "==> [3/3] Firebase web app"

APP_COUNT=$(gcp_api GET "https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('apps',[])))")

if [[ "${APP_COUNT}" -gt 0 ]]; then
  echo "    Web app already exists, skipping."
else
  echo "    Creating web app 'francis-console'…"
  OP=$(gcp_api POST "https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps" \
    -d '{"displayName":"francis-console"}' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])")
  for i in $(seq 1 12); do
    sleep 5
    DONE=$(gcp_api GET "https://firebase.googleapis.com/v1beta1/${OP}" \
      | python3 -c "import sys,json; print(json.load(sys.stdin).get('done', False))")
    [[ "${DONE}" == "True" ]] && break
    echo "    Waiting… (${i}/12)"
  done
  echo "    Web app created."
fi

# Print the API key and app ID (needed for NEXT_PUBLIC_FIREBASE_* env vars)
echo ""
echo "    Firebase web app config:"
APP_ID=$(gcp_api GET "https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['apps'][0]['appId'])")
gcp_api GET "https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps/${APP_ID}/config" \
  | python3 -c "
import sys, json
c = json.load(sys.stdin)
print(f'    NEXT_PUBLIC_FIREBASE_API_KEY={c[\"apiKey\"]}')
print(f'    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN={c[\"authDomain\"]}')
print(f'    NEXT_PUBLIC_FIREBASE_PROJECT_ID={c[\"projectId\"]}')
print(f'    NEXT_PUBLIC_FIREBASE_APP_ID={c[\"appId\"]}')
"

# ── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo "Bootstrap complete. Next steps:"
echo "  1. Copy the NEXT_PUBLIC_FIREBASE_* values above into console/.env.local"
echo "  2. cd terraform && terraform init"
echo "  3. terraform apply"
