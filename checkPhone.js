function checkUzbekPhoneNumber(phoneNumber) {
  // Barcha bo'sh joylarni olib tashlash
  phoneNumber = phoneNumber.replace(/\s+/g, "");

  // Agar raqam + bilan boshlansa, uni olib tashlash
  if (phoneNumber.startsWith("+")) {
    phoneNumber = phoneNumber.slice(1);
  }

  // Agar raqam 998 bilan boshlansa
  if (phoneNumber.startsWith("998")) {
    phoneNumber = phoneNumber.slice(3);
  }

  // Raqamning uzunligini tekshirish (9 raqam bo'lishi kerak)
  if (phoneNumber.length !== 9) {
    return {
      isValid: false,
      message: "Raqam uzunligi noto'g'ri",
    };
  }

  // Faqat raqamlardan iborat ekanligini tekshirish
  for (let i = 0; i < phoneNumber.length; i++) {
    if (phoneNumber[i] < "0" || phoneNumber[i] > "9") {
      return {
        isValid: false,
        message: "Raqam faqat sonlardan iborat bo'lishi kerak",
      };
    }
  }

  // O'zbekiston mobil operator kodlarini tekshirish
  const operatorCodes = ["90", "91", "93", "94", "95", "97", "98", "99", "88"];
  const operatorCode = phoneNumber.slice(0, 2);

  if (!operatorCodes.includes(operatorCode)) {
    return {
      isValid: false,
      message: "Noto'g'ri operator kodi",
    };
  }

  return {
    isValid: true,
    message: "Raqam to'g'ri",
    operator: getOperatorName(operatorCode),
    formattedNumber: formatPhoneNumber(phoneNumber),
  };
}

function getOperatorName(code) {
  const operators = {
    90: "Beeline",
    91: "Beeline",
    93: "Ucell",
    94: "Ucell",
    95: "Uzmobile",
    97: "MobiUz",
    98: "Perfectum",
    99: "Uzmobile",
    88: "MobiUz",
  };
  return operators[code] || "Noma'lum operator";
}

function formatPhoneNumber(number) {
  return `+998 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(
    5,
    7
  )} ${number.slice(7, 9)}`;
}

// Test qilish uchun misollar
console.log(checkUzbekPhoneNumber("+998901234567"));
console.log(checkUzbekPhoneNumber("998931234567"));
console.log(checkUzbekPhoneNumber("901234567"));
console.log(checkUzbekPhoneNumber("95123456")); // Xato: 9 ta raqam emas
console.log(checkUzbekPhoneNumber("9912345ab")); // Xato: harflar bor
