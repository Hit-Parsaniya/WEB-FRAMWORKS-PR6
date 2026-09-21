import React from 'react';

export default function Projects() {
  const sampleProjects = [
    { id: 1, name: 'Web Frameworks PR8', status: 'In Progress', progress: 85, team: 3 },
    { id: 2, name: 'Cloud Infrastructure Upgrade', status: 'Completed', progress: 100, team: 5 },
    { id: 3, name: 'Mobile App Redesign', status: 'Planning', progress: 30, team: 4 }
  ];

  return (
    <div className="page-container">
      <h2>📁 Project Management</h2>
      <p className="page-description">
        Manage project portfolios, assign tasks across teams, and monitor roadmap milestones.
      </p>

      <div className="project-grid">
        {sampleProjects.map((proj) => (
          <div key={proj.id} className="project-card">
            <h3>{proj.name}</h3>
            <span className={`status-badge ${proj.status.toLowerCase().replace(' ', '-')}`}>
              {proj.status}
            </span>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${proj.progress}%` }}
              ></div>
            </div>
            <div className="project-meta">
              <span>Progress: {proj.progress}%</span>
              <span>Team size: {proj.team} members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
