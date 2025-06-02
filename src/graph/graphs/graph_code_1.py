# ================================================================================
# USER PROMPT:
# generate a 3D graph showing surface colored by z value. highest z
# value being red to lowest value being yellow. use z =
# sin(sqrt(x^2+y^2)) as the equation where x,y are values betwee -5 and
# 5
#
# MODEL: llama3.2:latest
# CODE BLOCK: 1 of 4
# ================================================================================

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

fig = plt.figure(figsize=(8,6))
ax = fig.add_subplot(111, projection='3d')

x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(x, y)

Z = np.sin(np.sqrt(X**2 + Y**2))

im = ax.plot_surface(X, Y, Z, cmap='coolwarm', linewidth=0, antialiased=False)

fig.colorbar(im, shrink=0.5, aspect=10)

ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')

plt.savefig('surface_plot.png')