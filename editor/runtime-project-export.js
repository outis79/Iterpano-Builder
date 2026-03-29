(function () {
  function createProjectExportController(options) {
    const {
      state,
      generatedTiles,
      updateStatus,
      ensureProjectMediaStore,
      dataUrlToFile,
      downloadBlob,
      collectStaticExportWarnings,
      isSceneLinkHotspot,
      convertInfoBlocksToRichHtml,
      sanitizeRichHtml,
      parseMediaReference,
      collectViewerRuntimeFiles,
      blobToString,
      buildStaticPackageRootIndexHtml,
      writeFile,
      writePathFile,
    } = options;

    function exportProject() {
      if (!state.project) return;
      const blob = new Blob([JSON.stringify(state.project, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `${state.project.project.name || 'tour-project'}.json`);
    }

    async function exportProjectPackageZip() {
      if (!state.project) return;
      if (!window.JSZip) {
        updateStatus('Project package export requires JSZip.');
        return;
      }
      const project = JSON.parse(JSON.stringify(state.project));
      const zip = new window.JSZip();
      zip.file('project.json', JSON.stringify(project, null, 2));

      for (const [, tiles] of generatedTiles.entries()) {
        Object.entries(tiles || {}).forEach(([path, dataUrl]) => {
          if (!path || !dataUrl) return;
          const fileInfo = dataUrlToFile(dataUrl, path.split('/').pop() || 'tile.jpg');
          if (!fileInfo) return;
          zip.file(path, fileInfo.blob);
        });
      }

      updateStatus('Building project package ZIP...');
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        updateStatus(`Project package ZIP: ${Math.round(metadata.percent)}%`);
      });
      downloadBlob(content, `${state.project.project.name || 'tour-project'}-project-package.zip`);
      updateStatus('Project package ZIP export complete.');
    }

    async function exportStaticPackage() {
      if (!state.project) return;
      const warnings = collectStaticExportWarnings(state.project);
      if (warnings.missingTiles.length || warnings.insufficientLinks.length) {
        const lines = ['Static export warnings:', ''];
        if (warnings.missingTiles.length) {
          lines.push('Scenes without tiles:');
          warnings.missingTiles.forEach((scene) => {
            lines.push(`- ${scene.name || scene.id}`);
          });
          lines.push('');
        }
        if (warnings.insufficientLinks.length) {
          lines.push('Scenes with fewer than 2 scene links:');
          warnings.insufficientLinks.forEach(({ scene, linkCount }) => {
            lines.push(`- ${scene.name || scene.id} (${linkCount} link${linkCount === 1 ? '' : 's'})`);
          });
          lines.push('');
        }
        lines.push('Continue with static export?');
        if (!window.confirm(lines.join('\n'))) {
          updateStatus('Static export cancelled.');
          return;
        }
      }

      const project = JSON.parse(JSON.stringify(state.project));
      const assetDownloads = [];
      const usedAssetOutputPaths = new Set();
      const registerAssetFile = (fileInfo, folder) => {
        let filename = fileInfo.filename;
        let outputPath = `viewer/${folder}/${filename}`;
        let suffix = 1;
        while (usedAssetOutputPaths.has(outputPath)) {
          const dotIndex = filename.lastIndexOf('.');
          const base = dotIndex === -1 ? filename : filename.slice(0, dotIndex);
          const ext = dotIndex === -1 ? '' : filename.slice(dotIndex);
          filename = `${base}-${suffix}${ext}`;
          outputPath = `viewer/${folder}/${filename}`;
          suffix += 1;
        }
        usedAssetOutputPaths.add(outputPath);
        assetDownloads.push({ ...fileInfo, filename, folder, outputPath });
        return `${folder}/${filename}`;
      };

      ensureProjectMediaStore(project).forEach((media) => {
        if (media.dataUrl) {
          const fileInfo = dataUrlToFile(media.dataUrl, media.name || media.id);
          if (!fileInfo) return;
          media.path = registerAssetFile(fileInfo, 'media');
          delete media.dataUrl;
        }
      });
      const mediaPathById = new Map((project.assets.media || []).map((media) => [media.id, media.path || '']));

      const inlineImagePathByDataUrl = new Map();
      (project.scenes || []).forEach((scene) => {
        (scene.hotspots || []).forEach((hotspot, hotspotIndex) => {
          if (isSceneLinkHotspot(hotspot)) return;
          const sourceHtml = typeof hotspot.richContentHtml === 'string'
            ? hotspot.richContentHtml
            : convertInfoBlocksToRichHtml(hotspot, project);
          const template = document.createElement('template');
          template.innerHTML = sanitizeRichHtml(sourceHtml);
          const srcNodes = template.content.querySelectorAll('[src]');

          srcNodes.forEach((node, imageIndex) => {
            const src = String(node.getAttribute('src') || '').trim();
            const mediaId = parseMediaReference(src);
            if (mediaId) {
              const mediaPath = mediaPathById.get(mediaId) || '';
              if (mediaPath) {
                node.setAttribute('src', mediaPath);
              } else {
                node.removeAttribute('src');
              }
              return;
            }
            if (!src.startsWith('data:image/')) return;
            if (inlineImagePathByDataUrl.has(src)) {
              node.setAttribute('src', inlineImagePathByDataUrl.get(src));
              return;
            }
            const fileInfo = dataUrlToFile(src, `${scene.id}-${hotspot.id || hotspotIndex}-img-${imageIndex + 1}`);
            if (!fileInfo) return;
            const relativePath = registerAssetFile(fileInfo, 'media');
            inlineImagePathByDataUrl.set(src, relativePath);
            node.setAttribute('src', relativePath);
          });

          hotspot.richContentHtml = sanitizeRichHtml(template.innerHTML);
          hotspot.contentBlocks = (hotspot.contentBlocks || []).filter((block) => block.type === 'scene');
        });
      });

      (project.minimap?.floorplans || []).forEach((floorplan) => {
        if (floorplan.dataUrl) {
          const fileInfo = dataUrlToFile(floorplan.dataUrl, floorplan.name || floorplan.id);
          if (!fileInfo) return;
          floorplan.path = registerAssetFile(fileInfo, 'floorplans');
          delete floorplan.dataUrl;
        }
      });

      const jsonBlob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const tileDownloads = [];
      if (generatedTiles.size > 0) {
        for (const [, tiles] of generatedTiles.entries()) {
          Object.entries(tiles).forEach(([path, dataUrl]) => {
            const fileInfo = dataUrlToFile(dataUrl, path.split('/').pop());
            if (!fileInfo) return;
            tileDownloads.push({ ...fileInfo, path, outputPath: `viewer/${path}` });
          });
        }
      }

      let runtimeFiles = [];
      try {
        runtimeFiles = await collectViewerRuntimeFiles();
      } catch (error) {
        console.error(error);
        updateStatus('Static export failed: cannot read viewer runtime files.');
        return;
      }

      if (window.JSZip) {
        await exportZipPackage(project, jsonBlob, assetDownloads, tileDownloads, runtimeFiles);
        return;
      }

      if (window.showDirectoryPicker) {
        await exportWithFileSystemAccess(project, jsonBlob, assetDownloads, tileDownloads, runtimeFiles);
        return;
      }

      downloadBlob(jsonBlob, 'shared_sample-tour.json');
      runtimeFiles.forEach((file) => downloadBlob(file.blob, file.path.replace(/\//g, '_')));
      assetDownloads.forEach((file) => downloadBlob(file.blob, file.outputPath.replace(/\//g, '_')));
      tileDownloads.forEach((file) => downloadBlob(file.blob, file.outputPath.replace(/\//g, '_')));
      updateStatus('Static export: runtime + assets downloaded (no ZIP).');
    }

    async function exportZipPackage(project, jsonBlob, assets, tiles, runtimeFiles) {
      const zip = new window.JSZip();
      zip.file('index.html', buildStaticPackageRootIndexHtml());
      zip.file('shared/sample-tour.json', await blobToString(jsonBlob));

      runtimeFiles.forEach((file) => {
        zip.file(file.path, file.blob);
      });
      assets.forEach((asset) => {
        zip.file(asset.outputPath, asset.blob);
      });
      tiles.forEach((tile) => {
        zip.file(tile.outputPath, tile.blob);
      });

      updateStatus('Building ZIP...');
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        updateStatus(`ZIP: ${Math.round(metadata.percent)}%`);
      });

      downloadBlob(content, `${project.project.name || 'tour-project'}-static.zip`);
      updateStatus('ZIP export complete.');
    }

    async function exportWithFileSystemAccess(project, jsonBlob, assets, tiles, runtimeFiles) {
      try {
        const root = await window.showDirectoryPicker();
        await writeFile(root, 'index.html', new Blob([buildStaticPackageRootIndexHtml()], { type: 'text/html' }));
        const sharedDir = await root.getDirectoryHandle('shared', { create: true });
        await writeFile(sharedDir, 'sample-tour.json', jsonBlob);

        for (const file of runtimeFiles) {
          await writePathFile(root, file.path, file.blob);
        }
        for (const asset of assets) {
          await writePathFile(root, asset.outputPath, asset.blob);
        }
        for (const tile of tiles) {
          await writePathFile(root, tile.outputPath, tile.blob);
        }

        updateStatus('Static export complete (folder written).');
      } catch (error) {
        console.error(error);
        updateStatus('Static export failed.');
      }
    }

    return {
      exportProject,
      exportProjectPackageZip,
      exportStaticPackage,
      exportZipPackage,
      exportWithFileSystemAccess,
    };
  }

  window.IterpanoEditorProjectExport = {
    createProjectExportController,
  };
})();
