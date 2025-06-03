# ================================================================================
# USER PROMPT:
# Draw a scatter graph using fictitous data. Ensure that points are
# color and sized differently
#
# MODEL: gemma3:27b
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np

# Sample Data
np.random.seed(42)  # for reproducibility
n = 50
marketing_spend = np.random.rand(n) * 1000  # Marketing spend in dollars
revenue = np.random.rand(n) * 5000  # Revenue generated
campaign_type = np.random.choice(['Online', 'TV', 'Print'], n)
leads_generated = np.random.randint(10, 200, n)

# Color mapping for campaign type
color_map = {'Online': 'blue', 'TV': 'red', 'Print': 'green'}
colors = [color_map[ctype] for ctype in campaign_type]

# Sizes based on leads generated
sizes = leads_generated * 5  # Adjust the multiplier for desired size range


# Create the scatter plot
plt.figure(figsize=(10, 6))  # Adjust figure size for better visualization
plt.scatter(marketing_spend, revenue, c=colors, s=sizes, alpha=0.7)

# Add labels and title
plt.xlabel("Marketing Spend ($)")
plt.ylabel("Revenue ($)")
plt.title("Marketing Spend vs. Revenue by Campaign Type")

# Add a legend (optional, but helpful)
legend_elements = [plt.Line2D([0], [0], marker='o', color='w', label=ctype,
                          markerfacecolor=color_map[ctype], markersize=10)
                   for ctype in color_map]
plt.legend(handles=legend_elements, title="Campaign Type")

# Show the plot
plt.grid(True) #Add a grid for better readability
plt.show()

# Save the plot to an image file
plt.savefig("marketing_scatter.png")