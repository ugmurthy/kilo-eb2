# ================================================================================
# USER PROMPT:
# Show a bar graph for Narcotics ceased by DEA in the last 52 week.
# Generate fictitous data.
#
# MODEL: llama3.2:latest
# ================================================================================

import matplotlib.pyplot as plt

# Fictitious data: Narcotics seized by DEA over the last 52 weeks
weeks = ['Week ' + str(i) for i in range(1, 53)]
seizures = [round((i/52)*10000) for i in range(1, 53)]  # Random seizures per week

# Create a bar graph with matplotlib
plt.figure(figsize=(10,6))
plt.bar(weeks, seizures)

# Customize the appearance of the graph
plt.title('Narcotics Seized by DEA over Last 52 Weeks')
plt.xlabel('Week')
plt.ylabel('Seizures')
plt.xticks(rotation=45)  # Rotate x-axis labels for better readability

# Save the plot as an image file
plt.savefig('narcotics_seizure_graph.png')

# Display the plot
plt.show()