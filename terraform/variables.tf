variable "project" {
  description = "GCP project ID"
  type        = string
  default     = "my-litellm-proxy-qwdbagj7"
}

variable "region" {
  description = "GCP region for Cloud Run, Cloud Tasks, and Artifact Registry"
  type        = string
  default     = "europe-west1"
}

variable "firestore_location" {
  description = "Firestore database location (multi-region or region)"
  type        = string
  default     = "eur3"
}

variable "tf_state_bucket" {
  description = "GCS bucket name used for Terraform remote state"
  type        = string
  default     = "francis-tf-state-qwdbagj7"
}
