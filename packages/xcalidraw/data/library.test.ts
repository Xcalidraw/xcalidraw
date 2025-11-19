import { validateLibraryUrl } from "./library";

describe("validateLibraryUrl", () => {
  it("should validate hostname & pathname", () => {
    // valid hostnames
    // -------------------------------------------------------------------------
    expect(
      validateLibraryUrl("https://www.xcalidraw.com", ["xcalidraw.com"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com", ["xcalidraw.com"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://library.xcalidraw.com", ["xcalidraw.com"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://library.xcalidraw.com", [
        "library.xcalidraw.com",
      ]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/", ["xcalidraw.com/"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com", ["xcalidraw.com/"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/", ["xcalidraw.com"]),
    ).toBe(true);

    // valid pathnames
    // -------------------------------------------------------------------------
    expect(
      validateLibraryUrl("https://xcalidraw.com/path", ["xcalidraw.com"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/path/", ["xcalidraw.com"]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/specific/path", [
        "xcalidraw.com/specific/path",
      ]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/specific/path/", [
        "xcalidraw.com/specific/path",
      ]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/specific/path", [
        "xcalidraw.com/specific/path/",
      ]),
    ).toBe(true);
    expect(
      validateLibraryUrl("https://xcalidraw.com/specific/path/other", [
        "xcalidraw.com/specific/path",
      ]),
    ).toBe(true);

    // invalid hostnames
    // -------------------------------------------------------------------------
    expect(() =>
      validateLibraryUrl("https://xxcalidraw.com", ["xcalidraw.com"]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://x-xcalidraw.com", ["xcalidraw.com"]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://xcalidraw.comx", ["xcalidraw.com"]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://xcalidraw.comx", ["xcalidraw.com"]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://xcalidraw.com.mx", ["xcalidraw.com"]),
    ).toThrow();
    // protocol must be https
    expect(() =>
      validateLibraryUrl("http://xcalidraw.com.mx", ["xcalidraw.com"]),
    ).toThrow();

    // invalid pathnames
    // -------------------------------------------------------------------------
    expect(() =>
      validateLibraryUrl("https://xcalidraw.com/specific/other/path", [
        "xcalidraw.com/specific/path",
      ]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://xcalidraw.com/specific/paths", [
        "xcalidraw.com/specific/path",
      ]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://xcalidraw.com/specific/path-s", [
        "xcalidraw.com/specific/path",
      ]),
    ).toThrow();
    expect(() =>
      validateLibraryUrl("https://xcalidraw.com/some/specific/path", [
        "xcalidraw.com/specific/path",
      ]),
    ).toThrow();
  });
});
