resource "google_artifact_registry_repository" "console" {
  project       = local.project
  location      = local.region
  repository_id = "console"
  format        = "DOCKER"
  description   = "Docker images for the Francis console (Next.js)"

  depends_on = [google_project_service.apis]
}

resource "google_artifact_registry_repository" "worker" {
  project       = local.project
  location      = local.region
  repository_id = "worker"
  format        = "DOCKER"
  description   = "Docker images for the Francis worker (C++)"

  depends_on = [google_project_service.apis]
}
