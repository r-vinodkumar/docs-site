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
    <li class="toc-depth-${h.level}"><a href="#${h.id}">${h.text}</a></li>
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
    /* 1. Low Strain Themes */
    :root[data-theme="light"] {
      --bg: #fbf9f4;            /* Soft warm paper cream */
      --surface: #f4f0e6;       /* Header and card surfaces */
      --border: #e6dfcf;        /* Subtle warm divider */
      --text: #2d2a26;          /* Deep warm charcoal */
      --text-muted: #787168;    /* Muted ink */
      --accent: #2e609a;        /* Low-glare muted slate blue */
      --code-bg: #ece6d8;
    }

    :root[data-theme="dark"] {
      --bg: #161719;            /* Non-pure black: deep matte charcoal */
      --surface: #1e2023;       /* Mildly elevated surface */
      --border: #2a2d32;        /* Low-contrast outline */
      --text: #dcdad5;          /* Off-white reading text */
      --text-muted: #8e9299;    /* Calm secondary label text */
      --accent: #60a5fa;        /* Soft accessible accent */
      --code-bg: #111214;
    }

    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: 'Merriweather', Georgia, serif; 
      background: var(--bg); 
      color: var(--text); 
      line-height: 1.75;
      font-weight: 300;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* Top Sticky Header */
    header { 
      height: 60px; 
      border-bottom: 1px solid var(--border); 
      background: var(--surface); 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      padding: 0 1rem; 
      position: sticky; 
      top: 0; 
      z-index: 50; 
    }

    /* Header Component Layout */
    .menu-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 5px;
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
      font-size: 0.95rem; 
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
      padding: 0.35rem 0.65rem;
      border-radius: 5px;
      font-size: 0.8rem;
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
      box-shadow: 0 8px 16px rgba(0,0,0,0.25);
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

    .theme-toggle {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 5px;
      padding: 0.35rem 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .theme-toggle svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; }

    /* Layout Shell */
    .layout-wrap {
      display: flex;
      max-width: 1350px;
      margin: 0 auto;
      position: relative;
    }

    /* Left Sidebar */
    aside.sidebar { 
      width: 250px;
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
    .sidebar-title { font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.4rem; padding-left: 0.5rem; letter-spacing: 0.05em; }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar a { 
      display: block; 
      padding: 0.35rem 0.5rem; 
      color: var(--text-muted); 
      text-decoration: none; 
      font-size: 0.88rem; 
      border-radius: 4px; 
      margin-bottom: 2px;
    }
    .sidebar a:hover { color: var(--text); background: var(--surface); }
    .sidebar a.active { color: var(--text); background: var(--border); font-weight: 600; }

    .backdrop {
      display: none;
      position: fixed;
      inset: 0;
      top: 60px;
      background: rgba(0, 0, 0, 0.4);
      z-index: 35;
    }

    /* Center Content Area */
    main { 
      flex-grow: 1; 
      min-width: 0; 
      padding: 2rem 3rem; 
      max-width: 820px;
    }
    main h1, main h2, main h3 { font-weight: 700; color: var(--text); line-height: 1.3; }
    main h1 { font-size: 2.1rem; margin-top: 0; margin-bottom: 1rem; }
    main h2 { font-size: 1.4rem; margin-top: 2.2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
    main p { margin: 1rem 0; font-size: 1rem; }
    main pre { background: var(--code-bg); padding: 0.85rem; border-radius: 5px; border: 1px solid var(--border); overflow-x: auto; font-family: monospace; font-size: 0.85rem; }
    main code { font-family: monospace; font-size: 0.85em; }

    /* In-Page TOC (Mobile Dropdown) */
    .mobile-toc {
      display: none;
      margin-bottom: 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 5px;
      font-family: system-ui, sans-serif;
    }
    .mobile-toc summary {
      padding: 0.5rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--text);
      user-select: none;
    }
    .mobile-toc ul {
      list-style: none;
      margin: 0;
      padding: 0.4rem 0.85rem 0.6rem;
      border-top: 1px solid var(--border);
    }
    .mobile-toc a { display: block; padding: 0.25rem 0; color: var(--text-muted); text-decoration: none; font-size: 0.8rem; }
    .mobile-toc .toc-depth-3 { padding-left: 0.6rem; }

    /* In-Page TOC (Desktop Sidebar) */
    aside.desktop-toc { 
      width: 210px; 
      flex-shrink: 0; 
      padding: 1.5rem 1rem; 
      position: sticky; 
      top: 60px; 
      height: calc(100vh - 60px); 
      font-family: system-ui, sans-serif;
    }
    .desktop-toc .toc-title { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .desktop-toc ul { list-style: none; padding: 0; margin: 0; border-left: 1px solid var(--border); }
    .desktop-toc a { display: block; padding: 0.2rem 0 0.2rem 0.75rem; color: var(--text-muted); text-decoration: none; font-size: 0.78rem; }
    .desktop-toc a:hover { color: var(--text); }
    .desktop-toc .toc-depth-3 { padding-left: 0.5rem; }

    /* Responsive Queries */
    @media (max-width: 860px) {
      aside.desktop-toc { display: none; }
      .mobile-toc { display: block; }
      aside.sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        bottom: 0;
        height: calc(100vh - 60px);
        transform: translateX(-100%);
        box-shadow: 2px 0 10px rgba(0,0,0,0.2);
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
    <!-- 1. Menu Icon (Mobile only) -->
    <button id="menuBtn" class="menu-btn" aria-label="Toggle Navigation">
      <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>

    <!-- 2. Site Name -->
    <a href="${basePath}/" class="logo">Docs Base</a>

    <!-- 3. Search Bar -->
    <div class="search-box">
      <input type="text" id="searchInput" class="search-input" placeholder="Search docs..." />
      <div id="searchResults" class="search-results"></div>
    </div>

    <!-- 4. Theme Selector -->
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
      ${toc.length > 0 ? `
      <details class="mobile-toc">
        <summary>On this page ▾</summary>
        <ul>${tocListItems}</ul>
      </details>
      ` : ''}

      ${content}
    </main>

    <aside class="desktop-toc">
      <div class="toc-title">On this page</div>
      <ul>${tocListItems}</ul>
    </aside>
  </div>

  <script>
    // Theme Management with LocalStorage persistence
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
        // Sun icon
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      } else {
        // Moon icon
        themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      }
    }

    // Mobile Sidebar Drawer Toggle
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');

    function toggleMenu() {
      const isOpen = sidebar.classList.toggle('open');
      backdrop.classList.toggle('open', isOpen);
    }

    menuBtn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', toggleMenu);

    // Search Logic
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