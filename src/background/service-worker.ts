chrome.storage.session.setAccessLevel({
  accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
});

chrome.webRequest.onSendHeaders.addListener(
  async ({ url, requestHeaders }) => {
    const search = new URL(url).searchParams;
    if (search.get("type") !== "img") {
      return;
    }
    const id = search.get("id");
    const index = search.get("index");
    const token = requestHeaders?.find(
      (e) => e.name === "Authorization"
    )?.value;
    const key = `${id}?${index}`;
    chrome.storage.session.set({ [key]: token });
  },
  { urls: ["https://musescore.com/api/jmuse*"] },
  ["requestHeaders"]
);
