(function () {
  function createHotspotActionsController(options) {
    const {
      getSelectedScene,
      getSelectedInfoHotspot,
      getSceneInfoHotspots,
      getSceneLinkHotspots,
      getSelectedHotspot,
      getPendingSceneLinkDraft,
      setPendingSceneLinkDraft,
      clearPendingSceneLinkDraft,
      getDefaultLinkTargetSceneId,
      getNextSceneLinkCode,
      normalizeSceneLinkColorKey,
      getNewLinkColorKey,
      isPlacementMode,
      togglePlacementMode,
      refreshHotspotPanelsWithoutSceneSwitch,
      renderHotspotList,
      renderLinkEditor,
      renderContentBlocks,
      updateStatus,
      autosave,
      getSelectedHotspotId,
      setSelectedHotspotId,
    } = options;

    function deleteInfoHotspot() {
      const scene = getSelectedScene();
      if (!scene) {
        updateStatus('Select a scene first.');
        return;
      }
      const selected = getSelectedInfoHotspot();
      if (!selected) {
        updateStatus('Select an info hotspot first.');
        return;
      }
      const index = scene.hotspots.findIndex((hotspot) => hotspot.id === selected.id);
      if (index === -1) {
        updateStatus('Select an info hotspot first.');
        return;
      }
      scene.hotspots.splice(index, 1);
      setSelectedHotspotId(getSceneInfoHotspots(scene)[0]?.id || getSceneLinkHotspots(scene)[0]?.id || null);
      refreshHotspotPanelsWithoutSceneSwitch();
      updateStatus('Info hotspot deleted.');
      autosave();
    }

    function addSceneLinkDraft() {
      const scene = getSelectedScene();
      if (!scene) {
        updateStatus('Select a scene first.');
        return;
      }

      const pendingSceneLinkDraft = getPendingSceneLinkDraft();
      if (pendingSceneLinkDraft && pendingSceneLinkDraft.sceneId !== scene.id) {
        clearPendingSceneLinkDraft(false);
      }

      const refreshedPendingDraft = getPendingSceneLinkDraft();
      if (refreshedPendingDraft && refreshedPendingDraft.sceneId === scene.id) {
        renderHotspotList();
        renderLinkEditor();
        updateStatus(`Link ${refreshedPendingDraft.linkCode} is not placed yet. Double-click to place it first, or press Done to cancel.`);
        return;
      }

      const targetSceneId = getDefaultLinkTargetSceneId(scene);
      const linkCode = getNextSceneLinkCode();
      setPendingSceneLinkDraft({
        sceneId: scene.id,
        linkCode,
        targetSceneId,
        comment: '',
        linkColorKey: normalizeSceneLinkColorKey(getNewLinkColorKey())
      });
      setSelectedHotspotId(null);

      if (!isPlacementMode()) {
        togglePlacementMode();
      }
      renderHotspotList();
      renderLinkEditor();
      renderContentBlocks();
      updateStatus(`New link ${linkCode} ready. Double-click on the panorama to place it. Press Done to cancel.`);
    }

    function deleteSceneLink() {
      const scene = getSelectedScene();
      if (!scene) {
        updateStatus('Select a scene first.');
        return;
      }

      const selected = getSelectedHotspot();
      let hotspot = selected;
      if (!hotspot || !((hotspot.contentBlocks || []).some((block) => block.type === 'scene'))) {
        hotspot = [...(scene.hotspots || [])].reverse().find((item) =>
          (item.contentBlocks || []).some((block) => block.type === 'scene')
        ) || null;
      }

      if (!hotspot) {
        updateStatus('No link hotspot to delete.');
        return;
      }

      const sceneIndex = (scene.hotspots || []).findIndex((item) => item.id === hotspot.id);
      if (sceneIndex === -1) {
        updateStatus('No link hotspot to delete.');
        return;
      }

      const blocks = hotspot.contentBlocks || [];
      const remaining = blocks.filter((block) => block.type !== 'scene');
      if (!remaining.length) {
        scene.hotspots.splice(sceneIndex, 1);
        setSelectedHotspotId(scene.hotspots[0]?.id || null);
      } else {
        hotspot.contentBlocks = remaining;
        setSelectedHotspotId(hotspot.id);
      }

      refreshHotspotPanelsWithoutSceneSwitch();
      updateStatus('Link hotspot deleted.');
      autosave();
    }

    return {
      deleteInfoHotspot,
      addSceneLinkDraft,
      deleteSceneLink,
    };
  }

  window.IterpanoEditorHotspotActions = {
    createHotspotActionsController,
  };
})();
