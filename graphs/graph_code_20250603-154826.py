# ================================================================================
# USER PROMPT:
# Draw a scatter graph using different colors using fictitous data
#
# MODEL: deepseek-r1:32b
# ================================================================================

import numpy as np
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore", module="pydantic")

# Generate sample data for three groups
np.random.seed(42)
group1 = np.random.normal(loc=0, scale=1, size=(50, 2))
group2 = np.random.normal(loc=2, scale=1, size=(50, 2))
group3 = np.random.normal(loc=-2, scale=1, size=(50, 2))

# Create the scatter plot
plt.figure(figsize=(8, 6))
plt.scatter(group1[:, 0], group1[:, 1], color='red', label='Group 1')
plt.scatter(group2[:, 0], group2[:, 1], color='blue', label='Group 2')
plt.scatter(group3[:, 0], group3[:, 1], color='green', label='Group 3')

# Customize the plot
plt.title('Scatter Plot with Different Colors')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.legend()

# Save the plot
plt.savefig('scatter_plot.png', dpi=300, bbox_inches='tight')
plt.close()