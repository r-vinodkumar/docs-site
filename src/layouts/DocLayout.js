// src/layouts/DocLayout.js
export function renderDoc({ title, content, toc, currentPath, sidebar, basePath = '' }) {
  const sidebarHtml = sidebar.map(group => `
    <div class="sidebar-group">
      <div class="sidebar-title">${group.group}</div>
      <ul>
        ${group.items.map(item => {
          const fullLink = `${basePath}${item.link}`;
          const isActive = currentPath === item.link;
          return `<li><a href="${fullLink}" class="${isActive ? 'active' : ''}">${item.label}</a></li>`;
        }).join('')}
      </ul>
    </div>
  `).join('');

  const tocListItems = toc.map(h => `
    <li class="toc-depth-${h.level}"><a href="#${h.id}" data-toc-id="${h.id}">${h.text}</a></li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Docs</title>
  
  <!-- Merriweather Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap" rel="stylesheet">

  <style>
    /* 1. Low-Strain Eye Comfort Themes */
    :root[data-theme="light"] {
      --bg: #fdfcf9;
      --surface: #f3efe6;
      --border: #e2dcd0;
      --text: #2b2723;
      --text-muted: #736d64;
      --accent: #1e40af;
      --link-color: #1d4ed8;
      --link-hover: #1e3a8a;
      --code-bg: #eae4d5;
      --callout-bg: #f5f0e4;
      --callout-border: #d4a373;
    }

    :root[data-theme="dark"] {
      --bg: #151719;
      --surface: #1e2024;
      --border: #2c3036;
      --text: #dedcd7;
      --text-muted: #9499a2;
      --accent: #60a5fa;
      --link-color: #f3c27e;     /* Eye-friendly accessible amber */
      --link-hover: #fed7aa;
      --code-bg: #101113;
      --callout-bg: #1d2127;
      --callout-border: #60a5fa;
    }

    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: 'Merriweather', Georgia, serif; 
      background: var(--bg); 
      color: var(--text); 
      line-height: 1.8;
      font-weight: 300;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* URL link accessibility & wrapping */
    a { 
      color: var(--link-color); 
      text-decoration: underline; 
      text-underline-offset: 3px; 
      word-break: break-word; 
    }
    a:hover { color: var(--link-hover); }

    /* Sticky Top Header */
    header { 
      height: 60px; 
      border-bottom: 1px solid var(--border); 
      background: var(--surface); 
      display: flex; 
      align-items: center; 
      gap: 1rem; 
      padding: 0 1.5rem; 
      position: sticky; 
      top: 0; 
      z-index: 50; 
    }

    .menu-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 6px;
      padding: 0.35rem 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .menu-btn svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; }

    .logo { 
      font-family: system-ui, sans-serif;
      font-weight: 700; 
      color: var(--text); 
      text-decoration: none; 
      font-size: 1.05rem; 
      white-space: nowrap; 
      flex-shrink: 0;
    }

    .search-box { 
      position: relative; 
      flex: 1; 
      max-width: 450px; 
    }
    .search-input {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.82rem;
      outline: none;
      font-family: system-ui, sans-serif;
    }
    .search-input:focus { border-color: var(--accent); }

    .search-results {
      position: absolute;
      top: 115%;
      left: 0;
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      max-height: 260px;
      overflow-y: auto;
      display: none;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      z-index: 60;
    }
    .search-result-item {
      display: block;
      padding: 0.5rem 0.75rem;
      text-decoration: none;
      border-bottom: 1px solid var(--border);
    }
    .search-result-item:hover { background: var(--border); }
    .search-result-title { color: var(--text); font-size: 0.85rem; font-weight: 600; font-family: system-ui, sans-serif; }
    .search-result-snippet { color: var(--text-muted); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: system-ui, sans-serif; }

    .header-spacer { flex-grow: 1; }

    .theme-toggle {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 6px;
      padding: 0.35rem 0.55rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .theme-toggle svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; }

    /* Layout Shell */
    .layout-wrap {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
    }

    /* Left Sidebar */
    aside.sidebar { 
      width: 260px;
      flex-shrink: 0;
      border-right: 1px solid var(--border); 
      padding: 1.5rem 1rem; 
      background: var(--bg);
      position: sticky; 
      top: 60px; 
      height: calc(100vh - 60px); 
      overflow-y: auto; 
      transition: transform 0.2s ease;
      z-index: 40;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .sidebar-group { margin-bottom: 1.5rem; }
    .sidebar-title { font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.4rem; padding-left: 0.5rem; letter-spacing: 0.05em; }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar a { 
      display: block; 
      padding: 0.4rem 0.6rem; 
      color: var(--text-muted); 
      text-decoration: none; 
      font-size: 0.88rem; 
      border-radius: 6px; 
      margin-bottom: 2px;
    }
    .sidebar a:hover { color: var(--text); background: var(--surface); }
    .sidebar a.active { color: var(--text); background: var(--surface); border-left: 3px solid var(--accent); font-weight: 600; }

    .backdrop {
      display: none;
      position: fixed;
      inset: 0;
      top: 60px;
      background: rgba(0, 0, 0, 0.5);
      z-index: 35;
    }

    /* Content Area */
    main { 
      flex-grow: 1; 
      min-width: 0; 
      padding: 2.5rem 4rem; 
      max-width: 860px;
    }
    main h1, main h2, main h3 { font-weight: 700; color: var(--text); line-height: 1.35; scroll-margin-top: 80px; }
    main h1 { font-size: 2.2rem; margin-top: 0; margin-bottom: 1.25rem; }
    main h2 { font-size: 1.45rem; margin-top: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; }
    main p { margin: 1rem 0; font-size: 1rem; }
    main pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; border: 1px solid var(--border); overflow-x: auto; font-family: monospace; font-size: 0.88rem; }
    main code { font-family: monospace; font-size: 0.88em; }

    /* Boxed Callouts (Disclaimers & Notes) */
    main blockquote {
      margin: 1.75rem 0;
      padding: 1.1rem 1.4rem;
      background: var(--callout-bg);
      border-left: 4px solid var(--callout-border);
      border-top: 1px solid var(--border);
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      border-radius: 0 8px 8px 0;
      font-size: 0.95rem;
      line-height: 1.65;
    }
    main blockquote p { margin: 0; }
    main blockquote strong { color: var(--text); font-weight: 700; }

    /* Desktop TOC (Right Sidebar) */
    aside.desktop-toc { 
      width: 240px; 
      flex-shrink: 0; 
      padding: 2rem 1rem; 
      position: sticky; 
      top: 60px; 
      height: calc(100vh - 60px); 
      overflow-y: auto;
      font-family: system-ui, sans-serif;
    }
    .desktop-toc .toc-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .desktop-toc ul { list-style: none; padding: 0; margin: 0; border-left: 1px solid var(--border); }
    .desktop-toc a { 
      display: block; 
      padding: 0.25rem 0 0.25rem 0.85rem; 
      color: var(--text-muted); 
      text-decoration: none; 
      font-size: 0.82rem; 
      line-height: 1.4;
      border-left: 2px solid transparent;
      margin-left: -1px;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    .desktop-toc a:hover { color: var(--text); }
    .desktop-toc a.toc-active { 
      color: var(--accent); 
      font-weight: 600; 
      border-left: 2px solid var(--accent); 
    }
    .desktop-toc .toc-depth-3 { padding-left: 0.75rem; }

    /* Mobile Floating Bottom TOC Pill & Sheet */
    .mobile-toc {
      display: none;
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 45;
      font-family: system-ui, sans-serif;
    }
    .mobile-toc summary {
      list-style: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 0.55rem 1rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }
    .mobile-toc summary::-webkit-details-marker { display: none; }
    .mobile-toc ul {
      list-style: none;
      margin: 0;
      padding: 0.75rem 1rem;
      position: fixed;
      bottom: 4.5rem;
      left: 1rem;
      right: 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      max-height: 55vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }
    .mobile-toc a {
      display: block;
      padding: 0.4rem 0;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
    }
    .mobile-toc a:hover { color: var(--text); }
    .mobile-toc .toc-depth-3 { padding-left: 0.85rem; }

    /* Responsive Breakpoints */
    @media (max-width: 860px) {
      header { padding: 0 0.75rem; gap: 0.5rem; }
      aside.desktop-toc { display: none; }
      .header-spacer { display: none; }
      .mobile-toc { display: block; }
      aside.sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        bottom: 0;
        height: calc(100vh - 60px);
        transform: translateX(-100%);
        box-shadow: 2px 0 12px rgba(0,0,0,0.35);
      }
      aside.sidebar.open { transform: translateX(0); }
      .backdrop.open { display: block; }
      main { padding: 1.25rem; }
    }

    @media (min-width: 861px) {
      .menu-btn { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <!-- Left on mobile: Hamburger Menu -->
    <button id="menuBtn" class="menu-btn" aria-label="Toggle Navigation">
      <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>

    <!-- Site Name -->
    <a href="${basePath}/" class="logo">Docs Base</a>

    <!-- Middle: Search Input -->
    <div class="search-box">
      <input type="text" id="searchInput" class="search-input" placeholder="Search docs..." />
      <div id="searchResults" class="search-results"></div>
    </div>

    <!-- Desktop Spacer pushes theme toggle to far right -->
    <div class="header-spacer"></div>

    <!-- Far Right: Theme Toggle -->
    <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">
      <svg id="themeIcon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>
  </header>

  <div class="layout-wrap">
    <div id="backdrop" class="backdrop"></div>

    <aside id="sidebar" class="sidebar">
      ${sidebarHtml}
    </aside>

    <main>
      ${content}
    </main>

    <!-- Desktop Sticky TOC -->
    <aside class="desktop-toc">
      <div class="toc-title">On this page</div>
      <ul>${tocListItems}</ul>
    </aside>
  </div>

  <!-- Mobile Floating Bottom TOC Button -->
  ${toc.length > 0 ? `
  <details class="mobile-toc" id="mobileToc">
    <summary>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
      On this page
    </summary>
    <ul>${tocListItems}</ul>
  </details>
  ` : ''}

  <script>
    // 1. Theme Management
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('site-theme') || 
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const nextTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });

    function setTheme(theme) {
      htmlEl.setAttribute('data-theme', theme);
      localStorage.setItem('site-theme', theme);
      if (theme === 'light') {
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      } else {
        themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      }
    }

    // 2. Mobile Drawer Navigation
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');

    function toggleMenu() {
      const isOpen = sidebar.classList.toggle('open');
      backdrop.classList.toggle('open', isOpen);
    }

    menuBtn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', toggleMenu);

    // 3. Desktop Scroll-Spy
    const tocLinks = document.querySelectorAll('.desktop-toc a');
    const trackedHeadings = Array.from(document.querySelectorAll('main h2, main h3'));

    if (tocLinks.length > 0 && trackedHeadings.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              tocLinks.forEach((link) => {
                if (link.getAttribute('data-toc-id') === id) {
                  link.classList.add('toc-active');
                } else {
                  link.classList.remove('toc-active');
                }
              });
            }
          });
        },
        { rootMargin: '0px 0px -65% 0px', threshold: 0 }
      );

      trackedHeadings.forEach((h) => observer.observe(h));
    }

    // 4. Mobile Floating TOC Actions
    const mobileToc = document.getElementById('mobileToc');
    if (mobileToc) {
      mobileToc.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileToc.removeAttribute('open');
        });
      });

      document.addEventListener('click', (e) => {
        if (!mobileToc.contains(e.target)) {
          mobileToc.removeAttribute('open');
        }
      });
    }

    // 5. Client Search Logic
    let indexData = [];
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    fetch('${basePath}/search-index.json')
      .then(res => res.json())
      .then(data => { indexData = data; })
      .catch(() => {});

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        return;
      }

      const matches = indexData.filter(item => 
        item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q)
      );

      if (matches.length > 0) {
        searchResults.innerHTML = matches.map(m => \`
          <a href="\${m.link}" class="search-result-item">
            <div class="search-result-title">\${m.title}</div>
            <div class="search-result-snippet">\${m.snippet}</div>
          </a>
        \`).join('');
        searchResults.style.display = 'block';
      } else {
        searchResults.innerHTML = '<div style="padding: 0.6rem; font-size: 0.78rem; color: var(--text-muted);">No results found</div>';
        searchResults.style.display = 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-box')) {
        searchResults.style.display = 'none';
      }
    });
  </script>
</body>
</html>`;
}