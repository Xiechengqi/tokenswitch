import { useState } from 'react';

const COMMAND = 'docker run -itd -p 8008:8008 -v $HOME/.token-switch:/root/.cc-switch --name cc-switch ghcr.io/xiechengqi/cc-switch:latest';

export default function TerminalCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = COMMAND;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="terminal-card" id="install">
      <div className="terminal-head">
        <span className="terminal-dots" aria-hidden="true">
          <i style={{ background: '#FF5F57' }} />
          <i style={{ background: '#FEBC2E' }} />
          <i style={{ background: '#28C840' }} />
        </span>
        <span className="terminal-label">bash</span>
        <button
          className={`terminal-copy ${copied ? 'is-copied' : ''}`}
          onClick={handleCopy}
          aria-label="Copy command"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="terminal-body">
        <span className="terminal-prompt" aria-hidden="true">$</span>
        <code className="terminal-code">{COMMAND}</code>
      </div>
      <p className="terminal-hint">
        Once running, open{' '}
        <a href="http://localhost:8008" target="_blank" rel="noopener noreferrer">
          http://localhost:8008
        </a>
        <span className="terminal-sep" aria-hidden="true">·</span>
        default login <code>user</code> / <code>mypasswd</code>
      </p>
    </div>
  );
}
