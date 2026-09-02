import numpy as np
from scipy import stats

p0 = 0.0002 # 0.02% calibrated baseline
N = 1000

print(f"{'k_obs':>6} | {'QBER':>8} | {'p-value':>12} | {'Z-score':>8} | {'Verdict':>16}")
print("-" * 60)

for k_obs in [0, 1, 2, 3, 4, 5, 10, 25, 50, 150, 500]:
    e_obs = k_obs / N
    # Exact binomial survival function: P(K >= k_obs)
    p_val = 1.0 if k_obs == 0 else float(stats.binom.sf(k_obs - 1, N, p0))
    se = np.sqrt(p0 * (1 - p0) / N)
    z = (e_obs - p0) / se
    
    if p_val > 0.05:
        verdict = "SAFE"
    elif p_val <= 0.001 or e_obs >= 0.08:
        verdict = "ATTACK DETECTED"
    else:
        verdict = "SUSPICIOUS"
        
    print(f"{k_obs:6d} | {e_obs:7.2%} | {p_val:12.4e} | {z:8.2f} | {verdict:>16}")
