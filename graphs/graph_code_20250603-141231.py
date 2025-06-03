# ================================================================================
# USER PROMPT:
# Generate a scatter graph. Generate fictitous data for the same
#
# MODEL: gemma3:27b
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np

# Sample data
np.random.seed(42)
x = np.random.rand(50)
y = np.random.rand(50)
colors = np.random.rand(50)
sizes = (30 * np.random.rand(50))**2  # Adjust sizes for better visibility

# Create the scatter plot
plt.figure(figsize=(8, 6))
plt.scatter(x, y, c=colors, s=sizes, alpha=0.7, cmap='viridis')
plt.colorbar(label='Color Intensity')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.title('Scatter Plot of Random Data')
plt.grid(True)

# Save the plot as an image
plt.savefig('scatter_plot.png')

plt.show()