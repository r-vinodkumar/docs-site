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

  const tocHtml = toc.map(h => `
    <li class="toc-depth-${h.level}"><a href="#${h.id}">${h.text}</a></li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Docs</title>
  <style>
    :root { --bg: #0b0f19; --surface: #111827; --border: #1f2937; --text: #e5e7eb; --muted: #9ca3af; --accent: #6366f1; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }
    header { height: 60px; border-bottom: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; padding: 0 1.5rem; position: sticky; top: 0; z-index: 10; }
    .site-title { font-weight: 700; color: #fff; font-size: 1.1rem; }
    .docs-container { display: grid; grid-template-columns: 240px minmax(0, 1fr) 200px; max-width: 1400px; margin: 0 auto; min-height: calc(100vh - 60px); }
    aside.sidebar { border-right: 1px solid var(--border); padding: 1.5rem; position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; }
    .sidebar-group { margin-bottom: 1.5rem; }
    .sidebar-title { font-size: 0.75rem; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 0.5rem; }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar a { display: block; padding: 0.35rem 0.5rem; color: var(--muted); text-decoration: none; font-size: 0.9rem; border-radius: 4px; }
    .sidebar a:hover { color: #fff; background: #1f2937; }
    .sidebar a.active { color: #fff; background: var(--accent); font-weight: 600; }
    main { padding: 2rem 3rem; line-height: 1.6; }
    main h1 { font-size: 2.2rem; margin-top: 0; color: #fff; }
    main h2 { margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; color: #f3f4f6; }
    aside.toc { padding: 1.5rem 1rem; position: sticky; top: 60px; height: calc(100vh - 60px); }
    .toc-title { font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; text-transform: uppercase; }
    .toc ul { list-style: none; padding: 0; margin: 0; border-left: 1px solid var(--border); }
    .toc a { display: block; padding: 0.25rem 0 0.25rem 1rem; color: var(--muted); text-decoration: none; font-size: 0.85rem; }
    .toc a:hover { color: var(--accent); }
    .toc-depth-3 { padding-left: 0.5rem; }
  </style>
</head>
<body>
  <header><div class="site-title">Documentation</div></header>
  <div class="docs-container">
    <aside class="sidebar">${sidebarHtml}</aside>
    <main>${content}</main>
    <aside class="toc"><div class="toc-title">On this page</div><ul>${tocHtml}</ul></aside>
  </div>
</body>
</html>`;
}