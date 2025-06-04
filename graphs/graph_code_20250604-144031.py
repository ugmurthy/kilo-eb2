# ================================================================================
# USER PROMPT:
# Generate a 2x2 grid plot of subplots showing sine wave of different
# frequencies start with 100 Hz in increments of 100. ensure each
# subplot is colored differently and has a title
#
# MODEL: llama3.2:latest
# ================================================================================

import matplotlib.pyplot as plt
import numpy as np

# Define frequencies and their corresponding colors
frequencies = [100 + i*100 for i in range(20)]
colors = ['b', 'g', 'r', 'c', 'm', 'y', 'k', 'tab:blue', 'tab:green', 
          'tab:red', 'tab:orange', 'tab:magenta', 'tab:cyan', 
          'tab:brown', 'lightcoral', 'gold']

# Create a figure with 2x2 subplots
fig, axs = plt.subplots(2, 2, figsize=(10, 8))

# Iterate over frequencies and plot sine waves
for i, (ax, freq) in enumerate(zip(axs.flat, frequencies)):
    x = np.linspace(0, 1, 1000)
    y = np.sin(2 * np.pi * freq * x)

    # Plot the sine wave
    ax.plot(x, y, color=colors[i])

    # Set title and labels for each subplot
    if i == 0:
        ax.set_title(f'Sine wave at {freq} Hz')
    else:
        ax.set_title('')

    ax.set_xlabel('Time (s)')
    ax.set_ylabel('Amplitude')

# Layout so plots do not overlap
fig.tight_layout()

# Save the plot to a file or show it
plt.savefig('sine_waves.png', dpi=300)
# plt.show()