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

  const getCategoryIcon = () => {
    switch(category) {
      case 'tech': return '💻';
      case 'design': return '🎨';
      case 'life': return '🌿';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Generate Boring Story</h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Select a category and click "Generate" to create a boring, mildly sarcastic story about mundane topics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="w-full sm:w-64">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Story Category
                </label>
                <div className="relative">
                  <select 
                    id="category"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-md"
                    disabled={loading}
                  >
                    <option value="tech">Boring Tech</option>
                    <option value="design">Boring Design</option>
                    <option value="life">Boring Life</option>
                  </select>
                </div>
              </div>
              
              <button 
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]" 
                onClick={handleGenerate} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {story && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{getCategoryIcon()}</span>
              <h2 className="text-xl font-semibold text-gray-800">
                Boring {category.charAt(0).toUpperCase() + category.slice(1)} Story
              </h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm whitespace-pre-wrap">
              {story}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 