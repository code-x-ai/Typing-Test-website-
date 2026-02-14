// js/results.js

const STORAGE_KEY = 'typingTestResults';

/**
 * Save a test result to localStorage, keeping only the last 5 entries.
 * @param {number} wpm - Words per minute
 * @param {number} accuracy - Accuracy percentage
 * @param {string} category - Category selected
 * @param {string} size - Size selected
 * @param {number} duration - Test duration in seconds
 */
function saveResult(wpm, accuracy, category, size, duration) {
    const results = loadResults();
    const newResult = {
        wpm,
        accuracy,
        category,
        size,
        duration,
        date: new Date().toLocaleString()
    };
    results.push(newResult);
    // Keep only last 5
    const updated = results.slice(-5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Load results from localStorage.
 * @returns {Array} Array of result objects (empty if none)
 */
function loadResults() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Determine trend based on last 5 results.
 * @returns {Object} { text: 'Improving'|'Stable'|'Declining', class: 'trend-improving'|'trend-stable'|'trend-declining' }
 */
function getTrend() {
    const results = loadResults();
    if (results.length < 2) {
        return { text: 'Not enough data', class: '' };
    }
    const last = results[results.length - 1].wpm;
    const previousAvg = results.slice(0, -1).reduce((sum, r) => sum + r.wpm, 0) / (results.length - 1);
    const diff = last - previousAvg;
    if (diff > 5) return { text: '⬆️ Improving', class: 'trend-improving' };
    if (diff < -5) return { text: '⬇️ Declining', class: 'trend-declining' };
    return { text: '➡️ Stable', class: 'trend-stable' };
}

/**
 * Render the last 5 results as an HTML table inside the given container element.
 * @param {string} containerId - ID of the container element
 */
function renderSummary(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const results = loadResults();
    if (results.length === 0) {
        container.innerHTML = '<p>No tests completed yet.</p>';
        return;
    }

    // Build table
    let html = '<table class="results-table">';
    html += '<thead><tr><th>Date</th><th>WPM</th><th>Accuracy</th><th>Category</th><th>Size</th><th>Duration</th></tr></thead><tbody>';

    results.slice().reverse().forEach(r => { // Show most recent first
        html += `<tr>
            <td>${r.date}</td>
            <td>${r.wpm}</td>
            <td>${r.accuracy}%</td>
            <td>${r.category}</td>
            <td>${r.size}</td>
            <td>${r.duration}s</td>
        </tr>`;
    });
    html += '</tbody></table>';

    // Add trend summary
    const trend = getTrend();
    html += `<div class="trend-summary">Trend: <span class="${trend.class}">${trend.text}</span></div>`;

    container.innerHTML = html;
}