# ============================================================
# AI-Driven Adaptive DASH Streaming Simulation
# Approach 1 - Python Simulation (Jupyter Notebook)
# ============================================================

# Install if needed:
# !pip install numpy pandas matplotlib scikit-learn

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# ------------------------------------------------------------
# STEP 1 : SIMULATE NETWORK BANDWIDTH
# ------------------------------------------------------------

np.random.seed(42)

time_steps = 200

# Simulated bandwidth in Mbps
bandwidth = []

current_bw = 5

for i in range(time_steps):
    
    # Random network fluctuation
    fluctuation = np.random.normal(0, 0.8)
    
    current_bw += fluctuation
    
    # Keep bandwidth in reasonable range
    current_bw = max(0.5, min(current_bw, 10))
    
    bandwidth.append(current_bw)

# Convert to dataframe
df = pd.DataFrame({
    'time': np.arange(time_steps),
    'bandwidth': bandwidth
})

print(df.head())

# ------------------------------------------------------------
# STEP 2 : VISUALIZE BANDWIDTH
# ------------------------------------------------------------

plt.figure(figsize=(14,5))
plt.plot(df['time'], df['bandwidth'])
plt.title("Simulated Network Bandwidth")
plt.xlabel("Time")
plt.ylabel("Bandwidth (Mbps)")
plt.grid(True)
plt.show()

# ------------------------------------------------------------
# STEP 3 : CREATE DATASET FOR AI PREDICTION
# ------------------------------------------------------------

# We use previous 5 bandwidth values to predict next value

window_size = 5

X = []
y = []

for i in range(window_size, len(bandwidth)):
    
    X.append(bandwidth[i-window_size:i])
    y.append(bandwidth[i])

X = np.array(X)
y = np.array(y)

# Train-test split
split = int(0.8 * len(X))

X_train = X[:split]
y_train = y[:split]

X_test = X[split:]
y_test = y[split:]

# ------------------------------------------------------------
# STEP 4 : TRAIN AI MODEL
# ------------------------------------------------------------

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# ------------------------------------------------------------
# STEP 5 : PREDICT FUTURE BANDWIDTH
# ------------------------------------------------------------

predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)

print("\nMean Absolute Error:", mae)

# ------------------------------------------------------------
# STEP 6 : VISUALIZE PREDICTION
# ------------------------------------------------------------

plt.figure(figsize=(14,5))

plt.plot(y_test, label='Actual Bandwidth')
plt.plot(predictions, label='Predicted Bandwidth')

plt.title("Bandwidth Prediction using AI")
plt.xlabel("Time")
plt.ylabel("Bandwidth (Mbps)")
plt.legend()
plt.grid(True)
plt.show()

# ------------------------------------------------------------
# STEP 7 : DASH BITRATE ADAPTATION LOGIC
# ------------------------------------------------------------

# Available video qualities
bitrates = {
    '240p': 1,
    '480p': 2.5,
    '720p': 5,
    '1080p': 8
}

def select_quality(predicted_bw):
    
    if predicted_bw >= 8:
        return '1080p'
    
    elif predicted_bw >= 5:
        return '720p'
    
    elif predicted_bw >= 2.5:
        return '480p'
    
    else:
        return '240p'

# Apply adaptation
selected_quality = []

for bw in predictions:
    
    quality = select_quality(bw)
    selected_quality.append(quality)

# ------------------------------------------------------------
# STEP 8 : CREATE RESULT DATAFRAME
# ------------------------------------------------------------

results = pd.DataFrame({
    'Actual_BW': y_test,
    'Predicted_BW': predictions,
    'Selected_Quality': selected_quality
})

print("\nAdaptive Streaming Decisions:")
print(results.head(20))

# ------------------------------------------------------------
# STEP 9 : BUFFERING / QoS SIMULATION
# ------------------------------------------------------------

buffer_events = 0

for i in range(len(results)):
    
    quality = results['Selected_Quality'].iloc[i]
    
    required_bw = bitrates[quality]
    
    actual_bw = results['Actual_BW'].iloc[i]
    
    # Buffering occurs if actual bandwidth
    # becomes lower than required bitrate
    
    if actual_bw < required_bw:
        buffer_events += 1

print("\nTotal Buffering Events:", buffer_events)

# ------------------------------------------------------------
# STEP 10 : QUALITY SWITCH ANALYSIS
# ------------------------------------------------------------

switches = 0

for i in range(1, len(selected_quality)):
    
    if selected_quality[i] != selected_quality[i-1]:
        switches += 1

print("Quality Switches:", switches)

# ------------------------------------------------------------
# STEP 11 : FINAL QoE SCORE
# ------------------------------------------------------------

# Simple QoE formula
# Higher bitrate good
# More buffering bad
# More switching bad

quality_scores = {
    '240p': 1,
    '480p': 2,
    '720p': 3,
    '1080p': 4
}

avg_quality = np.mean([
    quality_scores[q] for q in selected_quality
])

qoe = (
    avg_quality * 10
    - buffer_events * 2
    - switches * 0.5
)

print("\nAverage Quality Score:", avg_quality)
print("QoE Score:", qoe)

# ------------------------------------------------------------
# STEP 12 : VISUALIZE QUALITY SELECTION
# ------------------------------------------------------------

quality_numeric = []

mapping = {
    '240p':1,
    '480p':2,
    '720p':3,
    '1080p':4
}

for q in selected_quality:
    quality_numeric.append(mapping[q])

plt.figure(figsize=(14,5))

plt.plot(quality_numeric)

plt.yticks(
    [1,2,3,4],
    ['240p','480p','720p','1080p']
)

plt.title("Adaptive Video Quality Selection")
plt.xlabel("Time")
plt.ylabel("Video Quality")
plt.grid(True)
plt.show()

# ------------------------------------------------------------
# END OF PROJECT
# ------------------------------------------------------------

print("\nSimulation Completed Successfully!")