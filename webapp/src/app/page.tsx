export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: '#f8f7ff',
    }}>
      <h1 style={{
        fontSize: '2rem',
        color: '#6366f1',
        marginBottom: '0.5rem',
      }}>
        Compass
      </h1>
      <p style={{
        color: '#64748b',
        fontSize: '1.1rem',
        textAlign: 'center',
        maxWidth: '400px',
      }}>
        Your personalized well-being plan is ready.
        <br />
        This is a placeholder for the main app experience.
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem 2rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
          Coming soon: Daily exercises, progress tracking, community support
        </p>
      </div>
    </main>
  );
}
