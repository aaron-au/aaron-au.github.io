/* Minimal CDP helper for verifying this site in headless Chrome.
   Node >= 22 (built-in fetch + WebSocket), no dependencies.

   Usage from a scratchpad script:
     import { launch, loginAsGuest, geometry, sleep } from "<repo>/.claude/skills/verify/cdp.mjs";
     const c = await launch();                    // kills stale instances first
     await c.goto("http://127.0.0.1:8123/");
     await loginAsGuest(c);
     const g = await geometry(c, "#menubar");     // computed visibility + rect
     await c.screenshot("/path/to/shot.png");     // then LOOK at it
     await c.close();
*/
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ port = 9333, width = 1440, height = 900 } = {}) {
  // Stale instances serve stale emulation and confuse everything — kill first.
  spawn("pkill", ["-f", `remote-debugging-port=${port}`]);
  await sleep(400);

  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--window-size=${width},${height}`,
      "--use-angle=swiftshader", // WebGL; without it WebQuake alert()s and hangs
      "--no-first-run",
      `--user-data-dir=/tmp/cdp-profile-${port}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {}
    if (!target) await sleep(200);
  }
  if (!target) {
    proc.kill();
    throw new Error("Chrome debugger endpoint never came up on port " + port);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error("WebSocket connect failed"));
  });

  let nextId = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    // Auto-accept dialogs — an unhandled alert() freezes the page forever.
    if (msg.method === "Page.javascriptDialogOpening") {
      send("Page.handleJavaScriptDialog", { accept: true });
    }
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, (msg) =>
        msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)
      );
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  await send("Page.enable");
  await send("Runtime.enable");

  const c = {
    proc,
    send,

    async eval(expression) {
      const r = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      }
      return r.result.value;
    },

    async goto(url, settleMs = 800) {
      await send("Page.navigate", { url });
      await sleep(settleMs);
    },

    // Desktop headless clamps window width to ~500px — phone sizes MUST use
    // emulation, not --window-size.
    async phone(w = 390, h = 844) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: w,
        height: h,
        deviceScaleFactor: 2,
        mobile: true,
      });
      await sleep(300);
    },

    async click(x, y) {
      for (const type of ["mousePressed", "mouseReleased"]) {
        await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
      }
    },

    // Real key events (games and Escape handlers need keydown, not insertText).
    async press(key, { code, keyCode = 0 } = {}) {
      const base = {
        key,
        code: code || key,
        windowsVirtualKeyCode: keyCode,
        nativeVirtualKeyCode: keyCode,
      };
      await send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...base });
      if (key.length === 1) {
        await send("Input.dispatchKeyEvent", { type: "char", text: key, ...base });
      }
      await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
    },

    // For contenteditable fields (terminal, login password, Wi-Fi password).
    async type(text) {
      await send("Input.insertText", { text });
    },

    async waitFor(expression, { timeoutMs = 5000, intervalMs = 200 } = {}) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (await c.eval(expression)) return true;
        await sleep(intervalMs);
      }
      throw new Error("waitFor timed out: " + expression);
    },

    async screenshot(path) {
      const r = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(path, Buffer.from(r.data, "base64"));
      return path;
    },

    async close() {
      try {
        ws.close();
      } catch {}
      proc.kill();
    },
  };
  return c;
}

/* Click the Guest user on the login screen. Do this before poking the
   desktop — nothing else is interactable pre-login. */
export async function loginAsGuest(c) {
  await c.waitFor(`!!document.querySelector('#login-screen [data-user="guest"]')`);
  await c.eval(`document.querySelector('#login-screen [data-user="guest"]').click()`);
  await sleep(700); // login fade-out
}

/* Computed visibility + geometry for a selector. Assert on THIS, never on
   attributes — [hidden] can lose to display:flex and the element still shows
   (or an attribute-visible element can render 0x0). */
export async function geometry(c, selector) {
  return c.eval(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return { exists: false, visible: false };
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      exists: true,
      visible: s.display !== "none" && s.visibility !== "hidden" &&
               parseFloat(s.opacity) > 0 && r.width > 0 && r.height > 0,
      x: r.x, y: r.y, width: r.width, height: r.height,
      display: s.display, zIndex: s.zIndex,
    };
  })()`);
}
