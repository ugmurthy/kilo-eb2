# ================================================================================
# USER PROMPT:
# Draw a Bar graph with fictitous data
#
# MODEL: gemma3:27b
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np

# Sample data
products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
sales = [120, 85, 150, 60, 100]

# Create the bar graph
plt.figure(figsize=(10, 6))  # Adjust figure size for better readability
plt.bar(products, sales, color='skyblue')

# Add labels and title
plt.xlabel('Products')
plt.ylabel('Sales')
plt.title('Sales of Different Products')

# Rotate x-axis labels for better readability if needed
plt.xticks(rotation=45, ha='right')

# Add gridlines
plt.grid(axis='y', linestyle='--')

# Adjust layout to prevent labels from overlapping
plt.tight_layout()

# Save the graph as an image
plt.savefig('bar_graph.png')

# Display the graph (optional - removes need to save)
# plt.show()