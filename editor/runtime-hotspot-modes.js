(function () {
  function createHotspotModesController(options) {
    const {
      btnAddHotspot,
      btnEditHotspot,
      btnSaveHotspot,
      btnTogglePlacement,
      viewerCanvas,
      getSelectedScene,
      getSelectedInfoHotspot,
      getProjectHomePage,
      updateHomePageButtons,
      setHomePageEditMode,
      getPlacementMode,
      setPlacementMode,
      getInfoHotspotCreateMode,
      setInfoHotspotCreateModeState,
      getInfoHotspotEditMode,
      setInfoHotspotEditModeState,
      getHomePageEditMode,
      getPendingSceneLinkDraft,
      clearPendingSceneLinkDraft,
      hideHotspotHoverCard,
      closeHotspotPreview,
      saveRichEditorModalContent,
      saveRichSourceModalContent,
      openRichEditorModal,
      renderInfoHotspotList,
      renderContentBlocks,
      renderLinkEditor,
      updateStatus,
      getRichEditorModalVisible,
      getRichSourceModalVisible,
      getRichEditorContext,
      getRichSourceContext,
    } = options;

    function updatePlacementButtonLabel() {
      if (!btnTogglePlacement) return;
      btnTogglePlacement.textContent = getPlacementMode() ? 'Done' : 'Edit';
    }

    function isInfoHotspotInteractionModeActive() {
      return getInfoHotspotCreateMode() || getInfoHotspotEditMode();
    }

    function updateInfoHotspotModeButtons() {
      if (btnAddHotspot) {
        btnAddHotspot.classList.toggle('active', getInfoHotspotCreateMode());
        btnAddHotspot.textContent = getInfoHotspotCreateMode() ? 'New ON' : 'New';
        btnAddHotspot.setAttribute('aria-pressed', getInfoHotspotCreateMode() ? 'true' : 'false');
      }
      if (btnEditHotspot) {
        btnEditHotspot.classList.toggle('active', getInfoHotspotEditMode());
        btnEditHotspot.textContent = getInfoHotspotEditMode() ? 'Edit ON' : 'Edit';
        btnEditHotspot.setAttribute('aria-pressed', getInfoHotspotEditMode() ? 'true' : 'false');
      }
      if (btnSaveHotspot) {
        const canSave =
          Boolean(getSelectedScene()) &&
          Boolean(getSelectedInfoHotspot()) &&
          isInfoHotspotInteractionModeActive();
        btnSaveHotspot.disabled = !canSave;
      }
      updateHomePageButtons();
    }

    function togglePlacementMode() {
      const wasPlacementMode = getPlacementMode();
      const hadPendingBeforeToggle = Boolean(getPendingSceneLinkDraft());
      const nextPlacementMode = !wasPlacementMode;
      setPlacementMode(nextPlacementMode);
      btnTogglePlacement?.classList.toggle('active', nextPlacementMode);
      updatePlacementButtonLabel();
      if (wasPlacementMode && !nextPlacementMode && hadPendingBeforeToggle) {
        clearPendingSceneLinkDraft(true);
      }
      renderLinkEditor();
      viewerCanvas?.classList.toggle('placement-mode', nextPlacementMode);
      if (nextPlacementMode) {
        hideHotspotHoverCard();
      }
      updateStatus(
        nextPlacementMode
          ? 'Edit mode enabled for Scene Links. Drag link hotspots or double-click panorama to place/move selected link.'
          : (hadPendingBeforeToggle ? 'Pending link cancelled.' : 'Edit mode disabled.')
      );
    }

    function setInfoHotspotCreateMode(nextMode, { silent = false } = {}) {
      const next = Boolean(nextMode);
      if (next && !getSelectedScene()) {
        updateStatus('Select a scene first.');
        return;
      }
      if (next && getPlacementMode()) {
        togglePlacementMode();
      }
      if (next && getInfoHotspotEditMode()) {
        setInfoHotspotEditModeState(false);
        if (getRichEditorModalVisible()) {
          saveRichEditorModalContent({ closeAfterSave: true, refreshPanel: true });
        }
      }
      if (next && getHomePageEditMode()) {
        setHomePageEditMode(false, { silent: true });
      }
      setInfoHotspotCreateModeState(next);
      if (next) {
        hideHotspotHoverCard();
        closeHotspotPreview();
      }
      updateInfoHotspotModeButtons();
      renderInfoHotspotList();
      renderContentBlocks();
      if (!silent) {
        updateStatus(
          next
            ? 'New mode ON: double-click panorama to create info hotspots. Click New again to exit.'
            : 'New mode OFF.'
        );
      }
    }

    function setInfoHotspotEditMode(nextMode, { silent = false } = {}) {
      const next = Boolean(nextMode);
      if (next) {
        const hotspot = getSelectedInfoHotspot();
        if (!hotspot) {
          updateStatus('Select an info hotspot first.');
          return;
        }
        if (getPlacementMode()) {
          togglePlacementMode();
        }
        if (getInfoHotspotCreateMode()) {
          setInfoHotspotCreateModeState(false);
        }
        if (getHomePageEditMode()) {
          setHomePageEditMode(false, { silent: true });
        }
        setInfoHotspotEditModeState(true);
        hideHotspotHoverCard();
        closeHotspotPreview();
      } else {
        setInfoHotspotEditModeState(false);
        if (getRichEditorModalVisible()) {
          saveRichEditorModalContent({ closeAfterSave: true, refreshPanel: true });
        }
      }
      updateInfoHotspotModeButtons();
      renderInfoHotspotList();
      renderContentBlocks();
      if (!silent) {
        updateStatus(
          next
            ? 'Edit mode ON: drag info hotspots or double-click panorama to move selected info hotspot. Click Edit again to exit.'
            : 'Edit mode OFF.'
        );
      }
    }

    function toggleInfoHotspotCreateMode() {
      setInfoHotspotCreateMode(!getInfoHotspotCreateMode());
    }

    function toggleInfoHotspotEditMode() {
      setInfoHotspotEditMode(!getInfoHotspotEditMode());
    }

    return {
      updatePlacementButtonLabel,
      isInfoHotspotInteractionModeActive,
      updateInfoHotspotModeButtons,
      togglePlacementMode,
      setInfoHotspotCreateMode,
      setInfoHotspotEditMode,
      toggleInfoHotspotCreateMode,
      toggleInfoHotspotEditMode,
    };
  }

  window.IterpanoEditorHotspotModes = {
    createHotspotModesController,
  };
})();
