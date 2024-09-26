import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import './Admin.css';

const Admin = () => {
  const [teamName, setTeamName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedKey('');

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError('You must be logged in to generate an API key.');
      return;
    }

    const idToken = await user.getIdToken();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/create-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      setGeneratedKey(data.apiKey);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-container">
      <h1>Generate API Key</h1>
      <form onSubmit={handleSubmit} className="api-key-form">
        <div className="form-group">
          <label htmlFor="teamName">Team Name:</label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="generate-button">Generate API Key</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {generatedKey && (
        <div className="generated-key">
          <h2>Generated API Key:</h2>
          <p>{generatedKey}</p>
        </div>
      )}
    </div>
  );
};

export default Admin;