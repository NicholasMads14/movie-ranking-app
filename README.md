
# Movie Club Rankings App

This is an interactive webapp for our movie club to rank the 100+ movies that have been watched. It allows users to:
- Drag and drop movies to rank them
- Submit their rankings
- Load previously saved rankings
- Save a separate ranking file for each user

The app is built with Flask and uses pandas for data handling. Frontend uses HTML, CSS, and SortableJS for drag-and-drop functionality.

---

## Project Structure

```
movie_ranking_app/
├── templates/            # HTML templates
│   ├── index.html        # Main ranking interface
│   └── thanks.html       # Thank you page
├── user_rankings/        # Folder with each user's rankings (XLSX)
├── .gitignore            # Ignore venv and other unneeded files
├── README.md             # Project description
├── app.py                # Main Flask app
├── app.spec              # PyInstaller spec file for building executables
├── movie_appender.py     # Script to append new movies to all user files
├── movies.xlsx           # Master list of all movies
├── rankings.json         # JSON file to store user rankings
```

---

## How It Works

When a user visits the app, they can drag and drop the movie titles to create their personal ranking. After submitting, their ranking is saved as a separate file and can be loaded again later. The app also maintains backups of each ranking file and the main movies list.

---

## License

This project is for educational and personal use. Feel free to fork and adapt.
