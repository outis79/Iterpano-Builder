(function () {
  function createSceneActionsController(options) {
    const {
      state,
      generatedTiles,
      editorScenes,
      windowRef,
      getSelectedScene,
      getSelectedGroup,
      getGroupById,
      getPreferredSceneForGroup,
      getSelectedSceneFov,
      getFloorplanForGroup,
      getPendingSceneLinkDraft,
      clearPendingSceneLinkDraft,
      renderAll,
      renderSceneList,
      renderSceneGroupOptions,
      updateSceneTitle,
      renderHotspotList,
      renderLinkEditor,
      renderContentBlocks,
      renderFloorplans,
      switchEditorScene,
      autosave,
      updateStatus,
      askDeleteConfirmation,
      askGroupName,
    } = options;

    function selectScene(sceneId) {
      const scene = state.project?.scenes?.find((item) => item.id === sceneId);
      if (!scene) return;
      clearPendingSceneLinkDraft(false);

      state.selectedGroupId = scene.groupId || state.selectedGroupId;
      state.selectedSceneId = scene.id;
      state.selectedHotspotId = scene.hotspots[0]?.id || null;
      state.selectedFloorplanId = getFloorplanForGroup(state.selectedGroupId)?.id || null;
      state.multiSelectedSceneIds = [scene.id];
      state.sceneSelectionAnchorId = scene.id;

      renderSceneGroupOptions();
      renderSceneList();
      updateSceneTitle();
      renderHotspotList();
      renderLinkEditor();
      renderContentBlocks();
      renderFloorplans();
      switchEditorScene();
    }

    function moveSceneSelectionBy(delta) {
      const scenes = options.getScenesForSelectedGroup();
      if (!scenes.length) return false;

      let index = scenes.findIndex((scene) => scene.id === state.selectedSceneId);
      if (index < 0) index = 0;
      const nextIndex = Math.min(scenes.length - 1, Math.max(0, index + delta));
      if (nextIndex === index) return true;

      selectScene(scenes[nextIndex].id);
      return true;
    }

    function toggleSceneSort(sortKey) {
      if (state.sceneSortKey === sortKey) {
        state.sceneSortDirection = state.sceneSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sceneSortKey = sortKey;
        state.sceneSortDirection = 'asc';
      }
      renderSceneList();
      const modeLabel = state.sceneSortKey === 'date'
        ? 'date'
        : (state.sceneLabelMode === 'alias' ? 'alias' : 'name');
      updateStatus(`Scenes sorted by ${modeLabel} (${state.sceneSortDirection}).`);
    }

    function toggleSceneLabelMode() {
      state.sceneLabelMode = state.sceneLabelMode === 'alias' ? 'name' : 'alias';
      renderSceneList();
      updateStatus(`Scene list mode: ${state.sceneLabelMode === 'alias' ? 'Alias' : 'Name'}.`);
    }

    function createSceneRecord(name = 'New Scene', groupId = null) {
      const id = `scene-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      return {
        id,
        groupId: groupId || state.selectedGroupId || state.project?.groups?.[0]?.id || null,
        name,
        alias: '',
        comment: '',
        levels: [{ tileSize: 256, size: 256, fallbackOnly: true }],
        faceSize: 2048,
        initialViewParameters: { yaw: 0, pitch: 0, fov: getSelectedSceneFov() },
        orientationSaved: false,
        hotspots: []
      };
    }

    function ensureMainSceneForGroup(groupId, candidateSceneId = null) {
      const group = getGroupById(groupId);
      if (!group) return;
      const groupScenes = (state.project?.scenes || []).filter((scene) => scene.groupId === groupId);
      if (!groupScenes.length) {
        group.mainSceneId = null;
        return;
      }
      if (candidateSceneId && groupScenes.some((scene) => scene.id === candidateSceneId) && !group.mainSceneId) {
        group.mainSceneId = candidateSceneId;
        return;
      }
      if (!group.mainSceneId || !groupScenes.some((scene) => scene.id === group.mainSceneId)) {
        group.mainSceneId = groupScenes[0].id;
      }
    }

    function normalizeGroupName(name) {
      return String(name || '').trim().toLowerCase();
    }

    function hasDuplicateGroupName(nextName, currentGroupId = null) {
      const normalized = normalizeGroupName(nextName);
      if (!normalized) return false;
      return (state.project?.groups || []).some((group) =>
        group.id !== currentGroupId && normalizeGroupName(group.name) === normalized
      );
    }

    function addScene() {
      const group = getSelectedGroup();
      if (!group) {
        updateStatus('Create a group first.');
        return;
      }
      const name = windowRef.prompt('Scene name');
      if (!name) return;
      const scene = createSceneRecord(name, group.id);
      state.project.scenes.push(scene);
      ensureMainSceneForGroup(group.id, scene.id);
      state.selectedSceneId = scene.id;
      state.selectedHotspotId = null;
      renderAll();
      autosave();
    }

    async function addGroup() {
      const result = askGroupName
        ? await askGroupName({
          title: 'Add Group',
          label: 'Group name',
          confirmLabel: 'Add',
          value: '',
        })
        : {
          confirmed: true,
          value: windowRef.prompt('Group name') || '',
        };
      if (!result?.confirmed) return;
      const trimmedName = String(result.value || '').trim() || 'New Group';
      if (hasDuplicateGroupName(trimmedName)) {
        windowRef.alert(`Group name "${trimmedName}" already exists. Choose a different name.`);
        updateStatus(`Group not created: "${trimmedName}" already exists.`);
        return;
      }
      const group = {
        id: `group-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        name: trimmedName,
        mainSceneId: null
      };
      state.project.groups.push(group);
      if (!state.project.activeGroupId) {
        state.project.activeGroupId = group.id;
      }
      state.selectedGroupId = group.id;
      state.selectedSceneId = null;
      state.selectedHotspotId = null;
      state.selectedFloorplanId = getFloorplanForGroup(group.id)?.id || null;
      renderAll();
      updateStatus(`Group "${group.name}" created. Upload a floorplan for this group.`);
      autosave();
    }

    function setSelectedGroupAsMain() {
      const group = getSelectedGroup();
      if (!group) {
        updateStatus('Select a group first.');
        return;
      }
      state.project.activeGroupId = group.id;
      renderSceneGroupOptions();
      renderSceneList();
      renderFloorplans();
      updateStatus(`Group "${group.name}" set as default group.`);
      autosave();
    }

    async function renameSelectedGroup() {
      const group = getSelectedGroup();
      if (!group) {
        updateStatus('Select a group first.');
        return;
      }
      const result = askGroupName
        ? await askGroupName({
          title: 'Rename Group',
          label: 'Group name',
          confirmLabel: 'Rename',
          value: group.name || '',
        })
        : {
          confirmed: true,
          value: windowRef.prompt('Group name', group.name || '') || '',
        };
      if (!result?.confirmed) return;
      const trimmedName = String(result.value || '').trim() || 'Untitled Group';
      if (hasDuplicateGroupName(trimmedName, group.id)) {
        windowRef.alert(`Group name "${trimmedName}" already exists. Choose a different name.`);
        updateStatus(`Rename cancelled: "${trimmedName}" already exists.`);
        return;
      }
      group.name = trimmedName;
      renderSceneGroupOptions();
      updateStatus(`Group renamed to "${group.name}".`);
      autosave();
    }

    function setMainSceneForSelectedGroup() {
      const scene = getSelectedScene();
      if (!scene) {
        updateStatus('Select a scene first.');
        return;
      }
      const group = getGroupById(scene.groupId);
      if (!group) {
        updateStatus('No active group found for this scene.');
        return;
      }

      group.mainSceneId = scene.id;
      state.selectedGroupId = group.id;
      renderSceneList();
      renderSceneGroupOptions();
      updateStatus(`"${scene.name || scene.id}" set as main scene for "${group.name}".`);
      autosave();
    }

    function clearSceneTargetReferences(deletedSceneIds) {
      if (!deletedSceneIds || !deletedSceneIds.size) return;
      (state.project?.scenes || []).forEach((scene) => {
        const hotspots = scene.hotspots || [];
        scene.hotspots = hotspots.filter((hotspot) => {
          const blocks = hotspot.contentBlocks || [];
          let removedLinks = 0;
          const nextBlocks = blocks.filter((block) => {
            const isDeletedTarget = block.type === 'scene' && deletedSceneIds.has(block.sceneId);
            if (isDeletedTarget) {
              removedLinks += 1;
              return false;
            }
            return true;
          });

          if (!removedLinks) {
            return true;
          }

          hotspot.contentBlocks = nextBlocks;
          if (!nextBlocks.some((block) => block.type === 'scene')) {
            delete hotspot.linkCode;
          }

          return nextBlocks.length > 0;
        });

        if (
          scene.id === state.selectedSceneId &&
          state.selectedHotspotId &&
          !scene.hotspots.some((hotspot) => hotspot.id === state.selectedHotspotId)
        ) {
          state.selectedHotspotId = scene.hotspots[0]?.id || null;
        }
      });
    }

    async function deleteGroup() {
      await deleteGroupById(state.selectedGroupId);
    }

    async function deleteGroupById(groupId) {
      const groups = state.project?.groups || [];
      if (groups.length <= 1) {
        updateStatus('At least one group is required.');
        return;
      }
      const group = groups.find((item) => item.id === groupId) || null;
      if (!group) return;
      const fallback = groups.find((item) => item.id !== group.id);
      if (!fallback) return;
      const scenesToDelete = (state.project.scenes || []).filter((scene) => scene.groupId === group.id);
      const sceneCount = scenesToDelete.length;
      const deletedSceneIds = new Set(scenesToDelete.map((scene) => scene.id));
      const floorplansForGroup = (state.project.minimap.floorplans || []).filter((fp) => fp.groupId === group.id);
      const mapCount = floorplansForGroup.length;
      const mapNodeCount = floorplansForGroup.reduce((total, fp) => total + ((fp.nodes || []).length), 0);
      let inboundSceneLinkCount = 0;
      (state.project.scenes || []).forEach((scene) => {
        if (scene.groupId === group.id) return;
        (scene.hotspots || []).forEach((hotspot) => {
          (hotspot.contentBlocks || []).forEach((block) => {
            if (block.type === 'scene' && deletedSceneIds.has(block.sceneId)) {
              inboundSceneLinkCount += 1;
            }
          });
        });
      });

      const warningLines = [
        `Delete group "${group.name}"?`,
        '',
        'This action will:',
        `- Delete ${sceneCount} image/scene(s) in this group`,
        mapCount ? `- Delete ${mapCount} map file(s) linked to this group` : '- No map file linked to this group',
        mapNodeCount ? `- Remove ${mapNodeCount} map point(s)` : '- No map points to remove',
        inboundSceneLinkCount
          ? `- Remove ${inboundSceneLinkCount} scene-link reference(s) from other groups/scenes`
          : '- No incoming scene-link references from other groups/scenes',
        '',
        'This cannot be undone.'
      ];
      const confirmed = askDeleteConfirmation
        ? await askDeleteConfirmation({
          title: 'Delete Group',
          message: warningLines.join('\n'),
        })
        : windowRef.confirm(warningLines.join('\n'));
      if (!confirmed) return;

      scenesToDelete.forEach((scene) => {
        generatedTiles.delete(scene.id);
        editorScenes.delete(scene.id);
      });
      if (getPendingSceneLinkDraft() && deletedSceneIds.has(getPendingSceneLinkDraft().sceneId)) {
        clearPendingSceneLinkDraft(false);
      }
      state.project.scenes = (state.project.scenes || []).filter((scene) => !deletedSceneIds.has(scene.id));
      clearSceneTargetReferences(deletedSceneIds);

      state.project.minimap.floorplans = (state.project.minimap.floorplans || []).filter((fp) => fp.groupId !== group.id);
      state.project.groups = groups.filter((item) => item.id !== group.id);
      if (state.project.activeGroupId === group.id) {
        state.project.activeGroupId = fallback.id;
      }
      ensureMainSceneForGroup(fallback.id);

      state.selectedGroupId = fallback.id;
      const preferredScene = getPreferredSceneForGroup(state.selectedGroupId);
      state.selectedSceneId = preferredScene?.id || null;
      state.selectedHotspotId = preferredScene?.hotspots?.[0]?.id || null;
      state.selectedFloorplanId = getFloorplanForGroup(fallback.id)?.id || null;
      renderAll();
      updateStatus(`Group "${group.name}" deleted. Removed ${sceneCount} images/scenes.`);
      autosave();
    }

    function deleteSceneById(sceneId) {
      const sceneIndex = state.project.scenes.findIndex((scene) => scene.id === sceneId);
      if (sceneIndex === -1) return;
      const [removed] = state.project.scenes.splice(sceneIndex, 1);
      if (getPendingSceneLinkDraft()?.sceneId === removed?.id) {
        clearPendingSceneLinkDraft(false);
      }
      if (removed?.id) {
        generatedTiles.delete(removed.id);
        editorScenes.delete(removed.id);
        const floorplans = state.project?.minimap?.floorplans || [];
        floorplans.forEach((floorplan) => {
          floorplan.nodes = (floorplan.nodes || []).filter((node) => node.sceneId !== removed.id);
        });
        clearSceneTargetReferences(new Set([removed.id]));
        ensureMainSceneForGroup(removed.groupId);
      }
      const fallbackScene =
        getPreferredSceneForGroup(state.selectedGroupId) ||
        state.project.scenes[0] ||
        null;
      state.selectedSceneId = fallbackScene?.id || null;
      state.selectedHotspotId = fallbackScene?.hotspots?.[0]?.id || null;
      renderAll();
      autosave();
    }

    async function deleteSelectedScenes() {
      if (!state.project?.scenes?.length) {
        updateStatus('No scenes available.');
        return;
      }

      const selectedIds = new Set(
        (state.multiSelectedSceneIds || [])
          .filter(Boolean)
          .filter((sceneId) => state.project.scenes.some((scene) => scene.id === sceneId))
      );
      if (!selectedIds.size && state.selectedSceneId) {
        selectedIds.add(state.selectedSceneId);
      }
      if (!selectedIds.size) {
        updateStatus('Select at least one scene.');
        return;
      }

      const scenesToDelete = (state.project.scenes || []).filter((scene) => selectedIds.has(scene.id));
      if (!scenesToDelete.length) {
        updateStatus('Select at least one scene.');
        return;
      }

      const deletedSceneIds = new Set(scenesToDelete.map((scene) => scene.id));
      const confirmed = askDeleteConfirmation
        ? await askDeleteConfirmation({
          title: 'Delete Selected Scenes',
          message: [
            `Delete ${scenesToDelete.length} selected scene(s)?`,
            '',
            'This will remove:',
            '- the selected scenes and all their hotspots',
            '- their scene links',
            '- their floorplan placements',
            '- their generated tiles and scene metadata',
            '- incoming scene links from other scenes that target them',
            '',
            'This cannot be undone.'
          ].join('\n'),
        })
        : windowRef.confirm([
          `Delete ${scenesToDelete.length} selected scene(s)?`,
          '',
          'This will remove:',
          '- the selected scenes and all their hotspots',
          '- their scene links',
          '- their floorplan placements',
          '- their generated tiles and scene metadata',
          '- incoming scene links from other scenes that target them',
          '',
          'This cannot be undone.'
        ].join('\n'));
      if (!confirmed) return;

      if (getPendingSceneLinkDraft() && deletedSceneIds.has(getPendingSceneLinkDraft().sceneId)) {
        clearPendingSceneLinkDraft(false);
      }

      scenesToDelete.forEach((scene) => {
        generatedTiles.delete(scene.id);
        editorScenes.delete(scene.id);
      });

      state.project.scenes = (state.project.scenes || []).filter((scene) => !deletedSceneIds.has(scene.id));
      clearSceneTargetReferences(deletedSceneIds);

      (state.project?.minimap?.floorplans || []).forEach((floorplan) => {
        floorplan.nodes = (floorplan.nodes || []).filter((node) => !deletedSceneIds.has(node.sceneId));
      });

      const affectedGroups = new Set(scenesToDelete.map((scene) => scene.groupId).filter(Boolean));
      affectedGroups.forEach((groupId) => ensureMainSceneForGroup(groupId));

      const fallbackScene =
        getPreferredSceneForGroup(state.selectedGroupId) ||
        state.project.scenes[0] ||
        null;
      state.selectedSceneId = fallbackScene?.id || null;
      state.selectedHotspotId = fallbackScene?.hotspots?.[0]?.id || null;
      state.multiSelectedSceneIds = state.selectedSceneId ? [state.selectedSceneId] : [];
      state.sceneSelectionAnchorId = state.selectedSceneId || null;

      renderAll();
      updateStatus(`Deleted ${scenesToDelete.length} selected scene(s).`);
      autosave();
    }

    return {
      selectScene,
      moveSceneSelectionBy,
      toggleSceneSort,
      toggleSceneLabelMode,
      createSceneRecord,
      ensureMainSceneForGroup,
      normalizeGroupName,
      hasDuplicateGroupName,
      addScene,
      addGroup,
      setSelectedGroupAsMain,
      renameSelectedGroup,
      setMainSceneForSelectedGroup,
      clearSceneTargetReferences,
      deleteGroup,
      deleteGroupById,
      deleteSceneById,
      deleteSelectedScenes,
    };
  }

  window.IterpanoEditorSceneActions = {
    createSceneActionsController,
  };
})();
