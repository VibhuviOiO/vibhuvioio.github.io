// Server-only content processing utilities for lesson pages

export interface SidebarItem {
  id: string;
  title: string;
  slug: string;
  duration?: string;
  type?: string;
  videoUrl?: string;
  githubUrl?: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  lang: string;
}

export interface ProjectData {
  name: string;
  files: ProjectFile[];
}

export interface ProcessedContent {
  content: string;
  projects: ProjectData[];
}

// Map file extensions to language names for syntax highlighting
export function detectLang(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    yml: 'yaml', yaml: 'yaml', json: 'json', conf: 'conf',
    sh: 'bash', env: 'bash', toml: 'toml', properties: 'properties',
  };
  return map[ext] || 'text';
}

// Resolve ```fetch:lang\nURL\n``` blocks — fetches raw file content at build time
async function resolveFetchBlocks(content: string): Promise<string> {
  const pattern = /```fetch:(\w+)\n(https?:\/\/[^\s]+)\n```/g;
  const matches = [...content.matchAll(pattern)];
  if (matches.length === 0) return content;

  const results = await Promise.all(
    matches.map(async ([, , url]) => {
      try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        return res.ok ? await res.text() : null;
      } catch {
        return null;
      }
    })
  );

  let resolved = content;
  matches.forEach(([fullMatch, lang], i) => {
    const fetched = results[i];
    resolved = resolved.replace(
      fullMatch,
      fetched !== null
        ? `\`\`\`${lang}\n${fetched}\`\`\``
        : `\`\`\`${lang}\n# Failed to fetch file\n\`\`\``
    );
  });
  return resolved;
}

// Parse ```project blocks and fetch all referenced files in parallel
async function resolveProjectBlocks(
  content: string
): Promise<{ content: string; projects: ProjectData[] }> {
  const pattern = /```project\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(pattern)];
  if (matches.length === 0) return { content, projects: [] };

  const projects: ProjectData[] = [];

  for (const match of matches) {
    const lines = match[1].trim().split('\n');
    let projectName = 'project';
    const fileEntries: { path: string; url: string }[] = [];

    for (const line of lines) {
      const nameLine = line.match(/^name:\s*(.+)$/);
      if (nameLine) { projectName = nameLine[1].trim(); continue; }
      const fileLine = line.match(/^(.+?):\s*(https?:\/\/.+)$/);
      if (fileLine) fileEntries.push({ path: fileLine[1].trim(), url: fileLine[2].trim() });
    }

    const fileResults = await Promise.all(
      fileEntries.map(async (entry) => {
        try {
          const res = await fetch(entry.url, { next: { revalidate: 3600 } });
          return { ...entry, content: res.ok ? await res.text() : '# Failed to fetch file' };
        } catch {
          return { ...entry, content: '# Failed to fetch file' };
        }
      })
    );

    projects.push({
      name: projectName,
      files: fileResults.map(r => ({
        name: r.path.split('/').pop() || r.path,
        path: r.path,
        content: r.content,
        lang: detectLang(r.path),
      })),
    });
  }

  let idx = 0;
  const processedContent = content.replace(pattern, () => `___PROJECT_BLOCK_${idx++}___`);
  return { content: processedContent, projects };
}

// Full content processing pipeline: fetch blocks → project blocks
export async function processLessonContent(raw: string): Promise<ProcessedContent> {
  const withFetch = await resolveFetchBlocks(raw);
  return resolveProjectBlocks(withFetch);
}

// Transform operations sidebar sections into docs sidebar nav format
export function buildSidebarGroups(sidebar: SidebarSection[]) {
  return sidebar.map(section => ({
    title: section.title,
    items: section.items.map(({ id, title, slug }) => ({ id, title, slug })),
  }));
}

// Find the githubUrl for a specific lesson by slug
export function findLessonGithubUrl(
  sidebar: SidebarSection[],
  currentSlug: string
): string | undefined {
  for (const section of sidebar) {
    for (const item of section.items) {
      if (item.slug === currentSlug && item.githubUrl) return item.githubUrl;
    }
  }
  return undefined;
}
