const COMMAND = "copy-current-url";
const TOAST_MS = 3000;

/**
 * Write text to the clipboard from the background context.
 *
 * navigator.clipboard is preferred, but it can reject when the background page
 * has no user activation, so fall back to a hidden textarea + execCommand,
 * which the "clipboardWrite" permission always allows.
 */
async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return copyViaTextarea(text);
  }
}

function copyViaTextarea(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  // Keep it out of sight but still selectable.
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);

  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (e) {
    copied = false;
  }

  textarea.remove();
  return copied;
}

/**
 * Show the toast inside the page. Injection is refused on privileged pages
 * (about:*, addons.mozilla.org, the PDF viewer, view-source:), so the caller
 * falls back to a native notification when this returns false.
 */
async function showToastInTab(tabId, title, subtitle, isError) {
  try {
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: showCopyLinkToast,
      args: [title, subtitle, TOAST_MS, isError]
    });
    return results?.[0]?.result === true;
  } catch (e) {
    return false;
  }
}

async function showNotification(title, message) {
  try {
    const id = await browser.notifications.create({
      type: "basic",
      title,
      message
    });
    setTimeout(() => browser.notifications.clear(id), TOAST_MS);
  } catch (e) {
    // Nothing left to fall back to; the badge still signals the result.
  }
}

async function flashBadge(ok) {
  await browser.action.setBadgeBackgroundColor({
    color: ok ? "#1a7f37" : "#cf222e"
  });
  await browser.action.setBadgeText({ text: ok ? "✓" : "✗" });
  setTimeout(() => browser.action.setBadgeText({ text: "" }), 1200);
}

async function copyCurrentUrl() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) {
    await flashBadge(false);
    return;
  }

  const ok = await writeToClipboard(tab.url);
  const title = ok ? "Link copied" : "Couldn't copy link";
  const subtitle = tab.url;

  await flashBadge(ok);

  const shown = await showToastInTab(tab.id, title, subtitle, !ok);
  if (!shown) {
    await showNotification(title, subtitle);
  }
}

browser.commands.onCommand.addListener((command) => {
  if (command === COMMAND) {
    copyCurrentUrl();
  }
});

browser.action.onClicked.addListener(() => {
  copyCurrentUrl();
});
