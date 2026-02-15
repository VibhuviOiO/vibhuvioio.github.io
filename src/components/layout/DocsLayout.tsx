import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { SidebarGroup } from '@/types/docs';

interface DocsLayoutProps {
  children: ReactNode;
  sidebar: {
    groups: SidebarGroup[];
    title?: string;
  };
  basePath: string;
}

export default function DocsLayout({ children, sidebar, basePath }: DocsLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar 
        groups={sidebar.groups} 
        basePath={basePath}
        title={sidebar.title}
      />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
