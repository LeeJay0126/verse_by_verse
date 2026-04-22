const WALKTHROUGH_REDIRECTS = [
  { prefixes: ["/create-community", "/browse-community", "/community"], to: "/community-how" },
  { prefixes: ["/bible", "/study", "/study/notes", "/notes"], to: "/bible/walkthrough" },
];

export const getLoggedOutRedirectPath = (pathname = "") => {
  const path = String(pathname || "");

  const match = WALKTHROUGH_REDIRECTS.find(({ prefixes }) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  );

  return match?.to || "/account";
};
