# ================================================================================
# USER PROMPT:
# generate a 3D graph showing surface colored by z value. highest z
# value being red to lowest value being yellow. use z =
# sin(sqrt(x^2+y^2)) as the equation where x,y are values betwee -5 and
# 5
#
# MODEL: llama3.2:latest
# CODE BLOCK: 3 of 4
# ================================================================================

import plotly.graph_objects as go
import numpy as np
from mpl_toolkits.mplot3d import Axes3D

fig = go.Figure(data=[go.Surface(z=np.sin(np.sqrt(x**2 + y**2)), x=x, y=y)])

fig.update_layout(
    scene = dict(
        xaxis_title='X',
        yaxis_title='Y'),
    width=800,
    height=600)
fig.show()