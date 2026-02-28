# Before running `terraform init`, create the GCS state bucket:
#
#   gcloud storage buckets create gs://francis-tf-state-qwdbagj7 \
#     --project=my-litellm-proxy-qwdbagj7 \
#     --location=europe-west1 \
#     --uniform-bucket-level-access
#
# Then run:
#   terraform init
#   terraform plan
#   terraform apply

terraform {
  required_version = ">= 1.7"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "francis-tf-state-qwdbagj7"
    prefix = "terraform/state"
  }
}

provider "google" {
  project               = var.project
  region                = var.region
  billing_project       = var.project
  user_project_override = true
}

locals {
  project = var.project
  region  = var.region

  # Artifact Registry base path
  registry_base = "${var.region}-docker.pkg.dev/${var.project}"

  # Placeholder images — replace with real image URIs once CI/CD is wired up
  console_image = "${local.registry_base}/console/console:latest"
  worker_image  = "${local.registry_base}/worker/worker:latest"
}
