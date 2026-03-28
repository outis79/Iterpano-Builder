(function () {
  function createRichSelectionController(options) {
    const {
      richEditorModal,
      richEditorSurface,
      syncRichEditorTypographyControls,
      applyRichEditorModalResizeConstraints,
      findClosestRichLayout,
      updateRichLayoutBlockResizeHandle,
      hideRichLayoutBlockResizeHandle,
    } = options;

    let selectedRichImageElement = null;
    let selectedRichLayoutElement = null;
    let richImageResizeHandleEl = null;
    let richImageResizeState = null;

    function setSelectedLayoutElement(layoutEl) {
      if (selectedRichLayoutElement && selectedRichLayoutElement !== layoutEl) {
        selectedRichLayoutElement.classList.remove('rich-layout-selected');
      }
      selectedRichLayoutElement = layoutEl || null;
      if (selectedRichLayoutElement) {
        selectedRichLayoutElement.classList.add('rich-layout-selected');
      }
      if (!selectedRichLayoutElement) {
        hideRichLayoutBlockResizeHandle();
      } else {
        updateRichLayoutBlockResizeHandle();
      }
    }

    function getSelectedLayoutElement() {
      if (
        selectedRichLayoutElement &&
        richEditorSurface &&
        richEditorSurface.contains(selectedRichLayoutElement)
      ) {
        return selectedRichLayoutElement;
      }
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      return findClosestRichLayout(selection.anchorNode);
    }

    function ensureImageResizeHandle() {
      if (richImageResizeHandleEl) return richImageResizeHandleEl;
      const handle = document.createElement('div');
      handle.className = 'rich-image-resize-handle hidden';
      handle.title = 'Drag to resize media';
      handle.addEventListener('pointerdown', startImageResize);
      document.body.appendChild(handle);
      richImageResizeHandleEl = handle;
      return richImageResizeHandleEl;
    }

    function hideImageResizeHandle() {
      if (!richImageResizeHandleEl) return;
      richImageResizeHandleEl.classList.add('hidden');
    }

    function updateRichImageResizeHandle() {
      if (!richEditorModal?.classList.contains('visible')) {
        hideImageResizeHandle();
        return;
      }
      const media = getSelectedImageElement();
      if (!media || !media.isConnected) {
        hideImageResizeHandle();
        return;
      }
      const rect = media.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || rect.width <= 0 || !Number.isFinite(rect.height) || rect.height <= 0) {
        hideImageResizeHandle();
        return;
      }
      const handle = ensureImageResizeHandle();
      handle.style.left = `${Math.round(rect.right)}px`;
      handle.style.top = `${Math.round(rect.bottom)}px`;
      handle.classList.remove('hidden');
    }

    function stopImageResize() {
      if (!richImageResizeState) return;
      richImageResizeState = null;
      window.removeEventListener('pointermove', handleImageResizeMove);
      window.removeEventListener('pointerup', stopImageResize);
      window.removeEventListener('pointercancel', stopImageResize);
    }

    function handleImageResizeMove(event) {
      if (!richImageResizeState?.media?.isConnected) {
        stopImageResize();
        hideImageResizeHandle();
        return;
      }
      const deltaX = event.clientX - richImageResizeState.startX;
      const nextWidth = Math.round(Math.min(
        richImageResizeState.maxWidth,
        Math.max(richImageResizeState.minWidth, richImageResizeState.startWidth + deltaX)
      ));
      richImageResizeState.media.style.width = `${nextWidth}px`;
      if (richImageResizeState.keepAspectRatio) {
        const nextHeight = Math.round(Math.max(24, nextWidth * richImageResizeState.aspectRatio));
        richImageResizeState.media.style.height = `${nextHeight}px`;
      } else {
        richImageResizeState.media.style.height = 'auto';
      }
      updateRichImageResizeHandle();
    }

    function startImageResize(event) {
      const media = getSelectedImageElement();
      if (!media) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = media.getBoundingClientRect();
      const tagName = String(media.tagName || '').toLowerCase();
      const keepAspectRatio = tagName === 'video' || tagName === 'iframe';
      const width = Math.max(24, Math.round(rect.width));
      const height = Math.max(24, Math.round(rect.height));
      const aspectRatio = height / Math.max(1, width);
      media.style.width = `${width}px`;
      media.style.removeProperty('max-height');
      media.style.height = keepAspectRatio ? `${height}px` : 'auto';
      richImageResizeState = {
        media,
        startX: event.clientX,
        startWidth: rect.width,
        aspectRatio,
        keepAspectRatio,
        minWidth: 24,
        maxWidth: 4096,
      };
      window.addEventListener('pointermove', handleImageResizeMove);
      window.addEventListener('pointerup', stopImageResize);
      window.addEventListener('pointercancel', stopImageResize);
    }

    function setSelectedImageElement(imageEl) {
      if (selectedRichImageElement && selectedRichImageElement !== imageEl) {
        selectedRichImageElement.classList.remove('rich-image-selected', 'rich-media-selected');
      }
      selectedRichImageElement = imageEl || null;
      if (selectedRichImageElement) {
        selectedRichImageElement.classList.add('rich-media-selected');
        if (selectedRichImageElement.tagName.toLowerCase() === 'img') {
          selectedRichImageElement.classList.add('rich-image-selected');
        }
      }
      updateRichImageResizeHandle();
    }

    function getSelectedImageElement() {
      if (
        selectedRichImageElement &&
        richEditorSurface &&
        richEditorSurface.contains(selectedRichImageElement)
      ) {
        return selectedRichImageElement;
      }
      if (!richEditorSurface) return null;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      let node = selection.anchorNode;
      if (!node) return null;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      if (!(node instanceof Element)) return null;
      const media = node.closest('img,video,iframe');
      if (!media) return null;
      if (!richEditorSurface.contains(media)) return null;
      return media;
    }

    function syncSelectionState() {
      if (!richEditorSurface) return;

      if (
        selectedRichImageElement &&
        (!richEditorSurface.contains(selectedRichImageElement) || !selectedRichImageElement.isConnected)
      ) {
        setSelectedImageElement(null);
      } else {
        const currentImage = getSelectedImageElement();
        if (currentImage !== selectedRichImageElement) {
          setSelectedImageElement(currentImage);
        } else {
          updateRichImageResizeHandle();
        }
      }

      if (
        selectedRichLayoutElement &&
        (!richEditorSurface.contains(selectedRichLayoutElement) || !selectedRichLayoutElement.isConnected)
      ) {
        setSelectedLayoutElement(null);
      } else {
        const currentLayout = getSelectedLayoutElement();
        if (currentLayout !== selectedRichLayoutElement) {
          setSelectedLayoutElement(currentLayout);
        } else {
          updateRichLayoutBlockResizeHandle();
        }
      }
      applyRichEditorModalResizeConstraints();
      syncRichEditorTypographyControls();
    }

    return {
      syncSelectionState,
      ensureImageResizeHandle,
      hideImageResizeHandle,
      updateRichImageResizeHandle,
      stopImageResize,
      setSelectedImageElement,
      getSelectedImageElement,
      setSelectedLayoutElement,
      getSelectedLayoutElement,
    };
  }

  window.IterpanoEditorRichSelection = {
    createRichSelectionController,
  };
})();
