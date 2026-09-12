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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Docs</title>
  <style>
    :root { 
      --bg: #0b0f19; 
      --surface: #111827; 
      --border: #1f2937; 
      --text: #e5e7eb; 
      --muted: #9ca3af; 
      --accent: #3b82f6; 
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }

    /* Top Header: Menu (Left) | Search (Middle) | Site Name (Right) */
    header { 
      height: 64px; 
      border-bottom: 1px solid var(--border); 
      background: var(--surface); 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      gap: 0.75rem;
      padding: 0 1rem; 
      position: sticky; 
      top: 0; 
      z-index: 50; 
    }

    /* Left Hamburger Button */
    .menu-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 6px;
      padding: 0.45rem 0.6rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .menu-btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; }

    /* Middle Search Bar */
    .search-box { 
      position: relative; 
      flex: 1; 
      max-width: 500px; 
    }
    .search-input {
      width: 100%;
      background: #030712;
      border: 1px solid var(--border);
      color: #fff;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      outline: none;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-results {
      position: absolute;
      top: 110%;
      left: 0;
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      max-height: 260px;
      overflow-y: auto;
      display: none;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.6);
      z-index: 60;
    }
    .search-result-item {
      display: block;
      padding: 0.6rem 0.8rem;
      text-decoration: none;
      border-bottom: 1px solid var(--border);
    }
    .search-result-item:hover { background: #1f2937; }
    .search-result-title { color: #fff; font-size: 0.85rem; font-weight: 600; }
    .search-result-snippet { color: var(--muted); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Right Site Name */
    .logo { 
      font-weight: 700; 
      color: #fff; 
      text-decoration: none; 
      font-size: 1rem; 
      white-space: nowrap; 
      flex-shrink: 0; 
    }

    /* Layout Wrapper */
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
      top: 64px; 
      height: calc(100vh - 64px); 
      overflow-y: auto; 
      transition: transform 0.25s ease;
      z-index: 40;
    }
    .sidebar-group { margin-bottom: 1.5rem; }
    .sidebar-title { font-size: 0.75rem; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 0.5rem; padding-left: 0.5rem; }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar a { 
      display: block; 
      padding: 0.45rem 0.6rem; 
      color: var(--muted); 
      text-decoration: none; 
      font-size: 0.9rem; 
      border-radius: 6px; 
      margin-bottom: 2px;
    }
    .sidebar a:hover { color: #fff; background: #1f2937; }
    .sidebar a.active { color: #fff; background: var(--accent); font-weight: 600; }

    /* Mobile Dim Backdrop */
    .backdrop {
      display: none;
      position: fixed;
      inset: 0;
      top: 64px;
      background: rgba(0, 0, 0, 0.6);
      z-index: 35;
    }

    /* Content Area */
    main { 
      flex-grow: 1; 
      min-width: 0; 
      padding: 1.5rem; 
      line-height: 1.6; 
    }
    main h1 { font-size: 1.8rem; margin-top: 0; color: #fff; }
    main h2 { margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; color: #f3f4f6; font-size: 1.4rem; }
    main pre { background: #030712; padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border); overflow-x: auto; font-size: 0.85rem; }

    /* Mobile "On This Page" Dropdown */
    .mobile-toc {
      display: none;
      margin-bottom: 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }
    .mobile-toc summary {
      padding: 0.65rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--text);
      user-select: none;
    }
    .mobile-toc ul {
      list-style: none;
      margin: 0;
      padding: 0.5rem 1rem 0.75rem 1rem;
      border-top: 1px solid var(--border);
    }
    .mobile-toc a {
      display: block;
      padding: 0.35rem 0;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
    }
    .mobile-toc .toc-depth-3 { padding-left: 0.75rem; }

    /* Right Sidebar (Desktop Table of Contents) */
    aside.desktop-toc { 
      width: 220px; 
      flex-shrink: 0; 
      padding: 1.5rem 1rem; 
      position: sticky; 
      top: 64px; 
      height: calc(100vh - 64px); 
    }
    .desktop-toc .toc-title { font-size: 0.75rem; font-weight: 700; color: var(--muted); margin-bottom: 0.75rem; text-transform: uppercase; }
    .desktop-toc ul { list-style: none; padding: 0; margin: 0; border-left: 1px solid var(--border); }
    .desktop-toc a { display: block; padding: 0.2rem 0 0.2rem 0.8rem; color: var(--muted); text-decoration: none; font-size: 0.8rem; }
    .desktop-toc a:hover { color: var(--accent); }
    .desktop-toc .toc-depth-3 { padding-left: 0.5rem; }

    /* Mobile Responsive Rules (< 860px) */
    @media (max-width: 860px) {
      aside.desktop-toc { display: none; }
      .mobile-toc { display: block; }
      
      aside.sidebar {
        position: fixed;
        top: 64px;
        left: 0;
        bottom: 0;
        height: calc(100vh - 64px);
        transform: translateX(-100%);
        box-shadow: 2px 0 12px rgba(0,0,0,0.5);
      }
      aside.sidebar.open {
        transform: translateX(0);
      }
      .backdrop.open {
        display: block;
      }
      main { padding: 1.25rem; }
    }

    @media (min-width: 861px) {
      .menu-btn { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <!-- Left: Hamburger Button -->
    <button id="menuBtn" class="menu-btn" aria-label="Toggle Navigation">
      <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>

    <!-- Middle: Search Bar -->
    <div class="search-box">
      <input type="text" id="searchInput" class="search-input" placeholder="Search docs..." />
      <div id="searchResults" class="search-results"></div>
    </div>

    <!-- Right: Site Name -->
    <a href="${basePath}/" class="logo">Docs Base</a>
  </header>

  <div class="layout-wrap">
    <div id="backdrop" class="backdrop"></div>

    <aside id="sidebar" class="sidebar">
      ${sidebarHtml}
    </aside>

    <main>
      <!-- Mobile Accordion TOC -->
      ${toc.length > 0 ? `
      <details class="mobile-toc">
        <summary>On this page ▾</summary>
        <ul>${tocListItems}</ul>
      </details>
      ` : ''}

      ${content}
    </main>

    <!-- Desktop TOC -->
    <aside class="desktop-toc">
      <div class="toc-title">On this page</div>
      <ul>
        ${tocListItems}
      </ul>
    </aside>
  </div>

  <script>
    // 1. Mobile Drawer Toggle
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');

    function toggleMenu() {
      const isOpen = sidebar.classList.toggle('open');
      backdrop.classList.toggle('open', isOpen);
    }

    menuBtn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', toggleMenu);

    // 2. Client-side Search Logic
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
        searchResults.innerHTML = '<div style="padding: 0.75rem; font-size: 0.8rem; color: #9ca3af;">No results found</div>';
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