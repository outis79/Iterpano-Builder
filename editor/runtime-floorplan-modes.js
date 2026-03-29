(function () {
  function createFloorplanModesController(options) {
    const {
      btnFloorplanPlaceScene,
      btnFloorplanEdit,
      btnFloorplanSelectAll,
      btnFloorplanToggleLabels,
      btnFloorplanToggleAliases,
      miniMap,
      getFloorplanShowLabels,
      setFloorplanShowLabelsState,
      getFloorplanShowAliases,
      setFloorplanShowAliasesState,
      getFloorplanPlaceMode,
      setFloorplanPlaceModeState,
      getFloorplanEditMode,
      setFloorplanEditModeState,
      getFloorplanSelectAllMode,
      setFloorplanSelectAllModeState,
      getSelectedFloorplan,
      stopFloorplanPan,
      updateFloorplanColorPaletteUi,
      updateFloorplanDeleteNodeUi,
      updateFloorplanSelectAllUi,
      renderFloorplans,
      updateStatus,
    } = options;

    function updateFloorplanLabelToggleUi() {
      if (!btnFloorplanToggleLabels) return;
      btnFloorplanToggleLabels.classList.toggle('active', getFloorplanShowLabels());
      btnFloorplanToggleLabels.textContent = getFloorplanShowLabels() ? 'Names ON' : 'Names OFF';
      if (btnFloorplanToggleAliases) {
        btnFloorplanToggleAliases.classList.toggle('active', getFloorplanShowAliases());
        btnFloorplanToggleAliases.textContent = getFloorplanShowAliases() ? 'Alias ON' : 'Alias OFF';
      }
    }

    function setFloorplanShowLabels(nextMode) {
      setFloorplanShowLabelsState(Boolean(nextMode));
      updateFloorplanLabelToggleUi();
      renderFloorplans();
    }

    function setFloorplanShowAliases(nextMode) {
      setFloorplanShowAliasesState(Boolean(nextMode));
      updateFloorplanLabelToggleUi();
      renderFloorplans();
    }

    function updateFloorplanPlaceUi() {
      if (btnFloorplanPlaceScene) {
        btnFloorplanPlaceScene.classList.toggle('active', getFloorplanPlaceMode());
        btnFloorplanPlaceScene.textContent = getFloorplanPlaceMode() ? 'Place ON' : 'Place';
      }
    }

    function updateFloorplanEditUi() {
      if (btnFloorplanEdit) {
        btnFloorplanEdit.classList.toggle('active', getFloorplanEditMode());
        btnFloorplanEdit.textContent = getFloorplanEditMode() ? 'Edit ON' : 'Edit';
      }
    }

    function setFloorplanSelectAllMode(nextMode, { silent = false } = {}) {
      if (!getFloorplanEditMode()) {
        setFloorplanSelectAllModeState(false);
        updateFloorplanSelectAllUi();
        return;
      }
      const floorplan = getSelectedFloorplan();
      if (!floorplan || !(floorplan.nodes || []).length) {
        setFloorplanSelectAllModeState(false);
        updateFloorplanSelectAllUi();
        return;
      }
      setFloorplanSelectAllModeState(Boolean(nextMode));
      if (!silent) {
        updateStatus(getFloorplanSelectAllMode() ? 'All map points selected.' : 'All map points unselected.');
      }
      updateFloorplanColorPaletteUi();
      updateFloorplanDeleteNodeUi();
      updateFloorplanSelectAllUi();
      renderFloorplans();
    }

    function setFloorplanPlaceMode(nextMode) {
      const next = Boolean(nextMode);
      setFloorplanPlaceModeState(next);
      if (next) {
        setFloorplanEditModeState(false);
        setFloorplanSelectAllModeState(false);
        stopFloorplanPan();
      }
      if (miniMap) {
        miniMap.classList.toggle('floorplan-pan-enabled', !getFloorplanPlaceMode() && miniMap.classList.contains('has-floorplan'));
      }
      updateFloorplanPlaceUi();
      updateFloorplanEditUi();
      updateFloorplanColorPaletteUi();
      updateFloorplanDeleteNodeUi();
      updateFloorplanSelectAllUi();
    }

    function setFloorplanEditMode(nextMode) {
      const next = Boolean(nextMode);
      setFloorplanEditModeState(next);
      if (next) {
        setFloorplanPlaceModeState(false);
      } else {
        setFloorplanSelectAllModeState(false);
      }
      if (miniMap) {
        miniMap.classList.toggle('floorplan-pan-enabled', !getFloorplanPlaceMode() && miniMap.classList.contains('has-floorplan'));
      }
      updateFloorplanPlaceUi();
      updateFloorplanEditUi();
      updateFloorplanColorPaletteUi();
      updateFloorplanDeleteNodeUi();
      updateFloorplanSelectAllUi();
    }

    return {
      updateFloorplanLabelToggleUi,
      setFloorplanShowLabels,
      setFloorplanShowAliases,
      updateFloorplanPlaceUi,
      updateFloorplanEditUi,
      setFloorplanSelectAllMode,
      setFloorplanPlaceMode,
      setFloorplanEditMode,
    };
  }

  window.IterpanoEditorFloorplanModes = {
    createFloorplanModesController,
  };
})();
