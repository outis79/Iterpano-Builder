(function () {
  function createRichLayoutController(options) {
    const {
      richEditorModal,
      richEditorSurface,
      parsePixelStyleValue,
      applyRichEditorModalResizeConstraints,
      applyRichLayoutColumnWidths,
      getRichLayoutDirectColumns,
      getSelectedRichLayoutElement,
      richLayoutColumnMinWidth,
    } = options;

    let richLayoutResizeState = null;
    let richLayoutBlockResizeHandleHeightEl = null;
    let richLayoutBlockResizeState = null;

    function stopResize() {
      if (!richLayoutResizeState) return;
      richLayoutResizeState = null;
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('pointercancel', stopResize);
      applyRichEditorModalResizeConstraints();
    }

    function handleResizeMove(event) {
      if (!richLayoutResizeState?.layout?.isConnected) {
        stopResize();
        return;
      }
      const {
        layout,
        index,
        mode,
        startX,
        startWidths,
        minWidth,
      } = richLayoutResizeState;
      const currentRect = layout.getBoundingClientRect();
      const delta = event.clientX - startX;
      let resizedColumnWidth = startWidths[index] + delta;
      if (resizedColumnWidth < minWidth) {
        resizedColumnWidth = minWidth;
      }
      const nextWidths = [...startWidths];
      nextWidths[index] = Math.max(minWidth, resizedColumnWidth);
      if (mode === 'last-edge') {
        nextWidths[index] = Math.max(minWidth, resizedColumnWidth);
      }
      const layoutComputed = window.getComputedStyle(layout);
      const gap = Number.parseFloat(layoutComputed.columnGap || layoutComputed.gap || '12') || 12;
      const nextLayoutWidth =
        nextWidths.reduce((sum, width) => sum + Math.max(minWidth, width), 0)
        + (Math.max(0, nextWidths.length - 1) * gap);
      layout.style.width = `${Math.round(Math.max(180, nextLayoutWidth))}px`;
      applyRichLayoutColumnWidths(layout, nextWidths);
      layout.removeAttribute('data-height-locked');
      layout.style.removeProperty('height');
      const naturalHeight = measureNaturalHeight(layout, Math.max(180, nextLayoutWidth));
      layout.style.minHeight = `${Math.round(Math.max(40, naturalHeight))}px`;
      updateBlockResizeHandle();
    }

    function maybeStartResize(event) {
      if (!richEditorSurface || event.button !== 0) return false;
      const target =
        event.target instanceof Element
          ? event.target
          : document.elementFromPoint(event.clientX, event.clientY);
      const column = target?.closest('[data-col]');
      if (!column || !richEditorSurface.contains(column)) return false;
      const layout = column.parentElement;
      if (!layout || !String(layout.getAttribute('data-layout') || '').startsWith('columns-')) return false;
      layout.removeAttribute('data-height-locked');
      layout.style.removeProperty('height');
      layout.style.removeProperty('min-height');
      const columns = getRichLayoutDirectColumns(layout);
      const index = columns.indexOf(column);
      if (index < 0) return false;
      const rect = column.getBoundingClientRect();
      const edgeThreshold = 12;
      const nearRightEdge = (rect.right - event.clientX) <= edgeThreshold;
      const nearLeftEdge = (event.clientX - rect.left) <= edgeThreshold;

      let boundaryIndex = -1;
      let resizeMode = 'divider';
      if (nearRightEdge && index < columns.length - 1) {
        boundaryIndex = index;
      } else if (nearLeftEdge && index > 0) {
        boundaryIndex = index - 1;
      } else if (nearRightEdge && index === columns.length - 1) {
        boundaryIndex = index;
        resizeMode = 'last-edge';
      } else {
        return false;
      }

      const startWidths = columns.map((col) => col.getBoundingClientRect().width);
      richLayoutResizeState = {
        layout,
        index: boundaryIndex,
        mode: resizeMode,
        startX: event.clientX,
        startWidths,
        minWidth: richLayoutColumnMinWidth,
      };
      event.preventDefault();
      event.stopPropagation();
      window.addEventListener('pointermove', handleResizeMove);
      window.addEventListener('pointerup', stopResize);
      window.addEventListener('pointercancel', stopResize);
      return true;
    }

    function ensureBlockResizeHandles() {
      if (!richLayoutBlockResizeHandleHeightEl) {
        const heightHandle = document.createElement('div');
        heightHandle.className = 'rich-layout-resize-handle rich-layout-resize-height hidden';
        heightHandle.title = 'Drag to resize columns block height';
        heightHandle.addEventListener('pointerdown', startBlockResize);
        document.body.appendChild(heightHandle);
        richLayoutBlockResizeHandleHeightEl = heightHandle;
      }
      return richLayoutBlockResizeHandleHeightEl;
    }

    function hideBlockResizeHandle() {
      if (richLayoutBlockResizeHandleHeightEl) {
        richLayoutBlockResizeHandleHeightEl.classList.add('hidden');
      }
    }

    function updateBlockResizeHandle() {
      if (!richEditorModal?.classList.contains('visible')) {
        hideBlockResizeHandle();
        return;
      }
      const layout = getSelectedRichLayoutElement();
      if (!layout || !layout.isConnected) {
        hideBlockResizeHandle();
        return;
      }
      const rect = layout.getBoundingClientRect();
      if (!Number.isFinite(rect.width) || rect.width <= 0 || !Number.isFinite(rect.height) || rect.height <= 0) {
        hideBlockResizeHandle();
        return;
      }
      const heightHandle = ensureBlockResizeHandles();
      heightHandle.style.left = `${Math.round(rect.left + (rect.width / 2))}px`;
      heightHandle.style.top = `${Math.round(rect.bottom)}px`;
      heightHandle.classList.remove('hidden');
    }

    function stopBlockResize() {
      if (!richLayoutBlockResizeState) return;
      richLayoutBlockResizeState = null;
      window.removeEventListener('pointermove', handleBlockResizeMove);
      window.removeEventListener('pointerup', stopBlockResize);
      window.removeEventListener('pointercancel', stopBlockResize);
      applyRichEditorModalResizeConstraints();
    }

    function measureNaturalHeight(layout, widthPx) {
      if (!layout?.isConnected) return 40;
      const previousWidth = layout.style.width;
      const previousHeight = layout.style.height;
      const previousMinHeight = layout.style.minHeight;
      layout.style.width = `${Math.round(widthPx)}px`;
      layout.style.height = 'auto';
      layout.style.minHeight = '0px';
      const rect = layout.getBoundingClientRect();
      const measured = Number.isFinite(rect.height) ? rect.height : 0;
      const scrollMeasured = Math.max(0, layout.scrollHeight || 0);
      const natural = Math.ceil(Math.max(measured, scrollMeasured, 40));
      layout.style.width = previousWidth;
      layout.style.height = previousHeight;
      layout.style.minHeight = previousMinHeight;
      return natural;
    }

    function findWidthForTargetHeight(layout, targetHeight, minWidth, maxWidth) {
      const lowStart = Math.max(minWidth, 180);
      const highStart = Math.max(lowStart, maxWidth);
      const currentRect = layout.getBoundingClientRect();
      const currentWidth = Math.round(currentRect.width);
      const currentNatural = measureNaturalHeight(layout, currentWidth);
      if (currentNatural <= targetHeight) {
        return { width: currentWidth, height: targetHeight };
      }
      const highNatural = measureNaturalHeight(layout, highStart);
      if (highNatural > targetHeight) {
        return { width: highStart, height: highNatural };
      }

      let low = Math.max(currentWidth, lowStart);
      let high = highStart;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const naturalAtMid = measureNaturalHeight(layout, mid);
        if (naturalAtMid <= targetHeight) {
          high = mid;
        } else {
          low = mid + 1;
        }
      }
      return { width: low, height: targetHeight };
    }

    function handleBlockResizeMove(event) {
      if (!richLayoutBlockResizeState?.layout?.isConnected) {
        stopBlockResize();
        hideBlockResizeHandle();
        return;
      }
      const { layout, startY, startHeight } = richLayoutBlockResizeState;
      const deltaY = event.clientY - startY;
      const nextHeight = Math.round(Math.min(1600, Math.max(40, startHeight + deltaY)));
      const fitted = findWidthForTargetHeight(layout, nextHeight, 180, 2200);
      layout.style.width = `${Math.round(Math.max(180, fitted.width))}px`;
      const lockedHeight = Math.round(Math.max(40, fitted.height));
      layout.style.height = `${lockedHeight}px`;
      layout.style.minHeight = `${lockedHeight}px`;
      layout.dataset.heightLocked = 'true';
      updateBlockResizeHandle();
    }

    function startBlockResize(event) {
      const layout = getSelectedRichLayoutElement();
      if (!layout) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = layout.getBoundingClientRect();
      const currentHeight = parsePixelStyleValue(layout.style.height, rect.height);
      layout.style.width = `${Math.round(rect.width)}px`;
      if (currentHeight > 0) {
        const lockedHeight = Math.round(currentHeight);
        layout.style.height = `${lockedHeight}px`;
        layout.style.minHeight = `${lockedHeight}px`;
      }
      layout.dataset.heightLocked = 'true';
      richLayoutBlockResizeState = {
        layout,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: currentHeight,
      };
      window.addEventListener('pointermove', handleBlockResizeMove);
      window.addEventListener('pointerup', stopBlockResize);
      window.addEventListener('pointercancel', stopBlockResize);
    }

    return {
      stopResize,
      maybeStartResize,
      hideBlockResizeHandle,
      updateBlockResizeHandle,
      stopBlockResize,
    };
  }

  window.IterpanoEditorRichLayout = {
    createRichLayoutController,
  };
})();
