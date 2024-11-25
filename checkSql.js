function checkSQLInjection(input) {
  // Agar input bo'sh bo'lsa
  if (!input || typeof input !== "string") {
    return {
      isSafe: false,
      message: "Kiritilgan ma'lumot bo'sh yoki string emas",
      risk: "none",
      details: null,
    };
  }

  // SQL in'eksiya belgilari va kalitlarini aniqlash
  const analysis = analyzeSQLInjection(input);

  // Xavf darajasini aniqlash
  const risk = calculateRiskLevel(analysis);

  // Tozalangan versiyasini yaratish
  const sanitized = sanitizeInput(input);

  // Natijani qaytarish
  return {
    isSafe: risk.level === "safe",
    message: risk.message,
    risk: risk.level,
    details: {
      analysis: analysis,
      risk: risk,
      sanitized: sanitized,
      recommendations: generateRecommendations(analysis),
    },
  };
}

function analyzeSQLInjection(input) {
  const analysis = {
    originalInput: input,
    length: input.length,
    containsSQLKeywords: false,
    containsSQLOperators: false,
    containsSQLComments: false,
    containsSQLFunctions: false,
    containsSpecialChars: false,
    suspiciousPatterns: [],
    detectedKeywords: [],
    detectedOperators: [],
    detectedFunctions: [],
    detectedSpecialChars: [],
  };

  // SQL kalit so'zlarini tekshirish
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "UNION",
    "WHERE",
    "HAVING",
    "GROUP BY",
    "ORDER BY",
    "FROM",
    "JOIN",
    "CREATE",
    "ALTER",
    "TRUNCATE",
    "DECLARE",
    "EXEC",
  ];

  // SQL operatorlarini tekshirish
  const sqlOperators = [
    "=",
    ">",
    "<",
    ">=",
    "<=",
    "<>",
    "!=",
    "LIKE",
    "IN",
    "BETWEEN",
    "AND",
    "OR",
    "NOT",
  ];

  // SQL funksiyalarini tekshirish
  const sqlFunctions = [
    "COUNT",
    "SUM",
    "AVG",
    "MAX",
    "MIN",
    "CONCAT",
    "SUBSTRING",
    "LENGTH",
    "UPPER",
    "LOWER",
    "CONVERT",
    "CAST",
    "COALESCE",
    "ISNULL",
  ];

  // Maxsus belgilarni tekshirish
  const specialChars = [
    ";",
    "--",
    "/*",
    "*/",
    "#",
    "@@",
    "@",
    "'",
    '"',
    "`",
    "\\",
    "%",
    "_",
  ];

  // Input ni bo'laklarga ajratish
  const words = input.split(/\s+/);

  // Har bir so'zni tekshirish
  words.forEach((word) => {
    const upperWord = word.toUpperCase();

    // Kalit so'zlarni tekshirish
    sqlKeywords.forEach((keyword) => {
      if (upperWord.includes(keyword)) {
        analysis.containsSQLKeywords = true;
        analysis.detectedKeywords.push({
          keyword: keyword,
          position: input.toUpperCase().indexOf(keyword),
        });
      }
    });

    // Operatorlarni tekshirish
    sqlOperators.forEach((operator) => {
      if (upperWord.includes(operator)) {
        analysis.containsSQLOperators = true;
        analysis.detectedOperators.push({
          operator: operator,
          position: input.toUpperCase().indexOf(operator),
        });
      }
    });

    // Funksiyalarni tekshirish
    sqlFunctions.forEach((func) => {
      if (upperWord.includes(func)) {
        analysis.containsSQLFunctions = true;
        analysis.detectedFunctions.push({
          function: func,
          position: input.toUpperCase().indexOf(func),
        });
      }
    });
  });

  // Maxsus belgilarni tekshirish
  specialChars.forEach((char) => {
    if (input.includes(char)) {
      analysis.containsSpecialChars = true;
      analysis.detectedSpecialChars.push({
        character: char,
        position: input.indexOf(char),
      });
    }
  });

  // SQL kommentariylarni tekshirish
  if (
    input.includes("--") ||
    input.includes("/*") ||
    input.includes("*/") ||
    input.includes("#")
  ) {
    analysis.containsSQLComments = true;
  }

  // Shubhali patternlarni tekshirish
  const suspiciousPatterns = [
    /\bOR\b.*?=.*?/i, // OR operatori
    /\bAND\b.*?=.*?/i, // AND operatori
    /'\s*OR\s*'1'\s*=\s*'1/i, // Tautologies
    /--/, // SQL kommentariylar
    /\/\*/, // Ko'p qatorli kommentariylar
    /;\s*$/, // Oxirida nuqta-vergul
    /''\s*;/, // Bo'sh string bilan tugash
    /\bdrop\b/i, // DROP so'zi
    /\bexec\b/i, // EXEC so'zi
    /\bxp_\w+/i, // xp_ bilan boshlanuvchi protseduralar
  ];

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(input)) {
      analysis.suspiciousPatterns.push({
        pattern: pattern.toString(),
        matches: input.match(pattern),
      });
    }
  });

  return analysis;
}

