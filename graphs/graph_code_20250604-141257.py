# ================================================================================
# USER PROMPT:
# Create a Bar graph with any data
#
# MODEL: deepseek-r1:32b
# ================================================================================

import matplotlib.pyplot as plt

# Sample data
months = ['January', 'February', 'March', 'April', 'May', 'June']
sales = [1200, 1500, 1400, 1700, 1800, 1600]

# Create figure and set size
plt.figure(figsize=(10, 6))

# Create bar chart
plt.bar(months, sales, color='blue')

# Add title and labels
plt.title('Monthly Sales Data')
plt.xlabel('Month')
plt.ylabel('Sales (USD)')

# Rotate x-tick labels for better readability
plt.xticks(rotation=45)
plt.rcParams.update({'font.size': 12})

# Save the plot as an image
plt.savefig('bar_graph.png', dpi=300, bbox_inches='tight')

# Show plot
plt.show()