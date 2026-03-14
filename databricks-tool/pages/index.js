import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [script, setScript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitScript = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script })
      });
      if (!response.ok) throw new Error('Unable to fetch comparison');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Databricks Runtime Suggestion Tool</title>
        <meta name="description" content="Compare your Databricks job with available runtimes." />
      </Head>

      <main>
        <h1>Databricks Runtime Suggestion Tool</h1>
        <p>
          Paste a Databricks script/query/job snippet and we will compare it with available runtime versions
          to recommend the best fit.
        </p>

        <form className="script-form" onSubmit={submitScript}>
          <label htmlFor="script">Script / Query / Job</label>
          <textarea
            id="script"
            placeholder="# Paste your Databricks script here"
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
          <button type="submit" disabled={loading || !script.trim()}>
            {loading ? 'Analyzing…' : 'Compare Runtime'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <section className="result">
            <h2>Recommendation</h2>
            <p>
              Based on your submission, the tool matched the script against runtime metadata pulled from official
              Databricks sources and identified the best match below.
            </p>
            <div className="card">
              <h3>{result.runtime_name}</h3>
              <p>Databricks Runtime Version: {result.version}</p>
              <p>Apache Spark: {result.spark_version}</p>
              <p>Primary Language: {result.language}</p>
              <p>Notes: {result.notes}</p>
            </div>
            <div className="card">
              <h4>Why this runtime?</h4>
              <ul>
                {result.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer>
        <p>Built with Next.js, Express, SQLite, and local file logging.</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8fafc;
        }
        main {
          width: min(960px, 100%);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        h1 {
          margin: 0;
          font-size: 2.5rem;
        }
        p {
          margin: 0;
          color: #475569;
        }
        .script-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        textarea {
          min-height: 10rem;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1rem;
          resize: vertical;
        }
        button {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 0.85rem 1.5rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
        .result {
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card {
          border: 1px solid #e2e8f0;
          padding: 1rem;
          border-radius: 0.75rem;
          background: #f8fafc;
        }
        ul {
          margin: 0;
          padding-left: 1.25rem;
          color: #0f172a;
        }
        .error {
          color: #dc2626;
        }
        footer {
          margin-top: auto;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}
