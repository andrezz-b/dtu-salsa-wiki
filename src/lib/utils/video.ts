interface VideoData {
  id: string;
  isShort: boolean;
  start?: number;
  end?: number;
}

function extractTimestamps(url: string): Pick<VideoData, "start" | "end"> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {};
  }

  const rawStart = parsedUrl.searchParams.get("start");
  const rawEnd = parsedUrl.searchParams.get("end");

  const start = rawStart !== null ? parseInt(rawStart, 10) : undefined;
  const end = rawEnd !== null ? parseInt(rawEnd, 10) : undefined;

  const validStart =
    start !== undefined && !isNaN(start) && start >= 0 ? start : undefined;
  const validEnd =
    end !== undefined && !isNaN(end) && end > 0 ? end : undefined;

  // Discard both if end is not strictly greater than start
  if (
    validStart !== undefined &&
    validEnd !== undefined &&
    validEnd <= validStart
  ) {
    return {};
  }

  const result: Pick<VideoData, "start" | "end"> = {};
  if (validStart !== undefined) result.start = validStart;
  if (validEnd !== undefined) result.end = validEnd;
  return result;
}

export const extractVideoData = (url: string): VideoData | null => {
  if (!url) return null;

  // Check if it's a YouTube Short
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/);
  if (shortsMatch && shortsMatch[1].length === 11) {
    return {
      id: shortsMatch[1],
      isShort: true,
      ...extractTimestamps(url),
    };
  }

  // Check for regular YouTube video formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return {
      id: match[2],
      isShort: false,
      ...extractTimestamps(url),
    };
  }

  return null;
};
