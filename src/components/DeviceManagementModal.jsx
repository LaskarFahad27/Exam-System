import React, { useState, useEffect } from 'react';
import { X, Monitor, Smartphone, Laptop, Tablet, LogOut, RefreshCw, Shield } from 'lucide-react';
import { getUserSessions, logoutSpecificSession, logoutOtherDevices } from '../utils/auth';
import './DeviceModal.css';

const DeviceManagementModal = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle modal visibility with a slight delay for animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with the CSS transition duration
    }
  }, [isOpen]);

  // Get device icon based on user agent
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <Monitor className="w-5 h-5 text-gray-600" />;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-blue-600" />;
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      return <Tablet className="w-5 h-5 text-purple-600" />;
    } else if (ua.includes('mac') || ua.includes('windows') || ua.includes('linux')) {
      return <Laptop className="w-5 h-5 text-indigo-600" />;
    }
    return <Monitor className="w-5 h-5 text-gray-600" />;
  };

  // Get device name based on user agent
  const getDeviceName = (userAgent, isCurrentDevice) => {
    if (!userAgent) return `Unknown Device${isCurrentDevice ? ' (Current)' : ''}`;
    
    const ua = userAgent.toLowerCase();
    let deviceType = 'Unknown Device';
    
    if (ua.includes('windows')) {
      deviceType = 'Windows';
    } else if (ua.includes('mac')) {
      deviceType = 'Mac';
    } else if (ua.includes('linux')) {
      deviceType = 'Linux';
    } else if (ua.includes('iphone')) {
      deviceType = 'iPhone';
    } else if (ua.includes('ipad')) {
      deviceType = 'iPad';
    } else if (ua.includes('android')) {
      deviceType = 'Android';
    }
    
    return `${deviceType}${isCurrentDevice ? ' (Current)' : ''}`;
  };

  // Get browser name based on user agent
  const getBrowserName = (userAgent) => {
    if (!userAgent) return 'Unknown Browser';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome')) {
      return 'Chrome';
    } else if (ua.includes('firefox')) {
      return 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    } else if (ua.includes('edge')) {
      return 'Edge';
    } else if (ua.includes('opera')) {
      return 'Opera';
    }
    
    return 'Unknown Browser';
  };

  // Format timestamp to BDT (UTC+6)
  const formatTimestamp = (timestamp, clientFetchTime) => {
    if (!timestamp) return 'Unknown';
    
    // Debug log to see what's coming in
    console.log('Formatting timestamp:', timestamp);
    
    // Parse the timestamp
    let date;
    try {
      // Check if timestamp is in ISO format or unix timestamp
      date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
    } catch (e) {
      console.error('Error parsing timestamp:', e);
      return 'Invalid date';
    }
    
    // Get current time
    const now = new Date();
    
    // Calculate time difference in milliseconds
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      // Format date to BDT (UTC+6) by explicitly setting the timezone
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka' // Explicitly set timezone to Bangladesh
      });
    }
  };

  // Fetch sessions when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset any previous state
      setError(null);
      setSessions([]);
      
      // Fetch fresh sessions data
      fetchSessions();
      
      // Set up a refresh interval when the modal is open
      const intervalId = setInterval(() => {
        fetchSessions();
      }, 30000); // Refresh every 30 seconds
      
      // Clean up the interval when the modal closes
      return () => clearInterval(intervalId);
    }
  }, [isOpen]);

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserSessions();
      
      // Debug log the sessions data
      console.log('Sessions data received:', response);
      
      if (Array.isArray(response)) {
        // Process the sessions for display
        const processedSessions = response.map(session => {
          // If it's not the current session and the timestamp is older than 10 minutes
          if (!session.is_current) {
            // Create a date from a minute ago for testing
            const oneMinuteAgo = new Date();
            oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
            
            // Only modify the timestamp for demo/debug purposes
            // In production, you'd work with your backend team to ensure accurate timestamps
            return {
              ...session,
              // Use the original timestamp but log what we think it should be
              debug_timestamp: oneMinuteAgo.toISOString()
            };
          }
          return session;
        });
        
        setSessions(processedSessions);
      } else {
        setSessions([]);
        setError('No sessions data available');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load your active sessions. Please try again.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh sessions
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchSessions();
      
      // Force re-render with fresh timestamps
      setSessions(prevSessions => {
        if (!prevSessions) return [];
        // Create a new array with the same sessions to trigger re-render
        return [...prevSessions];
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Logout from specific session
  const handleLogoutSession = async (sessionId) => {
    try {
      setLoggingOut(true);
      setSelectedSessionId(sessionId);
      await logoutSpecificSession(sessionId);
      
      // Refresh sessions to get updated list
      await fetchSessions();
    } catch (err) {
      console.error('Error logging out session:', err);
      setError('Failed to log out from the selected device. Please try again.');
    } finally {
      setLoggingOut(false);
      setSelectedSessionId(null);
    }
  };

  // Logout from all other devices
  const handleLogoutOtherDevices = async () => {
    try {
      setLoggingOut(true);
      await logoutOtherDevices();
      
      // Refresh sessions to get updated list
      await fetchSessions();
    } catch (err) {
      console.error('Error logging out other devices:', err);
      setError('Failed to log out from other devices. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    isOpen ? (
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div 
            className={`bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden transition-all duration-300 ${isVisible ? 'transform-none' : 'scale-95 translate-y-4'}`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Device Management</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  Active sessions across all your devices
                </p>
                <button 
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none p-1 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center">
                  <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active sessions found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md 
                        ${session.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getDeviceIcon(session.device_info)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {getDeviceName(session.device_info, session.is_current)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getBrowserName(session.device_info)}
                            </div>
                            {session.is_current && (
                              <div className="text-xs text-green-500 mt-1">
                                Active now
                              </div>
                            )}
                            {session.ip_address && (
                              <div className="text-xs text-gray-400">
                                IP: {session.ip_address}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!session.is_current && (
                          <button
                            onClick={() => handleLogoutSession(session.id)}
                            disabled={loggingOut}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 h-8 w-8 flex items-center justify-center"
                          >
                            {loggingOut && selectedSessionId === session.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <LogOut className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {session.is_current && (
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Current
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {sessions && sessions.length > 0 && (
                    <div>
                      <span>{sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}</span>
                      <div className="text-xs text-gray-400 mt-1">All times shown in BDT (UTC+6)</div>
                    </div>
                  )}
                </div>
                
                {sessions && sessions.filter(s => !s.is_current).length > 0 && (
                  <button
                    onClick={handleLogoutOtherDevices}
                    disabled={loggingOut}
                    className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {loggingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Logout other devices</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    ) : null
  );
};

export default DeviceManagementModal;
