(function () {
  function createHotspotUiController(options) {
    const {
      state,
      linkNoteLabel,
      richEditorSurface,
      previewModal,
      previewModalContent,
      previewModalBody,
      getGroupById,
      getInfoHotspotFrameSize,
      getViewportClampedInfoFrameSize,
      getPreviewModalAnchorOffset,
      getHotspotViewportPoint,
      getScaledInfoFramePositionForViewport,
      isHomePagePreviewMode,
      getSelectedGroupId,
      getProjectScenes,
      getLinkTargetAllGroups,
      normalizeFloorplanColorKey,
      floorplanColorMap,
      withAlpha,
      defaultInfoBgColorKey,
      defaultInfoBgTransparency,
      minInfoFrameWidth,
      minInfoFrameHeight,
    } = options;

    function sanitizeInfoBackgroundTransparencyPercent(value, fallback = defaultInfoBgTransparency) {
      const numeric = Number.parseInt(String(value ?? ''), 10);
      if (!Number.isFinite(numeric)) return fallback;
      return Math.max(0, Math.min(100, Math.round(numeric)));
    }

    function getInfoHotspotEditorVisualStyle(hotspot) {
      const raw = hotspot?.editorVisualStyle;
      if (!raw || typeof raw !== 'object') {
        return {
          backgroundColorKey: defaultInfoBgColorKey,
          backgroundTransparency: defaultInfoBgTransparency,
        };
      }
      const colorKey = normalizeFloorplanColorKey(raw.backgroundColorKey || defaultInfoBgColorKey);
      let transparencyPercent;
      if (raw.backgroundTransparency !== undefined) {
        transparencyPercent = sanitizeInfoBackgroundTransparencyPercent(raw.backgroundTransparency, defaultInfoBgTransparency);
      } else if (raw.backgroundOpacity !== undefined) {
        const legacyOpacity = sanitizeInfoBackgroundTransparencyPercent(raw.backgroundOpacity, 100 - defaultInfoBgTransparency);
        transparencyPercent = 100 - legacyOpacity;
      } else {
        transparencyPercent = defaultInfoBgTransparency;
      }
      return {
        backgroundColorKey: colorKey,
        backgroundTransparency: transparencyPercent,
      };
    }

    function setInfoHotspotEditorVisualStyle(hotspot, colorKey, transparencyPercent) {
      if (!hotspot) return;
      const safeTransparency = sanitizeInfoBackgroundTransparencyPercent(transparencyPercent, defaultInfoBgTransparency);
      hotspot.editorVisualStyle = {
        backgroundColorKey: normalizeFloorplanColorKey(colorKey || defaultInfoBgColorKey),
        backgroundTransparency: safeTransparency,
        backgroundOpacity: 100 - safeTransparency,
      };
    }

    function applyRichEditorSurfaceVisualStyle(hotspot) {
      if (!richEditorSurface) return;
      const visualStyle = getInfoHotspotEditorVisualStyle(hotspot);
      if (!visualStyle) {
        richEditorSurface.style.removeProperty('background-color');
        return;
      }
      const hex = floorplanColorMap[visualStyle.backgroundColorKey];
      const alpha = (100 - visualStyle.backgroundTransparency) / 100;
      richEditorSurface.style.backgroundColor = withAlpha(hex, alpha);
    }

    function measurePreviewRichContentFrame(maxWidth, maxHeight) {
      if (!previewModalBody || !document.body) return null;
      if (!previewModalBody.classList.contains('preview-rich-surface')) return null;
      if (!previewModalBody.childNodes.length) return null;
      const measurer = document.createElement('div');
      measurer.className = 'modal-body preview-rich-surface';
      measurer.style.position = 'fixed';
      measurer.style.left = '-20000px';
      measurer.style.top = '0';
      measurer.style.visibility = 'hidden';
      measurer.style.pointerEvents = 'none';
      measurer.style.width = 'fit-content';
      measurer.style.height = 'auto';
      measurer.style.maxWidth = `${Math.max(minInfoFrameWidth, maxWidth)}px`;
      measurer.style.maxHeight = 'none';
      measurer.style.overflow = 'visible';
      previewModalBody.childNodes.forEach((node) => {
        measurer.appendChild(node.cloneNode(true));
      });
      document.body.appendChild(measurer);
      const rect = measurer.getBoundingClientRect();
      measurer.remove();
      if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return null;
      return {
        width: Math.max(minInfoFrameWidth, Math.min(Math.ceil(rect.width), maxWidth)),
        height: Math.max(minInfoFrameHeight, Math.min(Math.ceil(rect.height), maxHeight)),
      };
    }

    function applyPreviewModalFrameSize(hotspot) {
      if (!previewModalContent || !previewModalBody) return;
      if (isHomePagePreviewMode()) {
        previewModal.classList.add('home-page-preview-mode');
        previewModalContent.style.width = `${window.innerWidth}px`;
        previewModalContent.style.height = `${window.innerHeight}px`;
        previewModalContent.style.left = '0px';
        previewModalContent.style.top = '0px';
        previewModalBody.style.height = `${window.innerHeight}px`;
        previewModalBody.style.maxHeight = `${window.innerHeight}px`;
        return;
      }
      previewModal.classList.remove('home-page-preview-mode');
      const frame = getViewportClampedInfoFrameSize(getInfoHotspotFrameSize(hotspot));
      const isRichLike = previewModal?.classList.contains('preview-modal-rich-like');
      if (isRichLike) {
        const maxWidth = Math.max(minInfoFrameWidth, window.innerWidth - 16);
        const maxHeight = Math.max(minInfoFrameHeight, window.innerHeight - 16);
        let width = Math.min(frame.width, maxWidth);
        let height = Math.min(frame.height, maxHeight);
        const measured = measurePreviewRichContentFrame(width, height);
        if (measured) {
          width = measured.width;
          height = measured.height;
        }
        previewModalContent.style.width = `${width}px`;
        previewModalContent.style.height = `${height}px`;
        previewModalBody.style.height = `${height}px`;
        previewModalBody.style.maxHeight = `${height}px`;
        const hotspotPoint = getHotspotViewportPoint(hotspot);
        const anchorOffset = getPreviewModalAnchorOffset(hotspot);
        const framePosition = hotspotPoint && anchorOffset
          ? {
              left: Math.round(hotspotPoint.x + anchorOffset.offsetX),
              top: Math.round(hotspotPoint.y + anchorOffset.offsetY),
            }
          : getScaledInfoFramePositionForViewport(hotspot);
        const left = Number.isFinite(framePosition.left) ? framePosition.left : 320;
        const top = Number.isFinite(framePosition.top) ? framePosition.top : 112;
        const maxLeft = Math.max(8, window.innerWidth - width - 8);
        const maxTop = Math.max(8, window.innerHeight - height - 8);
        previewModalContent.style.left = `${Math.round(Math.min(maxLeft, Math.max(8, left)))}px`;
        previewModalContent.style.top = `${Math.round(Math.min(maxTop, Math.max(8, top)))}px`;
        return;
      }

      const bodyHorizontalPadding = 32;
      const maxContentWidth = Math.max(320, window.innerWidth - 56);
      const width = Math.min(frame.width + bodyHorizontalPadding, maxContentWidth);
      previewModalContent.style.width = `${width}px`;
      previewModalBody.style.height = `${frame.height}px`;
      previewModalBody.style.maxHeight = `${frame.height}px`;
    }

    function schedulePreviewRichContentFrameRefresh(hotspot) {
      if (!previewModalBody || !previewModal?.classList.contains('visible')) return;
      requestAnimationFrame(() => {
        if (!previewModal?.classList.contains('visible')) return;
        applyPreviewModalFrameSize(hotspot);
      });
      previewModalBody.querySelectorAll('img, video, iframe').forEach((mediaEl) => {
        const refresh = () => {
          if (!previewModal?.classList.contains('visible')) return;
          applyPreviewModalFrameSize(hotspot);
        };
        mediaEl.addEventListener('load', refresh, { once: true });
        mediaEl.addEventListener('loadedmetadata', refresh, { once: true });
      });
    }

    function resetPreviewModalFrameSize() {
      if (!previewModalContent || !previewModalBody) return;
      previewModalContent.style.removeProperty('width');
      previewModalContent.style.removeProperty('height');
      previewModalContent.style.removeProperty('left');
      previewModalContent.style.removeProperty('top');
      previewModalBody.style.removeProperty('height');
      previewModalBody.style.removeProperty('max-height');
    }

    function applyPreviewModalVisualStyle(hotspot) {
      if (!previewModalBody) return;
      const visualStyle = getInfoHotspotEditorVisualStyle(hotspot);
      if (!visualStyle) {
        previewModalBody.style.removeProperty('background-color');
        return;
      }
      const hex = floorplanColorMap[visualStyle.backgroundColorKey] || floorplanColorMap.yellow;
      const alpha = (100 - visualStyle.backgroundTransparency) / 100;
      previewModalBody.style.backgroundColor = withAlpha(hex, alpha);
    }

    function getLinkTargetSceneOptions(currentSceneId) {
      const allScenes = getProjectScenes();
      const currentScene = allScenes.find((scene) => scene.id === currentSceneId) || null;
      if (getLinkTargetAllGroups()) {
        return allScenes.filter((scene) => scene.id !== currentSceneId);
      }
      const currentGroupId = currentScene?.groupId || getSelectedGroupId();
      return allScenes.filter((scene) => scene.id !== currentSceneId && scene.groupId === currentGroupId);
    }

    function formatTargetSceneOptionLabel(scene, { includeGroup = false } = {}) {
      if (!scene) return '';
      const sceneName = scene.name || scene.id;
      if (!includeGroup) return sceneName;
      const groupName = getGroupById(scene.groupId)?.name || scene.groupId || 'Unknown group';
      return `${sceneName} (${groupName})`;
    }

    function updateLinkNoteModeUi() {
      if (linkNoteLabel) {
        linkNoteLabel.textContent = 'Comment (optional)';
      }
    }

    return {
      sanitizeInfoBackgroundTransparencyPercent,
      getInfoHotspotEditorVisualStyle,
      setInfoHotspotEditorVisualStyle,
      applyRichEditorSurfaceVisualStyle,
      measurePreviewRichContentFrame,
      applyPreviewModalFrameSize,
      schedulePreviewRichContentFrameRefresh,
      resetPreviewModalFrameSize,
      applyPreviewModalVisualStyle,
      getLinkTargetSceneOptions,
      formatTargetSceneOptionLabel,
      updateLinkNoteModeUi,
    };
  }

  window.IterpanoEditorHotspotUi = {
    createHotspotUiController,
  };
})();
