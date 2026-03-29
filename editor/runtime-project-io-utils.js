(function () {
  const VIEWER_RUNTIME_PATHS = [
    'viewer/index.html',
    'viewer/app.js',
    'viewer/runtime-ui.js',
    'viewer/runtime-gyro.js',
    'viewer/runtime-floorplan.js',
    'viewer/runtime-mobile-panels.js',
    'viewer/runtime-hotspots.js',
    'viewer/styles.css',
    'viewer/vendor/marzipano.js',
    'viewer/vendor/bowser.min.js',
    'viewer/vendor/screenfull.min.js',
    'viewer/vendor/reset.min.css'
  ];

  function createProjectIoUtilsController() {
    function sanitizeFilename(name) {
      return String(name || 'asset')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-z0-9_-]+/gi, '-')
        .toLowerCase()
        .slice(0, 60);
    }

    function dataUrlToFile(dataUrl, fallbackName) {
      const [meta, data] = String(dataUrl || '').split(',');
      const mimeMatch = meta?.match(/data:(.*?);base64/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const extension = mime.split('/')[1] || 'bin';
      const filename = `${sanitizeFilename(fallbackName || 'asset')}.${extension}`;
      const binary = window.atob(data || '');
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: mime });
      return { filename, blob };
    }

    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }

    function blobToString(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blob);
      });
    }

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    function buildStaticPackageRootIndexHtml() {
      return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=./viewer/index.html">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Open Tour</title>
</head>
<body>
  <p>Redirecting to <a href="./viewer/index.html">viewer/index.html</a>...</p>
</body>
</html>
`;
    }

    async function writeFile(directoryHandle, filename, blob) {
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    }

    async function writePathFile(root, path, blob) {
      const parts = String(path || '').split('/');
      let dir = root;
      for (let i = 0; i < parts.length - 1; i += 1) {
        dir = await dir.getDirectoryHandle(parts[i], { create: true });
      }
      await writeFile(dir, parts[parts.length - 1], blob);
    }

    async function fetchRuntimeFile(path) {
      const response = await fetch(`../${path}`);
      if (!response.ok) {
        throw new Error(`Missing runtime file: ${path}`);
      }
      return await response.blob();
    }

    async function collectViewerRuntimeFiles() {
      const files = [];
      for (const path of VIEWER_RUNTIME_PATHS) {
        const blob = await fetchRuntimeFile(path);
        files.push({ path, blob });
      }
      return files;
    }

    return {
      sanitizeFilename,
      dataUrlToFile,
      downloadBlob,
      blobToString,
      blobToDataUrl,
      buildStaticPackageRootIndexHtml,
      writeFile,
      writePathFile,
      fetchRuntimeFile,
      collectViewerRuntimeFiles,
    };
  }

  window.IterpanoEditorProjectIoUtils = {
    createProjectIoUtilsController,
  };
})();
