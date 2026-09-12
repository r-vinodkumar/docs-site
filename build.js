// build.js
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import fm from 'front-matter';
import { renderDoc } from './src/layouts/DocLayout.js';

const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '';
const CONTENT_DIR = './content/docs';
const DIST_DIR = './dist';

// Helper: Recursively find all .md files across all subdirectories
async function getMarkdownFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(await getMarkdownFiles(fullPath));
    } else if (dirent.isFile() && dirent.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Helper: Format folder names to titles ("indian-constitution" -> "Indian Constitution")
function formatTitle(slug) {
  return slug
    .replace(/^\d+-/, '') // remove leading numbers like 01-
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

async function build() {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });

  const mdFiles = await getMarkdownFiles(CONTENT_DIR);

  // 1. Parse all documents
  const parsedDocs = [];
  for (const filePath of mdFiles) {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { attributes, body } = fm(raw);
    
    // Relative path from content/docs (e.g. "indian-constitution/01-union.md")
    const relativePath = path.relative(CONTENT_DIR, filePath);
    const dirName = path.dirname(relativePath);
    const fileBase = path.basename(filePath, '.md');

    // Determine group: frontmatter > folder name > 'General'
    let group = attributes.group;
    if (!group) {
      group = dirName === '.' ? 'General' : formatTitle(dirName);
    }

    // Determine clean route path (strip out sort prefixes like "01-")
    const cleanRouteName = fileBase.replace(/^\d+-/, '');
    const currentPath = dirName === '.' 
      ? `/${cleanRouteName}` 
      : `/${dirName}/${cleanRouteName}`;

    parsedDocs.push({
      filePath,
      currentPath,
      group,
      title: attributes.title || formatTitle(fileBase),
      order: attributes.order !== undefined ? attributes.order : 99,
      body,
      isRoot: fileBase === 'getting-started' || fileBase === 'index'
    });
  }

  // 2. Build Sidebar Navigation Tree
  const groupsMap = {};
  parsedDocs.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  for (const doc of parsedDocs) {
    if (!groupsMap[doc.group]) groupsMap[doc.group] = [];
    groupsMap[doc.group].push({
      label: doc.title,
      link: doc.currentPath
    });
  }

  const autoSidebar = Object.keys(groupsMap).map(groupName => ({
    group: groupName,
    items: groupsMap[groupName]
  }));

  // 3. Compile and Emit Pages
  const searchIndex = [];

  for (const doc of parsedDocs) {
    const toc = [];
    const renderer = new marked.Renderer();

    renderer.heading = ({ text, depth }) => {
      const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
      if (depth === 2 || depth === 3) toc.push({ text, level: depth, id: slug });
      return `<h${depth} id="${slug}">${text}</h${depth}>`;
    };

    const contentHtml = marked.parse(doc.body, { renderer });

    // Search snippet
    const cleanText = doc.body.replace(/#+\s+/g, '').replace(/[*_`]/g, '').slice(0, 300);
    searchIndex.push({
      title: doc.title,
      link: `${repoName}${doc.currentPath}`,
      snippet: cleanText
    });

    const pageHtml = renderDoc({
      title: doc.title,
      content: contentHtml,
      toc,
      currentPath: doc.currentPath,
      sidebar: autoSidebar,
      basePath: repoName
    });

    // Write to dist/<route>/index.html
    const outDir = path.join(DIST_DIR, doc.currentPath.replace(/^\//, ''));
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), pageHtml, 'utf-8');

    // Default entry page
    if (doc.isRoot && doc.currentPath === '/getting-started') {
      await fs.writeFile(path.join(DIST_DIR, 'index.html'), pageHtml, 'utf-8');
    }
  }

  await fs.writeFile(path.join(DIST_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf-8');
  await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
  console.log('Build complete with recursive directory support!');
}

build();