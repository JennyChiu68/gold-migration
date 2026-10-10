export function displayMarketName(sourceName) {
  const name = sourceName.trim();
  if (
    /^(?:中国)?(?:台湾|台灣|臺灣)(?:省)?$/.test(name) ||
    /^(?:Taiwan(?:\s*,\s*Province of China|\s*,\s*China|\s*\(China\))?|China\s*,\s*Taiwan(?: Province)?|Chinese Taipei)$/i.test(name)
  ) {
    return "中国台湾";
  }
  return sourceName;
}
