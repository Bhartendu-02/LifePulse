import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🩸</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                LifePulse — Blood Bank & Emergency Network
              </strong>
            </div>
            <p style={{ lineHeight: '1.5', maxWidth: '540px' }}>
              A public emergency assistance project built to help accident bystanders and patient families find matching blood stock across local hospitals, post SOS requests, and reach voluntary donors in real time.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>
              Emergency Medical Helplines (India)
            </div>
            <div className="footer-helplines">
              <a href="tel:108" className="helpline-box">
                <strong>108</strong>
                <span>Ambulance & Trauma Services</span>
              </a>
              <a href="tel:102" className="helpline-box">
                <strong>102</strong>
                <span>Free Maternity & Transport</span>
              </a>
              <a href="tel:112" className="helpline-box">
                <strong>112</strong>
                <span>All-in-One National Emergency</span>
              </a>
              <a href="tel:104" className="helpline-box">
                <strong>104</strong>
                <span>Blood Bank & Health Advice</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ marginBottom: '6px' }}>
            <strong>Important:</strong> LifePulse is an emergency information tool. Always call 108 first for road accident victims or critical patients.
          </p>
          <div>
            LifePulse Emergency Healthcare Portal &bull; Final Year Engineering Project
          </div>
        </div>
      </div>
    </footer>
  );
}
