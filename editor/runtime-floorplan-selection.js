(function () {
  function createFloorplanSelectionController(options) {
    const {
      getProjectData,
      getSelectedGroupId,
      getSelectedSceneId,
      getFloorplanSelectAllMode,
      normalizeFloorplanColorKey,
    } = options;

    function getFloorplanForGroup(groupId) {
      if (!groupId) return null;
      return getProjectData()?.minimap?.floorplans?.find((fp) => fp.groupId === groupId) || null;
    }

    function getSelectedFloorplan() {
      return getFloorplanForGroup(getSelectedGroupId());
    }

    function getSelectedFloorplanNode() {
      const floorplan = getSelectedFloorplan();
      const sceneId = getSelectedSceneId();
      if (!floorplan || !sceneId) return null;
      return (floorplan.nodes || []).find((node) => node.sceneId === sceneId) || null;
    }

    function getSelectedFloorplanNodes() {
      const floorplan = getSelectedFloorplan();
      if (!floorplan) return [];
      const nodes = floorplan.nodes || [];
      if (getFloorplanSelectAllMode()) {
        return nodes.slice();
      }
      const selected = getSelectedFloorplanNode();
      return selected ? [selected] : [];
    }

    function getSelectedFloorplanColorKey() {
      const floorplan = getSelectedFloorplan();
      const selectedNodes = getSelectedFloorplanNodes();
      const keyFromSelection = selectedNodes[0]?.colorKey;
      return normalizeFloorplanColorKey(keyFromSelection || floorplan?.markerColorKey || 'yellow');
    }

    return {
      getFloorplanForGroup,
      getSelectedFloorplan,
      getSelectedFloorplanNode,
      getSelectedFloorplanNodes,
      getSelectedFloorplanColorKey,
    };
  }

  window.IterpanoEditorFloorplanSelection = {
    createFloorplanSelectionController,
  };
})();
