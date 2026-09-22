/**
 * Injected into the active tab to show a transient toast in the top-right
 * corner. Must be fully self-contained: it is serialised and run in the page.
 */
function showCopyLinkToast(title, subtitle, durationMs, isError) {
  const HOST_ID = "__copy_link_toast_host__";
  const FADE_MS = 220;

  if (!document.body) return false;

  // Replace any toast still on screen from a previous copy.
  const previous = document.getElementById(HOST_ID);
  if (previous) previous.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.setProperty("position", "fixed", "important");
  host.style.setProperty("top", "16px", "important");
  host.style.setProperty("right", "16px", "important");
  host.style.setProperty("z-index", "2147483647", "important");
  host.style.setProperty("pointer-events", "none", "important");

  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .card {
        pointer-events: auto;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        max-width: 380px;
        padding: 12px 14px;
        border-radius: 10px;
        background: #1f2328;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.32);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
        opacity: 0;
        transform: translateY(-8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .card.visible { opacity: 1; transform: translateY(0); }
      .mark {
        flex: none;
        width: 18px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 700;
        background: #2da44e;
        color: #ffffff;
      }
      .mark.error { background: #cf222e; }
      .text { min-width: 0; }
      .title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
      }
      .subtitle {
        margin-top: 2px;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.72);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        direction: ltr;
      }
      @media (prefers-reduced-motion: reduce) {
        .card { transition: none; transform: none; }
      }
    </style>
    <div class="card" role="status" aria-live="polite">
      <div class="mark${isError ? " error" : ""}">${isError ? "!" : "✓"}</div>
      <div class="text">
        <div class="title"></div>
        <div class="subtitle"></div>
      </div>
    </div>
  `;

  const card = root.querySelector(".card");
  // textContent, not innerHTML: the URL is untrusted page-controlled data.
  root.querySelector(".title").textContent = title;
  root.querySelector(".subtitle").textContent = subtitle;
  root.querySelector(".subtitle").title = subtitle;

  document.body.appendChild(host);
  requestAnimationFrame(() => card.classList.add("visible"));

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    card.classList.remove("visible");
    setTimeout(() => host.remove(), FADE_MS);
  };

  card.addEventListener("click", dismiss);
  setTimeout(dismiss, durationMs);

  return true;
}
