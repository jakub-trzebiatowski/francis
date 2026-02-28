locals {
  required_apis = [
    "run.googleapis.com",
    "cloudtasks.googleapis.com",
    "firestore.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iamcredentials.googleapis.com",    # required for WIF SA impersonation
    "sts.googleapis.com",               # required for WIF token exchange
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.required_apis)

  project            = local.project
  service            = each.value
  disable_on_destroy = false
}
