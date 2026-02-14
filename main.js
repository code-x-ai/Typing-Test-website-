const typingInput = document.getElementById('typing-input');
const passageDisplay = document.getElementById('passage-display');
const timerSpan = document.getElementById('timer');
const wpmSpan = document.getElementById('wpm');
const accuracySpan = document.getElementById('accuracy');
const timerSelect = document.getElementById('timer-select');
const categorySelect = document.getElementById('category-select');
const sizeSelect = document.getElementById('size-select');
const restartBtn = document.getElementById('restart-btn');
const resultModal = document.getElementById('result-modal');
const finalWpm = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const finalTime = document.getElementById('final-time');
const modalClose = document.getElementById('modal-close');
const modalRestart = document.getElementById('modal-restart');
const closeBtn = document.querySelector('.close-btn');

let testActive = false;
let startTime = null;
let timerInterval = null;
let inactivityTimeout = null;
let currentPassage = '';
let charSpans = [];

const INACTIVITY_LIMIT = 10000;
const AUTO_SCROLL_THRESHOLD = 5; // Scroll when within 5 chars of bottom

// Visual Viewport handling for mobile keyboard
function setupVisualViewport() {
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            const fixedHeader = document.querySelector('.fixed-header');
            if (fixedHeader) {
                fixedHeader.style.position = 'fixed';
                fixedHeader.style.top = '0';
                fixedHeader.style.left = '0';
                fixedHeader.style.right = '0';
            }
        });
    }
}

function normalizeChar(c) {
    const map = {
        '“': '"', '”': '"',
        '‘': "'", '’': "'",
        '—': '-', '–': '-',
        '…': '.'
    };
    return map[c] || c;
}

function normalizeText(text) {
    return text
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/[—–]/g, '-')
        .replace(/\u00A0/g, ' ')
        .replace(/[^\x20-\x7E\n\r]/g, '');
}

function init() {
    setupVisualViewport();
    loadNewPassage();
    typingInput.focus();
}

function loadNewPassage() {
    const category = categorySelect.value;
    const size = sizeSelect.value;
    let rawPassage = getTypingText(category, size);
    currentPassage = normalizeText(rawPassage).replace(/\s+/g, ' ');
    renderPassage();
    resetTestState();
}

function renderPassage() {
    passageDisplay.innerHTML = '';
    charSpans = [];
    for (let char of currentPassage) {
        const span = document.createElement('span');
        span.textContent = char;
        passageDisplay.appendChild(span);
        charSpans.push(span);
    }
}

function resetTestState() {
    stopTimer();
    testActive = false;
    startTime = null;
    clearInactivityTimeout();
    charSpans.forEach(span => {
        span.classList.remove('correct', 'incorrect', 'current');
    });
    if (charSpans.length > 0) {
        charSpans[0].classList.add('current');
    }
    updateStats(0, 0);
    const totalDuration = parseInt(timerSelect.value, 10);
    timerSpan.textContent = formatTime(totalDuration);
    typingInput.value = '';
    // Reset scroll positions
    passageDisplay.scrollTop = 0;
    typingInput.focus();
}

function startTest() {
    if (testActive) return;
    testActive = true;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
}

function stopTest() {
    if (!testActive) return;
    testActive = false;
    stopTimer();
    clearInactivityTimeout();

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const totalDuration = parseInt(timerSelect.value, 10);
    const finalElapsed = Math.min(elapsed, totalDuration);

    let correctCount = 0, totalTyped = 0;
    for (let i = 0; i < charSpans.length; i++) {
        if (charSpans[i].classList.contains('correct')) {
            correctCount++;
            totalTyped++;
        } else if (charSpans[i].classList.contains('incorrect')) {
            totalTyped++;
        } else {
            break;
        }
    }

    const wpm = calculateWPM(correctCount, finalElapsed);
    const accuracy = calculateAccuracy(correctCount, totalTyped);

    saveResult(wpm, accuracy, categorySelect.value, sizeSelect.value, finalElapsed);
    renderSummary('results-summary');
    showResultModal(wpm, accuracy, finalElapsed);
    startTime = null;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    if (!testActive || !startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const totalDuration = parseInt(timerSelect.value, 10);
    const remaining = totalDuration - elapsed;
    if (remaining <= 0) {
        timerSpan.textContent = '0s';
        stopTest();
    } else {
        timerSpan.textContent = formatTime(remaining);
    }
}

function resetInactivityTimeout() {
    clearInactivityTimeout();
    if (!testActive) return;
    inactivityTimeout = setTimeout(() => {
        stopTest();
    }, INACTIVITY_LIMIT);
}

function clearInactivityTimeout() {
    if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = null;
    }
}

