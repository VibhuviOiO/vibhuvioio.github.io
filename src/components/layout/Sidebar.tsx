'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react';
import { SidebarGroup } from '@/types/docs';

interface SidebarProps {
  groups: SidebarGroup[];
  basePath: string;
  title?: string;
}

interface SidebarItemProps {
  item: {
    id: string;
    title: string;
    slug: string;
    items?: any[];
  };
  basePath: string;
  depth?: number;
}

function SidebarItem({ item, basePath, depth = 0 }: SidebarItemProps) {
  const pathname = usePathname();
  const itemPath = `${basePath}/${item.slug}`;
  const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  const hasChildren = item.items && item.items.length > 0;
  const [expanded, setExpanded] = useState(isActive);

  if (hasChildren) {
    return (
      <div className="select-none">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-2 py-1.5 pr-2 text-left text-sm transition-colors rounded-md mx-2 ${
            isActive 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }`}
          style={{ 
            paddingLeft: `${depth * 12 + 8}px`,
            fontWeight: isActive ? 500 : 400
          }}
        >
          <ChevronRight 
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} 
            style={{ color: isActive ? '#ffffff' : '#9ca3af' }}
          />
          {expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0" style={{ color: isActive ? '#ffffff' : '#9ca3af' }} />
          ) : (
            <Folder className="h-4 w-4 shrink-0" style={{ color: isActive ? '#ffffff' : '#9ca3af' }} />
          )}
          <span className="truncate">{item.title}</span>
        </button>
        
        {expanded && (
          <div className="mt-0.5">
            {item.items!.map((child) => (
              <SidebarItem 
                key={child.id} 
                item={child} 
                basePath={basePath}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={itemPath}
      className={`flex items-center gap-2 py-1.5 pr-2 text-sm transition-colors rounded-md mx-2 ${
        isActive 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
      style={{ 
        paddingLeft: `${depth * 12 + 12}px`,
        fontWeight: isActive ? 500 : 400
      }}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? '#ffffff' : '#9ca3af' }} />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}

export default function Sidebar({ groups, basePath, title }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
        {title && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {title}
            </h2>
          </div>
        )}
        
        <nav className="space-y-6">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarItem 
                    key={item.id} 
                    item={item} 
                    basePath={basePath}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
