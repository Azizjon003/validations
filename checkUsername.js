function checkUsername(username) {
  // Boshlang'ich tekshiruv
  if (!username) {
    return {
      isValid: false,
      message: "Username bo'sh bo'lishi mumkin emas",
    };
  }

  // Bo'sh joylarni olib tashlash
  username = username.trim();

  // Minimal va maksimal uzunlik
  const MIN_LENGTH = 3;
  const MAX_LENGTH = 20;

  if (username.length < MIN_LENGTH) {
    return {
      isValid: false,
      message: `Username kamida ${MIN_LENGTH} ta belgidan iborat bo'lishi kerak`,
    };
  }

  if (username.length > MAX_LENGTH) {
    return {
      isValid: false,
      message: `Username ko'pi bilan ${MAX_LENGTH} ta belgidan iborat bo'lishi mumkin`,
    };
  }

  // Bo'sh joylar tekshiruvi
  if (username.includes(" ")) {
    return {
      isValid: false,
      message: "Username bo'sh joy (space) tutmasligi kerak",
    };
  }

  // Ruxsat etilgan belgilar tekshiruvi
  const allowedCharsRegex = /^[a-zA-Z0-9._-]+$/;
  if (!allowedCharsRegex.test(username)) {
    return {
      isValid: false,
      message:
        "Username faqat harflar, raqamlar va (_, ., -) belgilaridan iborat bo'lishi mumkin",
    };
  }

  // Maxsus belgilar bilan boshlanmasligi va tugamasligi
  if (
    username.startsWith(".") ||
    username.startsWith("_") ||
    username.startsWith("-") ||
    username.endsWith(".") ||
    username.endsWith("_") ||
    username.endsWith("-")
  ) {
    return {
      isValid: false,
      message:
        "Username maxsus belgilar (., _, -) bilan boshlanishi yoki tugashi mumkin emas",
    };
  }

  // Ketma-ket maxsus belgilar tekshiruvi
  if (
    username.includes("..") ||
    username.includes("__") ||
    username.includes("--") ||
    username.includes("._") ||
    username.includes("_.") ||
    username.includes("-.") ||
    username.includes(".-") ||
    username.includes("_-") ||
    username.includes("-_")
  ) {
    return {
      isValid: false,
      message: "Ketma-ket maxsus belgilar ishlatish mumkin emas",
    };
  }

  // Raqam bilan boshlanmaslik tekshiruvi
  if (!isNaN(parseInt(username[0]))) {
    return {
      isValid: false,
      message: "Username raqam bilan boshlanishi mumkin emas",
    };
  }

  // Taqiqlangan so'zlar tekshiruvi
  const forbiddenWords = [
    "admin",
    "administrator",
    "moderator",
    "root",
    "system",
    "support",
    "help",
    "info",
    "webmaster",
    "security",
  ];

  const lowercaseUsername = username.toLowerCase();
  for (const word of forbiddenWords) {
    if (lowercaseUsername === word) {
      return {
        isValid: false,
        message: "Bu username tizim tomonidan taqiqlangan",
      };
    }
  }

  // Username tahlili
  const analysis = analyzeUsername(username);

  return {
    isValid: true,
    message: "Username to'g'ri",
    normalizedUsername: username.toLowerCase(),
    analysis: analysis,
    suggestions: generateSuggestions(username),
  };
}

function analyzeUsername(username) {
  return {
    length: username.length,
    containsNumbers: /[0-9]/.test(username),
    containsUppercase: /[A-Z]/.test(username),
    containsLowercase: /[a-z]/.test(username),
    containsSpecialChars: /[._-]/.test(username),
    strength: calculateUsernameStrength(username),
  };
}

function calculateUsernameStrength(username) {
  let strength = 0;

  // Uzunlik bo'yicha ball
  if (username.length >= 8) strength += 2;
  else if (username.length >= 5) strength += 1;

  // Turli xil belgilar uchun balllar
  if (/[A-Z]/.test(username)) strength += 1;
  if (/[a-z]/.test(username)) strength += 1;
  if (/[0-9]/.test(username)) strength += 1;
  if (/[._-]/.test(username)) strength += 1;

  // Strength darajasini qaytarish
  if (strength >= 5) return "Kuchli";
  if (strength >= 3) return "O'rta";
  return "Oddiy";
}

function generateSuggestions(username) {
  const suggestions = [];
  const lowercaseUsername = username.toLowerCase();

  // Agar username band bo'lsa, quyidagi variantlarni taklif qilish mumkin
  if (username.length < 20) {
    suggestions.push(lowercaseUsername + Math.floor(Math.random() * 100));
    suggestions.push(lowercaseUsername + "_" + Math.floor(Math.random() * 100));
    suggestions.push("the_" + lowercaseUsername);
  }

  return suggestions;
}

// Test qilish uchun misollar
console.log(checkUsername("John_Doe"));
console.log(checkUsername("user123"));
console.log(checkUsername("ad")); // Xato: juda qisqa
console.log(checkUsername("admin")); // Xato: taqiqlangan so'z
console.log(checkUsername("user__name")); // Xato: ketma-ket maxsus belgilar
console.log(checkUsername("123user")); // Xato: raqam bilan boshlangan
console.log(checkUsername("user@name")); // Xato: taqiqlangan belgi
console.log(checkUsername(".username")); // Xato: nuqta bilan boshlangan
