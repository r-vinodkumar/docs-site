// build.js
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import fm from 'front-matter';
import { renderDoc } from './src/layouts/DocLayout.js';

const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}` : '';

const SIDEBAR_CONFIG = [
  {
    group: 'Getting Started',
    items: [
      { label: 'Introduction', link: '/getting-started' },
      { label: 'Manual Setup', link: '/manual-setup' }
    ]
  }
];

const CONTENT_DIR = './content/docs';
const DIST_DIR = './dist';

async function build() {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });

  const files = await fs.readdir(CONTENT_DIR);
  const searchIndex = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
    const { attributes, body } = fm(raw);
    const baseName = path.basename(file, '.md');
    const currentPath = `/${baseName}`;
    const pageTitle = attributes.title || baseName;

    const toc = [];
    const renderer = new marked.Renderer();
    renderer.heading = ({ text, depth }) => {
      const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
      if (depth === 2 || depth === 3) toc.push({ text, level: depth, id: slug });
      return `<h${depth} id="${slug}">${text}</h${depth}>`;
    };

    const contentHtml = marked.parse(body, { renderer });

    // Plain text extraction for instant search
    const cleanText = body.replace(/#+\s+/g, '').replace(/[*_`]/g, '').slice(0, 300);
    searchIndex.push({
      title: pageTitle,
      link: `${repoName}${currentPath}`,
      snippet: cleanText
    });

    const pageHtml = renderDoc({
      title: pageTitle,
      content: contentHtml,
      toc,
      currentPath,
      sidebar: SIDEBAR_CONFIG,
      basePath: repoName
    });

    const outDir = path.join(DIST_DIR, baseName);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), pageHtml, 'utf-8');

    if (baseName === 'getting-started') {
      await fs.writeFile(path.join(DIST_DIR, 'index.html'), pageHtml, 'utf-8');
    }
  }

  // Write the search index file
  await fs.writeFile(path.join(DIST_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf-8');
  await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
  console.log('✓ Build complete with search index!');
}

build();