function calculateRiskLevel(analysis) {
  let riskScore = 0;
  let riskDetails = [];

  // SQL kalit so'zlari uchun
  if (analysis.containsSQLKeywords) {
    riskScore += 3;
    riskDetails.push("SQL kalit so'zlari aniqlandi");
  }

  // SQL operatorlari uchun
  if (analysis.containsSQLOperators) {
    riskScore += 2;
    riskDetails.push("SQL operatorlari aniqlandi");
  }

  // SQL funksiyalari uchun
  if (analysis.containsSQLFunctions) {
    riskScore += 2;
    riskDetails.push("SQL funksiyalari aniqlandi");
  }

  // Maxsus belgilar uchun
  if (analysis.containsSpecialChars) {
    riskScore += 2;
    riskDetails.push("Maxsus belgilar aniqlandi");
  }

  // SQL kommentariylar uchun
  if (analysis.containsSQLComments) {
    riskScore += 3;
    riskDetails.push("SQL kommentariylari aniqlandi");
  }

  // Shubhali patternlar uchun
  if (analysis.suspiciousPatterns.length > 0) {
    riskScore += analysis.suspiciousPatterns.length * 2;
    riskDetails.push("Shubhali patternlar aniqlandi");
  }

  // Xavf darajasini aniqlash
  let level = "safe";
  let message = "Kiritilgan ma'lumot xavfsiz";

  if (riskScore >= 8) {
    level = "high";
    message = "Yuqori xavf! SQL in'eksiya aniqlandi";
  } else if (riskScore >= 4) {
    level = "medium";
    message = "O'rta xavf! Shubhali belgilar aniqlandi";
  } else if (riskScore >= 2) {
    level = "low";
    message = "Past xavf! Ba'zi shubhali elementlar bor";
  }

  return {
    level: level,
    score: riskScore,
    message: message,
    details: riskDetails,
  };
}

function sanitizeInput(input) {
  let sanitized = input;

  // Maxsus belgilarni almashtirish
  sanitized = sanitized.replace(/[;'"\\]/g, "");

  // SQL kalit so'zlarini tozalash
  const keywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "UNION"];
  keywords.forEach((keyword) => {
    const regex = new RegExp(keyword, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  // Kommentariylarni tozalash
  sanitized = sanitized.replace(/--/g, "");
  sanitized = sanitized.replace(/\/\*|\*\//g, "");
  sanitized = sanitized.replace(/#/g, "");

  // Ko'p bo'sh joylarni bitta bo'sh joy bilan almashtirish
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}

function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.containsSQLKeywords) {
    recommendations.push("SQL kalit so'zlarini kiritmang");
  }

  if (analysis.containsSQLOperators) {
    recommendations.push("SQL operatorlarini kiritmang");
  }

  if (analysis.containsSpecialChars) {
    recommendations.push("Maxsus belgilardan foydalanmang");
  }

  if (analysis.containsSQLComments) {
    recommendations.push("SQL kommentariylarini kiritmang");
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Ma'lumotni xavfsiz kiritish uchun maxsus belgilardan foydalanmang"
    );
  }

  return recommendations;
}

// Test qilish uchun misollar
console.log(checkSQLInjection("Hello World")); // Xavfsiz
console.log(checkSQLInjection("SELECT * FROM users")); // Xavfli
console.log(checkSQLInjection("admin' OR '1'='1")); // Xavfli
console.log(checkSQLInjection("Robert'); DROP TABLE users;--")); // Juda xavfli
console.log(checkSQLInjection("Test'--")); // O'rta xavf
