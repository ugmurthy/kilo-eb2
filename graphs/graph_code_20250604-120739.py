# ================================================================================
# USER PROMPT:
# Draw a line graph using matplotlib along with seaborn y = x^3 + c
# where x ranges from -5 to +5 and c = 1
#
# MODEL: gemma3:27b
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

# Sample data (x values from -5 to 5)
x = np.linspace(-5, 5, 100)  # Create 100 evenly spaced points from -5 to 5
c = 1
y = x**3 + c

# Create the plot using matplotlib and seaborn
plt.figure(figsize=(8, 6))  # Adjust figure size
sns.lineplot(x=x, y=y)

# Add labels and title
plt.xlabel("x")
plt.ylabel("y = x^3 + " + str(c))
plt.title("Line Graph of y = x^3 + " + str(c))
plt.grid(True)

# Save the plot as a PNG image
plt.savefig("cubic_function_plot.png")

# Show the plot (optional - if you want to display it)
plt.show()