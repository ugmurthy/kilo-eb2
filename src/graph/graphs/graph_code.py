# ================================================================================
# USER PROMPT:
# Create a 3d plot to show an example of electromagnetic wave. ensure
# surface is coloured based on z values. provide meaningful title,label
# and legend
#
# MODEL: qwq:latest
# ================================================================================

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module='pydantic')

# Generate sample data for electromagnetic wave
x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(x, y)
Z = np.sin(X) * np.cos(Y)

# Create 3D plot
fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(X, Y, Z, cmap='viridis', edgecolor='none', shade=True)
ax.set_xlabel('X Axis (meters)', fontsize=12)
ax.set_ylabel('Y Axis (meters)', fontsize=12)
ax.set_zlabel('Amplitude', fontsize=12)
ax.set_title('Electromagnetic Wave Example', fontsize=14, pad=20)

# Add colorbar for z-values
fig.colorbar(surf, ax=ax, shrink=0.8, aspect=25, label='Z Value (Intensity)')

plt.tight_layout()
plt.savefig('electromagnetic_wave_plot.png')
plt.show()