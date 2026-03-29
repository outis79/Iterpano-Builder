(function () {
  function createSceneSelectionController(options) {
    const {
      getProjectData,
      getSelectedSceneId,
      getSelectedGroupId,
      getSceneLabelMode,
      getSceneSortKey,
      getSceneSortDirection,
    } = options;

    function getSelectedScene() {
      const project = getProjectData();
      return project?.scenes.find((scene) => scene.id === getSelectedSceneId()) || null;
    }

    function getSelectedGroup() {
      const project = getProjectData();
      return project?.groups?.find((group) => group.id === getSelectedGroupId()) || null;
    }

    function getGroupById(groupId) {
      if (!groupId) return null;
      const project = getProjectData();
      return project?.groups?.find((group) => group.id === groupId) || null;
    }

    function getSceneById(sceneId) {
      if (!sceneId) return null;
      const project = getProjectData();
      return project?.scenes?.find((scene) => scene.id === sceneId) || null;
    }

    function getSceneListLabel(scene) {
      if (!scene) return '';
      if (getSceneLabelMode() === 'alias') {
        return String(scene.alias || '').trim();
      }
      return String(scene.name || '').trim();
    }

    function compareScenesByName(a, b) {
      const nameA = getSceneListLabel(a);
      const nameB = getSceneListLabel(b);
      const cmp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
      if (cmp !== 0) return cmp;
      return String(a?.id || '').localeCompare(String(b?.id || ''), undefined, { sensitivity: 'base', numeric: true });
    }

    function compareScenesByUploadId(a, b) {
      return String(a?.id || '').localeCompare(String(b?.id || ''), undefined, { sensitivity: 'base', numeric: true });
    }

    function sortScenesForList(scenes) {
      const list = [...(scenes || [])];
      const key = getSceneSortKey() === 'date' ? 'date' : 'name';
      const direction = getSceneSortDirection() === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        const cmp = key === 'date' ? compareScenesByUploadId(a, b) : compareScenesByName(a, b);
        return cmp * direction;
      });
      return list;
    }

    function getScenesForSelectedGroup() {
      const groupId = getSelectedGroupId();
      const project = getProjectData();
      const scenes = (project?.scenes || []).filter((scene) => scene.groupId === groupId);
      return sortScenesForList(scenes);
    }

    function getPreferredSceneForGroup(groupId) {
      const project = getProjectData();
      const scenes = (project?.scenes || []).filter((scene) => scene.groupId === groupId);
      if (!scenes.length) return null;
      const group = getGroupById(groupId);
      const preferred = scenes.find((scene) => scene.id === group?.mainSceneId);
      return preferred || scenes[0];
    }

    return {
      getSelectedScene,
      getSelectedGroup,
      getGroupById,
      getSceneById,
      getSceneListLabel,
      compareScenesByName,
      compareScenesByUploadId,
      sortScenesForList,
      getScenesForSelectedGroup,
      getPreferredSceneForGroup,
    };
  }

  window.IterpanoEditorSceneSelection = {
    createSceneSelectionController,
  };
})();
