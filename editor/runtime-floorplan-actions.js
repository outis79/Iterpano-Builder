(function () {
  function createFloorplanActionsController(options) {
    const {
      miniMap,
      getSelectedScene,
      getSelectedFloorplan,
      getSelectedSceneId,
      getFloorplanEditMode,
      getFloorplanPlaceMode,
      getFloorplanSelectAllMode,
      setFloorplanSelectAllModeState,
      getFloorplanColorValue,
      normalizeFloorplanColorKey,
      renderFloorplans,
      autosave,
      updateStatus,
      selectScene,
      zoomFloorplanAt,
      startFloorplanPan,
    } = options;

    let dragState = null;

    function addFloorplanNode(x, y) {
      const scene = getSelectedScene();
      const floorplan = getSelectedFloorplan();
      if (!scene || !floorplan) return;
      if (scene.groupId !== floorplan.groupId) return;

      const existing = floorplan.nodes.find((node) => node.sceneId === scene.id);
      if (existing) {
        updateStatus(`Scene "${scene.name}" is already on the map.`);
        return;
      }
      const selectedColor = normalizeFloorplanColorKey(getFloorplanColorValue() || floorplan.markerColorKey || 'yellow');
      floorplan.nodes.push({ sceneId: scene.id, x, y, rotation: 0, colorKey: selectedColor });

      renderFloorplans();
      updateStatus(`Scene "${scene.name}" placed on map.`);
      autosave();
    }

    function removeFloorplanNode(index) {
      const floorplan = getSelectedFloorplan();
      if (!floorplan) return;
      floorplan.nodes.splice(index, 1);
      renderFloorplans();
      autosave();
    }

    function deleteSelectedFloorplanNode() {
      const floorplan = getSelectedFloorplan();
      if (!floorplan) return;
      if (getFloorplanSelectAllMode()) {
        const total = (floorplan.nodes || []).length;
        if (!total) {
          updateStatus('No map points to delete.');
          return;
        }
        floorplan.nodes = [];
        setFloorplanSelectAllModeState(false);
        renderFloorplans();
        updateStatus(`Deleted ${total} map point(s).`);
        autosave();
        return;
      }
      const scene = getSelectedScene();
      if (!scene) return;
      const index = (floorplan.nodes || []).findIndex((node) => node.sceneId === scene.id);
      if (index === -1) {
        updateStatus('Selected scene is not placed on the map.');
        return;
      }
      floorplan.nodes.splice(index, 1);
      renderFloorplans();
      updateStatus(`Map point removed for scene "${scene.name}".`);
      autosave();
    }

    function rotateFloorplanNode(index, delta) {
      const floorplan = getSelectedFloorplan();
      if (!floorplan) return;
      const node = floorplan.nodes[index];
      if (!node) return;
      const next = (node.rotation || 0) + delta;
      node.rotation = (next + 360) % 360;
      renderFloorplans();
      autosave();
    }

    function stopDrag() {
      if (!dragState) return;
      dragState = null;
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', stopDrag);
      autosave();
    }

    function handleDrag(event) {
      if (!dragState) return;
      const floorplan = getSelectedFloorplan();
      if (!floorplan || floorplan.id !== dragState.floorplanId) return;
      const canvas = miniMap?.querySelector('.floorplan-canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const node = floorplan.nodes[dragState.index];
      if (!node) return;
      node.x = Math.min(Math.max(x, 0), 1);
      node.y = Math.min(Math.max(y, 0), 1);
      renderFloorplans();
    }

    function startDrag(event, index) {
      event.stopPropagation();
      if (!getFloorplanEditMode()) {
        return;
      }
      const floorplan = getSelectedFloorplan();
      if (!floorplan) return;
      dragState = { index, floorplanId: floorplan.id };
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', stopDrag);
    }

    function bindNodeElement(dot, index, nodeSceneId) {
      dot.addEventListener('mousedown', (event) => startDrag(event, index));
      dot.addEventListener('click', (event) => {
        event.stopPropagation();
        if (getFloorplanSelectAllMode()) {
          setFloorplanSelectAllModeState(false);
        }
        if (getSelectedSceneId() !== nodeSceneId) {
          selectScene(nodeSceneId);
        } else {
          renderFloorplans();
        }
      });
      dot.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (!getFloorplanEditMode()) {
          updateStatus('Enable Edit to modify map points.');
          return;
        }
        removeFloorplanNode(index);
      });
    }

    function bindCanvasElement(canvas, groupId) {
      const normalizeLegacyWheelEvent = (event) => {
        if (typeof event.deltaY === 'number') return event;
        if (typeof event.wheelDelta === 'number') {
          event.deltaY = -event.wheelDelta;
          return event;
        }
        if (typeof event.detail === 'number') {
          event.deltaY = event.detail * 40;
          return event;
        }
        return event;
      };
      const handleCanvasClick = (event) => {
        if (!getFloorplanPlaceMode()) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        addFloorplanNode(x, y);
      };
      const handleWheel = (event) => {
        zoomFloorplanAt(normalizeLegacyWheelEvent(event), groupId);
      };

      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('mousewheel', handleWheel, { passive: false });
      canvas.addEventListener('mousedown', startFloorplanPan);

      const image = canvas.querySelector('.floorplan-image');
      image?.addEventListener('wheel', handleWheel, { passive: false });
      image?.addEventListener('mousewheel', handleWheel, { passive: false });

      if (miniMap) {
        miniMap.onwheel = (event) => {
          if (!event.target.closest('.floorplan-canvas')) return;
          handleWheel(event);
        };
        miniMap.onmousewheel = (event) => {
          if (!event.target.closest('.floorplan-canvas')) return;
          handleWheel(event);
        };
      }
    }

    return {
      addFloorplanNode,
      removeFloorplanNode,
      deleteSelectedFloorplanNode,
      rotateFloorplanNode,
      startDrag,
      stopDrag,
      bindNodeElement,
      bindCanvasElement,
    };
  }

  window.IterpanoEditorFloorplanActions = {
    createFloorplanActionsController,
  };
})();
