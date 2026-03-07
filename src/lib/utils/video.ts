interface VideoData {
  id: string;
  isShort: boolean;
}
export const extractVideoData = (url: string): VideoData | null => {
  if (!url) return null;

  // Check if it's a YouTube Short
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/);
  if (shortsMatch && shortsMatch[1].length === 11) {
    return {
      id: shortsMatch[1],
      isShort: true,
    };
  }

  // Check for regular YouTube video formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return {
      id: match[2],
      isShort: false,
    };
  }

  return null;
};
