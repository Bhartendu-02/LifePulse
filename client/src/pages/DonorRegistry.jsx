import React, { useState } from 'react';
import api from '../api/axios';
import DonorCard from '../components/DonorCard';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorRegistry() {
  // Registration State
  const [registerData, setRegisterData] = useState({
    name: '',
    bloodGroup: 'O+',
    city: '',
    phone: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Search State
  const [searchCity, setSearchCity] = useState('Delhi');
  const [searchBloodGroup, setSearchBloodGroup] = useState('');
  const [donors, setDonors] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterSuccess('');
    setRegisterError('');

    try {
      await api.post('/emergency/donors', registerData);
      setRegisterSuccess('Thank you! You are now enrolled as an emergency standby blood donor.');
      setRegisterData({
        name: '',
        bloodGroup: 'O+',
        city: '',
        phone: ''
      });
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Failed to complete donor registration');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError('');
    setSearchPerformed(true);

    try {
      const params = {};
      if (searchCity.trim()) params.city = searchCity.trim();
      if (searchBloodGroup) params.bloodGroup = searchBloodGroup;

      const res = await api.get('/emergency/donors', { params });
      setDonors(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Unable to retrieve donor directory.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Voluntary Blood Donor Registry</h1>
        <p className="page-description">
          Register to donate blood during hospital shortages or search for standby volunteer donors in your city.
        </p>
      </div>

      <div className="grid-2">
        {/* Left Column: Volunteer Registration */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Register as a Volunteer Donor</h2>
              <div className="card-subtitle">Help save lives when rare blood groups are out of stock</div>
            </div>
          </div>

          <div className="alert alert-info" style={{ fontSize: '0.82rem', padding: '10px 12px' }}>
            <div>
              <strong>Donor Eligibility Guidelines:</strong>
              <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                <li>Age between 18 and 65 years, weight &gt; 50 kg</li>
                <li>At least 3 months since last whole blood donation</li>
                <li>No active fever or major medical restrictions</li>
              </ul>
            </div>
          </div>

          {registerSuccess && (
            <div className="alert alert-success">
              <span>✓ {registerSuccess}</span>
            </div>
          )}

          {registerError && (
            <div className="alert alert-danger">
              <span>⚠️ {registerError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="regName">Full Name *</label>
              <input
                id="regName"
                name="name"
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={registerData.name}
                onChange={handleRegisterChange}
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="regBlood">Blood Group *</label>
                <select
                  id="regBlood"
                  name="bloodGroup"
                  value={registerData.bloodGroup}
                  onChange={handleRegisterChange}
                  className="form-control font-mono"
                >
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="regCity">City *</label>
                <input
                  id="regCity"
                  name="city"
                  type="text"
                  required
                  placeholder="e.g. Delhi, Mumbai, Bengaluru"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regPhone">Mobile Phone Number *</label>
              <input
                id="regPhone"
                name="phone"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={registerData.phone}
                onChange={handleRegisterChange}
                className="form-control font-mono"
              />
            </div>

            <button
              type="submit"
              className="btn btn-success btn-block btn-lg"
              disabled={registerLoading}
            >
              {registerLoading ? 'Registering...' : '🩸 Register as Volunteer Donor'}
            </button>
          </form>
        </div>

        {/* Right Column: Search Donors */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Search Volunteer Donors</h2>
              <div className="card-subtitle">Find donors by city and blood type</div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '14px' }}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="searchCity">City:</label>
                <input
                  id="searchCity"
                  type="text"
                  placeholder="e.g. Delhi, Mumbai"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="searchBlood">Blood Group:</label>
                <select
                  id="searchBlood"
                  value={searchBloodGroup}
                  onChange={(e) => setSearchBloodGroup(e.target.value)}
                  className="form-control font-mono"
                >
                  <option value="">All Groups</option>
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={searchLoading}
            >
              🔍 {searchLoading ? 'Searching...' : 'Search Donors'}
            </button>
          </form>

          {searchError && (
            <div className="alert alert-danger">
              <span>{searchError}</span>
            </div>
          )}

          {searchLoading ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '24px' }}>
              Searching volunteer directory...
            </div>
          ) : searchPerformed ? (
            donors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                  Found {donors.length} volunteer donor{donors.length !== 1 ? 's' : ''}:
                </div>
                {donors.map((d) => (
                  <DonorCard key={d._id} donor={d} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>👥</div>
                <h4 style={{ color: '#0f172a', marginBottom: '4px' }}>No Donors Found in {searchCity}</h4>
                <p style={{ fontSize: '0.88rem' }}>
                  Try searching without filtering by blood group or check another nearby city.
                </p>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📍</div>
              <h4 style={{ color: '#0f172a', marginBottom: '4px' }}>Find Donors in Your City</h4>
              <p style={{ fontSize: '0.88rem' }}>
                Enter your city name above and click <strong>Search Donors</strong> to see volunteers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
