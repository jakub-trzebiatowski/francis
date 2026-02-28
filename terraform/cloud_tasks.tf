resource "google_cloud_tasks_queue" "jobs" {
  project  = local.project
  name     = "francis-jobs"
  location = local.region

  rate_limits {
    max_concurrent_dispatches = 10
    max_dispatches_per_second = 5
  }

  retry_config {
    max_attempts  = 3
    min_backoff   = "10s"
    max_backoff   = "60s"
    max_doublings = 3
  }

  depends_on = [google_project_service.apis]
}
