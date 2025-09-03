import React, { useEffect, useState } from 'react';
import { getUserSessions, logoutSpecificSession, logoutOtherDevices } from '../utils/auth';

// This is a test component to verify the auth API functionality
const SessionsTest = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserSessions();
      console.log('Sessions response:', response);
      setSessions(Array.isArray(response) ? response : []);
      setSuccessMessage('Sessions fetched successfully');
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      setLoading(true);
      await logoutSpecificSession(sessionId);
      setSuccessMessage(`Session ${sessionId} logged out successfully`);
      // Refresh sessions
      fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to logout session');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    try {
      setLoading(true);
      await logoutOtherDevices();
      setSuccessMessage('All other devices logged out successfully');
      // Refresh sessions
      fetchSessions();
    } catch (err) {
      setError(err.message || 'Failed to logout other devices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Sessions Test</h2>
      
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      
      <div className="mb-4">
        <button 
          onClick={fetchSessions}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Refresh Sessions
        </button>
        
        <button 
          onClick={handleLogoutOtherDevices}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout Other Devices
        </button>
      </div>
      
      <div className="border rounded p-2">
        <h3 className="font-semibold mb-2">Sessions ({sessions.length})</h3>
        
        {sessions.length === 0 ? (
          <p className="text-gray-500">No active sessions found</p>
        ) : (
          <ul className="divide-y">
            {sessions.map(session => (
              <li key={session.id} className="py-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p><strong>Device:</strong> {session.device_info || 'Unknown Device'}</p>
                    <p><strong>IP:</strong> {session.ip_address || 'Unknown'}</p>
                    <p><strong>Last Active:</strong> {new Date(session.last_active).toLocaleString()}</p>
                    {session.is_current && <span className="text-green-500 font-semibold">Current Device</span>}
                  </div>
                  
                  {!session.is_current && (
                    <button
                      onClick={() => handleLogoutSession(session.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionsTest;
