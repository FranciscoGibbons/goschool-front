
# Security Policy

## Overview

This repository contains the **frontend application** for the GoSchool project.
It is a client-side web application responsible for user interaction and
communication with the backend API.

Security considerations for the frontend focus on:
- Safe handling of user input
- Secure interaction with backend services
- Minimization of sensitive data exposure
- Protection against common web-based attacks

This project has not yet undergone a formal third-party security audit.

---

## Supported Versions

Only the latest version available on the main branch is supported
with security updates.

| Version | Supported |
|--------|-----------|
| Latest (main) | ✅ |

---

## Threat Model

The frontend operates in an **untrusted environment** (the user’s browser).
Therefore:

- No secrets are considered secure on the client side.
- All critical security decisions are enforced on the backend.
- The frontend is treated as a potential attack surface.

---

## Authentication and Session Handling

- Authentication is performed using **JSON Web Tokens (JWT)** issued by the backend.
- The frontend does **not** generate, sign, or validate JWTs cryptographically.
- Tokens are treated as opaque values and are only forwarded to the backend API.
- No credentials or secrets are hardcoded in the frontend source code.

---

## Data Handling

- The frontend does not store sensitive personal data persistently.
- Any data rendered in the UI is assumed to be untrusted and is handled accordingly.
- User input is validated on the backend; frontend validation is treated as
  usability-only, not a security control.

---

## Transport Security

- The application is intended to be served exclusively over **HTTPS**.
- Communication with the backend API is expected to occur over TLS.
- Mixed-content (HTTP over HTTPS) usage is not supported.

---

## Common Web Security Considerations

The following risks are acknowledged and mitigated primarily by design:

### Cross-Site Scripting (XSS)

- The frontend relies on the framework’s default escaping mechanisms.
- No dynamic HTML injection is performed without sanitization.
- User-generated content is not trusted.

### Cross-Site Request Forgery (CSRF)

- The frontend relies on token-based authentication.
- CSRF protection is enforced at the backend level.

### Dependency Security

- Frontend dependencies are managed via the project’s package manager.
- Regular updates are recommended to address known vulnerabilities.
- Dependency vulnerabilities should be reviewed before deployment.

---

## Security Testing

- No automated frontend security testing (DAST/SAST) is currently in place.
- Dependency vulnerability checks may be performed using standard tooling
  provided by the package manager ecosystem.
- Manual review is recommended before production deployments.

---

## Reporting a Vulnerability

If you discover a security vulnerability affecting the frontend:

### How to Report

- Open a **private security advisory** on GitHub  
  **or**
- Contact the maintainers through GitHub

Please include:
- A detailed description of the issue
- Steps to reproduce
- Potential impact

---

## Disclaimer

This frontend application is provided as-is and is intended for educational,
experimental, or small-scale deployments.

It is **not certified** for high-assurance environments without additional
security hardening, monitoring, and review.

---

## Future Improvements

Potential future security enhancements include:
- Content Security Policy (CSP) hardening
- Automated dependency and security scanning
- Frontend-focused security testing prior to production releases
