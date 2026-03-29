(function () {
  function createFloorplanRenderController(options) {
    const {
      miniMap,
      btnFloorplanPlaceScene,
      btnFloorplanEdit,
      btnFloorplanSelectAll,
      btnFloorplanDeleteNode,
      btnFloorplanToggleLabels,
      btnFloorplanToggleAliases,
      btnFloorplanZoomReset,
      btnFloorplanZoomOut,
      btnFloorplanZoomIn,
      floorplanColorSelect,
      state,
      FLOORPLAN_COLOR_MAP,
      colorLabelFromKey,
      floorplanZoomByGroup,
      floorplanImageMetricsById,
      normalizeFloorplanColorKey,
      getSelectedGroup,
      getSelectedScene,
      getSelectedFloorplan,
      getSelectedFloorplanNodes,
      getSelectedFloorplanColorKey,
      getFloorplanPlaceMode,
      getFloorplanEditMode,
      getFloorplanSelectAllMode,
      getFloorplanShowLabels,
      getFloorplanShowAliases,
      setFloorplanPlaceMode,
      setFloorplanEditMode,
      updateFloorplanLabelToggleUi,
      updateFloorplanDeleteNodeUi,
      updateFloorplanSelectAllUi,
      stopFloorplanPan,
      autosave,
      updateStatus,
      getSceneName,
      getSceneAlias,
      getRuntimeFloorplanActions,
    } = options;

    function hexToRgb(hex) {
      const clean = String(hex || '').replace('#', '');
      const value = clean.length === 3
        ? clean.split('').map((c) => c + c).join('')
        : clean;
      if (!/^[0-9a-f]{6}$/i.test(value)) return { r: 240, g: 200, b: 75 };
      return {
        r: Number.parseInt(value.slice(0, 2), 16),
        g: Number.parseInt(value.slice(2, 4), 16),
        b: Number.parseInt(value.slice(4, 6), 16)
      };
    }

    function rgbToHex(r, g, b) {
      const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
      return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
    }

    function darkenHex(hex, ratio = 0.22) {
      const rgb = hexToRgb(hex);
      const k = Math.max(0, Math.min(1, 1 - ratio));
      return rgbToHex(rgb.r * k, rgb.g * k, rgb.b * k);
    }

    function withAlpha(hex, alpha = 0.35) {
      const rgb = hexToRgb(hex);
      const a = Math.max(0, Math.min(1, alpha));
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    }

    function getContrastTextColor(hex) {
      const rgb = hexToRgb(hex);
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      return luminance >= 0.62 ? '#111111' : '#f8fafc';
    }

    function applyFloorplanNodeColorStyles(nodeElement, colorKey) {
      const color = FLOORPLAN_COLOR_MAP[normalizeFloorplanColorKey(colorKey)];
      nodeElement.style.setProperty('--floorplan-marker-color', color);
      nodeElement.style.setProperty('--floorplan-marker-border', darkenHex(color, 0.24));
      nodeElement.style.setProperty('--floorplan-marker-ring', withAlpha(color, 0.35));
      nodeElement.style.setProperty('--floorplan-marker-text', getContrastTextColor(color));
    }

    function updateFloorplanColorPaletteUi() {
      if (!floorplanColorSelect) return;
      const floorplan = getSelectedFloorplan();
      const selectedKey = getSelectedFloorplanColorKey();
      const disabled = !floorplan || (!getFloorplanEditMode() && !getFloorplanPlaceMode());
      floorplanColorSelect.innerHTML = '';
      Object.keys(FLOORPLAN_COLOR_MAP).forEach((key) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = '⬤';
        option.title = colorLabelFromKey(key);
        option.style.color = FLOORPLAN_COLOR_MAP[key];
        floorplanColorSelect.appendChild(option);
      });
      floorplanColorSelect.disabled = disabled;
      floorplanColorSelect.value = selectedKey;
      floorplanColorSelect.style.color = FLOORPLAN_COLOR_MAP[selectedKey];
    }

    function setSelectedFloorplanColor(colorKey) {
      const floorplan = getSelectedFloorplan();
      if (!floorplan) return;
      if (!getFloorplanEditMode() && !getFloorplanPlaceMode()) {
        updateStatus('Enable Place or Edit to change map color.');
        return;
      }
      const nextKey = normalizeFloorplanColorKey(colorKey);
      floorplan.markerColorKey = nextKey;
      const selectedNodes = getSelectedFloorplanNodes();
      if (getFloorplanEditMode() && selectedNodes.length) {
        selectedNodes.forEach((node) => {
          node.colorKey = nextKey;
        });
      }
      renderFloorplans();
      autosave();
    }

    function getFloorplanZoom(groupId = state.selectedGroupId) {
      if (!groupId) return 1;
      const value = floorplanZoomByGroup.get(groupId);
      return Number.isFinite(value) ? value : 1;
    }

    function getFloorplanImageMetrics(floorplan) {
      if (!floorplan?.id) return null;
      const storedWidth = Number(floorplan.imageWidth);
      const storedHeight = Number(floorplan.imageHeight);
      if (storedWidth > 0 && storedHeight > 0) {
        return { width: storedWidth, height: storedHeight };
      }
      return floorplanImageMetricsById.get(floorplan.id) || null;
    }

    function setFloorplanImageMetrics(floorplan, width, height) {
      if (!floorplan?.id) return;
      const nextWidth = Math.round(Number(width) || 0);
      const nextHeight = Math.round(Number(height) || 0);
      if (nextWidth <= 0 || nextHeight <= 0) return;
      floorplan.imageWidth = nextWidth;
      floorplan.imageHeight = nextHeight;
      floorplanImageMetricsById.set(floorplan.id, { width: nextWidth, height: nextHeight });
    }

    function syncFloorplanCanvasSize(canvas, floorplan) {
      if (!canvas || !floorplan || !miniMap) return;
      const metrics = getFloorplanImageMetrics(floorplan);
      const zoom = getFloorplanZoom(floorplan.groupId || state.selectedGroupId);
      if (metrics?.width > 0 && metrics?.height > 0) {
        const availableWidth = Math.max(1, miniMap.clientWidth);
        const availableHeight = Math.max(1, miniMap.clientHeight || 140);
        const fitScale = Math.min(availableWidth / metrics.width, availableHeight / metrics.height);
        const baseScale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
        const widthPx = Math.max(1, Math.round(metrics.width * baseScale * zoom));
        const heightPx = Math.max(1, Math.round(metrics.height * baseScale * zoom));
        canvas.style.width = `${widthPx}px`;
        canvas.style.minWidth = `${widthPx}px`;
        canvas.style.height = `${heightPx}px`;
        canvas.style.minHeight = `${heightPx}px`;
        canvas.style.aspectRatio = `${metrics.width} / ${metrics.height}`;
      } else {
        const baseWidth = Math.max(1, miniMap.clientWidth);
        const widthPx = Math.max(1, Math.round(baseWidth * zoom));
        const fallbackHeight = Math.max(1, Math.round((miniMap.clientHeight || 140) * zoom));
        canvas.style.width = `${widthPx}px`;
        canvas.style.minWidth = `${widthPx}px`;
        canvas.style.removeProperty('aspect-ratio');
        canvas.style.height = `${fallbackHeight}px`;
        canvas.style.minHeight = `${fallbackHeight}px`;
      }
    }

    function refreshFloorplanCanvasLayout() {
      const floorplan = getSelectedFloorplan();
      const canvas = miniMap?.querySelector('.floorplan-canvas');
      if (!floorplan || !canvas || !miniMap) return;
      const previousWidth = canvas.offsetWidth || 1;
      const previousHeight = canvas.offsetHeight || 1;
      const relativeCenterX = (miniMap.scrollLeft + (miniMap.clientWidth / 2)) / previousWidth;
      const relativeCenterY = (miniMap.scrollTop + (miniMap.clientHeight / 2)) / previousHeight;
      syncFloorplanCanvasSize(canvas, floorplan);
      requestAnimationFrame(() => {
        const nextWidth = canvas.offsetWidth || 1;
        const nextHeight = canvas.offsetHeight || 1;
        miniMap.scrollLeft = Math.max(0, (relativeCenterX * nextWidth) - (miniMap.clientWidth / 2));
        miniMap.scrollTop = Math.max(0, (relativeCenterY * nextHeight) - (miniMap.clientHeight / 2));
      });
    }

    function setFloorplanZoom(nextZoom) {
      const groupId = state.selectedGroupId;
      if (!groupId) return;
      const clamped = Math.min(8, Math.max(0.5, nextZoom));
      floorplanZoomByGroup.set(groupId, clamped);
      renderFloorplans();
    }

    function renderFloorplans() {
      stopFloorplanPan();
      const group = getSelectedGroup();
      const setFloorplanControlsState = ({ hasFloorplan = false, hasSceneSelection = false } = {}) => {
        if (btnFloorplanPlaceScene) btnFloorplanPlaceScene.disabled = !hasFloorplan || !hasSceneSelection;
        if (btnFloorplanEdit) btnFloorplanEdit.disabled = !hasFloorplan;
        if (btnFloorplanSelectAll) btnFloorplanSelectAll.disabled = true;
        if (btnFloorplanDeleteNode) btnFloorplanDeleteNode.disabled = true;
        if (btnFloorplanToggleLabels) btnFloorplanToggleLabels.disabled = !hasFloorplan;
        if (btnFloorplanToggleAliases) btnFloorplanToggleAliases.disabled = !hasFloorplan;
        if (btnFloorplanZoomReset) btnFloorplanZoomReset.disabled = !hasFloorplan;
        if (btnFloorplanZoomOut) btnFloorplanZoomOut.disabled = !hasFloorplan;
        if (btnFloorplanZoomIn) btnFloorplanZoomIn.disabled = !hasFloorplan;
      };
      if (!group) {
        miniMap.classList.remove('has-floorplan');
        miniMap.classList.remove('floorplan-pan-enabled');
        miniMap.innerHTML = '<div class="mini-map-placeholder"></div>';
        setFloorplanControlsState();
        setFloorplanPlaceMode(false);
        setFloorplanEditMode(false);
        updateFloorplanColorPaletteUi();
        return;
      }

      const selected = getSelectedFloorplan();
      const hasSceneSelection = Boolean(getSelectedScene());
      state.selectedFloorplanId = selected?.id || null;
      miniMap.innerHTML = '';
      if (!selected) {
        miniMap.classList.remove('has-floorplan');
        miniMap.classList.remove('floorplan-pan-enabled');
        miniMap.innerHTML = '<div class="mini-map-placeholder"></div>';
        setFloorplanControlsState();
        setFloorplanPlaceMode(false);
        setFloorplanEditMode(false);
        updateFloorplanColorPaletteUi();
      } else {
        miniMap.classList.add('has-floorplan');
        miniMap.classList.toggle('floorplan-pan-enabled', !getFloorplanPlaceMode());
        setFloorplanControlsState({ hasFloorplan: true, hasSceneSelection });
        if (!hasSceneSelection) {
          setFloorplanPlaceMode(false);
        }
        const canvas = document.createElement('div');
        canvas.className = 'floorplan-canvas';

        const img = document.createElement('img');
        img.className = 'floorplan-image';
        img.alt = selected?.name || 'Floorplan';
        img.addEventListener('load', () => {
          setFloorplanImageMetrics(selected, img.naturalWidth, img.naturalHeight);
          syncFloorplanCanvasSize(canvas, selected);
        });
        img.src = selected?.dataUrl || selected?.path || '';
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          setFloorplanImageMetrics(selected, img.naturalWidth, img.naturalHeight);
        }
        canvas.appendChild(img);
        syncFloorplanCanvasSize(canvas, selected);

        const nodes = selected?.nodes || [];
        const selectedSceneIds = new Set(
          (state.multiSelectedSceneIds || []).filter((sceneId) =>
            (state.project?.scenes || []).some((scene) => scene.id === sceneId && scene.groupId === group.id)
          )
        );
        if (!selectedSceneIds.size && state.selectedSceneId) {
          selectedSceneIds.add(state.selectedSceneId);
        }
        nodes.forEach((node, index) => {
          const dot = document.createElement('div');
          const isActive = getFloorplanSelectAllMode() || selectedSceneIds.has(node.sceneId);
          dot.className = `floorplan-node${isActive ? ' active' : ''}`;
          dot.style.left = `${node.x * 100}%`;
          dot.style.top = `${node.y * 100}%`;
          dot.dataset.index = String(index);
          applyFloorplanNodeColorStyles(dot, node.colorKey || selected.markerColorKey);

          const label = document.createElement('div');
          label.className = 'floorplan-label';
          const aliasText = getSceneAlias(node.sceneId);
          const labelText = getFloorplanShowAliases()
            ? (aliasText || (getFloorplanShowLabels() ? getSceneName(node.sceneId) : ''))
            : getSceneName(node.sceneId);
          if (labelText && (getFloorplanShowAliases() || getFloorplanShowLabels())) {
            label.classList.add('visible');
          }
          label.textContent = labelText;
          dot.appendChild(label);

          getRuntimeFloorplanActions()?.bindNodeElement(dot, index, node.sceneId);
          canvas.appendChild(dot);
        });

        getRuntimeFloorplanActions()?.bindCanvasElement(canvas, group.id);

        miniMap.appendChild(canvas);
      }
      updateFloorplanLabelToggleUi();
      updateFloorplanColorPaletteUi();
      updateFloorplanDeleteNodeUi();
      updateFloorplanSelectAllUi();
    }

    return {
      applyFloorplanNodeColorStyles,
      updateFloorplanColorPaletteUi,
      setSelectedFloorplanColor,
      getFloorplanZoom,
      getFloorplanImageMetrics,
      setFloorplanImageMetrics,
      syncFloorplanCanvasSize,
      refreshFloorplanCanvasLayout,
      setFloorplanZoom,
      renderFloorplans,
    };
  }

  window.IterpanoEditorFloorplanRender = {
    createFloorplanRenderController,
  };
})();
