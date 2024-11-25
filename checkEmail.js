function checkEmail(email) {
  // Bo'sh joylarni olib tashlash
  email = email.trim();

  // Email bo'sh emasligini tekshirish
  if (!email) {
    return {
      isValid: false,
      message: "Email bo'sh bo'lishi mumkin emas",
    };
  }

  // @ belgisi mavjudligini tekshirish
  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return {
      isValid: false,
      message: "Email manzilida @ belgisi bo'lishi shart",
    };
  }

  // @ belgisi faqat bitta bo'lishi kerak
  if (email.indexOf("@", atIndex + 1) !== -1) {
    return {
      isValid: false,
      message: "Email manzilida faqat bitta @ belgisi bo'lishi kerak",
    };
  }

  // Local va domain qismlarini ajratib olish
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  // Local qism tekshiruvi
  if (!checkLocalPart(localPart)) {
    return {
      isValid: false,
      message: "Email manzilining birinchi qismi noto'g'ri",
    };
  }

  // Domain qism tekshiruvi
  if (!checkDomainPart(domainPart)) {
    return {
      isValid: false,
      message: "Domain qismi noto'g'ri",
    };
  }

  // Umumiy uzunlikni tekshirish
  if (email.length > 254) {
    return {
      isValid: false,
      message: "Email manzili juda uzun",
    };
  }

  return {
    isValid: true,
    message: "Email manzili to'g'ri",
    normalizedEmail: email.toLowerCase(),
    localPart: localPart,
    domain: domainPart,
  };
}

function checkLocalPart(localPart) {
  // Local qism bo'sh bo'lmasligi kerak
  if (localPart.length === 0) {
    return false;
  }

  // Local qism uzunligi 64 belgidan oshmasligi kerak
  if (localPart.length > 64) {
    return false;
  }

  // Ruxsat etilgan belgilar tekshiruvi
  const allowedChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_";

  for (let char of localPart) {
    if (!allowedChars.includes(char)) {
      return false;
    }
  }

  // Nuqta bilan boshlanmasligi va tugamasligi kerak
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return false;
  }

  // Ketma-ket nuqtalar bo'lmasligi kerak
  if (localPart.includes("..")) {
    return false;
  }

  return true;
}

function checkDomainPart(domainPart) {
  // Domain bo'sh bo'lmasligi kerak
  if (domainPart.length === 0) {
    return false;
  }

  // Domain uzunligi 255 belgidan oshmasligi kerak
  if (domainPart.length > 255) {
    return false;
  }

  // Nuqta bo'lishi shart
  if (!domainPart.includes(".")) {
    return false;
  }

  // Ruxsat etilgan belgilar tekshiruvi
  const allowedChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-";

  for (let char of domainPart) {
    if (!allowedChars.includes(char)) {
      return false;
    }
  }

  // Nuqta bilan boshlanmasligi va tugamasligi kerak
  if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
    return false;
  }

  // Ketma-ket nuqtalar bo'lmasligi kerak
  if (domainPart.includes("..")) {
    return false;
  }

  // Domain qismlari tekshiruvi
  const parts = domainPart.split(".");
  if (parts.length < 2) {
    return false;
  }

  // Har bir qism bo'sh bo'lmasligi va uzunligi 63 dan oshmasligi kerak
  for (let part of parts) {
    if (part.length === 0 || part.length > 63) {
      return false;
    }

    // Domain qismlari raqam bilan boshlanmasligi kerak
    if (!isNaN(parseInt(part[0]))) {
      return false;
    }
  }

  return true;
}

// Test qilish uchun misollar
console.log(checkEmail("user@example.com"));
console.log(checkEmail("test.email@domain.co.uk"));
console.log(checkEmail("invalid@email")); // Xato: domain noto'g'ri
console.log(checkEmail("user@.com")); // Xato: domain noto'g'ri
console.log(checkEmail("user.@domain.com")); // Xato: local qism oxirida nuqta
console.log(checkEmail("user..name@domain.com")); // Xato: ketma-ket nuqtalar
console.log(checkEmail("user@domain..com")); // Xato: domain da ketma-ket nuqtalar
