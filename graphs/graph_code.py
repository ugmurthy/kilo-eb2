# ================================================================================
# USER PROMPT:
# Generate a visually appealling 3d graph. Generate 3d data on you own
#
# MODEL: deepseek-r1:32b
# ================================================================================

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# Generate sample 3D data
x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
x, y = np.meshgrid(x, y)
z = (np.sin(x) * np.cos(y)) + (np.sin(x**2) * np.cos(y**2)) + np.random.randn(100,100)*0.3

# Create figure and 3D axis
fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection='3d')

# Custom color map for better visual appeal
cmap = plt.cm.viridis

# Plot the surface with transparency
surf = ax.plot_surface(x, y, z, cmap=cmap, alpha=0.8, edgecolor='none', antialiased=True)

# Add a colorbar
fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)

# Customize the view angle
ax.view_init(azim=45, elev=30)

# Add grid lines for better depth perception
ax.grid(True, linestyle='--', alpha=0.7)

# Add a title and labels
plt.title('3D Visualization of Sample Data', size=16, color='black')
ax.set_xlabel('X Axis', fontsize=12)
ax.set_ylabel('Y Axis', fontsize=12)
ax.set_zlabel('Z Axis', fontsize=12)

# Adjust layout
plt.tight_layout()

# Save the figure
plt.savefig('3d_graph.png', dpi=300, bbox_inches='tight')

# Show the plot
plt.show()