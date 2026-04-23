# Frontend Authentication Limits

This document records the authentication-related limits and guards currently enforced by the frontend. Backend validation should still be treated as the source of truth, because frontend checks can be bypassed.

## Web Signup

Source: `src/pages/Account/signUp/SignUp.js`

| Field | Frontend limit / rule |
| --- | --- |
| First name | Required, normalized by collapsing spaces and trimming, max 20 characters |
| Last name | Required, normalized by collapsing spaces and trimming, max 20 characters |
| Email | Required, trimmed, max 254 characters, must match `^[^@\s]+@[^@\s]+\.[^@\s]+$` |
| Username | Required, trimmed, 4-20 characters |
| Username characters | Letters, numbers, dot, underscore only: `^[a-zA-Z0-9._]+$` |
| Username punctuation | Cannot start or end with `.` or `_` |
| Username punctuation patterns | Rejects `..`, `__`, `._`, and `_.` |
| Password | Required, 10-72 characters |
| Password strength | Uses `zxcvbn`; requires score 3 or higher |
| Common passwords | Rejects a small local blocklist such as `password`, `password123`, `1234567890`, `qwerty123`, `admin`, `welcome` |
| Password user inputs | `zxcvbn` receives username, email, first name, last name, and email local-part as user inputs |
| Confirm password | Required and must exactly match password |
| Submit | Submit button is disabled when invalid or loading |
| Duplicate submit | Guarded with `submittingRef` to block rapid repeated signup requests |

Password paste and change handlers truncate over-limit input to 72 characters and show an error. The request sends `firstName`, `lastName`, `email`, `username`, `password`, and `passwordScore`.

## Web Sign In

Source: `src/pages/Account/Account.js`

| Field | Frontend limit / rule |
| --- | --- |
| Identifier | Required after trimming, minimum 3 characters |
| Password | Required, minimum 4 characters |
| Submit | Submit button is disabled when invalid or submitting |
| Email not verified | If backend returns `EMAIL_NOT_VERIFIED`, user is sent to `/check-email` |

No explicit max length is set on the sign-in identifier or password fields.

## Web Forgot Password

Source: `src/pages/Account/findUser/FindPw.js`

| Field | Frontend limit / rule |
| --- | --- |
| Email | Required, trimmed, max 254 characters, must match `^[^@\s]+@[^@\s]+\.[^@\s]+$` |
| Submit | Submit button is disabled while sending or when email is invalid |
| Request payload | Sends lowercase trimmed email |
| After success | Email input becomes read-only |

## Web Reset Password

Source: `src/pages/Account/findUser/ResetPassword.js`

| Field | Frontend limit / rule |
| --- | --- |
| Email | Required from reset link query parameter |
| Token | Required from reset link query parameter |
| New password | Required, 10-72 characters |
| Confirm password | Required and must exactly match new password |
| Inputs | Password fields use `maxLength={72}` |
| Submit | Submit button is disabled while saving, when password is invalid, or when passwords do not match |
| Request payload | Sends lowercase email, token, and new password |

Unlike web signup, reset password does not run `zxcvbn` strength scoring or common-password checks in the frontend.

## Web Email Verification

Sources:

- `src/pages/Account/email/VerifyEmail.js`
- `src/pages/Account/email/CheckEmail.js`
- `src/pages/Account/email/ExpiredVerifyEmail.js`
- `src/pages/Account/email/resendCooldown.js`

| Flow | Frontend limit / rule |
| --- | --- |
| Verify email | Requires `email` and `token` query parameters |
| Verify email success | Shows verified or already-verified message, then redirects to `/account` after 800 ms |
| Invalid/expired link | On backend `INVALID_OR_EXPIRED`, redirects to `/verify-email-expired` |
| Resend email field | Requires valid email, max 254 characters |
| Resend cooldown | 60 seconds, stored in `sessionStorage` per normalized email |
| Verification link TTL display | UI tells users links expire in 5 minutes |
| Resend submit | Disabled while sending, when email is invalid, or while cooldown remains |
| Backend throttling | Frontend recognizes `TOO_SOON` or HTTP 429 and restores cooldown messaging |

The resend cooldown is a UX guard only. Backend throttling must still enforce resend limits.

## Mobile Sign In

Sources:

- `apps/mobile/App.js`
- `apps/mobile/src/components/AuthSectionCard.js`

| Field | Frontend limit / rule |
| --- | --- |
| Identifier | Required after trimming |
| Password | Required after trimming |
| Submit | Disabled while submitting |
| Email not verified | If backend returns `EMAIL_NOT_VERIFIED`, switches to check-email mode |

Mobile sign-in does not set explicit max lengths for identifier or password inputs.

## Mobile Signup

Sources:

- `apps/mobile/App.js`
- `apps/mobile/src/components/AuthSectionCard.js`

| Field | Frontend limit / rule |
| --- | --- |
| First name | Required, trimmed |
| Last name | Required, trimmed |
| Email | Required, trimmed, lowercased, must match `^[^@\s]+@[^@\s]+\.[^@\s]+$` |
| Username | Required, trimmed, minimum 4 characters |
| Password | Required, 10-72 characters |
| Confirm password | Required and must exactly match password |
| Submit | Guarded with `signUpSubmittingRef` to block rapid repeated signup requests |

Mobile signup does not currently enforce the web signup max lengths for first name, last name, username, or the web username punctuation rules. It also does not run `zxcvbn` or the common-password blocklist.

## Mobile Forgot Password

Source: `apps/mobile/App.js`

| Field | Frontend limit / rule |
| --- | --- |
| Email | Required after trimming and lowercasing |
| Submit | Disabled while submitting |

Mobile forgot password does not currently run the same email regex or 254-character max check before calling the shared auth API.

## Mobile Reset Password

Source: `apps/mobile/App.js`

| Field | Frontend limit / rule |
| --- | --- |
| Email | Required after trimming and lowercasing |
| Token | Required after trimming |
| New password | Required, 10-72 characters |
| Confirm password | Required and must exactly match new password |
| Submit | Disabled while submitting |

Mobile reset password does not run `zxcvbn` strength scoring or common-password checks in the frontend.

## Mobile Email Verification Resend

Source: `apps/mobile/App.js`

| Field | Frontend limit / rule |
| --- | --- |
| Email | Required after trimming and lowercasing |
| Submit | Disabled while submitting |

Mobile resend does not currently have the web 60-second session cooldown. It relies on the backend/shared auth API for throttling errors.

## Shared Auth API Client

Source: `packages/shared/auth.js`

The shared auth client wraps these endpoints but does not enforce field lengths or validation rules:

- `GET /auth/me`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/signup`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

It parses JSON safely and throws errors when HTTP status is not OK or `data.ok === false`.

## Alignment Notes

- Web signup is stricter than mobile signup. If the same account rules should apply everywhere, move shared validation constants/functions into `packages/shared`.
- Frontend max lengths and regex checks improve UX, but backend must enforce all limits.
- Password length is consistently capped at 72 on web signup, web reset, mobile signup, and mobile reset.
- Email max length of 254 is enforced in web auth forms, but not consistently in mobile auth flows.
- Login max lengths are not enforced on web or mobile.
- Web resend verification has a 60-second frontend cooldown; mobile resend verification does not.
