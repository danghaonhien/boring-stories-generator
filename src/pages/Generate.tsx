import axios from 'axios';
import { useState } from 'react';

export default function Generate() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('tech');
  const [story, setStory] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate`, {
        category,
      });
      setStory(res.data.story);
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Boring Story</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
          <select 
            id="category"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="tech">Boring Tech</option>
            <option value="design">Boring Design</option>
            <option value="life">Boring Life</option>
          </select>
        </div>
        <div className="self-end">
          <button 
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      
      {story && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Story</h2>
          <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{story}</div>
        </div>
      )}
    </div>
  );
} 