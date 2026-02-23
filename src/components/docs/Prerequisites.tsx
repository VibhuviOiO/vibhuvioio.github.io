import { ChevronRight, ExternalLink } from 'lucide-react';

interface ToolItem {
  name: string;
  description: string;
  installUrl: string;
  alternatives?: { name: string; url: string }[];
}

interface PrerequisitesProps {
  knowledge?: string[];
  tools?: ToolItem[];
}

const defaultKnowledge: string[] = [
  'Basic Linux command line knowledge',
  'Docker and Docker Compose fundamentals',
  'Understanding of JSON and REST APIs',
];

const defaultDockerTools: ToolItem[] = [
  {
    name: 'Docker Engine or Docker Desktop',
    description: 'Container runtime required for all labs in this course.',
    installUrl: 'https://docs.docker.com/get-docker/',
    alternatives: [
      { name: 'Podman', url: 'https://podman.io/getting-started/installation' },
    ],
  },
  {
    name: 'Docker Compose',
    description: 'Multi-container orchestration used in every hands-on exercise.',
    installUrl: 'https://docs.docker.com/compose/install/',
    alternatives: [
      { name: 'Podman Compose', url: 'https://github.com/containers/podman-compose' },
    ],
  },
];

export default function Prerequisites({ knowledge, tools }: PrerequisitesProps) {
  const toolList = tools || defaultDockerTools;
  const knowledgeList = knowledge || defaultKnowledge;
  const hasKnowledge = knowledgeList.length > 0;

  return (
    <div>

      {/* Knowledge prerequisites */}
      {hasKnowledge && (
        <ul className="space-y-2 mb-5">
          {knowledgeList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* Tools with install links */}
      <div className="space-y-2.5">
        {toolList.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                <a
                  href={item.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#2702a6] hover:underline"
                >
                  Install <ExternalLink className="h-3 w-3" />
                </a>
                {item.alternatives && item.alternatives.map((alt, i) => (
                  <span key={i} className="text-xs text-gray-400">
                    or{' '}
                    <a
                      href={alt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#2702a6] hover:underline"
                    >
                      {alt.name}
                    </a>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
