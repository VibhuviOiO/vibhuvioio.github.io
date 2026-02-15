import Link from 'next/link';

export default function BlogPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="mt-4 text-lg text-gray-600">
            Insights, tutorials, and updates from the VibhuviOiO team.
          </p>
        </div>
        
        <div className="mt-16 rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">Blog posts coming soon.</p>
          <p className="text-sm text-gray-400 mt-2">
            Follow us on GitHub for updates.
          </p>
        </div>
      </div>
    </main>
  );
}
