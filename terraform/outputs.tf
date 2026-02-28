output "console_url" {
  description = "Public URL of the Francis console Cloud Run Service"
  value       = google_cloud_run_v2_service.console.uri
}

output "worker_job_name" {
  description = "Fully-qualified name of the Francis worker Cloud Run Job"
  value       = google_cloud_run_v2_job.worker.name
}

output "cloud_tasks_queue" {
  description = "Fully-qualified Cloud Tasks queue name"
  value       = google_cloud_tasks_queue.jobs.id
}

output "console_registry_url" {
  description = "Artifact Registry repository URL for console images"
  value       = "${google_artifact_registry_repository.console.location}-docker.pkg.dev/${local.project}/${google_artifact_registry_repository.console.repository_id}"
}

output "worker_registry_url" {
  description = "Artifact Registry repository URL for worker images"
  value       = "${google_artifact_registry_repository.worker.location}-docker.pkg.dev/${local.project}/${google_artifact_registry_repository.worker.repository_id}"
}

output "console_service_account" {
  description = "Email of the console service account"
  value       = google_service_account.console.email
}

output "worker_service_account" {
  description = "Email of the worker service account"
  value       = google_service_account.worker.email
}
