import { useState, useEffect } from 'react'
import { healthCheck } from './utils/api'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    // Test backend connection on component mount
    checkBackendConnection()
  }, [])

  const checkBackendConnection = async () => {
    try {
      const response = await healthCheck()
      setBackendStatus('Connected')
      setBackendMessage(response.data.message)
    } catch (error) {
      setBackendStatus('Disconnected')
      setBackendMessage(
        error.response
          ? `Error: ${error.response.data?.message || error.message}`
          : 'Unable to reach backend server. Make sure it is running on port 5000.'
      )
    }
  }

  return (
    <>
      <div className="app-container">
        <h1>QuizAI</h1>
        <div className="card">
          <h2>Backend Connection Status</h2>
          <p className={`status ${backendStatus.toLowerCase()}`}>
            Status: <strong>{backendStatus}</strong>
          </p>
          {backendMessage && (
            <p className="message">{backendMessage}</p>
          )}
          <button onClick={checkBackendConnection}>
            Test Connection
          </button>
        </div>
      </div>
    </>
  )
}

export default App
