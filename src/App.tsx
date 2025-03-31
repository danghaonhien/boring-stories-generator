import Generate from './pages/Generate';
import { CSSProperties } from 'react';

// Inline styles to replace Tailwind
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'black',
    color: 'white',
    padding: '1rem',
  },
  headerContent: {
    maxWidth: '48rem',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#d1d5db',
  },
  footer: {
    padding: '1rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

function App() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>The Boring Dev</h1>
          <p style={styles.subtitle}>Tech, Design, and Life Stories Generator</p>
        </div>
      </header>
      <main>
        <Generate />
      </main>
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} The Boring Dev. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
