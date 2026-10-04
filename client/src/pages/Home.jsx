import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SosRequestCard from '../components/SosRequestCard';

export default function Home() {
  const [activeRequests, setActiveRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const loadRecentRequests = async () => {
      try {
        const res = await api.get('/emergency/requests');
        // Show up to 3 most recent requests
        setActiveRequests(res.data.slice(0, 3));
      } catch (err) {
        console.error('Error loading recent requests on home:', err);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRecentRequests();
  }, []);

  return (
    <div className="container">
      {/* Welcome Banner */}
      <div className="home-welcome-box">
        <h1>LifePulse Blood Bank & Trauma Assistance</h1>
        <p>
          A dedicated emergency healthcare portal to help bystanders and families quickly check real-time blood stock in nearby hospital blood banks, post emergency SOS blood requests for accident victims, and connect with volunteer donors in your city.
        </p>

        <div className="home-actions-bar">
          <Link to="/nearby" className="btn btn-primary btn-lg">
            🔍 Find Hospitals & Blood
          </Link>
          <Link to="/request-blood" className="btn btn-danger btn-lg">
            🚨 Post Urgent Request (SOS)
          </Link>
          <Link to="/donors" className="btn btn-success btn-lg">
            🩸 Volunteer as Donor
          </Link>
          <Link to="/first-aid" className="btn btn-outline btn-lg">
            🩹 First-Aid Guide
          </Link>
        </div>
      </div>

      {/* Ambulance Dispatch Banner */}
      <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <strong style={{ fontSize: '1rem' }}>🚑 Medical Emergency / Road Accident?</strong>
          <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
            Call the government ambulance service immediately. Available 24x7 free of cost.
          </div>
        </div>
        <a href="tel:108" className="btn btn-danger">
          📞 Dial 108 Ambulance
        </a>
      </div>

      {/* Active Urgent Requests on Home */}
      <div style={{ marginTop: '24px' }}>
        <div className="home-section-title">
          <span>Active Emergency Blood Requests:</span>
          <Link to="/request-blood" style={{ fontSize: '0.88rem', fontWeight: '600' }}>
            View All Requests ({activeRequests.length}) &rarr;
          </Link>
        </div>

        {loadingRequests ? (
          <div className="card text-muted" style={{ textAlign: 'center', padding: '20px' }}>
            Loading urgent blood requests...
          </div>
        ) : activeRequests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeRequests.map((req) => (
              <SosRequestCard key={req._id} request={req} />
            ))}
          </div>
        ) : (
          <div className="card text-muted" style={{ textAlign: 'center', padding: '24px' }}>
            ✅ No critical blood requests pending right now.
          </div>
        )}
      </div>

      {/* Quick Accident Scene Bystander Protocol */}
      <div style={{ marginTop: '28px' }}>
        <h2 className="home-section-title">
          What to Do at a Road Accident Scene:
        </h2>

        <div className="home-steps-grid">
          <div className="home-step-card">
            <span className="home-step-number">Step 1</span>
            <div className="home-step-title">Ensure Scene Safety</div>
            <p className="home-step-desc">
              Warn oncoming traffic. If the injured person was on a motorcycle, <strong>do not forcefully pull off their helmet</strong> as it can damage the cervical spine.
            </p>
          </div>

          <div className="home-step-card">
            <span className="home-step-number">Step 2</span>
            <div className="home-step-title">Call 108 Ambulance</div>
            <p className="home-step-desc">
              State your exact location, nearby landmarks, and number of injured individuals clearly to the emergency operator.
            </p>
          </div>

          <div className="home-step-card">
            <span className="home-step-number">Step 3</span>
            <div className="home-step-title">Stop Active Bleeding</div>
            <p className="home-step-desc">
              Apply continuous, firm pressure to any bleeding wounds with a clean cloth or bandage. Keep the injured limb elevated if possible.
            </p>
          </div>

          <div className="home-step-card">
            <span className="home-step-number">Step 4</span>
            <div className="home-step-title">Check Hospital & Blood</div>
            <p className="home-step-desc">
              Use LifePulse to locate the nearest hospital with an open Trauma ICU and the required blood units in stock before transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
