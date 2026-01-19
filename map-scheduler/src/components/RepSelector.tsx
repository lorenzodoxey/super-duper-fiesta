import { useState } from 'react';
import { User } from 'lucide-react';
import './RepSelector.css';

interface RepSelectorProps {
  onRepSelected: (repId: string) => void;
}

export default function RepSelector({ onRepSelected }: RepSelectorProps) {
  const [repId, setRepId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = repId.trim();

    if (!trimmedId) {
      setError('Please enter your name or rep ID');
      return;
    }

    if (trimmedId.length < 2) {
      setError('Name or ID must be at least 2 characters');
      return;
    }

    // Store rep ID in localStorage for future sessions
    localStorage.setItem('repId', trimmedId);
    onRepSelected(trimmedId);
  };

  return (
    <div className="rep-selector-overlay">
      <div className="rep-selector-modal">
        <div className="rep-selector-content">
          <div className="rep-selector-icon">
            <User size={48} />
          </div>
          
          <h1>Welcome to MHM Map Scheduler</h1>
          <p className="rep-selector-subtitle">
            Enter your name or rep ID to get started
          </p>

          <form onSubmit={handleSubmit} className="rep-selector-form">
            <div className="rep-selector-group">
              <label htmlFor="repId">Your Name or Rep ID *</label>
              <input
                id="repId"
                type="text"
                value={repId}
                onChange={(e) => {
                  setRepId(e.target.value);
                  setError('');
                }}
                placeholder="e.g., John Smith or REP-001"
                className={error ? 'error' : ''}
                autoFocus
              />
              {error && <span className="error-text">{error}</span>}
              <p className="rep-selector-hint">
                This keeps your appointments separate from other reps
              </p>
            </div>

            <button type="submit" className="btn-start">
              Get Started
            </button>
          </form>

          <div className="rep-selector-info">
            <h3>How it works:</h3>
            <ul>
              <li>✓ Your appointments are stored in the cloud</li>
              <li>✓ Access them from any device</li>
              <li>✓ Your data is separate and secure</li>
              <li>✓ Real-time updates across devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
