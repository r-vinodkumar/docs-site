// build.js
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import fm from 'front-matter';
import { renderDoc } from './src/layouts/DocLayout.js';

const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '';
const CONTENT_DIR = './content/docs';
const DIST_DIR = './dist';

async function build() {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });

  const files = await fs.readdir(CONTENT_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  // 1. Read all files first to auto-construct sidebar navigation
  const parsedDocs = [];
  for (const file of mdFiles) {
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
    const { attributes, body } = fm(raw);
    const baseName = path.basename(file, '.md');
    
    parsedDocs.push({
      file,
      baseName,
      title: attributes.title || baseName,
      group: attributes.group || 'General',       // Group category (optional)
      order: attributes.order || 99,              // Sort order (optional)
      body
    });
  }

  // 2. Automatically generate the sidebar configuration grouped by category
  const groupsMap = {};
  parsedDocs.sort((a, b) => a.order - b.order);

  for (const doc of parsedDocs) {
    if (!groupsMap[doc.group]) {
      groupsMap[doc.group] = [];
    }
    groupsMap[doc.group].push({
      label: doc.title,
      link: `/${doc.baseName}`
    });
  }

  const autoSidebar = Object.keys(groupsMap).map(groupName => ({
    group: groupName,
    items: groupsMap[groupName]
  }));

  // 3. Compile pages and build search index
  const searchIndex = [];

  for (const doc of parsedDocs) {
    const currentPath = `/${doc.baseName}`;
    const toc = [];
    const renderer = new marked.Renderer();

    renderer.heading = ({ text, depth }) => {
      const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
      if (depth === 2 || depth === 3) toc.push({ text, level: depth, id: slug });
      return `<h${depth} id="${slug}">${text}</h${depth}>`;
    };

    const contentHtml = marked.parse(doc.body, { renderer });

    const cleanText = doc.body.replace(/#+\s+/g, '').replace(/[*_`]/g, '').slice(0, 300);
    searchIndex.push({
      title: doc.title,
      link: `${repoName}${currentPath}`,
      snippet: cleanText
    });

    const pageHtml = renderDoc({
      title: doc.title,
      content: contentHtml,
      toc,
      currentPath,
      sidebar: autoSidebar,
      basePath: repoName
    });

    const outDir = path.join(DIST_DIR, doc.baseName);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), pageHtml, 'utf-8');

    // Default landing page
    if (doc.baseName === 'getting-started' || doc.baseName === 'index') {
      await fs.writeFile(path.join(DIST_DIR, 'index.html'), pageHtml, 'utf-8');
    }
  }

  await fs.writeFile(path.join(DIST_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf-8');
  await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
  console.log('Build completed with automated sidebar and search index!');
}

build();