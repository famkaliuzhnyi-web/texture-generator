import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(32);
  const [filename, setFilename] = useState('texture');
  const [textures, setTextures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState(null);

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await axios.get('/api/ollama-status');
      setOllamaStatus(response.data);
    } catch (error) {
      setOllamaStatus({ status: 'error', error: error.message });
    }
  };

  const generateTextures = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a texture description');
      return;
    }

    setLoading(true);
    setError('');
    setTextures([]);

    try {
      const response = await axios.post('/api/generate-textures', {
        prompt: prompt.trim(),
        size: parseInt(size),
        filename: filename.trim() || 'texture'
      });

      if (response.data.success) {
        setTextures(response.data.textures);
      } else {
        setError('Failed to generate textures');
      }
    } catch (error) {
      console.error('Error generating textures:', error);
      setError(error.response?.data?.error || 'Failed to generate textures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTexture = async (texture) => {
    try {
      const response = await axios.get(texture.downloadUrl, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = texture.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading texture:', error);
      setError('Failed to download texture');
    }
  };

  const sizeOptions = [16, 32, 64, 128, 256, 512];

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>AI Texture Generator</h1>
          <p>Generate unique textures using AI - powered by Ollama</p>
        </header>

        {ollamaStatus && (
          <div className="status-section">
            <h3>System Status</h3>
            <div className="status-item">
              <span>Ollama Connection:</span>
              <span className={ollamaStatus.status === 'connected' ? 'status-connected' : 'status-disconnected'}>
                {ollamaStatus.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {ollamaStatus.models && ollamaStatus.models.length > 0 && (
              <div className="status-item">
                <span>Available Models:</span>
                <span>{ollamaStatus.models.length} model(s)</span>
              </div>
            )}
            {ollamaStatus.status === 'disconnected' && (
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                Note: Ollama is not connected. The system will use built-in texture generation.
              </div>
            )}
          </div>
        )}

        <form onSubmit={generateTextures} className="form-section">
          <div className="form-group">
            <label htmlFor="prompt">Texture Description</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the texture you want to generate (e.g., 'rough stone wall', 'wooden planks', 'metal surface with rust')"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="size">Texture Size (pixels)</label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {sizeOptions.map(option => (
                  <option key={option} value={option}>
                    {option}x{option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="filename">Base Filename</label>
              <input
                type="text"
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="texture"
                pattern="[a-zA-Z0-9_-]+"
                title="Only letters, numbers, hyphens, and underscores allowed"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="generate-btn"
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Generating Textures...' : 'Generate 4 Textures'}
          </button>
        </form>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Generating textures, please wait...</span>
          </div>
        )}

        {textures.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2>Generated Textures</h2>
              <p>Click on any texture to download it</p>
            </div>

            <div className="results-grid">
              {textures.map((texture) => (
                <div key={texture.id} className="texture-card">
                  <img
                    src={texture.url}
                    alt={`Generated texture ${texture.id}`}
                    className="texture-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="texture-info">
                    <h3>Texture {texture.id}</h3>
                    <button
                      onClick={() => downloadTexture(texture)}
                      className="download-btn"
                    >
                      Download {texture.filename}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;