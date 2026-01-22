#!/bin/bash

# Activity Tracker CSS
cat > /workspaces/Hawk Fuel/src/components/ActivityTracker.css << 'EOF'
/* Modern Gym Theme - Activity Tracker */

.activity-tracker {
  background: var(--dark-gray);
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  border: 2px solid var(--medium-gray);
}

.activity-tracker h2 {
  color: var(--primary-orange);
  margin-bottom: 30px;
  font-size: 2.2em;
  text-align: center;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.activity-card {
  background: var(--medium-gray);
  padding: 25px;
  border-radius: 12px;
  border: 2px solid var(--light-gray);
  transition: all 0.3s;
}

.activity-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-orange);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.activity-card h3 {
  color: var(--primary-orange);
  margin: 0 0 15px 0;
  font-size: 1.4em;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.activity-card input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--light-gray);
  border-radius: 8px;
  font-size: 1.1em;
  background: var(--black);
  color: var(--white);
  font-weight: 600;
  transition: all 0.3s;
}

.activity-card input:focus {
  outline: none;
  border-color: var(--primary-orange);
  box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 16px 35px;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.btn-primary {
  background: var(--primary-orange);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.btn-primary:hover {
  background: var(--dark-orange);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.6);
}

.btn-secondary {
  background: var(--medium-gray);
  color: var(--white);
  border: 2px solid var(--light-gray);
}

.btn-secondary:hover {
  background: var(--light-gray);
  border-color: var(--primary-orange);
}
EOF

# Results CSS
cat > /workspaces/Hawk Fuel/src/components/Results.css << 'EOF'
/* Modern Gym Theme - Results */

.results {
  background: var(--dark-gray);
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  border: 2px solid var(--medium-gray);
}

.results h2 {
  color: var(--primary-orange);
  margin-bottom: 30px;
  font-size: 2.2em;
  text-align: center;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.result-section {
  background: var(--medium-gray);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 25px;
  border: 2px solid var(--light-gray);
}

.result-section h3 {
  color: var(--primary-orange);
  margin: 0 0 20px 0;
  font-size: 1.5em;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.big-number {
  font-size: 3.5em;
  font-weight: 900;
  color: var(--white);
  margin: 20px 0;
}

.label {
  color: var(--off-white);
  font-size: 1.1em;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.activity-list {
  display: grid;
  gap: 15px;
  margin-top: 20px;
}

.activity-result {
  background: var(--black);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid var(--light-gray);
  transition: all 0.3s;
}

.activity-result:hover {
  border-color: var(--primary-orange);
  transform: translateX(5px);
}

.activity-name {
  font-size: 1.3em;
  font-weight: 700;
  color: var(--white);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.activity-calories {
  font-size: 1.5em;
  font-weight: 800;
  color: var(--primary-orange);
}

.summary-grid {
  display: grid;
  gap: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: var(--black);
  border-radius: 8px;
  border: 2px solid var(--light-gray);
}

.summary-label {
  font-weight: 700;
  color: var(--off-white);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summary-value {
  font-weight: 800;
  font-size: 1.3em;
  color: var(--white);
}

.highlight-item {
  border-color: var(--primary-orange);
  background: var(--medium-gray);
}

.highlight-item .summary-value {
  color: var(--primary-orange);
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn-continue, .btn-reset {
  padding: 16px 35px;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.btn-continue {
  flex: 2;
  background: var(--primary-orange);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.btn-continue:hover {
  background: var(--dark-orange);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.6);
}

.btn-reset {
  flex: 1;
  background: var(--medium-gray);
  color: var(--white);
  border: 2px solid var(--light-gray);
}

.btn-reset:hover {
  background: var(--light-gray);
  border-color: var(--primary-orange);
}
EOF

echo "CSS files updated successfully!"
