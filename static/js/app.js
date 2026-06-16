// Main App Logic for BigQuery Release Notes Viewer
document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let state = {
        releases: [],
        selectedRelease: null,
        searchQuery: '',
        loading: false
    };

    // DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = document.getElementById('refresh-icon');
    const searchInput = document.getElementById('search-input');
    const feedList = document.getElementById('feed-list');
    const feedStatus = document.getElementById('feed-status');
    
    const detailPane = document.getElementById('detail-pane');
    const detailPlaceholder = document.getElementById('detail-placeholder');
    const detailContent = document.getElementById('detail-content');
    const detailStatus = document.getElementById('detail-status');
    const docDate = document.getElementById('doc-date');
    const docTitle = document.getElementById('doc-title');
    const docBody = document.getElementById('doc-body');
    const tweetBtn = document.getElementById('tweet-btn');
    const originalLink = document.getElementById('original-link');
    const systemStatus = document.getElementById('system-status');
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Theme Management
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };

    const updateThemeIcon = (theme) => {
        if (theme === 'light') {
            themeIcon.className = 'fa-solid fa-moon';
            themeToggle.title = 'Switch to Dark Mode';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
            themeToggle.title = 'Switch to Light Mode';
        }
    };

    // Event Listeners
    refreshBtn.addEventListener('click', fetchReleases);
    searchInput.addEventListener('input', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);

    // Initial Setup
    initTheme();
    fetchReleases();

    // Fetch Release Notes from backend API
    async function fetchReleases() {
        if (state.loading) return;
        
        setLoadingState(true);
        
        try {
            const response = await fetch('/api/releases');
            const data = await response.json();
            
            if (data.success && data.releases) {
                state.releases = data.releases;
                renderFeed();
                updateSystemStatus('ONLINE', 'text-success');
            } else {
                showError(data.error || 'Failed to parse releases.');
                updateSystemStatus('ERROR', 'text-danger');
            }
        } catch (error) {
            console.error('Error fetching release notes:', error);
            showError('Network error connecting to API.');
            updateSystemStatus('OFFLINE', 'text-danger');
        } finally {
            setLoadingState(false);
        }
    }

    // Set Loading Visual State
    function setLoadingState(isLoading) {
        state.loading = isLoading;
        if (isLoading) {
            refreshIcon.classList.add('spinning');
            feedStatus.textContent = 'SYNCING';
            feedStatus.className = 'status-indicator syncing';
        } else {
            refreshIcon.classList.remove('spinning');
            feedStatus.textContent = 'ONLINE';
            feedStatus.className = 'status-indicator online';
        }
    }

    // Handle Input Search Filter
    function handleSearch(e) {
        state.searchQuery = e.target.value.toLowerCase();
        renderFeed();
    }

    // Update Status Bar
    function updateSystemStatus(text, className) {
        systemStatus.textContent = text;
        systemStatus.className = `value ${className}`;
    }

    // Render Release Feed List
    function renderFeed() {
        const filtered = state.releases.filter(release => {
            const matchTitle = release.title.toLowerCase().includes(state.searchQuery);
            // Also strip HTML to search plain content
            const plainContent = release.content.replace(/<[^>]*>/g, '').toLowerCase();
            const matchContent = plainContent.includes(state.searchQuery);
            return matchTitle || matchContent;
        });

        if (filtered.length === 0) {
            feedList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>${state.releases.length === 0 ? 'No release notes loaded.' : 'No matching entries found.'}</p>
                </div>
            `;
            return;
        }

        feedList.innerHTML = '';
        filtered.forEach((release, index) => {
            const item = document.createElement('div');
            item.className = 'feed-item';
            if (state.selectedRelease && state.selectedRelease.id === release.id) {
                item.classList.add('active');
            }

            // Extract plain text snippet
            const snippet = generateSnippet(release.content);
            
            // Format published date
            const formattedDate = formatDate(release.date);

            item.innerHTML = `
                <div class="feed-item-header">
                    <span class="feed-item-date">${formattedDate}</span>
                </div>
                <h4 class="feed-item-title">${escapeHTML(release.title)}</h4>
                <p class="feed-item-snippet">${escapeHTML(snippet)}</p>
            `;

            item.addEventListener('click', () => selectRelease(release));
            feedList.appendChild(item);
        });
    }

    // Select and Display Specific Release Details
    function selectRelease(release) {
        state.selectedRelease = release;
        
        // Highlight active item in the list
        document.querySelectorAll('.feed-item').forEach(el => {
            const titleEl = el.querySelector('.feed-item-title');
            if (titleEl && titleEl.textContent === release.title) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Populate detail panels
        detailPlaceholder.classList.add('hidden');
        detailContent.classList.remove('hidden');
        
        detailStatus.textContent = 'INSPECTING';
        detailStatus.className = 'status-indicator online';

        docDate.textContent = formatDate(release.date);
        docTitle.textContent = release.title;
        
        // Inject content safely (HTML is provided by the source XML)
        docBody.innerHTML = release.content;

        // Configure Twitter Intent Link
        const tweetText = generateTweetText(release.title, release.link);
        tweetBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

        // Configure Original Link
        if (release.link) {
            originalLink.href = release.link;
            originalLink.classList.remove('hidden');
        } else {
            originalLink.classList.add('hidden');
        }
    }

    // Show Error State inside Feed
    function showError(message) {
        feedList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation" style="color: var(--error)"></i>
                <p style="color: var(--error)">${escapeHTML(message)}</p>
            </div>
        `;
    }

    // Format Date string to a cleaner visual format
    function formatDate(dateStr) {
        if (!dateStr) return 'Unknown Date';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr.split('T')[0];
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    }

    // Construct Tweet text with truncation safeguards
    function generateTweetText(title, link) {
        const url = link || 'https://cloud.google.com/bigquery/docs/release-notes';
        const prefix = "BigQuery Update: ";
        const hashtags = " #GCP #BigQuery";
        
        // Max characters: 280. 
        // We account for URLs taking up 23 characters in Twitter's shortening system.
        const maxTitleLength = 280 - prefix.length - 23 - hashtags.length - 4; // reserve space for ellipsis
        
        let displayTitle = title;
        if (displayTitle.length > maxTitleLength) {
            displayTitle = displayTitle.substring(0, maxTitleLength) + "...";
        }
        
        return `${prefix}${displayTitle}\n\n${url}${hashtags}`;
    }

    // Simple Helper to escape HTML tags for strings
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Generate a clean snippet ending at sentence or word boundary
    function generateSnippet(content) {
        // Strip HTML and clean whitespace
        const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!plain) return '';

        // Match the first sentence
        const sentenceRegex = /[^.!?]+[.!?](\s|$)/;
        const match = plain.match(sentenceRegex);
        
        if (match) {
            const firstSentence = match[0].trim();
            if (firstSentence.length <= 150) {
                return firstSentence;
            }
        }

        // Fallback: Truncate to 150 characters at a word boundary
        if (plain.length <= 150) return plain;
        
        let truncated = plain.substring(0, 150);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            truncated = truncated.substring(0, lastSpace);
        }
        return truncated + '...';
    }
});
