(function () {
  function createRichModalController(options) {
    const {
      richEditorModal,
      richEditorModalContent,
      richEditorSurface,
      isHomePageRichEditorMode,
      getHomePageEditorViewportBounds,
      getViewportClampedInfoFrameSize,
      getAnchoredInfoFramePosition,
      getInfoHotspotFrameSize,
      getHotspotViewportPoint,
      parsePixelStyleValue,
      normalizeInfoFrameSize,
      normalizeInfoFramePosition,
      normalizeInfoFrameViewport,
      normalizeInfoFrameAnchorOffset,
      minInfoFrameWidth,
      minInfoFrameHeight,
      maxInfoFrameWidth,
      maxInfoFrameHeight,
    } = options;

    let richEditorDragState = null;
    let richModalResizeHandleEl = null;
    let richModalResizeState = null;

    function getRichEditorContentMinSize() {
      return {
        minWidth: minInfoFrameWidth,
        minHeight: minInfoFrameHeight,
      };
    }

    function applyResizeConstraints() {
      if (!richEditorModalContent || !richEditorSurface) return;
      if (isHomePageRichEditorMode()) {
        richEditorModalContent.style.minWidth = '0px';
        richEditorModalContent.style.minHeight = '0px';
        return;
      }
      const contentMin = getRichEditorContentMinSize();
      const chromeWidth = Math.max(0, richEditorModalContent.offsetWidth - richEditorSurface.clientWidth);
      const chromeHeight = Math.max(0, richEditorModalContent.offsetHeight - richEditorSurface.clientHeight);
      const minModalWidth = Math.min(maxInfoFrameWidth, Math.max(minInfoFrameWidth, contentMin.minWidth + chromeWidth));
      const minModalHeight = Math.min(maxInfoFrameHeight, Math.max(minInfoFrameHeight, contentMin.minHeight + chromeHeight));
      richEditorModalContent.style.minWidth = `${Math.round(minModalWidth)}px`;
      richEditorModalContent.style.minHeight = `${Math.round(minModalHeight)}px`;
      const currentWidth = parsePixelStyleValue(richEditorModalContent.style.width, richEditorModalContent.offsetWidth);
      const currentHeight = parsePixelStyleValue(richEditorModalContent.style.height, richEditorModalContent.offsetHeight);
      if (Number.isFinite(currentWidth) && currentWidth < minModalWidth) {
        richEditorModalContent.style.width = `${Math.round(minModalWidth)}px`;
      }
      if (Number.isFinite(currentHeight) && currentHeight < minModalHeight) {
        richEditorModalContent.style.height = `${Math.round(minModalHeight)}px`;
      }
    }

    function ensureResizeHandle() {
      if (richModalResizeHandleEl) return richModalResizeHandleEl;
      const handle = document.createElement('div');
      handle.className = 'rich-modal-resize-handle hidden';
      handle.title = 'Drag to resize visual editor';
      handle.addEventListener('pointerdown', startResize);
      document.body.appendChild(handle);
      richModalResizeHandleEl = handle;
      return richModalResizeHandleEl;
    }

    function hideResizeHandle() {
      if (!richModalResizeHandleEl) return;
      richModalResizeHandleEl.classList.add('hidden');
    }

    function updateResizeHandle() {
      if (!richEditorModal?.classList.contains('visible') || !richEditorModalContent) {
        hideResizeHandle();
        return;
      }
      if (isHomePageRichEditorMode()) {
        hideResizeHandle();
        return;
      }
      const rect = richEditorModalContent.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || rect.width <= 0 || !Number.isFinite(rect.height) || rect.height <= 0) {
        hideResizeHandle();
        return;
      }
      const handle = ensureResizeHandle();
      handle.style.left = `${Math.round(rect.right)}px`;
      handle.style.top = `${Math.round(rect.bottom)}px`;
      handle.classList.remove('hidden');
    }

    function clampPosition() {
      if (!richEditorModalContent) return;
      if (isHomePageRichEditorMode()) {
        richEditorModalContent.style.left = '0px';
        richEditorModalContent.style.top = '0px';
        hideResizeHandle();
        return;
      }
      const rect = richEditorModalContent.getBoundingClientRect();
      const maxLeft = Math.max(0, window.innerWidth - rect.width - 8);
      const maxTop = Math.max(0, window.innerHeight - rect.height - 8);
      const currentLeft = parsePixelStyleValue(richEditorModalContent.style.left, rect.left);
      const currentTop = parsePixelStyleValue(richEditorModalContent.style.top, rect.top);
      const nextLeft = Math.min(maxLeft, Math.max(8, currentLeft));
      const nextTop = Math.min(maxTop, Math.max(8, currentTop));
      richEditorModalContent.style.left = `${Math.round(nextLeft)}px`;
      richEditorModalContent.style.top = `${Math.round(nextTop)}px`;
      updateResizeHandle();
    }

    function applyFrameSize(hotspot) {
      if (!richEditorModalContent || !richEditorSurface) return;
      if (isHomePageRichEditorMode()) {
        const bounds = getHomePageEditorViewportBounds();
        richEditorModal.classList.add('home-page-editor-mode');
        richEditorModalContent.style.width = `${bounds.width}px`;
        richEditorModalContent.style.height = `${bounds.height}px`;
        richEditorModalContent.style.left = `${bounds.left}px`;
        richEditorModalContent.style.top = `${bounds.top}px`;
        hideResizeHandle();
        return;
      }
      richEditorModal.classList.remove('home-page-editor-mode');
      const desired = getViewportClampedInfoFrameSize(getInfoHotspotFrameSize(hotspot));
      const desiredPos = getAnchoredInfoFramePosition(hotspot);
      const chromeWidth = Math.max(0, richEditorModalContent.clientWidth - richEditorSurface.clientWidth);
      const chromeHeight = Math.max(0, richEditorModalContent.clientHeight - richEditorSurface.clientHeight);
      richEditorModalContent.style.width = `${desired.width + chromeWidth}px`;
      richEditorModalContent.style.height = `${desired.height + chromeHeight}px`;
      richEditorModalContent.style.left = `${desiredPos.left}px`;
      richEditorModalContent.style.top = `${desiredPos.top}px`;
      applyResizeConstraints();
      clampPosition();
    }

    function captureFrameSize(hotspot) {
      if (!hotspot || !richEditorSurface) return;
      hotspot.infoFrameSize = normalizeInfoFrameSize({
        width: richEditorSurface.clientWidth,
        height: richEditorSurface.clientHeight,
      });
      if (richEditorModalContent) {
        const rect = richEditorModalContent.getBoundingClientRect();
        const left = parsePixelStyleValue(richEditorModalContent.style.left, rect.left);
        const top = parsePixelStyleValue(richEditorModalContent.style.top, rect.top);
        hotspot.infoFramePosition = normalizeInfoFramePosition({ left, top });
        hotspot.infoFrameViewport = normalizeInfoFrameViewport({
          width: window.innerWidth,
          height: window.innerHeight,
        });
        const hotspotPoint = getHotspotViewportPoint(hotspot);
        hotspot.infoFrameAnchorOffset = hotspotPoint
          ? normalizeInfoFrameAnchorOffset({
              offsetX: left - hotspotPoint.x,
              offsetY: top - hotspotPoint.y,
            })
          : null;
      }
    }

    function stopResize() {
      if (!richModalResizeState) return;
      richModalResizeState = null;
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('pointercancel', stopResize);
    }

    function handleResizeMove(event) {
      if (!richModalResizeState || !richEditorModalContent) {
        stopResize();
        return;
      }
      const computed = window.getComputedStyle(richEditorModalContent);
      const minWidth = parsePixelStyleValue(computed.minWidth, minInfoFrameWidth);
      const minHeight = parsePixelStyleValue(computed.minHeight, minInfoFrameHeight);
      const maxWidth = Math.max(minWidth, Math.min(maxInfoFrameWidth, window.innerWidth - richModalResizeState.left - 8));
      const maxHeight = Math.max(minHeight, Math.min(maxInfoFrameHeight, window.innerHeight - richModalResizeState.top - 8));
      const deltaX = event.clientX - richModalResizeState.startX;
      const deltaY = event.clientY - richModalResizeState.startY;
      const nextWidth = Math.round(Math.min(maxWidth, Math.max(minWidth, richModalResizeState.startWidth + deltaX)));
      const nextHeight = Math.round(Math.min(maxHeight, Math.max(minHeight, richModalResizeState.startHeight + deltaY)));
      richEditorModalContent.style.width = `${nextWidth}px`;
      richEditorModalContent.style.height = `${nextHeight}px`;
      updateResizeHandle();
    }

    function startResize(event) {
      if (!richEditorModalContent || !richEditorModal?.classList.contains('visible')) return;
      if (isHomePageRichEditorMode()) return;
      event.preventDefault();
      event.stopPropagation();
      applyResizeConstraints();
      const rect = richEditorModalContent.getBoundingClientRect();
      richModalResizeState = {
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        left: rect.left,
        top: rect.top,
      };
      window.addEventListener('pointermove', handleResizeMove);
      window.addEventListener('pointerup', stopResize);
      window.addEventListener('pointercancel', stopResize);
    }

    function stopDrag() {
      if (!richEditorDragState) return;
      richEditorDragState = null;
      richEditorSurface?.classList.remove('dragging');
      richEditorSurface?.classList.remove('drag-zone');
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    }

    function handleDragMove(event) {
      if (!richEditorDragState || !richEditorModalContent) return;
      const deltaX = event.clientX - richEditorDragState.startX;
      const deltaY = event.clientY - richEditorDragState.startY;
      const width = richEditorModalContent.offsetWidth || 0;
      const height = richEditorModalContent.offsetHeight || 0;
      const maxLeft = Math.max(0, window.innerWidth - width - 8);
      const maxTop = Math.max(0, window.innerHeight - height - 8);
      const nextLeft = Math.min(maxLeft, Math.max(8, richEditorDragState.startLeft + deltaX));
      const nextTop = Math.min(maxTop, Math.max(8, richEditorDragState.startTop + deltaY));
      richEditorModalContent.style.left = `${Math.round(nextLeft)}px`;
      richEditorModalContent.style.top = `${Math.round(nextTop)}px`;
      updateResizeHandle();
    }

    function maybeStartDrag(event) {
      if (!richEditorModalContent || !richEditorSurface || event.button !== 0) return false;
      if (isHomePageRichEditorMode()) return false;
      if (!(event.target instanceof Element) || event.target !== richEditorSurface) return false;
      const rect = richEditorSurface.getBoundingClientRect();
      const withinDragZone = (event.clientY - rect.top) <= 18;
      if (!withinDragZone) return false;
      const modalRect = richEditorModalContent.getBoundingClientRect();
      richEditorDragState = {
        startX: event.clientX,
        startY: event.clientY,
        startLeft: modalRect.left,
        startTop: modalRect.top,
      };
      richEditorSurface.classList.add('dragging');
      event.preventDefault();
      window.addEventListener('pointermove', handleDragMove);
      window.addEventListener('pointerup', stopDrag);
      window.addEventListener('pointercancel', stopDrag);
      return true;
    }

    function handleSurfaceHover(event) {
      if (!richEditorSurface || richEditorDragState) return;
      const rect = richEditorSurface.getBoundingClientRect();
      const inDragZone = (event.clientY - rect.top) <= 18;
      richEditorSurface.classList.toggle('drag-zone', inDragZone);
    }

    function handleSurfaceLeave() {
      if (!richEditorDragState) {
        richEditorSurface?.classList.remove('drag-zone');
      }
    }

    return {
      applyFrameSize,
      captureFrameSize,
      applyResizeConstraints,
      clampPosition,
      ensureResizeHandle,
      hideResizeHandle,
      updateResizeHandle,
      stopResize,
      stopDrag,
      maybeStartDrag,
      handleSurfaceHover,
      handleSurfaceLeave,
    };
  }

  window.IterpanoEditorRichModal = {
    createRichModalController,
  };
})();
