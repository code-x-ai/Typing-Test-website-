// js/passages.js

// Text samples organized by category and size
const passages = {
    plain: {
        small: [
            "the quick brown fox jumps over the lazy dog",
            "a simple sentence with only letters and spaces",
            "hello world this is a basic typing test"
        ],
        medium: [
            "this is a medium length passage without any punctuation it is just a bunch of words strung together to make a longer sentence that can be used for typing practice",
            "another medium example that contains no numbers or special characters just plain old english words and a bit more length to keep you typing for a while"
        ],
        large: [
            "a very long passage that goes on and on with many words to provide a substantial amount of text for typing practice it could be a paragraph from a book or something similar but remember no punctuation or capitals everything is lowercase and only letters and spaces appear here so you can focus on the words themselves without any distractions from punctuation or numbers or special symbols"
        ]
    },
    numbersAndPunctuation: {
        small: [
            "Hello, world! 123.",
            "The price is $99.99, right?",
            "I have 3 apples and 2 oranges."
        ],
        medium: [
            "In 2024, we'll have 3 major updates: v1.0, v2.0, and v3.0!",
            "The result was 42.5% – better than expected. However, we need to check the numbers: 100, 200, and 300.",
            "On 15th March, 2023, we met at 5:30 PM. It was great!"
        ],
        large: [
            "The event took place on 21st July, 2023, at 10:30 AM. There were 150 attendees, and the feedback score was 4.8/5. We sold 75 tickets at $25.50 each, totalling $1,912.50. The next event is scheduled for 5th September, 2024. Don't miss it!"
        ]
    },
    specialCharacters: {
        small: [
            "@#$% ^&*()",
            "C++ & Java are #1!",
            "Password: P@ssw0rd!"
        ],
        medium: [
            "The password is P@ssw0rd! (don't tell anyone).",
            "She said: \"Hello! How are you?\" – I replied: \"Fine, thanks!\"",
            "Special chars: @, #, $, %, ^, &, *, (, ), -, _, +, =, {, }, [, ], \\, |, ;, :, ', \", ,, <, >, /, ?, `, ~"
        ],
        large: [
            "In programming, we use symbols like &&, ||, !, ==, !=, <=, >=, ++, --, +=, -=, *=, /=, %=, &, |, ^, ~, <<, >>, >>>, ??, ?., =>, ... and many more. Also brackets: (), {}, []. And don't forget backticks `, quotes \", and apostrophes '. Escaping is fun!"
        ]
    },
    quotes: {
        small: [
            "'To be or not to be'",
            "“The only limit is your mind.”",
            "“Stay hungry, stay foolish.”"
        ],
        medium: [
            "“Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.” – Albert Einstein",
            "“The only way to do great work is to love what you do.” – Steve Jobs",
            "“It does not matter how slowly you go as long as you do not stop.” – Confucius"
        ],
        large: [
            "“Success is not final, failure is not fatal: it is the courage to continue that counts.” – Winston Churchill",
            "“The future belongs to those who believe in the beauty of their dreams.” – Eleanor Roosevelt",
            "“I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.” – Maya Angelou"
        ]
    }
};

/**
 * Returns a typing passage by repeating a random base text until it reaches at least minLength characters.
 * @param {string} category - Category key (plain, numbersAndPunctuation, specialCharacters, quotes)
 * @param {string} size - Size key (small, medium, large)
 * @param {number} minLength - Minimum character length for the passage (default 500)
 * @returns {string} The repeated passage
 */
function getTypingText(category, size, minLength = 500) {
    // Get the array for the given category and size
    const list = passages[category] && passages[category][size];
    if (!list || list.length === 0) {
        // Fallback to plain medium if invalid selection
        console.warn('Invalid category/size, using plain/medium fallback.');
        return getTypingText('plain', 'medium', minLength);
    }

    // Pick a random base text from the list
    const baseText = list[Math.floor(Math.random() * list.length)];

    // Repeat the base text with a space until we reach minLength
    let result = baseText;
    while (result.length < minLength) {
        result += ' ' + baseText;
    }
    return result;
}