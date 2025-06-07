import os
import pandas as pd
import shutil

# 📁 Folder containing the user Excel files
FOLDER = 'user_rankings'
# 🆕 New movies to append
new_movies = ['Interstellar']

# 🔄 Create backups for user Excel files
print('🔄 Creating backups...')
for filename in os.listdir(FOLDER):
    if filename.endswith('.xlsx') and '_backup' not in filename:
        filepath = os.path.join(FOLDER, filename)
        name, ext = os.path.splitext(filename)
        backup_path = os.path.join(FOLDER, f"{name}_backup{ext}")
        shutil.copy2(filepath, backup_path)
        print(f'🔒 Backup created: {backup_path}')

# 🔄 Create backup of movies.xlsx in the root folder
movies_file = 'movies.xlsx'
if os.path.exists(movies_file) and '_backup' not in movies_file:
    backup_path = 'movies_backup.xlsx'
    shutil.copy2(movies_file, backup_path)
    print(f'🔒 Backup created: {backup_path}')

print('✅ Backups done!')

# 1️⃣ Update user Excel files (skip backups!)
for filename in os.listdir(FOLDER):
    if filename.endswith('.xlsx') and '_backup' not in filename:
        filepath = os.path.join(FOLDER, filename)
        print(f'Updating: {filename}')

        df = pd.read_excel(filepath)

        if 'Rank' in df.columns:
            last_rank = df['Rank'].max() if not df.empty else 0
            new_ranks = list(range(last_rank + 1, last_rank + 1 + len(new_movies)))

            new_df = pd.DataFrame({
                'Rank': new_ranks,
                'Movie': new_movies
            })

            updated_df = pd.concat([df, new_df], ignore_index=True)
        else:
            new_df = pd.DataFrame({'Movie': new_movies})
            updated_df = pd.concat([df, new_df], ignore_index=True)

        updated_df.to_excel(filepath, index=False)

print('✅ User Excel files updated!')

# 2️⃣ Update the main movies.xlsx file
if os.path.exists(movies_file) and '_backup' not in movies_file:
    print('Updating movies.xlsx...')
    df_movies = pd.read_excel(movies_file)

    new_movies_df = pd.DataFrame({'Movie': new_movies})
    updated_movies_df = pd.concat([df_movies, new_movies_df], ignore_index=True)

    updated_movies_df.to_excel(movies_file, index=False)
    print('✅ movies.xlsx updated!')

print('🎉 All done, with backups created safely!')
