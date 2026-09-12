// build.js
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import fm from 'front-matter';
import { renderDoc } from './src/layouts/DocLayout.js';

// If running in GitHub Actions, get the repository name for GitHub Pages pathing
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

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
    const { attributes, body } = fm(raw);
    const baseName = path.basename(file, '.md');
    const currentPath = `/${baseName}`;

    const toc = [];
    const renderer = new marked.Renderer();
    renderer.heading = ({ text, depth }) => {
      const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
      if (depth === 2 || depth === 3) toc.push({ text, level: depth, id: slug });
      return `<h${depth} id="${slug}">${text}</h${depth}>`;
    };

    const contentHtml = marked.parse(body, { renderer });

    const pageHtml = renderDoc({
      title: attributes.title || baseName,
      content: contentHtml,
      toc,
      currentPath,
      sidebar: SIDEBAR_CONFIG,
      basePath: repoName
    });

    const outDir = path.join(DIST_DIR, baseName);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), pageHtml, 'utf-8');

    // If it's getting-started, also copy it as index.html so root loads directly
    if (baseName === 'getting-started') {
      await fs.writeFile(path.join(DIST_DIR, 'index.html'), pageHtml, 'utf-8');
    }
  }

  // Create .nojekyll so GitHub Pages doesn't ignore modern folder structures
  await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
  console.log('Build completed successfully!');
}

build();