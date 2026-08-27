import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

interface Props {
  code: string;
  language?: string;
  theme?: 'dark' | 'light';
}

export const CodeBlock: React.FC<Props> = ({ code, language = 'typescript', theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-2 overflow-hidden rounded-xl border text-xs font-mono shadow-md ${
      theme === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-200' : 'border-slate-300 bg-slate-900 text-slate-100'
    }`}>
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-3.5 py-1.5 text-slate-400">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3.5 leading-relaxed">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};
