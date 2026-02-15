import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-3xl font-bold text-white mb-4 mt-8" {...props} />,
    h2: (props) => <h2 className="text-2xl font-semibold text-white mb-3 mt-8" {...props} />,
    h3: (props) => <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-6" {...props} />,
    p: (props) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
    a: (props) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
    ul: (props) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1" {...props} />,
    li: (props) => <li className="ml-4" {...props} />,
    code: (props) => {
      const { className, children } = props;
      const isInline = !className;
      
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 text-sm font-mono">
            {children}
          </code>
        );
      }
      
      return (
        <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 mb-4 border border-gray-800">
          <code className={`${className} text-sm font-mono`} {...props} />
        </pre>
      );
    },
    pre: (props) => <div {...props} />,
    blockquote: (props) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-4" {...props} />
    ),
    table: (props) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-700" {...props} />
      </div>
    ),
    thead: (props) => <thead className="bg-gray-800" {...props} />,
    th: (props) => <th className="border border-gray-700 px-4 py-2 text-left text-gray-200 font-semibold" {...props} />,
    td: (props) => <td className="border border-gray-700 px-4 py-2 text-gray-300" {...props} />,
    hr: (props) => <hr className="border-gray-800 my-8" {...props} />,
    ...components,
  };
}
