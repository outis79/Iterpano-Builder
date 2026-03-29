(function () {
  function createProjectImportController(options) {
    const {
      generatedTiles,
      loadProject,
      autosave,
      updateStatus,
      blobToDataUrl,
    } = options;

    function importProjectFile(file) {
      if (String(file?.name || '').toLowerCase().endsWith('.zip')) {
        importProjectPackageZip(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          generatedTiles.clear();
          loadProject(data);
          autosave();
          updateStatus('Project imported.');
        } catch (error) {
          console.error(error);
          updateStatus('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }

    async function importProjectPackageZip(file) {
      if (!window.JSZip) {
        updateStatus('ZIP import requires JSZip.');
        return;
      }
      try {
        updateStatus('Reading project package ZIP...');
        const zip = await window.JSZip.loadAsync(file);
        const projectEntry = zip.file('project.json') || zip.file(/(^|\/)project\.json$/i)[0];
        if (!projectEntry) {
          updateStatus('Invalid project package ZIP: missing project.json.');
          return;
        }
        const projectText = await projectEntry.async('string');
        const project = JSON.parse(projectText);

        const nextGeneratedTiles = new Map();
        const tileEntries = Object.values(zip.files).filter((entry) => {
          return !entry.dir && /^tiles\/.+/i.test(entry.name);
        });

        for (const entry of tileEntries) {
          const blob = await entry.async('blob');
          const dataUrl = await blobToDataUrl(blob);
          const match = entry.name.match(/^tiles\/([^/]+)\/.+$/i);
          if (!match) continue;
          const sceneId = match[1];
          if (!nextGeneratedTiles.has(sceneId)) {
            nextGeneratedTiles.set(sceneId, {});
          }
          nextGeneratedTiles.get(sceneId)[entry.name] = dataUrl;
        }

        generatedTiles.clear();
        nextGeneratedTiles.forEach((tiles, sceneId) => {
          generatedTiles.set(sceneId, tiles);
        });

        loadProject(project);
        autosave();
        updateStatus(`Project package imported (${nextGeneratedTiles.size} tiled scene(s)).`);
      } catch (error) {
        console.error(error);
        updateStatus('Invalid project package ZIP.');
      }
    }

    return {
      importProjectFile,
      importProjectPackageZip,
    };
  }

  window.IterpanoEditorProjectImport = {
    createProjectImportController,
  };
})();
