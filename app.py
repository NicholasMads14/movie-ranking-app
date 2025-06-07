from flask import Flask, render_template, request
import pandas as pd
import json
import os
import sys

app = Flask(__name__)

MOVIES_FILE = 'movies.xlsx'
RANKINGS_FILE = 'rankings.json'

def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

@app.route('/', methods=['GET', 'POST'])
def index():
    # Use resource_path for bundled files
    df = pd.read_excel(resource_path(MOVIES_FILE))
    movies = df['Movie'].dropna().tolist()

    if request.method == 'POST':
        username = request.form.get('username')
        action = request.form.get('action')

        if username:
            safe_username = username.strip().replace(' ', '_')
            user_xlsx_file = f"{safe_username}_rankings.xlsx"

            if action == 'load':
                if os.path.exists(user_xlsx_file):
                    df_user = pd.read_excel(user_xlsx_file)
                    rankings = df_user['Movie'].tolist()
                    return render_template('index.html', movies=rankings)
                else:
                    return render_template('index.html', movies=movies, error="No saved rankings found.")

            elif action == 'submit':
                rankings = request.form.getlist('movie')

                if rankings:
                    # Save rankings.json separately (not bundled)
                    rankings_file_path = resource_path(RANKINGS_FILE)
                    if os.path.exists(rankings_file_path):
                        with open(rankings_file_path, 'r') as f:
                            try:
                                all_rankings = json.load(f)
                            except json.JSONDecodeError:
                                all_rankings = {}
                    else:
                        all_rankings = {}

                    all_rankings[username] = rankings

                    with open(rankings_file_path, 'w') as f:
                        json.dump(all_rankings, f, indent=4)

                    # Save user's rankings to xlsx (not bundled)
                    user_rankings_df = pd.DataFrame({
                        'Rank': list(range(1, len(rankings) + 1)),
                        'Movie': rankings
                    })
                    user_rankings_df.to_excel(user_xlsx_file, index=False)

                    return render_template('thanks.html', username=username)

    return render_template('index.html', movies=movies)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
