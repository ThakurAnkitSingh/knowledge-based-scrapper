import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleScrape = async () => {
        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/api/scrape', { url: url.trim() });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while scraping');
            console.error('Scraping error:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadJSON = () => {
        if (!result) return;

        const dataStr = JSON.stringify(result, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const fileName = `knowledge_base_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
    };

    return (
        <div className="App">
            <div className="container">
                <div className="header">
                    <h1>Knowledge Base Scraper</h1>
                    <p className="subtitle">
                        Import technical knowledge from any website into your knowledge base
                    </p>
                </div>

                <div className="input-section">
                    <input
                        type="text"
                        className="url-input"
                        placeholder="Enter website URL (e.g., interviewing.io)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleScrape()}
                        disabled={loading}
                    />
                    <button
                        className="scrape-btn"
                        onClick={handleScrape}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Scraping...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                Start Scraping
                            </>
                        )}
                    </button>
                </div>

                {loading && (
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p>Discovering and scraping content...</p>
                        <p className="loading-subtitle">This may take a few moments</p>
                    </div>
                )}

                {error && (
                    <div className="error-section">
                        <p>❌ Error: {error}</p>
                    </div>
                )}

                {result && !loading && (
                    <div className="results-section">
                        <div className="stats-card">
                            <h3>Scraping Results</h3>
                            <div className="stats">
                                <div className="stat-item">
                                    <span className="stat-number">{result.items?.length || 0}</span>
                                    <span className="stat-label">items found</span>
                                </div>
                                {result.stats?.content_types && (
                                    <div className="content-types">
                                        {Object.entries(result.stats.content_types).map(([type, count]) => (
                                            <span key={type} className="content-type-badge">
                                                {count} {type}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="download-btn" onClick={downloadJSON}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download JSON
                        </button>

                        {result.items && result.items.length > 0 && (
                            <div className="items-preview">
                                <h3>Content Preview</h3>
                                <div className="items-list">
                                    {result.items.slice(0, 10).map((item, index) => (
                                        <div key={index} className="item-card">
                                            <h4 className="item-title">{item.title}</h4>
                                            <span className="item-type">{item.content_type}</span>
                                            <p className="item-url">{item.source_url}</p>
                                            <p className="item-preview">
                                                {item.content.substring(0, 150)}...
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {result.items.length > 10 && (
                                    <p className="more-items">
                                        ...and {result.items.length - 10} more items
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
