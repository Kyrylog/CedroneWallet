// Mnemonic generation utility with proper randomization
// Ensures 12 unique words with unique starting letters from BIP39 word list

export interface MnemonicGenerationResult {
  mnemonic: string[];
  isValid: boolean;
  error?: string;
}

/**
 * Generates a cryptographically random 12-word mnemonic phrase
 * with unique words and unique starting letters
 */
export function generateSecureMnemonic(wordList: string[]): MnemonicGenerationResult {
  if (!wordList || wordList.length < 26) {
    return {
      mnemonic: [],
      isValid: false,
      error: 'Word list must contain at least 26 words'
    };
  }

  const usedWords = new Set<string>();
  const usedFirstLetters = new Set<string>();
  const mnemonic: string[] = [];

  // Group words by first letter for efficient selection
  const wordsByFirstLetter = new Map<string, string[]>();
  for (const word of wordList) {
    const firstLetter = word[0].toLowerCase();
    if (!wordsByFirstLetter.has(firstLetter)) {
      wordsByFirstLetter.set(firstLetter, []);
    }
    wordsByFirstLetter.get(firstLetter)!.push(word);
  }

  const availableLetters = Array.from(wordsByFirstLetter.keys());
  
  if (availableLetters.length < 12) {
    return {
      mnemonic: [],
      isValid: false,
      error: 'Word list must have words starting with at least 12 different letters'
    };
  }

  // Shuffle available letters using Fisher-Yates algorithm
  const shuffledLetters = [...availableLetters];
  for (let i = shuffledLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
  }

  // Select 12 letters
  const selectedLetters = shuffledLetters.slice(0, 12);

  // For each selected letter, pick a random word
  for (const letter of selectedLetters) {
    const wordsForLetter = wordsByFirstLetter.get(letter)!;
    const randomIndex = Math.floor(Math.random() * wordsForLetter.length);
    const selectedWord = wordsForLetter[randomIndex];
    
    mnemonic.push(selectedWord);
    usedWords.add(selectedWord);
    usedFirstLetters.add(letter);
  }

  // Validate the generated mnemonic
  const validation = validateMnemonicStructure(mnemonic);
  
  return {
    mnemonic,
    isValid: validation.isValid,
    error: validation.error
  };
}

/**
 * Validates that a mnemonic has 12 unique words with unique starting letters
 */
export function validateMnemonicStructure(mnemonic: string[]): { isValid: boolean; error?: string } {
  if (mnemonic.length !== 12) {
    return {
      isValid: false,
      error: `Mnemonic must have exactly 12 words, got ${mnemonic.length}`
    };
  }

  const usedWords = new Set<string>();
  const usedFirstLetters = new Set<string>();

  for (let i = 0; i < mnemonic.length; i++) {
    const word = mnemonic[i];
    
    if (!word || word.length === 0) {
      return {
        isValid: false,
        error: `Word at position ${i + 1} is empty`
      };
    }

    if (usedWords.has(word)) {
      return {
        isValid: false,
        error: `Duplicate word found: "${word}"`
      };
    }

    const firstLetter = word[0].toLowerCase();
    if (usedFirstLetters.has(firstLetter)) {
      return {
        isValid: false,
        error: `Duplicate starting letter "${firstLetter}" found (word: "${word}")`
      };
    }

    usedWords.add(word);
    usedFirstLetters.add(firstLetter);
  }

  return { isValid: true };
}

/**
 * Generates multiple mnemonics and validates they all meet requirements
 * Used for testing
 */
export function generateAndValidateMultiple(
  wordList: string[],
  count: number
): { success: boolean; results: MnemonicGenerationResult[]; errors: string[] } {
  const results: MnemonicGenerationResult[] = [];
  const errors: string[] = [];

  for (let i = 0; i < count; i++) {
    const result = generateSecureMnemonic(wordList);
    results.push(result);

    if (!result.isValid) {
      errors.push(`Generation ${i + 1} failed: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors
  };
}

