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
      <main className="flex-1 min-w-0 bg-white">
        <div className="w-full px-6 md:px-10 lg:px-12 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
