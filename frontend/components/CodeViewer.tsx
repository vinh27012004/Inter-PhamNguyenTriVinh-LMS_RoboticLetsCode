/**
 * CodeViewer Component
 * Hiển thị code snippet với syntax highlighting
 */

'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeViewerProps {
  code: string;
  language?: 'python' | 'javascript' | 'markup';
}

export default function CodeViewer({ code, language = 'python' }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-400 font-mono uppercase">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="bg-gray-900 overflow-x-auto">
        <pre className="!m-0 !bg-transparent">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
