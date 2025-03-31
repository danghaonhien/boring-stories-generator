import axios from 'axios';
import { useState, CSSProperties } from 'react';

// Inline styles to replace Tailwind
const styles: Record<string, CSSProperties> = {
  container: {
    padding: '2rem',
    maxWidth: '48rem',
    margin: '0 auto',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
  },
  select: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '0.25rem',
    padding: '0.5rem 0.75rem',
    width: '100%',
    maxWidth: '20rem',
  },
  button: {
    backgroundColor: 'black',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    cursor: 'not-allowed',
  },
  resultContainer: {
    marginTop: '1.5rem',
  },
  resultHeading: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  storyContainer: {
    backgroundColor: '#f3f4f6',
    padding: '1rem',
    borderRadius: '0.25rem',
    whiteSpace: 'pre-wrap',
  },
};

export default function Generate() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('tech');
  const [story, setStory] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate`, {
        category,
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      });
      setStory(res.data.story);
    } catch (error: any) {
      console.error('Error generating story:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        alert(`Failed to generate story: ${error.response.data?.error || error.message}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Failed to generate story: No response from server');
      } else {
        console.error('Error setting up request:', error.message);
        alert('Failed to generate story: Request setup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Generate Boring Story</h1>
      <div style={styles.formGroup}>
        <label htmlFor="category" style={styles.label}>Category:</label>
        <select 
          id="category"
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          <option value="tech">Boring Tech</option>
          <option value="design">Boring Design</option>
          <option value="life">Boring Life</option>
        </select>
      </div>
      <button 
        style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}} 
        onClick={handleGenerate} 
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {story && (
        <div style={styles.resultContainer}>
          <h2 style={styles.resultHeading}>Generated Story:</h2>
          <div style={styles.storyContainer}>{story}</div>
        </div>
      )}
    </div>
  );
} 