function updateStats(correctCount, totalTyped) {
    if (testActive && startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const wpm = calculateWPM(correctCount, elapsed);
        wpmSpan.textContent = wpm;
    } else if (!testActive && startTime === null) {
        wpmSpan.textContent = '0';
    }
    accuracySpan.textContent = calculateAccuracy(correctCount, totalTyped) + '%';
}

// FIXED: Auto-scroll function to keep current character visible
function autoScrollToCurrent(currentIndex) {
    if (currentIndex >= charSpans.length) return;
    
    const currentSpan = charSpans[currentIndex];
    const container = passageDisplay;
    
    // Get positions relative to container
    const spanTop = currentSpan.offsetTop;
    const spanBottom = spanTop + currentSpan.offsetHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    
    // Check if current span is near bottom of visible area
    if (spanBottom > containerBottom - 50) { // 50px buffer from bottom
        // Scroll to show next few lines
        const scrollTarget = spanTop - container.clientHeight / 2;
        container.scrollTo({
            top: Math.max(0, scrollTarget),
            behavior: 'smooth'
        });
    }
    
    // Also scroll if near top (for backspace)
    if (spanTop < containerTop + 20) {
        container.scrollTo({
            top: Math.max(0, spanTop - 50),
            behavior: 'smooth'
        });
    }
}

function refreshHighlighting() {
    const input = typingInput.value;
    const inputLength = input.length;
    const passageLength = currentPassage.length;

    let correctCount = 0;
    let totalTyped = 0;

    charSpans.forEach(span => {
        span.classList.remove('correct', 'incorrect', 'current');
    });

    for (let i = 0; i < inputLength && i < passageLength; i++) {
        const span = charSpans[i];
        const normalizedInput = normalizeChar(input[i]);
        const normalizedPassage = normalizeChar(currentPassage[i]);
        
        if (normalizedInput === normalizedPassage) {
            span.classList.add('correct');
            correctCount++;
        } else {
            span.classList.add('incorrect');
        }
        totalTyped++;
    }

    if (inputLength < passageLength) {
        charSpans[inputLength].classList.add('current');
        // FIXED: Auto-scroll to keep current character visible
        autoScrollToCurrent(inputLength);
    }

    updateStats(correctCount, totalTyped);

    if (inputLength >= passageLength) {
        stopTest();
    }
}

function onInput(e) {
    if (!testActive && startTime !== null) {
        return;
    }
    
    if (!testActive) {
        startTest();
    }

    refreshHighlighting();
    resetInactivityTimeout();
}

function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        return;
    }
    
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        return;
    }
}

function restartTest() {
    resultModal.style.display = 'none';
    loadNewPassage();
    typingInput.focus();
}

function showResultModal(wpm, accuracy, time) {
    finalWpm.textContent = wpm;
    finalAccuracy.textContent = accuracy + '%';
    finalTime.textContent = time + 's';
    resultModal.style.display = 'flex';
}

function hideModal() {
    resultModal.style.display = 'none';
    if (!testActive && startTime === null) {
        restartTest();
    } else {
        typingInput.focus();
    }
}

typingInput.addEventListener('input', onInput);
typingInput.addEventListener('keydown', onKeyDown);

restartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restartTest();
});

modalRestart.addEventListener('click', restartTest);
modalClose.addEventListener('click', hideModal);
closeBtn.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        hideModal();
    }
});

document.addEventListener('click', (e) => {
    const tag = e.target.tagName;
    if (tag === 'SELECT' || tag === 'OPTION' || tag === 'BUTTON' || 
        e.target.classList.contains('btn') || e.target.classList.contains('close-btn')) {
        return;
    }
    if (e.target.id === 'typing-input') {
        return;
    }
    if (e.target.closest('#passage-display')) {
        typingInput.focus();
    }
});

window.addEventListener('load', () => {
    init();
    renderSummary('results-summary');
});

categorySelect.addEventListener('change', () => {
    if (!testActive) {
        loadNewPassage();
    }
});
sizeSelect.addEventListener('change', () => {
    if (!testActive) {
        loadNewPassage();
    }
});
