# ================================================================================
# USER PROMPT:
# Draw graph with subplots showing different graphs in each subplot. The
# main plot has 4x3 subl plots - show line plots, bar plots , scatter
# plots etc chose type of subplot and generate necessary data. Ensure
# each subplot has a title and a different color
#
# MODEL: gemma3:27b
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

# Suppress pydantic warnings (if any)
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)


# Sample Data
np.random.seed(42)
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)
categories = ['A', 'B', 'C', 'D']
values = np.random.randint(1, 100, size=len(categories))
data_scatter = np.random.rand(50, 2)
data_hist = np.random.normal(0, 1, 1000)
data_box = np.random.rand(100)
sizes = np.random.randint(1, 100, size=5)
labels = ['Label1', 'Label2', 'Label3', 'Label4', 'Label5']

# Create Figure and Subplots
fig, axes = plt.subplots(4, 3, figsize=(15, 10))
fig.suptitle("Variety of Plots", fontsize=16)

# Plotting

# Row 1
axes[0, 0].plot(x, y1, color='red', label='sin(x)')
axes[0, 0].set_title('Line Plot')
axes[0, 0].legend()

axes[0, 1].bar(categories, values, color='green')
axes[0, 1].set_title('Bar Plot')

axes[0, 2].scatter(data_scatter[:, 0], data_scatter[:, 1], color='blue')
axes[0, 2].set_title('Scatter Plot')

# Row 2
axes[1, 0].hist(data_hist, bins=30, color='orange')
axes[1, 0].set_title('Histogram')

axes[1, 1].boxplot(data_box, vert=False, patch_artist=True, color='purple')
axes[1, 1].set_title('Box Plot')

axes[1, 2].pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=sns.color_palette('pastel'))
axes[1, 2].set_title('Pie Chart')

# Row 3
axes[2, 0].plot(x, y2, color='brown', label='cos(x)')
axes[2, 0].set_title('Another Line Plot')
axes[2, 0].legend()

axes[2, 1].barh(categories, values, color='pink')
axes[2, 1].set_title('Horizontal Bar Plot')

axes[2, 2].scatter(x, y1 + np.random.normal(0, 0.5, len(x)), color='grey', label='Noise added')
axes[2, 2].set_title('Scatter with Noise')
axes[2, 2].legend()

# Row 4
axes[3, 0].plot(x, x**2, color='magenta')
axes[3, 0].set_title('Parabola Plot')

axes[3, 1].fill_between(x, y1, y2, color='cyan', alpha=0.5)
axes[3, 1].set_title('Area Plot')

axes[3, 2].step(x, y1, where='post', color='olive')
axes[3, 2].set_title('Step Plot')


# Adjust layout and show plot
plt.tight_layout(rect=[0, 0.03, 1, 0.95])  # Adjust for the suptitle
plt.savefig('subplots_example.png')
plt.show()