#!/usr/bin/env bash
# bootstrap-terraform.sh
#
# Creates the GCS bucket used for Terraform remote state.
# Run this ONCE before the first `terraform init`.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Sufficient IAM permissions (Storage Admin on the project)
#
# Usage:
#   ./bootstrap-terraform.sh

set -euo pipefail

PROJECT="my-litellm-proxy-qwdbagj7"
BUCKET="francis-tf-state-qwdbagj7"
LOCATION="europe-west1"

echo "Creating Terraform state bucket: gs://${BUCKET}"

gcloud storage buckets create "gs://${BUCKET}" \
  --project="${PROJECT}" \
  --location="${LOCATION}" \
  --uniform-bucket-level-access

echo "Done. You can now run:"
echo "  cd terraform && terraform init"
