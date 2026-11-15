export function renderErrorPage(errorDetail?: string): string {
  const safeErr = errorDetail ? errorDetail.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 32rem; width: 100%; text-align: center; padding: 2rem; background: #fff; border-radius: 1rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      h1 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; font-size: 0.95rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
      .reset { background: #fef3c7; color: #92400e; border-color: #fde68a; }
      .reset:hover { background: #fde68a; }
      .error-box { margin-top: 1rem; text-align: left; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-family: monospace; max-height: 120px; overflow-y: auto; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or reset your local CRM state.</p>
      ${safeErr ? `<div class="error-box">${safeErr}</div>` : ""}
      <div class="actions" style="margin-top: 1.5rem;">
        <button class="primary" onclick="location.reload()">Try again</button>
        <button class="reset" onclick="try{localStorage.clear();}catch(e){}location.href='/dashboard'">Reset & Open Dashboard</button>
        <a class="secondary" href="/dashboard">Go to Dashboard</a>
      </div>
    </div>
  </body>
</html>`;
}
