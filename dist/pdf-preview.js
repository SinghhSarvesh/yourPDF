// Keep library cleanup behind one adapter: PDF.js 6 uses loadingTask.destroy().
export async function openLocalPdf(lib, data, resources = {}) {
  const loadingTask = lib.getDocument({
    data, isEvalSupported: false, enableScripting: false, enableXfa: false,
    cMapUrl: '/vendor/cmaps/', cMapPacked: true,
    standardFontDataUrl: '/vendor/standard_fonts/', wasmUrl: '/vendor/wasm/',
    disableAutoFetch: true, ...resources,
  });
  try {
    const document = await loadingTask.promise;
    Object.defineProperty(document, 'destroy', {value: () => loadingTask.destroy(), configurable:true});
    return document;
  } catch (error) {
    try { await loadingTask.destroy(); } catch {}
    throw error;
  }
}
