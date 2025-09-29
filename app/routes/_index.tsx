import { useState, useEffect, useRef } from 'react';
import { generateFactsheet } from '../lib/n8n-client';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'VIN → Factsheet' },
    { name: 'description', content: 'Generate vehicle factsheet from VIN using AI workflow' },
  ];
};

export default function Index() {
  const [testResult, setTestResult] = useState<any>(null);
  const [execResult, setExecResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [vin, setVin] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 启动倒计时
  const startCountdown = () => {
    setCountdown(30);
    setProgress(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });

      setProgress((prev) => {
        const nextProgress = prev + (100 / 30);
        return Math.min(nextProgress, 100);
      });
    }, 1000);
  };

  // 停止倒计时
  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(30);
    setProgress(0);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-n8n');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setLoading(false);
  };

  const executeWorkflow = async () => {
    setLoading(true);
    setExecResult(null);
    startCountdown();

    try {
      const result = await generateFactsheet(vin);
      setExecResult(result);
    } catch (error) {
      setExecResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
      stopCountdown();
    }
  };

  const copyToClipboard = async (data: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert('✅ JSON copied to clipboard!');
    } catch (error) {
      alert('❌ Failed to copy');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>
        VIN → Factsheet
      </h1>

      {/* Main Execute Workflow */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
          Enter VIN
        </h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Enter 17-digit VIN"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '15px',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={executeWorkflow}
            disabled={loading || !vin}
            style={{
              background: '#3B82F6',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading || !vin ? 'not-allowed' : 'pointer',
              opacity: loading || !vin ? 0.6 : 1,
              whiteSpace: 'nowrap',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            {loading ? '⏳ Processing...' : '🚀 Generate'}
          </button>
        </div>

        {/* Progress Bar - 倒计时进度条 */}
        {loading && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                🔄 Generating factsheet...
              </span>
              <span style={{ fontSize: '14px', color: '#3B82F6', fontWeight: '600' }}>
                {countdown}s
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }} />
            </div>

            <p style={{
              fontSize: '13px',
              color: '#9CA3AF',
              marginTop: '8px',
              marginBottom: 0
            }}>
              Please wait while we fetch vehicle information...
            </p>
          </div>
        )}

        {execResult && (
          <div style={{ marginTop: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                {execResult.success ? '✅ Result' : '❌ Error'}
              </h3>
              {execResult.success && (
                <button
                  onClick={() => copyToClipboard(execResult)}
                  style={{
                    background: '#F3F4F6',
                    color: '#374151',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  📋 Copy JSON
                </button>
              )}
            </div>
            <pre style={{
              background: execResult.success ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${execResult.success ? '#BBF7D0' : '#FECACA'}`,
              padding: '16px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '13px',
              maxHeight: '600px',
              margin: 0
            }}>
              {JSON.stringify(execResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Debug Section - Hidden by default */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          onClick={() => setShowDebug(!showDebug)}
          style={{
            background: 'transparent',
            color: '#9CA3AF',
            padding: '4px 8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>

      {showDebug && (
        <div style={{
          background: '#F9FAFB',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '12px', color: '#6B7280' }}>
            🔧 Debug Tools
          </h3>
          <button
            onClick={testConnection}
            disabled={loading}
            style={{
              background: '#6B7280',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '13px'
            }}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <pre style={{
              background: testResult.success ? '#D1FAE5' : '#FEE2E2',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '12px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}