# ================================================================================
# USER PROMPT:
# generate a 3D graph showing surface colored by z value. highest z
# value being red to lowest value being yellow. use z =
# sin(sqrt(x^2+y^2)) as the equation where x,y are values betwee -5 and
# 5
#
# MODEL: llama3.2:latest
# CODE BLOCK: 2 of 4
# ================================================================================

import seaborn as sns
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

fig = plt.figure(figsize=(8,6))
ax = fig.add_subplot(111, projection='3d')

x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(x, y)

Z = np.sin(np.sqrt(X**2 + Y**2))

sns.kdeplot(Z.flatten(), cmap="coolwarm", ax=ax)
ax.invert_zorder()

for i in range(0, len(Z), 10):
    ax.plot3D(*zip(X.ravel()[i::10], Y.ravel()[i::10]), Z[i:i+10].mean(), c='black')

plt.xlabel('Z')
plt.ylabel('X')
plt.show()