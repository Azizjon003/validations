function checkPassword(password) {
  // Boshlang'ich tekshiruv
  if (!password) {
    return {
      isValid: false,
      message: "Parol bo'sh bo'lishi mumkin emas",
      strength: 0,
      details: null,
    };
  }

  const analysis = analyzePassword(password);
  const requirements = checkRequirements(analysis);
  const strength = calculatePasswordStrength(analysis);
  const suggestions = generatePasswordSuggestions(analysis);

  // Minimal talablar tekshiruvi
  if (!requirements.meetsMinimalRequirements) {
    return {
      isValid: false,
      message: requirements.failedRequirements.join(". "),
      strength: strength.score,
      details: {
        analysis: analysis,
        requirements: requirements,
        strength: strength,
        suggestions: suggestions,
      },
    };
  }

  return {
    isValid: true,
    message: `Parol ${strength.label}`,
    strength: strength.score,
    details: {
      analysis: analysis,
      requirements: requirements,
      strength: strength,
      suggestions: suggestions,
    },
  };
}

function analyzePassword(password) {
  return {
    length: password.length,
    containsLowercase: /[a-z]/.test(password),
    containsUppercase: /[A-Z]/.test(password),
    containsNumbers: /[0-9]/.test(password),
    containsSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    containsSpaces: /\s/.test(password),
    repeatingChars: findRepeatingCharacters(password),
    sequences: findSequences(password),
    commonWords: findCommonWords(password),
    uniqueCharCount: new Set(password).size,
    characterGroups: analyzeCharacterGroups(password),
  };
}

function findRepeatingCharacters(password) {
  const repeats = [];
  let count = 1;
  let prevChar = password[0];

  for (let i = 1; i <= password.length; i++) {
    if (password[i] === prevChar) {
      count++;
    } else {
      if (count >= 3) {
        repeats.push({
          char: prevChar,
          count: count,
        });
      }
      count = 1;
      prevChar = password[i];
    }
  }

  return repeats;
}

function findSequences(password) {
  const sequences = [];
  const commonSequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ];

  for (let seq of commonSequences) {
    let maxSequence = "";
    for (let i = 0; i < seq.length - 2; i++) {
      const portion = seq.slice(i, i + 3);
      if (password.toLowerCase().includes(portion)) {
        if (portion.length > maxSequence.length) {
          maxSequence = portion;
        }
      }
    }
    if (maxSequence) {
      sequences.push(maxSequence);
    }
  }

  return sequences;
}

function findCommonWords(password) {
  const commonWords = [
    "password",
    "admin",
    "123456",
    "qwerty",
    "welcome",
    "letmein",
    "monkey",
    "dragon",
    "baseball",
    "football",
    "master",
    "hello",
    "freedom",
    "love",
    "secret",
  ];

  return commonWords.filter((word) =>
    password.toLowerCase().includes(word.toLowerCase())
  );
}

function analyzeCharacterGroups(password) {
  const groups = {
    lowercase: (password.match(/[a-z]/g) || []).length,
    uppercase: (password.match(/[A-Z]/g) || []).length,
    numbers: (password.match(/[0-9]/g) || []).length,
    special: (password.match(/[^a-zA-Z0-9\s]/g) || []).length,
  };

  return {
    ...groups,
    total: Object.values(groups).reduce((a, b) => a + b, 0),
    distribution: Object.entries(groups).map(([key, value]) => ({
      type: key,
      percentage: ((value / password.length) * 100).toFixed(1),
    })),
  };
}

