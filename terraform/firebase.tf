# ── Firebase / Identity Platform ─────────────────────────────────────────────
# Initialises Identity Platform (Firebase Auth) on the project and enables
# email/password sign-in. Requires user_project_override = true in the
# provider block so that client-billed APIs like identitytoolkit.googleapis.com
# bill against this project rather than Google's OAuth client project.

resource "google_identity_platform_config" "default" {
  project = local.project

  sign_in {
    email {
      enabled           = true
      password_required = true
    }
  }

  autodelete_anonymous_users = false

  depends_on = [google_project_service.apis]
}
