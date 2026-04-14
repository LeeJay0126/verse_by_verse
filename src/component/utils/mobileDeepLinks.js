const MOBILE_APP_SCHEME = "versebyverse://";

export function buildMobileAppHomeUrl() {
  return MOBILE_APP_SCHEME;
}

export function buildMobileResetUrl({ email, token }) {
  const url = new URL("reset-password", MOBILE_APP_SCHEME);

  if (email) {
    url.searchParams.set("email", email);
  }

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}
