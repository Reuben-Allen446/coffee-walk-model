import numpy as np
import math

def newtons_law_of_cooling(T_initial, T_ambient, h_air, A_top, h_cup, A_sides, m, c, t_end, time_step=0.1):
    k_air = (h_air * A_top) / (m * c)  
    k_cup = (h_cup * A_sides) / (m * c) 
    k_total = (k_air + k_cup) * 60  
    
    time_values = np.arange(0, t_end + time_step, time_step)
    temp_values = T_ambient + (T_initial - T_ambient) * np.exp(-k_total * time_values)
    
    return time_values, temp_values

def calculate_frustum_surface_areas(r_top, r_bottom, h, volume):
    r_avg = h**2 / r_top 
    h_liquid = np.sqrt((r_top - r_bottom)**2 + h**2) 
    A_top = math.pi * r_avg**2  
    A_sides = (math.pi * (r_top + r_bottom) * h_liquid) 
    return A_top, A_sides

def find_minimum_walking_speed(T_initial, T_ambient, h_air, h_cup, r_top, r_bottom, h, volume, m, c, distance=0.4):
    cooling_threshold = T_initial - 15
    for speed in np.linspace(1, 4, 100): 
        t_end = (distance * 1609.34) / speed / 60  
        A_top, A_sides = calculate_frustum_surface_areas(r_top, r_bottom, h, volume)
        time_values, temp_values = newtons_law_of_cooling(T_initial, T_ambient, h_air, A_top, h_cup, A_sides, m, c, t_end)
        
        if temp_values[-1] >= cooling_threshold:
            return speed
    return None
