import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">VibhuviOiO</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Infinite Operations</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/docs" className="hover:text-gray-900 transition-colors">
              Documentation
            </Link>
            <Link href="/blog" className="hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <a 
              href="https://github.com/VibhuviOiO" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} VibhuviOiO. Experience The Operations.
        </div>
      </div>
    </footer>
  );
}
