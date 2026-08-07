import { useState, useEffect, useCallback } from 'react';
import './index.css';

const API_URL = '/api';
const TIMEOUT_MS = 120_000;

type Phase = 'idle' | 'loading' | 'analyzing' | 'success' | 'error';
type Host = 'outlook' | 'browser';

interface Result {
  summary: string;
  suggested_reply: string;
  answer: string;
  provider: string;
  model: string;
}

function IconMail() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13 2 4" /></svg>;
}
function IconSparkles() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L14 8.5 20 9.5 15.5 14 17 20 12 17 7 20 8.5 14 4 9.5 10 8.5Z" /></svg>;
}
function IconCopy() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
}
function IconRefresh() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>;
}
function IconSend() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9z" /></svg>;
}
function Spinner() {
  return <div className="spinner"><div className="spinner-ring" /></div>;
}

function toast(msg: string) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

async function fetchWithTimeout(url: string, opts: RequestInit, ms = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callAI(subject: string, body: string, sender: string, question: string) {
  const res = await fetchWithTimeout(`${API_URL}/email/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, body, sender, recipients: [], question }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(data.detail || data.error || `Server error ${res.status}`);
  }
  const json: Result = await res.json();
  if (!json.summary) {
    throw new Error('Invalid response from AI service');
  }
  return json;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sender, setSender] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [host, setHost] = useState<Host>('browser');
  const [officeReady, setOfficeReady] = useState(false);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    if (typeof Office === 'undefined') {
      setHost('browser');
      setOfficeReady(true);
      return;
    }
    Office.onReady((info) => {
      setHost(info.host === Office.HostType.Outlook ? 'outlook' : 'browser');
      setOfficeReady(true);
    });
  }, []);

  const readEmail = useCallback(async () => {
    setPhase('loading');
    setError('');

    if (host === 'browser') {
      setSubject('Demo: Project Status Update');
      setBody(
        'Hi team, just wanted to give you a quick update on the Q3 deliverables. ' +
        'The backend API is 90% complete and we expect to finish testing by end of week. ' +
        'Frontend integration has started and the design review is scheduled for Thursday. ' +
        'Please let me know if you have any concerns.\n\nBest, Alex'
      );
      setSender('alex@example.com');
      setPhase('idle');
      toast('Demo mode');
      return;
    }

    try {
      if (!Office?.context?.mailbox) {
        throw new Error('Outlook mailbox not available. Make sure an email is open.');
      }

      const item = Office.context.mailbox.item;

      setSubject(item.subject || '');
      const from = item.from;
      setSender(from?.emailAddress || 'Unknown');

      const raw = await new Promise<string>((resolve, reject) => {
        item.body.getAsync(Office.CoercionType.Text, { asynchronousProcessing: true }, (r) => {
          if (r.status === Office.AsyncResultStatus.Succeeded) {
            resolve(r.value || '');
          } else {
            reject(new Error(r.error?.message || 'Failed to read email body'));
          }
        });
      });
      const clean = raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

      if (!clean) {
        throw new Error('Email body is empty');
      }

      setBody(clean);
      setPhase('idle');
    } catch (err: any) {
      setError(err.message || 'Failed to read email');
      setPhase('error');
    }
  }, [host]);

  const analyzeEmail = useCallback(async (q: string = '') => {
    if (!body.trim()) {
      if (!subject && !body) {
        await readEmail();
        return;
      }
      setError('Nothing to analyze — no email content available');
      setPhase('error');
      return;
    }

    setPhase('analyzing');
    setError('');

    try {
      const json = await callAI(subject, body, sender, q);
      setResult(json);
      setPhase('success');
      if (q) setQuestion('');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out after 2min. Check if the backend is running.');
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Cannot reach backend. Make sure it is running on http://localhost:8000');
      } else {
        setError(err.message || 'Analysis failed');
      }
      setPhase('error');
    }
  }, [subject, body, sender, readEmail]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast(`${label} copied`)).catch(() => {});
  };

  const reset = () => {
    setPhase('idle');
    setResult(null);
    setError('');
    setQuestion('');
  };

  if (!officeReady) {
    return (
      <div className="app center">
        <Spinner />
        <p className="analyzing-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-icon"><IconSparkles /></div>
        <div>
          <h1>AI Assistant</h1>
          <p className="subtitle">{host === 'outlook' ? 'In Outlook' : 'Demo mode'}</p>
        </div>
      </header>

      <main className="content">
        {phase === 'idle' && (
          <div className="card">
            {subject && (
              <div className="email-preview">
                <span className="preview-label">From</span>
                <span className="preview-value">{sender || 'Unknown'}</span>
                <span className="preview-label">Subject</span>
                <span className="preview-value">{subject}</span>
              </div>
            )}
            <button className="btn-primary" onClick={readEmail} disabled={phase === 'loading'}>
              {phase === 'loading' ? <Spinner /> : <IconMail />}
              {phase === 'loading' ? 'Reading email...' : 'Read Selected Email'}
            </button>
            {body && (
              <button className="btn-sparkle" onClick={() => analyzeEmail()}>
                <IconSparkles /> Analyze with AI
              </button>
            )}
            {!subject && (
              <p className="hint">{host === 'outlook' ? 'Open an email and click to read it' : 'Click below to load demo data'}</p>
            )}
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="card center">
            <Spinner />
            <p className="analyzing-text">Analyzing email with AI...</p>
          </div>
        )}

        {phase === 'success' && result && (
          <div className="results">
            <div className="result-card">
              <div className="result-header">
                <span className="result-label">Summary</span>
                <button className="btn-icon" onClick={() => copyText(result.summary, 'Summary')}><IconCopy /></button>
              </div>
              <p className="result-text">{result.summary}</p>
              <span className="result-badge">{result.provider} / {result.model}</span>
            </div>
            {result.suggested_reply && (
              <div className="result-card">
                <div className="result-header">
                  <span className="result-label">Suggested Reply</span>
                  <button className="btn-icon" onClick={() => copyText(result.suggested_reply, 'Reply')}><IconCopy /></button>
                </div>
                <p className="result-text">{result.suggested_reply}</p>
              </div>
            )}
            {result.answer && (
              <div className="result-card answer-card">
                <div className="result-header">
                  <span className="result-label">Answer</span>
                  <button className="btn-icon" onClick={() => copyText(result.answer, 'Answer')}><IconCopy /></button>
                </div>
                <p className="result-text">{result.answer}</p>
              </div>
            )}
            <div className="question-box">
              <input
                className="question-input"
                placeholder="Ask about this email..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && question.trim() && analyzeEmail(question)}
                disabled={phase === 'analyzing'}
              />
              <button
                className="btn-ask"
                onClick={() => question.trim() && analyzeEmail(question)}
                disabled={!question.trim() || phase === 'analyzing'}
              >
                <IconSend />
              </button>
            </div>
            <button className="btn-secondary" onClick={reset}>
              <IconRefresh /> Analyze Another Email
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="card error">
            <p className="error-text">{error}</p>
            <button className="btn-secondary" onClick={reset}>
              <IconRefresh /> Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>Local prototype v0.1.0</span>
      </footer>
    </div>
  );
}
