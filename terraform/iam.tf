# ── Service accounts ────────────────────────────────────────────────────────

resource "google_service_account" "console" {
  project      = local.project
  account_id   = "francis-console"
  display_name = "Francis Console"
  description  = "Identity for the Francis console Cloud Run Service"

  depends_on = [google_project_service.apis]
}

resource "google_service_account" "worker" {
  project      = local.project
  account_id   = "francis-worker"
  display_name = "Francis Worker"
  description  = "Identity for the Francis worker Cloud Run Job"

  depends_on = [google_project_service.apis]
}

# ── Console SA bindings ──────────────────────────────────────────────────────

# Enqueue tasks onto the Cloud Tasks queue
resource "google_project_iam_member" "console_tasks_enqueuer" {
  project = local.project
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.console.email}"
}

# Trigger (run) the worker Cloud Run Job
resource "google_project_iam_member" "console_run_invoker" {
  project = local.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.console.email}"
}

# Read/write Firestore documents (session state)
resource "google_project_iam_member" "console_firestore_user" {
  project = local.project
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.console.email}"
}

# Create and verify Firebase session cookies
resource "google_project_iam_member" "console_firebase_auth_admin" {
  project = local.project
  role    = "roles/firebaseauth.admin"
  member  = "serviceAccount:${google_service_account.console.email}"
}

# ── Worker SA bindings ───────────────────────────────────────────────────────

# Read/write Firestore documents (write volatile session state)
resource "google_project_iam_member" "worker_firestore_user" {
  project = local.project
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.worker.email}"
}
