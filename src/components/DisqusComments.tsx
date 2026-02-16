'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Replace with your actual Disqus shortname
const DISQUS_SHORTNAME = 'vibhuvioio';

interface DisqusCommentsProps {
  title?: string;
  identifier?: string;
}

export default function DisqusComments({ title, identifier }: DisqusCommentsProps) {
  const pathname = usePathname();
  const disqusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${pathname}`
      : '';
    const pageId = identifier || pathname;

    // Reset Disqus if already loaded
    if ((window as any).DISQUS) {
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

    // First load
    (window as any).disqus_config = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageId;
      this.page.title = title || document.title;
    };

    const script = document.createElement('script');
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) {
        disqusThread.innerHTML = '';
      }
    };
  }, [pathname, title, identifier]);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Discussion</h3>
      <div id="disqus_thread" ref={disqusRef} />
      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </div>
  );
}
