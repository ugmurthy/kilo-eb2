# ================================================================================
# USER PROMPT:
# Generate a 3d plot for z = cos(sqrt(x^2+y^2)) where x,y range from -15
# to +15. Ensure surface is coloured based on z value. chose red to blue
# for low to high values of z
#
# MODEL: gemma3:27b
# ================================================================================

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.cm as cm

# Sample data generation
num = 200
x = np.linspace(-15, 15, num)
y = np.linspace(-15, 15, num)
X, Y = np.meshgrid(x, y)
Z = np.cos(np.sqrt(X**2 + Y**2))

# Create the figure and axes object
fig = plt.figure(figsize=(12, 12))
ax = fig.add_subplot(projection="3d")

# Plot the surface
surf = ax.plot_surface(X, Y, Z, cmap=cm.coolwarm, linewidth=0, antialiased=False)

# Add a color bar which maps values to colors.
fig.colorbar(surf, shrink=0.5, aspect=5)

# Set labels and title
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.set_zlabel("z")
ax.set_title("z = cos(sqrt(x^2+y^2))")

# Save the figure
plt.savefig("3d_plot.png")
plt.show()