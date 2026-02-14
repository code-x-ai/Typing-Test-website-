// js/utils.js

/**
 * Calculate Words Per Minute (WPM)
 * Standard formula: (correct characters / 5) / (minutes)
 * @param {number} correctChars - Number of correctly typed characters
 * @param {number} timeInSeconds - Time elapsed in seconds
 * @returns {number} WPM (rounded to nearest integer)
 */
function calculateWPM(correctChars, timeInSeconds) {
    if (timeInSeconds === 0) return 0;
    const minutes = timeInSeconds / 60;
    return Math.round((correctChars / 5) / minutes);
}

/**
 * Calculate typing accuracy percentage
 * @param {number} correctChars - Number of correctly typed characters
 * @param {number} totalTypedChars - Total characters typed (including incorrect)
 * @returns {number} Accuracy percentage (0-100, rounded to 1 decimal)
 */
function calculateAccuracy(correctChars, totalTypedChars) {
    if (totalTypedChars === 0) return 100.0;
    return Math.round((correctChars / totalTypedChars) * 100 * 10) / 10; // 1 decimal
}

/**
 * Format seconds into MM:SS or just "Xs" if less than 60 seconds
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatTime(seconds) {
    if (seconds < 60) {
        return seconds + 's';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Debounce function: delays invoking a function until after wait milliseconds
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}