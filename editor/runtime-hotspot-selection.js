(function () {
  function createHotspotSelectionController(options) {
    const {
      getSelectedScene,
      getSelectedHotspotId,
      getPendingSceneLinkDraft,
      getSelectedSceneId,
      normalizeInfoHotspotDisplayMode,
    } = options;

    function getSelectedHotspot() {
      const scene = getSelectedScene();
      if (!scene) return null;
      return scene.hotspots.find((hotspot) => hotspot.id === getSelectedHotspotId()) || null;
    }

    function isSceneLinkHotspot(hotspot) {
      return Boolean((hotspot?.contentBlocks || []).some((block) => block.type === 'scene'));
    }

    function isInfoHotspot(hotspot) {
      return Boolean(hotspot) && !isSceneLinkHotspot(hotspot);
    }

    function isQuickInfoHotspot(hotspot) {
      return isInfoHotspot(hotspot) && normalizeInfoHotspotDisplayMode(hotspot.displayMode) === 'quick';
    }

    function getSceneLinkHotspots(scene = getSelectedScene()) {
      if (!scene) return [];
      return (scene.hotspots || []).filter((hotspot) => isSceneLinkHotspot(hotspot));
    }

    function getSceneInfoHotspots(scene = getSelectedScene()) {
      if (!scene) return [];
      return (scene.hotspots || []).filter((hotspot) => isInfoHotspot(hotspot));
    }

    function getSceneLinkBlock(hotspot) {
      if (!hotspot) return null;
      return (hotspot.contentBlocks || []).find((block) => block.type === 'scene') || null;
    }

    function getSelectedLinkHotspot() {
      const selected = getSelectedHotspot();
      return isSceneLinkHotspot(selected) ? selected : null;
    }

    function getSelectedInfoHotspot() {
      const selected = getSelectedHotspot();
      return isInfoHotspot(selected) ? selected : null;
    }

    function getPendingSceneLinkDraftForSelectedScene() {
      const pendingSceneLinkDraft = getPendingSceneLinkDraft();
      if (!pendingSceneLinkDraft) return null;
      return pendingSceneLinkDraft.sceneId === getSelectedSceneId() ? pendingSceneLinkDraft : null;
    }

    return {
      getSelectedHotspot,
      isSceneLinkHotspot,
      isInfoHotspot,
      isQuickInfoHotspot,
      getSceneLinkHotspots,
      getSceneInfoHotspots,
      getSceneLinkBlock,
      getSelectedLinkHotspot,
      getSelectedInfoHotspot,
      getPendingSceneLinkDraftForSelectedScene,
    };
  }

  window.IterpanoEditorHotspotSelection = {
    createHotspotSelectionController,
  };
})();
