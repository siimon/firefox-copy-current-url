# Copy Link

A minimal Firefox extension that copies the current tab's URL to the clipboard.

- **Keyboard shortcut:** `Ctrl+Shift+C` on every platform (on macOS that's the
  real **Control** key, not Command)
- **Toolbar button:** click the icon to copy
- A **toast** appears in the page's top-right corner for 5 seconds, showing the
  copied URL as its subtitle (click it to dismiss early)
- A ✓ / ✗ badge also flashes briefly on the toolbar icon

## About the shortcut

`Ctrl+Shift+C` is used instead of `Cmd+Shift+C` because **`Cmd+Shift+C` is
Firefox's built-in DevTools Inspector shortcut**, and built-in shortcuts take
precedence over extension ones. On macOS Firefox almost everything is bound to
Command, which leaves the Control layer free.

To change it, no code edit needed:

1. Open `about:addons`
2. Click the gear icon (top right) -> **Manage Extension Shortcuts**
3. Find **Copy Link** and set whatever you prefer

That page also warns you if the combo is already claimed by another extension.

## Install (temporary, for development)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `manifest.json` in this folder

Temporary add-ons are removed when Firefox restarts.

## Install permanently

Unsigned extensions only load permanently in Firefox Developer Edition, Nightly,
or ESR (with `xpinstall.signatures.required` set to `false` in `about:config`).
For release Firefox, submit the packaged extension to
[addons.mozilla.org](https://addons.mozilla.org/developers/) for signing.

Package it with:

```sh
zip -r -FS copy-link.zip manifest.json background.js toast.js icons -x '*.DS_Store'
```

## The toast

The toast is injected into the current page and rendered inside a closed shadow
root, so page CSS can't affect it and it can't affect the page. The URL is set
via `textContent`, never `innerHTML`.

Firefox blocks script injection on privileged pages (`about:*`,
`addons.mozilla.org`, `view-source:`, the built-in PDF viewer). On those, the
extension falls back to a native OS notification, which on macOS also appears in
the top-right. Copying itself still works everywhere, because the clipboard
write happens in the background page rather than in the tab.

## Permissions

- `tabs` — read the active tab's URL
- `activeTab` — inject the toast into the current tab, granted only when you
  press the shortcut or click the icon (no broad host permission needed)
- `scripting` — perform that injection
- `clipboardWrite` — write to the clipboard
- `notifications` — fallback toast on pages where injection is blocked
