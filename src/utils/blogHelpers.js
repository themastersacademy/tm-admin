/**
 * Calculate word count from text
 */
export const getWordCount = (text) => {
  if (!text || typeof text !== "string") return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
export const getReadingTime = (text) => {
  const words = getWordCount(text);
  const minutes = Math.ceil(words / 200);
  return minutes;
};

/**
 * Get excerpt from markdown text (first N characters)
 */
export const getExcerpt = (text, maxLength = 100) => {
  if (!text || typeof text !== "string") return "";

  // Remove markdown formatting for cleaner excerpt
  const plainText = text
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/`(.+?)`/g, "$1") // Remove code
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + "...";
};

/**
 * Format date to readable string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "Recently";

  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  // Format as "MMM DD, YYYY"
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
