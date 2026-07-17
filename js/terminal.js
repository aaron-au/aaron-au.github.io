/* Terminal — a toy shell over the app registry, with easter eggs.
   `ls` shows a fake home directory of the site's apps; opening a "file" opens
   the corresponding window. Colours and "interpreter" are configurable for
   fun (`color`, `zsh`/`bash`/`fish`/`python`). Nothing here is a real shell. */
"use strict";

const Terminal = (() => {
  const USER = "guest";
  const HOST = "aaronlees";
  const BOOT_TIME = Date.now();

  // name shown by ls -> app id ("Games" is a folder)
  const HOME = [
    { name: "About Me.app", id: "about" },
    { name: "Résumé.app", id: "resume" },
    { name: "Blog.app", id: "blog" },
    { name: "Projects.app", id: "projects" },
    { name: "Contact.app", id: "contact" },
    { name: "Terminal.app", id: "terminal" },
    { name: "Games", dir: true },
    { name: "README.md", file: true },
  ];
  const GAMES = [
    { name: "DOOM.exe", id: "doom" },
    { name: "QUAKE.exe", id: "quake" },
    { name: "LEMMINGS.exe", id: "lemmings" },
  ];

  const PROMPTS = {
    zsh: () => USER + "@" + HOST + " ~ % ",
    bash: () => USER + "@" + HOST + ":~$ ",
    fish: () => USER + "@" + HOST + " ~> ",
    sh: () => "$ ",
    python: () => ">>> ",
  };

  function openApp(id) {
    if (document.body.dataset.mode === "ios") IOS.open(id);
    else WM.open(id);
  }

  /* Resolve a user-typed name to an app: "blog", "Blog.app", "doom.exe"… */
  function resolveApp(word) {
    const w = word.toLowerCase().replace(/\.(app|exe)$/, "");
    const alias = { "about": "about", "aboutme": "about", "about me": "about",
      "resume": "resume", "résumé": "resume", "cv": "resume" };
    const id = alias[w] || w;
    return Apps.get(id) ? id : null;
  }

  function init(node) {
    const term = node.querySelector(".term");
    const out = node.querySelector(".term-out");
    const promptEl = node.querySelector(".term-prompt");
    const input = node.querySelector(".term-input");

    const st = { shell: "zsh", history: [], histIdx: -1 };

    const print = (text, cls) => {
      const div = document.createElement("div");
      div.className = "term-row" + (cls ? " " + cls : "");
      div.textContent = text;
      out.appendChild(div);
    };
    const printHtml = (html) => {
      const div = document.createElement("div");
      div.className = "term-row";
      div.innerHTML = html;
      out.appendChild(div);
    };
    const scroll = () => { term.scrollTop = term.scrollHeight; };
    const setPrompt = () => { promptEl.textContent = PROMPTS[st.shell](); };

    const CMDS = {
      help() {
        printHtml("Available commands:<br>" +
          "  <b>ls</b> [Games]      list this place<br>" +
          "  <b>open</b> &lt;name&gt;    open an app (or just type its name)<br>" +
          "  <b>cat</b> README.md   read the fine print<br>" +
          "  <b>theme</b> dark|light  switch appearance<br>" +
          "  <b>color</b> fg|bg &lt;css-color&gt;  restyle the terminal (color reset to undo)<br>" +
          "  <b>zsh</b> | <b>bash</b> | <b>fish</b> | <b>sh</b> | <b>python</b>  change interpreter<br>" +
          "  <b>reboot</b> windows|macos  switch operating systems<br>" +
          "  <b>whoami</b>, <b>pwd</b>, <b>date</b>, <b>uname</b>, <b>echo</b>, <b>battery</b>, <b>neofetch</b>, <b>clear</b>, <b>exit</b>");
      },
      ls(args) {
        const target = (args[0] || "").replace(/\/$/, "").toLowerCase();
        if (target === "games") {
          printHtml(GAMES.map((g) => '<span class="t-exe">' + g.name + "</span>").join("   "));
        } else if (!target || target === "~" || target === ".") {
          printHtml(HOME.map((e) =>
            e.dir ? '<span class="t-dir">' + e.name + "/</span>"
            : e.file ? '<span class="t-file">' + e.name + "</span>"
            : '<span class="t-app">' + e.name.replace(/ /g, "&nbsp;") + "</span>"
          ).join("   "));
        } else {
          print("ls: " + args[0] + ": No such file or directory");
        }
      },
      open(args) {
        if (!args.length) { print("usage: open <name>   (try ls)"); return; }
        const id = resolveApp(args.join(" "));
        if (!id) { print("open: " + args.join(" ") + ": No such app"); return; }
        print("Opening " + Apps.get(id).title + "…");
        openApp(id);
      },
      cat(args) {
        if ((args[0] || "").toLowerCase() === "readme.md") {
          print("# aaronlees.id.au");
          print("Plain HTML/CSS/JS pretending to be two operating systems.");
          print("No frameworks. No build step. No telemetry. Some demons.");
        } else {
          print("cat: " + (args[0] || "") + ": No such file or directory");
        }
      },
      clear() { out.textContent = ""; },
      pwd() { print("/Users/" + USER); },
      whoami() { print(USER + "   (you could be anyone. that's the beauty of it)"); },
      date() { print(new Date().toString()); },
      echo(args) { print(args.join(" ")); },
      history() { st.history.forEach((h, i) => print("  " + (i + 1) + "  " + h)); },
      uname(args) {
        print(args.includes("-a")
          ? "aaronOS 1.0 " + HOST + ".id.au wasm x86_64 (DOS-compatible-ish)"
          : "aaronOS");
      },
      battery() {
        const b = Widgets.batteryNow();
        print("Battery: " + b.pct + "%" + (b.charging ? " (charging)" : "") +
          "   — it means something. Figure it out.");
      },
      theme(args) {
        const t = (args[0] || "").toLowerCase();
        if (t !== "dark" && t !== "light") { print("usage: theme dark|light"); return; }
        document.documentElement.dataset.theme = t;
        safeStore.set("theme", t);
        document.documentElement.dataset.effectiveTheme = t;
        print("Appearance set to " + t + ".");
      },
      color(args) {
        const [which, ...rest] = args;
        const value = rest.join(" ");
        if (which === "reset") {
          node.style.removeProperty("--term-bg");
          node.style.removeProperty("--term-fg");
          print("Colours reset.");
        } else if ((which === "fg" || which === "bg") && value) {
          if (!CSS.supports("color", value)) { print("color: '" + value + "' is not a CSS colour"); return; }
          node.style.setProperty(which === "fg" ? "--term-fg" : "--term-bg", value);
          print("Set " + which + " to " + value + ".");
        } else {
          print("usage: color fg <css-color> | color bg <css-color> | color reset");
        }
      },
      neofetch() {
        const up = Math.floor((Date.now() - BOOT_TIME) / 1000);
        const b = Widgets.batteryNow();
        printHtml('<pre class="t-neofetch">' +
"     _____        " + USER + "@" + HOST + ".id.au\n" +
"    /  _  \\       ---------------------\n" +
"   /  /_\\  \\      OS: aaronOS 1.0 (HTML, hand-carved)\n" +
"  /  _____  \\     Host: GitHub Pages\n" +
" /__/     \\__\\    Shell: " + st.shell + "\n" +
"                  Uptime: " + up + "s\n" +
"  no telemetry    Battery: " + b.pct + "%" + (b.charging ? " ⚡" : "") + "\n" +
"  no cookies      Resolution: " + window.innerWidth + "×" + window.innerHeight + "\n" +
"  some demons     DE: macOS-ish / iOS-ish\n" +
"</pre>");
      },
      exit() {
        print("logout");
        setTimeout(() => {
          if (document.body.dataset.mode === "ios") IOS.goHome();
          else WM.close("terminal");
        }, 150);
      },
      sudo(args) {
        if (args.join(" ").startsWith("rm -rf /")) { CMDS.rm(["-rf", "/"]); return; }
        print(USER + " is not in the sudoers file. This incident will be reported.");
        print("(to whom? nobody. there's no backend.)");
      },
      rm(args) {
        if (args.join(" ").replace(/\s+/g, " ").startsWith("-rf /")) {
          print("removing /System… ✓");
          print("removing /Applications… ✓");
          print("removing /Users/" + USER + "/hopes… ✓");
          setTimeout(() => {
            print("…just kidding. It's a static site. There is nothing to delete.", "t-dim");
            scroll();
          }, 900);
        } else {
          print("rm: permission denied (and honestly, why?)");
        }
      },
      man(args) { print("No manual entry for " + (args[0] || "man") + ". Have you tried guessing?"); },
      reboot(args) {
        const t = (args[0] || "").toLowerCase();
        if (t === "windows" || t === "win") { print("Rebooting into Windows…"); window.System.rebootInto("win"); }
        else if (t === "macos" || t === "mac") { print("Rebooting into macOS…"); window.System.rebootInto("mac"); }
        else print("usage: reboot windows|macos   (currently: " + (window.System.currentSkin() === "win" ? "Windows" : "macOS") + ")");
      },
      winver() { print("aaronOS 1.0 (" + (window.System.currentSkin() === "win" ? "Windows flavour" : "macOS flavour") + ") — all versions equally fake"); },
      vim() { print("vim: you're already trapped in one fake environment. Two seems unwise."); },
      hello() { print("G'day."); },
      games() { CMDS.ls(["Games"]); },
    };
    // interpreter switches
    ["zsh", "bash", "fish", "sh"].forEach((sh) => {
      CMDS[sh] = () => { st.shell = sh; setPrompt(); print("Switched to " + sh + "."); };
    });
    CMDS.python = () => {
      st.shell = "python";
      setPrompt();
      print('Python 3.∞.0 (fake, ' + new Date().getFullYear() + ') [wasm] on aaronOS');
      print('Type "exit()" to escape.');
    };

    function runPython(line) {
      const l = line.trim();
      if (l === "exit()" || l === "quit()") { st.shell = "zsh"; setPrompt(); print("Back to zsh."); return; }
      if (/^print\((.*)\)$/.test(l)) {
        try { print(String(eval(l.match(/^print\((.*)\)$/)[1]))); } // eslint-disable-line no-eval
        catch (e) { print("Traceback (most recent call last):\n  " + e.message); }
        return;
      }
      if (/^\d[\d\s+\-*/.()%]*$/.test(l)) {
        try { print(String(eval(l))); return; } catch (e) { /* fall through */ } // eslint-disable-line no-eval
      }
      if (l === "import this") { print("Beautiful is better than ugly.\nSimple is better than complex.\nWindows that drag are better than divs that don't."); return; }
      print("NameError: name '" + l.split(/[^\w]/)[0] + "' is not defined (this python is 90% vibes)");
    }

    function run(line) {
      printHtml('<span class="t-dim">' + escapeHtml(promptEl.textContent) + "</span>" + escapeHtml(line));
      if (!line.trim()) return;
      st.history.push(line);
      st.histIdx = st.history.length;

      if (st.shell === "python") { runPython(line); return; }

      const [cmd, ...args] = line.trim().split(/\s+/);
      const c = cmd.toLowerCase();
      if (CMDS[c]) { CMDS[c](args); return; }
      const id = resolveApp(cmd);
      if (id) { print("Opening " + Apps.get(id).title + "…"); openApp(id); return; }
      print(st.shell + ": command not found: " + cmd + "   (try: help)");
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[ch]));
    }

    /* The input is a contenteditable span (see index.html for why), so value
       access goes through textContent and history recall re-places the caret. */
    const getInput = () => input.textContent;
    const setInput = (text) => {
      input.textContent = text;
      const range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        run(getInput());
        setInput("");
        scroll();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (st.histIdx > 0) { st.histIdx--; setInput(st.history[st.histIdx] || ""); }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (st.histIdx < st.history.length) { st.histIdx++; setInput(st.history[st.histIdx] || ""); }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        CMDS.clear();
      }
    });
    // Paste as plain text only — contenteditable would happily take HTML
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text.replace(/\n/g, " "));
    });
    term.addEventListener("click", (e) => {
      if (!input.contains(e.target)) input.focus();
    });

    setPrompt();
    print("aaronOS Terminal — type 'help' to see what this thing pretends to do.");
    printHtml('<span class="t-dim">Last login: never. First login, actually. Welcome.</span>');
  }

  return { init };
})();

Apps.onCreate("terminal", Terminal.init);
