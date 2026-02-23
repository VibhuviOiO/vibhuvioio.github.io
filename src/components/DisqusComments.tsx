'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Replace with your actual Disqus shortname
const DISQUS_SHORTNAME = 'vibhuvi-oio';

interface DisqusCommentsProps {
  title?: string;
  identifier?: string;
}

export default function DisqusComments({ title, identifier }: DisqusCommentsProps) {
  const pathname = usePathname();
  const disqusRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pageUrl = `${window.location.origin}${pathname}`;
    const pageId = identifier || pathname;

    // Always set config first — covers the race where the script is loading
    // but window.DISQUS isn't set yet and the user navigates to a new page.
    (window as any).disqus_config = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageId;
      this.page.title = title || document.title;
    };

    try {
      if ((window as any).DISQUS) {
        // Already loaded — reset with new page config
        (window as any).DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = pageUrl;
            this.page.identifier = pageId;
            this.page.title = title || document.title;
          },
        });
        return;
      }

      if (document.getElementById('disqus-script')) {
        // Script is already loading; disqus_config is set above, nothing more to do.
        return;
      }

      const script = document.createElement('script');
      script.id = 'disqus-script';
      script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(+new Date()));
      script.async = true;
      script.onerror = () => {
        setError('Failed to load Disqus. Please check your ad blocker or network connection.');
      };
      document.body.appendChild(script);
    } catch (err) {
      setError('Error initializing Disqus comments.');
      console.error('Disqus error:', err);
    }

    return () => {
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) disqusThread.innerHTML = '';
    };
  }, [pathname, title, identifier]);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Discussion</h3>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}
      
      <div id="disqus_thread" ref={disqusRef} />
      
      <noscript>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript" className="text-blue-600 hover:underline">
              comments powered by Disqus.
            </a>
          </p>
        </div>
      </noscript>
    </div>
  );
}
