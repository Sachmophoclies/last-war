import { GOAL } from "../pages/ArmsRace/UnitProgression/UnitProgressionUtils.jsx";

export default function Results({ data }) {
  const { strategy, trueTimeSeconds } = data;

  if (!strategy) {
    return (
      <div className="card">
        <h2>No Data</h2>
        <p>Please fill in the required fields and click the check button to see results.</p>
      </div>
    );
  }

  const {
    totalUnits,
    barracks,
    speedUpUnits,
    totalPoints,
    pointsFromBarracks234,
    pointsFromBarracks1Normal,
    pointsFromSpeedUp,
    speedUpTimeMinutes,
    exceedsCapacity
  } = strategy;

  // Format true time as HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Check if all barracks have the same number of units (and no speedups)
  const allBarracksSame = barracks[0] === barracks[1] &&
                          barracks[1] === barracks[2] &&
                          barracks[2] === barracks[3] &&
                          barracks[0] > 0 &&
                          speedUpUnits === 0;

  // Check if barracks 2, 3, 4 all have the same number of units
  const canCombine234 = barracks[1] === barracks[2] && barracks[2] === barracks[3] && barracks[1] > 0;

  // Get barracks 1 capacity for breaking up speed-up batches
  const barracks1Capacity = parseInt(data.barracksCapacities?.[0], 10);
  const hasBarracks1Capacity = !isNaN(barracks1Capacity) && barracks1Capacity > 0;

  // Break up speed-up units into batches if they exceed barracks 1 capacity
  const speedUpBatches = [];
  if (speedUpUnits > 0 && hasBarracks1Capacity && speedUpUnits > barracks1Capacity) {
    const fullBatches = Math.floor(speedUpUnits / barracks1Capacity);
    const remainder = speedUpUnits % barracks1Capacity;

    for (let i = 0; i < fullBatches; i++) {
      speedUpBatches.push(barracks1Capacity);
    }
    if (remainder > 0) {
      speedUpBatches.push(remainder);
    }
  } else if (speedUpUnits > 0) {
    speedUpBatches.push(speedUpUnits);
  }

  return (
    <>
      <div className="card">
        <h2>Training Instructions</h2>

        <div style={{ marginBottom: '24px' }}>
          <ol style={{ paddingLeft: '20px', margin: 0 }}>
            {allBarracksSame ? (
              <li style={{ marginBottom: '12px' }}>
                <strong>Train {barracks[0]} units</strong> in all barracks
              </li>
            ) : (
              <>
                {canCombine234 ? (
                  <li style={{ marginBottom: '12px' }}>
                    <strong>Train {barracks[1]} units</strong> in each of barracks 4, 3, and 2
                  </li>
                ) : (
                  <>
                    {barracks[3] > 0 && (
                      <li style={{ marginBottom: '12px' }}>
                        <strong>Train {barracks[3]} units</strong> in barracks 4
                      </li>
                    )}
                    {barracks[2] > 0 && (
                      <li style={{ marginBottom: '12px' }}>
                        <strong>Train {barracks[2]} units</strong> in barracks 3
                      </li>
                    )}
                    {barracks[1] > 0 && (
                      <li style={{ marginBottom: '12px' }}>
                        <strong>Train {barracks[1]} units</strong> in barracks 2
                      </li>
                    )}
                  </>
                )}

                {speedUpBatches.map((batchSize, index) => (
                  <li key={index} style={{ marginBottom: '12px' }}>
                    <strong>Train and <u>Speed-Up</u> {batchSize} units</strong> in barracks 1{' '}
                    <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      (uses {Math.ceil((batchSize / speedUpUnits) * speedUpTimeMinutes)} minutes of speed-ups)
                    </span>
                  </li>
                ))}

                {barracks[0] > 0 && (
                  <li style={{ marginBottom: '12px' }}>
                    <strong>Train {barracks[0]} units</strong> in barracks 1
                  </li>
                )}
              </>
            )}
          </ol>
        </div>

        <div className="divider"></div>

        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Total Units Trained:</strong> {totalUnits.toLocaleString()}
          </div>
          {data.startingPoints > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Starting Points:</strong> {data.startingPoints.toLocaleString()}
            </div>
          )}
          <div style={{ marginBottom: '8px' }}>
            <strong>Total Points Earned:</strong> {Math.floor(totalPoints).toLocaleString()} / {GOAL.toLocaleString()}
          </div>
          {speedUpUnits > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Speed-Up Required:</strong> {Math.ceil(speedUpTimeMinutes)} minutes
            </div>
          )}
          {exceedsCapacity && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--card-border)', borderRadius: '8px' }}>
              <strong>⚠️ Note:</strong> One or more barracks reached capacity limit.
            </div>
          )}
        </div>
      </div>

      <div className="card debug-only">
        <h2>Debug Information</h2>

        <div style={{ marginBottom: '8px' }}>
          <strong>Input - Available Time:</strong> {data.availableTime || 'N/A'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Input - Barracks Capacity (single):</strong> {data.barracksCapacitySingle || 'N/A'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Input - Total Training Time:</strong> {data.totalTrainingTime || 'N/A'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Input - Starting Points:</strong> {data.startingPoints || 0}
        </div>
        <div className="divider"></div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Parsed - Total Time Seconds:</strong> {data.totalTimeSeconds || 0}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Calculated - Time Per Unit Seconds:</strong> {data.timePerUnitSeconds ? data.timePerUnitSeconds.toFixed(4) : 0}
        </div>
        <div className="divider"></div>
        <div style={{ marginBottom: '8px' }}>
          <strong>True Time:</strong> {formatTime(trueTimeSeconds)}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Units per barracks (time-based):</strong> {Math.floor(trueTimeSeconds / (data.timePerUnitSeconds || 1))}
        </div>
        <div className="divider"></div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Barracks 1 Units (normal):</strong> {barracks[0].toLocaleString()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Barracks 2 Units:</strong> {barracks[1].toLocaleString()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Barracks 3 Units:</strong> {barracks[2].toLocaleString()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Barracks 4 Units:</strong> {barracks[3].toLocaleString()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Barracks 1 Units (speed-up):</strong> {speedUpUnits.toLocaleString()}
        </div>
        <div className="divider"></div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Points from Barracks 2-4:</strong> {pointsFromBarracks234.toLocaleString()}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Points from Barracks 1 Normal:</strong> {pointsFromBarracks1Normal.toLocaleString()}
        </div>
        {speedUpUnits > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Points from Barracks 1 Speed-Up:</strong> {Math.floor(pointsFromSpeedUp).toLocaleString()}
          </div>
        )}
        <div style={{ marginBottom: '8px' }}>
          <strong>Total Points:</strong> {Math.floor(totalPoints).toLocaleString()}
        </div>
      </div>
    </>
  );
}
