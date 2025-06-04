import matplotlib.pyplot as plt
import numpy as np

# Create figure and subplots
fig, axes = plt.subplots(3, 4, figsize=(12, 8))
axes = axes.ravel()

x = np.linspace(0, 1, 100)
frequencies = [2**i for i in range(12)]  # Frequencies: 1, 2, 4, ..., 64
colors = plt.cm.tab20(np.linspace(0, 1, len(frequencies)))

for i, (ax, freq) in enumerate(zip(axes, frequencies)):
    y = np.cos(2 * np.pi * freq * x)
    ax.plot(x, y, color=colors[i], linewidth=2)
    ax.set_title(f'Cosine Function (Frequency={freq})', fontsize=10)
    ax.set_ylim(-1.5, 1.5)

plt.tight_layout()
plt.show()

# To save the figure
fig.savefig('cosine_functions.png', dpi=300, bbox_inches='tight')