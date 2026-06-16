# BigQuery Release Notes Console

A premium, terminal-inspired developer console dashboard that retrieves, parses, and formats the live Google Cloud BigQuery release notes Atom feed.

## 🚀 Features

- **Live Synchronization**: Fetches and parses the official BigQuery release notes feed directly from Google Cloud in real-time.
- **Console Interface**: A developer-centric dark mode layout with custom CSS and typography (Outfit and JetBrains Mono fonts).
- **Split-Pane Log Inspector**:
  - **FEED_LOG**: Interactive search, date badges, and text snippets of all release entries.
  - **INSPECTOR_PANEL**: Renders raw HTML release note contents, formatting lists, code blocks, and headings correctly.
- **Search & Filter**: Instantly search titles and body text (with HTML tags stripped dynamically).
- **Developer Workflows**:
  - **Tweet This Update**: Dynamically creates a Twitter/X Intent URL with character limit safety and auto-included hashtags.
  - **View Original Source**: Quick navigation links straight to the target Google Cloud documentation page.
- **Connection Health Checks**: System diagnostics panel checking and notifying online, syncing, and error states.

## 📁 Directory Structure

```text
bq-releases-notes/
│
├── app.py                 # Flask server, Atom XML scraper, and API controller
├── README.md              # Documentation
├── .gitignore             # Project files to ignore in Git
│
├── templates/
│   └── index.html         # Main console HTML template
│
└── static/
    ├── css/
    │   └── style.css      # Terminal styles, animations, variables, layout
    └── js/
        └── app.js         # Frontend controller, state manager, and Event Listeners
```

## 🛠️ Getting Started

### Prerequisites

Make sure you have **Python 3.x** installed.

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd bq-releases-notes
   ```

2. Install the required dependencies (Flask):
   ```bash
   pip install Flask
   ```

### Running the Console

1. Start the Flask application:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```text
   http://127.0.0.1:5000/
   ```

## 🔌 API Documentation

### Get Releases

*   **Endpoint**: `/api/releases`
*   **Method**: `GET`
*   **Response Structure**:
    ```json
    {
      "success": true,
      "releases": [
        {
          "id": "tag:google.com,2026:bigquery:release-note",
          "title": "Release Note Title",
          "date": "2026-06-15T10:00:00Z",
          "content": "<p>Formatted HTML description...</p>",
          "link": "https://cloud.google.com/bigquery/docs/release-notes#anchor"
        }
      ]
    }
    ```
