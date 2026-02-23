'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const DISQUS_SHORTNAME = 'vibhuvi-oio';

interface DisqusCommentsProps {
  title?: string;
  identifier?: string;
}

export default function DisqusComments({ title, identifier }: DisqusCommentsProps) {
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setError(null);

    // Clear thread and remove any previous script so Disqus initialises
    // cleanly on every navigation rather than using DISQUS.reset(), which
    // is unreliable in SPA contexts and causes "unable to load" errors.
    const thread = document.getElementById('disqus_thread');
    if (thread) thread.innerHTML = '';
    document.getElementById('disqus-script')?.remove();
    delete (window as any).DISQUS;

    const pageUrl = `${window.location.origin}${pathname}`;
    const pageId = identifier || pathname;

    (window as any).disqus_config = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageId;
      this.page.title = title || document.title;
    };

    const script = document.createElement('script');
    script.id = 'disqus-script';
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;
    script.onerror = () =>
      setError('Failed to load Disqus. Please check your ad blocker or network connection.');
    document.body.appendChild(script);

    return () => {
      const t = document.getElementById('disqus_thread');
      if (t) t.innerHTML = '';
      document.getElementById('disqus-script')?.remove();
      delete (window as any).DISQUS;
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

      <div id="disqus_thread" />

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
