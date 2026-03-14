import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [script, setScript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');

  const [runtimeList, setRuntimeList] = useState([]);
  const [runtimeLoading, setRuntimeLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchRuntimes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/runtimes`);
        const data = await response.json();
        setRuntimeList(data.runtimes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setRuntimeLoading(false);
      }
    };

    fetchRuntimes();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const submitScript = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/api/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script })
      });
      if (!response.ok) throw new Error('Unable to fetch comparison');
      const data = await response.json();
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage('');
    setAuthError('');
    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }

    const endpoint = authMode === 'login' ? 'login' : 'register';
    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to authenticate');
      }
      setAuthMessage(
        authMode === 'login'
          ? 'Successfully signed in — you can now compare jobs confidently.'
          : 'Account created! You can log in immediately.'
      );
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthMessage('');
    setAuthError('');
  };

  const scriptStats = script.trim()
    ? {
        words: script.trim().split(/\s+/).length,
        characters: script.length
      }
    : null;

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/comparisons`);
      const data = await response.json();
      setHistory(data.comparisons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  return (
    <div className="page">
      <Head>
        <title>Databricks Runtime Suggestion Tool</title>
        <meta
          name="description"
          content="Authenticate, describe your Databricks workload, and see the runtime recommendation report."
        />
      </Head>

      <header className="hero">
        <div>
          <p className="eyebrow">Databricks runtime intelligence</p>
          <h1>Compare your job with the freshest Databricks runtimes.</h1>
          <p>
            Upload or paste any job, script, or SQL query. The engine analyzes keywords against curated runtime metadata,
            then surfaces the runtime that best matches your workload.
          </p>
        </div>
        <div className="hero-card">
          <h2>Realtime recommendation</h2>
          {result ? (
            <div>
              <p className="hero-value">{result.runtime_name}</p>
              <p className="hero-sub">Spark {result.spark_version} • {result.language}</p>
            </div>
          ) : (
            <p>Enter a script to activate the comparator.</p>
          )}
        </div>
      </header>

      <main>
        <section className="grid">
          <article className="panel auth-panel">
            <div className="panel-header">
              <h2>{authMode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
              <p>{authMode === 'login' ? 'Secure sign-in with bcrypt-powered authentication.' : 'New accounts unlock saved runtime history.'}</p>
            </div>
            <form className="panel-body" onSubmit={handleAuth}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@databricks.com"
              />
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button type="submit" className="primary">
                {authMode === 'login' ? 'Login to compare' : 'Register user'}
              </button>
              <button type="button" className="ghost" onClick={toggleAuthMode}>
                {authMode === 'login' ? 'Need an account?' : 'Already registered?'}
              </button>
              {authMessage && <p className="info">{authMessage}</p>}
              {authError && <p className="error">{authError}</p>}
            </form>
          </article>

          <article className="panel compare-panel">
            <div className="panel-header">
              <h2>Runtime comparison</h2>
              <p>Paste your job or query below and the tool will match keywords against every official runtime.</p>
            </div>
            <form className="panel-body" onSubmit={submitScript}>
              <label htmlFor="script">Script / Query / Job</label>
              <textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="# Paste your Databricks script here — SQL, Python, Spark, or ML workload"
              />
              <button type="submit" className="primary" disabled={loading || !script.trim()}>
                {loading ? 'Analyzing…' : 'Compare runtimes'}
              </button>
            </form>
            {error && <p className="error">{error}</p>}
            {scriptStats && (
              <div className="script-stats">
                <div>
                  <p className="eyebrow">Script analysis</p>
                  <p className="stats-value">{scriptStats.words}</p>
                  <p className="stat-label">words</p>
                </div>
                <div>
                  <p className="eyebrow">Characters</p>
                  <p className="stats-value">{scriptStats.characters}</p>
                  <p className="stat-label">total length</p>
                </div>
              </div>
            )}
            {result && (
              <div className="result">
                <div>
                  <p className="eyebrow">Recommendation</p>
                  <h3>{result.runtime_name}</h3>
                  <p>
                    Version: {result.version} • Spark {result.spark_version} • {result.language}
                  </p>
                </div>
                <div className="result-highlights">
                  {result.highlights.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <p className="notes">{result.notes}</p>
              </div>
            )}
          </article>
        </section>

        <section className="panel runtime-panel">
          <div className="panel-header">
            <h2>Available runtimes</h2>
            <p>Everything pulled from the official Databricks runtime catalog in SQLite.</p>
          </div>
          {runtimeLoading ? (
            <p>Loading runtimes…</p>
          ) : (
            <div className="runtime-grid">
              {runtimeList.map((runtime) => (
                <article key={runtime.id}>
                  <h3>{runtime.runtime_name}</h3>
                  <p>{runtime.notes}</p>
                  <p className="meta">
                    Version {runtime.version} • Spark {runtime.spark_version}
                  </p>
                  <p className="meta">Language: {runtime.language}</p>
                  <p className="meta">Keywords: {runtime.keywords}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel history-panel">
          <div className="panel-header">
            <h2>Recent comparisons</h2>
            <p>Track the last few scripts that were evaluated.</p>
          </div>
          {historyLoading ? (
            <p>Loading history…</p>
          ) : history.length ? (
            <div className="history-grid">
              {history.map((entry) => (
                <article key={entry.id}>
                  <p className="eyebrow">{new Date(entry.created_at).toLocaleString()}</p>
                  <h3>{entry.runtime_name}</h3>
                  <p className="meta">Spark {entry.spark_version} • {entry.language}</p>
                  <p className="excerpt">{entry.script_excerpt}</p>
                </article>
              ))}
            </div>
          ) : (
            <p>No comparisons logged yet.</p>
          )}
        </section>
      </main>

      <footer>
        <p>Built with Next.js, Express, SQLite, and Winston file logging.</p>
      </footer>

      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: 'Inter', system-ui, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);
          color: #0f172a;
        }
        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(248, 250, 252, 0.05) 35%, #f8fafc 100%);
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }
        .hero {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          background: #ffffff11;
          padding: 2rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e2e8f0;
          margin-bottom: 2rem;
        }
        .hero h1 {
          font-size: clamp(2rem, 3vw, 3rem);
          margin-bottom: 0.5rem;
        }
        .hero .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.75rem;
          color: #93c5fd;
        }
        .hero-card {
          background: rgba(15, 23, 42, 0.7);
          padding: 1.5rem;
          border-radius: 1rem;
          min-width: 250px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .hero-value {
          font-size: 1.75rem;
          margin: 0;
        }
        .hero-sub {
          margin: 0;
          color: #cbd5f5;
        }
        main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          color: #0f172a;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .panel {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .panel-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .panel-header p {
          margin: 0;
          color: #475569;
        }
        .panel-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        input,
        textarea {
          border-radius: 0.75rem;
          border: 1px solid #cbd5f5;
          padding: 0.85rem;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
        }
        textarea {
          min-height: 10rem;
        }
        button {
          border-radius: 0.75rem;
          border: none;
          padding: 0.95rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .primary {
          background: #4f46e5;
          color: white;
        }
        .primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ghost {
          background: transparent;
          border: 1px solid #cbd5f5;
          color: #0f172a;
        }
        .error {
          color: #dc2626;
          margin: 0;
        }
        .info {
          color: #15803d;
          margin: 0;
        }
        .result {
          border-radius: 1rem;
          padding: 1rem;
          background: #0f172a;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .result-highlights {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .result-highlights span {
          background: rgba(59, 130, 246, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.85rem;
        }
        .notes {
          margin: 0;
          font-size: 0.95rem;
          color: #cbd5f5;
        }
        .script-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 1rem;
          background: #eef2ff;
          color: #0f172a;
        }
        .stats-value {
          font-size: 1.75rem;
          margin: 0;
          font-weight: 600;
        }
        .stat-label {
          margin: 0;
          color: #475569;
          font-size: 0.85rem;
        }
        .history-panel {
          background: rgba(255, 255, 255, 0.96);
        }
        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .history-grid article {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          background: #fff;
        }
        .history-grid .excerpt {
          font-size: 0.9rem;
          color: #0f172a;
          margin-top: 0.5rem;
        }
        .history-grid .meta {
          font-size: 0.85rem;
          color: #475569;
        }
        .runtime-panel {
          background: rgba(255, 255, 255, 0.92);
        }
        .runtime-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .runtime-grid article {
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
        }
        .runtime-grid h3 {
          margin: 0 0 0.35rem 0;
        }
        .runtime-grid p {
          margin: 0;
          color: #475569;
        }
        .runtime-grid .meta {
          font-size: 0.85rem;
          color: #0f172a;
        }
        footer {
          margin-top: 3rem;
          text-align: center;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
