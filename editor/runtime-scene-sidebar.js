(function () {
  function createSceneSidebarController(options) {
    const {
      state,
      sceneGroupSelect,
      sceneList,
      btnSetMainGroup,
      btnSetMainScene,
      btnSetOrientation,
      btnDeleteSelectedScenes,
      btnSceneSortName,
      btnSceneSortUpload,
      btnSceneLabelMode,
      getSelectedScene,
      getSelectedGroup,
      getScenesForSelectedGroup,
      getSceneListLabel,
      sceneHasGeneratedTiles,
      renderFloorplans,
      selectScene,
      deleteSceneById,
      startInlineSceneRename,
      handleSceneMultiSelectClick,
      updateStatus,
      singleClickDelayMs,
    } = options;

    function updateSceneSortButtons() {
      if (btnSceneSortName) {
        const activeName = state.sceneSortKey === 'name';
        btnSceneSortName.classList.toggle('active', activeName);
        const arrow = state.sceneSortDirection === 'asc' ? '↓' : '↑';
        btnSceneSortName.textContent = activeName ? `A/Z ${arrow}` : 'A/Z';
        btnSceneSortName.title = activeName
          ? `${state.sceneLabelMode === 'alias' ? 'Alias' : 'Name'} order (${state.sceneSortDirection})`
          : `Sort by scene ${state.sceneLabelMode === 'alias' ? 'alias' : 'name'}`;
      }
      if (btnSceneSortUpload) {
        const activeDate = state.sceneSortKey === 'date';
        btnSceneSortUpload.classList.toggle('active', activeDate);
        const arrow = state.sceneSortDirection === 'asc' ? '↓' : '↑';
        btnSceneSortUpload.textContent = activeDate ? `DATE ${arrow}` : 'DATE';
        btnSceneSortUpload.title = activeDate
          ? `Date order (${state.sceneSortDirection})`
          : 'Sort by scene creation date';
      }
      if (btnSceneLabelMode) {
        const aliasMode = state.sceneLabelMode === 'alias';
        btnSceneLabelMode.classList.toggle('active', aliasMode);
        btnSceneLabelMode.textContent = aliasMode ? 'Alias ON' : 'Alias OFF';
        btnSceneLabelMode.title = aliasMode
          ? 'Scenes list shows alias values'
          : 'Scenes list shows scene names';
      }
    }

    function renderSceneGroupOptions() {
      sceneGroupSelect.innerHTML = '';
      const groups = state.project?.groups || [];
      groups.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.id === state.project?.activeGroupId ? `${group.name} (Main)` : group.name;
        sceneGroupSelect.appendChild(option);
      });

      sceneGroupSelect.disabled = groups.length === 0;
      if (btnSetMainGroup) {
        btnSetMainGroup.disabled = groups.length === 0 || !state.selectedGroupId;
      }
      const scene = getSelectedScene();
      if (scene?.groupId) {
        sceneGroupSelect.value = scene.groupId;
      } else if (state.selectedGroupId) {
        sceneGroupSelect.value = state.selectedGroupId;
      }
    }

    function renderSceneList() {
      sceneList.innerHTML = '';
      updateSceneSortButtons();
      const scenes = getScenesForSelectedGroup();
      const group = getSelectedGroup();
      const sceneIds = new Set(scenes.map((scene) => scene.id));
      state.multiSelectedSceneIds = (state.multiSelectedSceneIds || []).filter((id) => sceneIds.has(id));
      if (!state.multiSelectedSceneIds.length && state.selectedSceneId && sceneIds.has(state.selectedSceneId)) {
        state.multiSelectedSceneIds = [state.selectedSceneId];
      }
      const multiSelected = new Set(state.multiSelectedSceneIds);
      if (btnSetMainScene) {
        btnSetMainScene.disabled = scenes.length === 0;
      }
      if (btnSetOrientation) {
        btnSetOrientation.disabled = !Boolean(getSelectedScene());
      }
      if (btnDeleteSelectedScenes) {
        btnDeleteSelectedScenes.disabled = !Boolean(getSelectedScene());
      }
      scenes.forEach((scene) => {
        const row = document.createElement('div');
        row.className = 'scene-item-row';

        const main = document.createElement('button');
        main.className = `list-item scene-item-main${scene.id === state.selectedSceneId ? ' active' : ''}${multiSelected.has(scene.id) ? ' multi-selected' : ''}`;
        const isMainScene = group?.mainSceneId === scene.id;
        const sceneLabel = getSceneListLabel(scene);
        const mainLabel = state.sceneLabelMode === 'name' && isMainScene
          ? `${sceneLabel || scene.name || ''} (Main)`
          : sceneLabel;
        main.textContent = mainLabel || '\u00A0';
        main.dataset.sceneId = scene.id;
        let clickTimer = null;
        main.addEventListener('click', (event) => {
          if (options.getRenamingSceneId() === scene.id) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (event.detail > 1) {
            event.preventDefault();
            event.stopPropagation();
            if (clickTimer) {
              clearTimeout(clickTimer);
              clickTimer = null;
            }
            return;
          }
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            if (clickTimer) {
              clearTimeout(clickTimer);
              clickTimer = null;
            }
            handleSceneMultiSelectClick(scene.id, event, scenes);
            return;
          }
          state.multiSelectedSceneIds = [scene.id];
          state.sceneSelectionAnchorId = scene.id;
          if (clickTimer) {
            clearTimeout(clickTimer);
          }
          clickTimer = setTimeout(() => {
            clickTimer = null;
            selectScene(scene.id);
          }, Number(singleClickDelayMs) > 0 ? Number(singleClickDelayMs) : 320);
        });
        main.addEventListener('dblclick', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
          }
          state.multiSelectedSceneIds = [scene.id];
          state.sceneSelectionAnchorId = scene.id;
          if (state.selectedSceneId !== scene.id) {
            selectScene(scene.id);
          }
          startInlineSceneRename(scene, main);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'scene-action';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete scene';
        deleteBtn.textContent = '🗑';
        deleteBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          deleteSceneById(scene.id);
        });

        const tilesIndicator = document.createElement('button');
        const tilesReady = sceneHasGeneratedTiles(scene);
        tilesIndicator.className = `scene-action scene-tile-indicator${tilesReady ? ' tile-ready' : ''}`;
        tilesIndicator.type = 'button';
        tilesIndicator.disabled = true;
        tilesIndicator.title = tilesReady ? 'Tiles created' : 'Tiles not created';
        tilesIndicator.setAttribute('aria-label', tilesReady ? 'Tiles created' : 'Tiles not created');
        tilesIndicator.textContent = 'T';

        row.appendChild(main);
        row.appendChild(tilesIndicator);
        row.appendChild(deleteBtn);
        sceneList.appendChild(row);
      });
    }

    return {
      updateSceneSortButtons,
      renderSceneGroupOptions,
      renderSceneList,
    };
  }

  window.IterpanoEditorSceneSidebar = {
    createSceneSidebarController,
  };
})();
