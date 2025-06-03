# ================================================================================
# USER PROMPT:
# Create a 3D graph where z = sin(sqrt(x^2+y^2)). Ensure the surface is
# color coded based on z value and varies from  red to yellow. Provide
# meaningful title, labels and legend.
#
# MODEL: gemma3:27b
# ================================================================================

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.cm as cm

# Sample data
num1 = np.arange(-5, 5, 0.1)
num2 = np.arange(-5, 5, 0.1)
X, Y = np.meshgrid(num1, num2)
Z = np.sin(np.sqrt(X**2 + Y**2))

# Create the figure and axes object
fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection="3d")

# Plot the surface
surf = ax.plot_surface(X, Y, Z, cmap=cm.RdYlGn, linewidth=0, antialiased=False)

# Customize the plot
ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.set_zlabel("Z")
ax.set_title("3D Surface Plot: z = sin(sqrt(x^2 + y^2))")

# Add a color bar which maps values to colors.
fig.colorbar(surf, shrink=0.5, aspect=5)

# Save the figure
plt.savefig("3d_surface_plot.png")
plt.show()