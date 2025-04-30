from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import math

app = Flask(__name__)
CORS(app)

# --- Utility functions --- #

def calculate_frustum_surface_areas(r_top, r_bottom, h, volume):
    r_avg = (r_top + r_bottom) / 2
    h_liquid = np.sqrt((r_top - r_bottom) ** 2 + h ** 2)
    A_top = math.pi * r_avg ** 2
    A_sides = math.pi * (r_top + r_bottom) * h_liquid
    return A_top, A_sides

def newtons_law_of_cooling(T_initial, T_ambient, h_air, A_top, h_cup, A_sides, m, c, t_end, time_step=0.1):
    k_air = (h_air * A_top) / (m * c)
    k_cup = (h_cup * A_sides) / (m * c)
    k_total = (k_air + k_cup) * 60  # per minute

    time_values = np.arange(0, t_end + time_step, time_step)
    temp_values = T_ambient + (T_initial - T_ambient) * np.exp(-k_total * time_values)
    return time_values, temp_values

# --- API route --- #

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    print("Received data:", data)

    try:
        # --- Input parsing ---
        T_initial = float(data.get('T_initial', 65))
        T_ambient = 15
        h_air = 10
        h_cup = 5
        r_top = float(data['r_top'])
        r_bottom = float(data['r_bottom'])
        h = float(data['height'])
        volume = float(data['volume'])
        m = volume  # assume 1L = 1kg
        c = 4184
        distance = 0.4  # km

        user_height = float(data.get('user_height', 170))  # cm
        user_weight = float(data.get('user_weight', 70))   # kg

        # --- Sloshiness model based on height & weight ---
        stride_freq = 2.0 - ((user_height - 160) * 0.005)     # Hz
        slosh_amp = 1.0 + ((75 - user_weight) * 0.01)         # More slosh if under 75kg

        # Clamp within reasonable bounds
        stride_freq = max(1.2, min(stride_freq, 2.2))
        slosh_amp = max(0.9, min(slosh_amp, 1.2))

        cooling_threshold = 50  # degrees Celsius

        # --- Find minimum walking speed ---
        for speed in np.linspace(1, 4, 100):  # Speeds between 1–4 m/s
            t_end = (distance * 1000) / speed / 60  # walk time in minutes

            A_top, A_sides = calculate_frustum_surface_areas(r_top, r_bottom, h, volume)
            time_values, temp_values = newtons_law_of_cooling(
                T_initial, T_ambient, h_air, A_top, h_cup, A_sides, m, c, t_end
            )

            final_temp = temp_values[-1]

            # Amplify safe speed based on slosh factor
            adjusted_speed = speed * slosh_amp

            if final_temp >= cooling_threshold:
                return jsonify({
                    'min_speed': round(adjusted_speed, 2),
                    'final_temp': float(final_temp),
                    'time_values': time_values.tolist(),
                    'temp_values': temp_values.tolist()
                })

        # No valid speed found
        return jsonify({
            'min_speed': 0,
            'final_temp': float(temp_values[-1]),
            'time_values': time_values.tolist(),
            'temp_values': temp_values.tolist(),
            'note': 'No valid speed found to maintain temperature'
        }), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({'error': str(e)}), 500

# --- Run server --- #

if __name__ == '__main__':
    app.run(debug=True)
