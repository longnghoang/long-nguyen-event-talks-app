import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Namespace for Atom feed
ATOM_NAMESPACE = {'atom': 'http://www.w3.org/2005/Atom'}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    try:
        # Create request with User-Agent header to avoid potential bot blocking
        req = urllib.request.Request(
            'https://docs.cloud.google.com/feeds/bigquery-release-notes.xml',
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        
        releases = []
        # Parse each entry in the Atom feed
        for entry in root.findall('atom:entry', ATOM_NAMESPACE):
            title_el = entry.find('atom:title', ATOM_NAMESPACE)
            published_el = entry.find('atom:published', ATOM_NAMESPACE) or entry.find('atom:updated', ATOM_NAMESPACE)
            content_el = entry.find('atom:content', ATOM_NAMESPACE) or entry.find('atom:summary', ATOM_NAMESPACE)
            id_el = entry.find('atom:id', ATOM_NAMESPACE)
            
            # Extract link href if available
            link_el = entry.find('atom:link', ATOM_NAMESPACE)
            link = link_el.attrib.get('href') if link_el is not None else ''
            
            title = title_el.text if title_el is not None else 'No Title'
            date_str = published_el.text if published_el is not None else ''
            content = content_el.text if content_el is not None else ''
            entry_id = id_el.text if id_el is not None else ''
            
            releases.append({
                'id': entry_id,
                'title': title,
                'date': date_str,
                'content': content,
                'link': link
            })
            
        return jsonify({
            'success': True,
            'releases': releases
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
