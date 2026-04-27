import { describe, it } from "node:test";
import assert from "node:assert";
import { extractVideoData } from "../src/lib/utils/video.js";

describe("extractVideoData", () => {
  describe("returns null for invalid input", () => {
    it("should return null for empty string", () => {
      assert.strictEqual(extractVideoData(""), null);
    });

    it("should return null for non-YouTube URL", () => {
      assert.strictEqual(extractVideoData("https://vimeo.com/123456789"), null);
    });

    it("should return null for malformed URL with short ID", () => {
      assert.strictEqual(extractVideoData("https://youtu.be/short"), null);
    });
  });

  describe("regular YouTube URLs", () => {
    it("should parse youtu.be short link", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ");
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });

    it("should parse youtube.com/watch?v= URL", () => {
      const result = extractVideoData(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });

    it("should parse embed URL", () => {
      const result = extractVideoData(
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });

    it("should ignore tracking params like si=", () => {
      const result = extractVideoData(
        "https://youtu.be/dQw4w9WgXcQ?si=HZqfRdEDCklucIIm",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });
  });

  describe("YouTube Shorts", () => {
    it("should parse youtube.com/shorts/ URL", () => {
      const result = extractVideoData(
        "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: true });
    });
  });

  describe("start param", () => {
    it("should extract start from youtu.be URL", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?start=30");
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: false,
        start: 30,
      });
    });

    it("should extract start from watch URL", () => {
      const result = extractVideoData(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=45",
      );
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: false,
        start: 45,
      });
    });

    it("should accept start=0", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?start=0");
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: false,
        start: 0,
      });
    });

    it("should discard non-numeric start", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?start=abc");
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });

    it("should discard negative start", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?start=-5");
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });
  });

  describe("end param", () => {
    it("should extract end without start", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?end=90");
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: false,
        end: 90,
      });
    });

    it("should discard non-numeric end", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?end=abc");
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });

    it("should discard end=0", () => {
      const result = extractVideoData("https://youtu.be/dQw4w9WgXcQ?end=0");
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });
  });

  describe("start and end together", () => {
    it("should include both when end > start", () => {
      const result = extractVideoData(
        "https://youtu.be/dQw4w9WgXcQ?start=10&end=60",
      );
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: false,
        start: 10,
        end: 60,
      });
    });

    it("should discard both when end == start", () => {
      const result = extractVideoData(
        "https://youtu.be/dQw4w9WgXcQ?start=60&end=60",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });

    it("should discard both when end < start", () => {
      const result = extractVideoData(
        "https://youtu.be/dQw4w9WgXcQ?start=90&end=10",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: false });
    });
  });

  describe("Shorts with timestamps", () => {
    it("should extract start from Shorts URL", () => {
      const result = extractVideoData(
        "https://www.youtube.com/shorts/dQw4w9WgXcQ?start=5",
      );
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: true,
        start: 5,
      });
    });

    it("should discard both start and end from Shorts URL when end <= start", () => {
      const result = extractVideoData(
        "https://www.youtube.com/shorts/dQw4w9WgXcQ?start=20&end=10",
      );
      assert.deepStrictEqual(result, { id: "dQw4w9WgXcQ", isShort: true });
    });
  });

  describe("tracking params alongside timestamps", () => {
    it("should preserve start when si tracking param is present", () => {
      const result = extractVideoData(
        "https://youtu.be/dQw4w9WgXcQ?si=HZqfRdEDCklucIIm&start=5",
      );
      assert.deepStrictEqual(result, {
        id: "dQw4w9WgXcQ",
        isShort: false,
        start: 5,
      });
    });
  });
});