function checkRequirements(analysis) {
  const requirements = [];
  const MIN_LENGTH = 8;
  const MAX_LENGTH = 128;

  if (analysis.length < MIN_LENGTH) {
    requirements.push(
      `Parol kamida ${MIN_LENGTH} ta belgidan iborat bo'lishi kerak`
    );
  }

  if (analysis.length > MAX_LENGTH) {
    requirements.push(
      `Parol ko'pi bilan ${MAX_LENGTH} ta belgidan iborat bo'lishi mumkin`
    );
  }

  if (!analysis.containsLowercase) {
    requirements.push("Kamida bitta kichik harf bo'lishi kerak");
  }

  if (!analysis.containsUppercase) {
    requirements.push("Kamida bitta katta harf bo'lishi kerak");
  }

  if (!analysis.containsNumbers) {
    requirements.push("Kamida bitta raqam bo'lishi kerak");
  }

  if (!analysis.containsSpecialChars) {
    requirements.push("Kamida bitta maxsus belgi bo'lishi kerak");
  }

  if (analysis.containsSpaces) {
    requirements.push("Parol bo'sh joy (space) tutmasligi kerak");
  }

  if (analysis.repeatingChars.length > 0) {
    requirements.push("Ketma-ket takrorlanuvchi belgilar bo'lmasligi kerak");
  }

  if (analysis.sequences.length > 0) {
    requirements.push(
      "Ketma-ket keluvchi harflar yoki raqamlar bo'lmasligi kerak"
    );
  }

  if (analysis.commonWords.length > 0) {
    requirements.push("Umumiy so'zlar ishlatilmasligi kerak");
  }

  return {
    meetsMinimalRequirements: requirements.length === 0,
    failedRequirements: requirements,
  };
}

function calculatePasswordStrength(analysis) {
  let score = 0;

  // Uzunlik uchun balllar
  score += Math.min(2, analysis.length / 8);

  // Har xil turdagi belgilar uchun balllar
  if (analysis.containsLowercase) score += 1;
  if (analysis.containsUppercase) score += 1;
  if (analysis.containsNumbers) score += 1;
  if (analysis.containsSpecialChars) score += 1;

  // Belgilar xilma-xilligi uchun balllar
  const uniqueCharRatio = analysis.uniqueCharCount / analysis.length;
  score += uniqueCharRatio;

  // Ketma-ket belgilar va umumiy so'zlar uchun ball ayirish
  score -= analysis.sequences.length * 0.5;
  score -= analysis.commonWords.length;
  score -= analysis.repeatingChars.length * 0.5;

  // Yakuniy ball (0 dan 10 gacha)
  const finalScore = Math.max(0, Math.min(10, score));

  return {
    score: finalScore,
    label: getStrengthLabel(finalScore),
  };
}

function getStrengthLabel(score) {
  if (score >= 8) return "Juda kuchli";
  if (score >= 6) return "Kuchli";
  if (score >= 4) return "O'rtacha";
  if (score >= 2) return "Kuchsiz";
  return "Juda kuchsiz";
}

function generatePasswordSuggestions(analysis) {
  const suggestions = [];

  if (analysis.length < 8) {
    suggestions.push("Parolni uzunroq qiling");
  }

  if (!analysis.containsUppercase) {
    suggestions.push("Katta harflardan foydalaning");
  }

  if (!analysis.containsLowercase) {
    suggestions.push("Kichik harflardan foydalaning");
  }

  if (!analysis.containsNumbers) {
    suggestions.push("Raqamlardan foydalaning");
  }

  if (!analysis.containsSpecialChars) {
    suggestions.push("Maxsus belgilardan foydalaning (!@#$%^&*)");
  }

  if (analysis.sequences.length > 0) {
    suggestions.push("Ketma-ket keluvchi belgilardan foydalanmang");
  }

  if (analysis.commonWords.length > 0) {
    suggestions.push("Umumiy so'zlardan foydalanmang");
  }

  return suggestions;
}

// Test qilish uchun misollar
console.log(checkPassword("password123")); // Kuchsiz parol
console.log(checkPassword("Password123!")); // O'rtacha parol
console.log(checkPassword("P@ssw0rd")); // O'rtacha parol
console.log(checkPassword("Strong#P@ssw0rd2024!")); // Kuchli parol
console.log(checkPassword("abc123")); // Juda kuchsiz parol
