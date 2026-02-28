# ── Workload Identity Federation ─────────────────────────────────────────────
# Allows GitHub Actions to authenticate to GCP without long-lived SA keys.
# The pool + provider are created once; SA bindings grant specific access.

locals {
  github_repo = "jakub-trzebiatowski/francis"
}

resource "google_iam_workload_identity_pool" "github" {
  project                   = local.project
  workload_identity_pool_id = "github-actions"
  display_name              = "GitHub Actions"
  description               = "WIF pool for GitHub Actions CI/CD"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = local.project
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  display_name                       = "GitHub Actions OIDC"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Only tokens from this specific repo are accepted
  attribute_condition = "assertion.repository == \"${local.github_repo}\""
}

# ── A dedicated SA for GitHub Actions CI/CD ───────────────────────────────────

resource "google_service_account" "ci" {
  project      = local.project
  account_id   = "francis-ci"
  display_name = "Francis CI"
  description  = "Used by GitHub Actions to push images and run terraform apply"

  depends_on = [google_project_service.apis]
}

# Allow the WIF provider (any ref in the repo) to impersonate the CI SA
resource "google_service_account_iam_member" "ci_wif_binding" {
  service_account_id = google_service_account.ci.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${local.github_repo}"
}

# ── IAM roles for the CI SA ───────────────────────────────────────────────────

# Push Docker images to Artifact Registry
resource "google_project_iam_member" "ci_artifact_writer" {
  project = local.project
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.ci.email}"
}

# terraform apply needs to read/write all managed resources.
# editor + a few extras cover our resource set without granting full owner.
resource "google_project_iam_member" "ci_editor" {
  project = local.project
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.ci.email}"
}

# IAM roles can only be granted by someone with roles/iam.securityAdmin
resource "google_project_iam_member" "ci_security_admin" {
  project = local.project
  role    = "roles/iam.securityAdmin"
  member  = "serviceAccount:${google_service_account.ci.email}"
}

# Terraform state bucket: read/write objects
resource "google_storage_bucket_iam_member" "ci_tf_state" {
  bucket = var.tf_state_bucket
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.ci.email}"
}
