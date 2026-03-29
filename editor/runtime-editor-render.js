(function () {
  function createEditorRenderController(options) {
    const {
      richEditorModal,
      richSourceModal,
      previewModal,
      closeRichEditorModal,
      getRichEditorHotspotByContext,
      getRichSourceHotspotByContext,
      getIsInfoHotspotEditMode,
      setIsInfoHotspotEditMode,
      updateInfoHotspotModeButtons,
      getPreviewHotspotByContext,
      closeRichSourceModal,
      closeHotspotPreview,
      getSelectedScene,
      sceneTitle,
      projectFovInput,
      getSelectedSceneFov,
      renderSceneGroupOptions,
      renderSceneList,
      renderHotspotList,
      renderLinkEditor,
      renderContentBlocks,
      renderFloorplans,
      switchEditorScene,
    } = options;

    function syncOpenRichEditorContexts() {
      if (richEditorModal?.classList.contains('visible') && !getRichEditorHotspotByContext()) {
        closeRichEditorModal();
        if (getIsInfoHotspotEditMode()) {
          setIsInfoHotspotEditMode(false);
          updateInfoHotspotModeButtons();
        }
      }
      if (richSourceModal?.classList.contains('visible') && !getRichSourceHotspotByContext()) {
        closeRichSourceModal();
      }
      if (previewModal?.classList.contains('visible') && !getPreviewHotspotByContext()) {
        closeHotspotPreview();
      }
    }

    function updateSceneTitle() {
      const scene = getSelectedScene();
      sceneTitle.textContent = scene ? `Scene: ${scene.name}` : 'Scene: -';
    }

    function syncSceneFovInput() {
      if (!projectFovInput) return;
      const scene = getSelectedScene();
      if (!scene) {
        projectFovInput.value = '1.4';
        projectFovInput.disabled = true;
        return;
      }
      projectFovInput.disabled = false;
      projectFovInput.value = String(Number(getSelectedSceneFov().toFixed(2)));
    }

    function renderAll() {
      syncOpenRichEditorContexts();
      updateInfoHotspotModeButtons();
      renderSceneGroupOptions();
      renderSceneList();
      renderHotspotList();
      renderLinkEditor();
      renderContentBlocks();
      updateSceneTitle();
      syncSceneFovInput();
      renderFloorplans();
      switchEditorScene();
    }

    return {
      syncOpenRichEditorContexts,
      updateSceneTitle,
      syncSceneFovInput,
      renderAll,
    };
  }

  window.IterpanoEditorRender = {
    createEditorRenderController,
  };
})();
