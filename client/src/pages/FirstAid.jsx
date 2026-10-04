import React, { useState } from 'react';
import api from '../api/axios';

const COMMON_SCENARIOS = [
  {
    title: '🩸 Severe Bleeding',
    desc: 'Deep cut or continuous bleeding from arm/leg',
    prompt: 'Severe bleeding from an arm or leg cut. Blood is flowing continuously. What should I do immediately to stop the bleeding?'
  },
  {
    title: '😵 Unconscious Victim',
    desc: 'Victim is unresponsive on the road',
    prompt: 'Adult accident victim is unconscious and not responding. How do I check their breathing and what should I do?'
  },
  {
    title: '🏍️ Biker Crash (Helmet On)',
    desc: 'Motorcyclist crashed with helmet still on',
    prompt: 'Motorcycle accident victim is lying on the road with helmet on. Should bystanders remove the helmet or leave it on?'
  },
  {
    title: '🦴 Broken Bone / Fracture',
    desc: 'Visibly bent, deformed, or painful limb',
    prompt: 'Victim has a visibly deformed or broken leg after a collision. How to support it safely until the ambulance arrives?'
  },
  {
    title: '⚡ Neck or Spine Pain',
    desc: 'Victim complains of severe back/neck pain',
    prompt: 'Car accident victim has severe neck and back pain. Should we move them out of the vehicle or keep them still?'
  }
];

export default function FirstAid() {
  const [situation, setSituation] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAdvice = async (queryText) => {
    const query = (queryText || situation).trim();
    if (!query) return;

    setLoading(true);
    setErrorMsg('');
    setAdvice('');
    setCopied(false);

    try {
      const res = await api.post('/emergency/first-aid', { situation: query });
      setAdvice(res.data.advice);
    } catch (err) {
      console.error('First-Aid AI error:', err);
      const fallback =
        err.response?.data?.message ||
        '1. DIAL 108 IMMEDIATELY FOR AN AMBULANCE.\n2. APPLY FIRM, DIRECT PRESSURE TO ANY ACTIVE BLEEDING WITH A CLEAN CLOTH.\n3. DO NOT MOVE THE VICTIM IF A NECK OR SPINAL INJURY IS SUSPECTED.';
      setAdvice(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioClick = (item) => {
    setSituation(item.prompt);
    fetchAdvice(item.prompt);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAdvice(situation);
  };

  const handleCopy = () => {
    if (!advice) return;
    navigator.clipboard.writeText(advice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderAdviceContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          const isWarning = trimmed.includes('DO NOT') || trimmed.startsWith('⚠️');
          const isAmbulance = trimmed.includes('108') || trimmed.includes('102') || trimmed.startsWith('🚨');

          if (isWarning) {
            return (
              <div key={idx} className="alert alert-warning" style={{ margin: '4px 0' }}>
                <span>⚠️ {trimmed}</span>
              </div>
            );
          }

          if (isAmbulance) {
            return (
              <div key={idx} className="alert alert-danger" style={{ margin: '4px 0' }}>
                <span>📞 <strong>{trimmed}</strong></span>
              </div>
            );
          }

          return (
            <p key={idx} className="instruction-step">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container">
      {/* 108 Emergency Banner */}
      <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <strong>🚨 Call 108 First:</strong>
          <span style={{ marginLeft: '6px' }}>First-aid provides temporary support until medical help arrives. Always call 108 immediately.</span>
        </div>
        <a href="tel:108" className="btn btn-danger btn-sm">
          Call 108 Ambulance
        </a>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Emergency First-Aid Guide</h1>
        <p className="page-description">
          Immediate, practical instructions for bystanders at an accident scene before professional medical help arrives.
        </p>
      </div>

      {/* Common Scenario Buttons */}
      <div className="card">
        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '10px', color: '#0f172a' }}>
          Select a Common Emergency Scenario:
        </div>
        <div className="first-aid-scenarios">
          {COMMON_SCENARIOS.map((item, index) => (
            <button
              key={index}
              type="button"
              className="scenario-button"
              onClick={() => handleScenarioClick(item)}
              disabled={loading}
            >
              <div>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                {item.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Query Input */}
        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <label htmlFor="custom-situation" style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px' }}>
            Or type your specific situation:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="custom-situation"
              type="text"
              className="form-control"
              placeholder="e.g. Person fell from stairs, head hit the floor, bleeding from ear..."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !situation.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? 'Checking...' : 'Get Instructions'}
            </button>
          </div>
        </form>
      </div>

      {/* Output Instructions Card */}
      <div className="instructions-card">
        <div className="card-header">
          <h2 className="card-title">First-Aid Instructions</h2>
          {advice && !loading && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : '📋 Copy Steps'}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-muted" style={{ textAlign: 'center', padding: '30px' }}>
            <div>⏳</div>
            <p style={{ marginTop: '8px' }}>Loading emergency guidance...</p>
          </div>
        ) : advice ? (
          <div>{renderAdviceContent(advice)}</div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🩹</div>
            <h3 style={{ color: '#0f172a', marginBottom: '4px' }}>Ready for Guidance</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Click any emergency scenario button above or describe the injury to see step-by-step bystander instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
