# ── Cloud Run Service: Console (Next.js) ─────────────────────────────────────

resource "google_cloud_run_v2_service" "console" {
  project  = local.project
  name     = "francis-console"
  location = local.region

  template {
    service_account = google_service_account.console.email

    containers {
      # Placeholder — replace with real image once CI/CD is wired up
      image = local.console_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "FIREBASE_PROJECT_ID"
        value = local.project
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.console,
  ]
}

# Allow unauthenticated access to the console (public web app)
resource "google_cloud_run_v2_service_iam_member" "console_public" {
  project  = local.project
  location = local.region
  name     = google_cloud_run_v2_service.console.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── Cloud Run Job: Worker (C++) ───────────────────────────────────────────────

resource "google_cloud_run_v2_job" "worker" {
  project  = local.project
  name     = "francis-worker"
  location = local.region

  template {
    template {
      service_account = google_service_account.worker.email

      containers {
        # Placeholder — replace with real image once CI/CD is wired up
        image = local.worker_image

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }

        # SESSION_ID is passed at job execution time by the console
        env {
          name  = "SESSION_ID"
          value = ""
        }
      }

      # Cloud Run Jobs: max time per task execution
      timeout = "3600s"
    }
  }

  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.worker,
  ]
}
