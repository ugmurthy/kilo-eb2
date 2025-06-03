# ================================================================================
# USER PROMPT:
# Draw a sample bar graph
#
# MODEL: gemma3:27b
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np

# Sample data
categories = ['Category A', 'Category B', 'Category C', 'Category D']
values = [25, 40, 30, 55]

# Create the bar graph
plt.figure(figsize=(8, 6))
plt.bar(categories, values, color='skyblue')
plt.xlabel('Categories')
plt.ylabel('Values')
plt.title('Sample Bar Graph')
plt.grid(axis='y', linestyle='--')

# Save the graph as an image
plt.savefig('bar_graph.png')
plt.close()