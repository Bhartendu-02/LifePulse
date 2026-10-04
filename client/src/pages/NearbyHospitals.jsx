import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import useGeolocation from '../hooks/useGeolocation';
import HospitalCard from '../components/HospitalCard';
import ReserveModal from '../components/ReserveModal';

const CITY_PRESETS = [
  { name: 'Delhi NCR', lat: 28.5672, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0176, lng: 72.8561 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RADII = [
  { label: 'Within 10 km', value: 10000 },
  { label: 'Within 15 km', value: 15000 },
  { label: 'Within 25 km', value: 25000 },
  { label: 'Within 50 km', value: 50000 }
];

export default function NearbyHospitals() {
  const geo = useGeolocation();

  // Active Coordinates State (Starts with Delhi NCR as safe fallback)
  const [coords, setCoords] = useState({ lat: 28.5672, lng: 77.2090 });
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(25000);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeCityName, setActiveCityName] = useState('Delhi NCR');

  // Reservation Modal State
  const [selectedHospitalForReserve, setSelectedHospitalForReserve] = useState(null);

  // Automatically switch to live GPS location if detected by browser
  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      setCoords({ lat: geo.latitude, lng: geo.longitude });
      setActiveCityName(null);
    }
  }, [geo.latitude, geo.longitude]);

  const fetchNearbyHospitals = useCallback(async (lat, lng, bloodGroup, radius) => {
    if (!lat || !lng) return;

    setLoading(true);
    setFetchError(null);

    try {
      const params = { lat, lng, radius };
      if (bloodGroup) params.bloodGroup = bloodGroup;

      const res = await api.get('/emergency/nearby', { params });
      setHospitals(res.data);
    } catch (err) {
      console.error('Error querying nearby hospitals:', err);
      setFetchError(
        err.response?.data?.message || 'Unable to retrieve nearby hospitals. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (coords) {
      fetchNearbyHospitals(coords.lat, coords.lng, selectedBloodGroup, radiusMeters);
    }
  }, [coords, selectedBloodGroup, radiusMeters, fetchNearbyHospitals]);

  const handleSelectPreset = (preset) => {
    setActiveCityName(preset.name);
    setCoords({ lat: preset.lat, lng: preset.lng });
  };

  const handleDetectLiveLocation = () => {
    if (geo.latitude && geo.longitude) {
      setActiveCityName(null);
      setCoords({ lat: geo.latitude, lng: geo.longitude });
    } else {
      geo.detectLocation();
    }
  };

  const handleStockReserved = (hospitalId, group, newStock) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h._id === hospitalId) {
          return {
            ...h,
            bloodUnits: {
              ...h.bloodUnits,
              [group]: newStock
            }
          };
        }
        return h;
      })
    );
  };

  const isLiveGpsActive = !activeCityName && coords && geo.latitude && geo.longitude;

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Hospital Directory & Blood Stock</h1>
        <p className="page-description">
          Find nearby medical centers with available blood units and check emergency trauma care facilities.
        </p>
      </div>

      {/* Filter and Location Deck */}
      <div className="filter-toolbar">
        <div className="filter-toolbar-header">
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginRight: '8px' }}>
              Search Location:
            </span>
            {isLiveGpsActive ? (
              <span className="badge badge-success">
                🟢 Live GPS Active ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
              </span>
            ) : geo.loading ? (
              <span className="badge badge-warning">
                📡 Acquiring GPS position...
              </span>
            ) : (
              <span className="badge badge-primary">
                📍 {activeCityName || 'Selected Coordinates'}
              </span>
            )}
          </div>

          {/* Location Switchers */}
          <div className="city-preset-buttons">
            <button
              type="button"
              className={`btn-city ${isLiveGpsActive ? 'active btn-gps' : 'btn-gps'}`}
              onClick={handleDetectLiveLocation}
              disabled={geo.loading}
              title="Detect real-time GPS coordinates using your device"
            >
              {geo.loading ? '📡 Acquiring GPS...' : isLiveGpsActive ? '✓ Using My GPS Location' : '🎯 Use My Live Location'}
            </button>

            {CITY_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`btn-city ${activeCityName === p.name ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Informative Location Alert */}
        {geo.error && activeCityName && (
          <div className="alert alert-warning" style={{ fontSize: '0.82rem', padding: '8px 12px', marginBottom: '12px' }}>
            <span>ℹ️ <strong>Live GPS status:</strong> {geo.error} Showing hospitals in <strong>{activeCityName}</strong>.</span>
          </div>
        )}

        {isLiveGpsActive && (
          <div className="alert alert-success" style={{ fontSize: '0.82rem', padding: '8px 12px', marginBottom: '12px' }}>
            <span>✓ <strong>Live GPS Active:</strong> Querying hospitals sorted by exact physical distance from your device coordinates ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}).</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="filter-inputs-row">
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <label htmlFor="bloodGroupSelect">Filter by Patient Blood Group:</label>
            <select
              id="bloodGroupSelect"
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="form-control font-mono"
            >
              <option value="">All Blood Groups (Show all hospitals)</option>
              {BLOOD_GROUPS.map((grp) => (
                <option key={grp} value={grp}>
                  {grp} (Show hospitals with {grp} or safe compatible stock)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label htmlFor="radiusSelect">Search Radius:</label>
            <select
              id="radiusSelect"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
              className="form-control"
            >
              {RADII.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedBloodGroup && (
          <div className="alert alert-info" style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.84rem' }}>
            ✓ Filtering for patient blood group <strong>{selectedBloodGroup}</strong>. Displaying matching stock and clinically safe universal/compatible blood types.
          </div>
        )}
      </div>

      {fetchError && (
        <div className="alert alert-danger">
          <span>⚠️ {fetchError}</span>
        </div>
      )}

      {/* Hospitals List */}
      {loading ? (
        <div className="card text-muted" style={{ textAlign: 'center', padding: '30px' }}>
          Searching nearby hospitals and live blood bank inventories...
        </div>
      ) : hospitals.length > 0 ? (
        <div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', fontWeight: '600' }}>
            Found {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} in selected range:
          </div>
          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital._id}
              hospital={hospital}
              onReserveClick={(h, grp) => setSelectedHospitalForReserve(h)}
            />
          ))}
        </div>
      ) : (
        <div className="card text-muted" style={{ textAlign: 'center', padding: '36px' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🏥</div>
          <h3 style={{ color: '#0f172a', marginBottom: '4px' }}>No Hospitals Found in this Range</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Try increasing the search distance (e.g. 50 km) or selecting a city preset above.
          </p>
        </div>
      )}

      {/* Reservation Modal */}
      {selectedHospitalForReserve && (
        <ReserveModal
          hospital={selectedHospitalForReserve}
          onClose={() => setSelectedHospitalForReserve(null)}
          onReserved={handleStockReserved}
        />
      )}
    </div>
  );
}
