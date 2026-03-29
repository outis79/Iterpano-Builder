(function () {
  function createHotspotSidebarController(options) {
    const {
      linkSelect,
      linkTargetSceneSelect,
      linkTargetAllGroupsToggle,
      linkCommentInput,
      linkNewColorSelect,
      infoHotspotSelect,
      infoHotspotModeSelect,
      infoHotspotColorSelect,
      btnAddSceneLink,
      btnDeleteSceneLink,
      btnRemoveAllLinks,
      btnAddHotspot,
      btnDeleteHotspot,
      btnEditHotspot,
      btnSaveHotspot,
      getSelectedScene,
      getSelectedLinkHotspot,
      getPendingSceneLinkDraftForSelectedScene,
      getLinkTargetSceneOptions,
      getProjectScenes,
      getSelectedSceneId,
      getPlacementMode,
      getNewLinkColorKey,
      getLinkTargetAllGroups,
      normalizeSceneLinkColorKey,
      renderSceneLinkColorOptions,
      updateLinkNoteModeUi,
      formatTargetSceneOptionLabel,
      getSceneLinkBlock,
      getSceneInfoHotspots,
      getSelectedInfoHotspot,
      getInfoHotspotCreateMode,
      setInfoHotspotCreateModeState,
      getInfoHotspotEditMode,
      setInfoHotspotEditModeState,
      updateInfoHotspotModeButtons,
      closeRichEditorModal,
      getRichEditorModalVisible,
      getInfoHotspotColorKey,
      defaultInfoHotspotColorKey,
      syncCustomColorSelect,
      normalizeInfoHotspotDisplayMode,
      defaultInfoHotspotDisplayMode,
      isInfoHotspotInteractionModeActive,
      getSceneLinkHotspots,
      getPendingSceneLinkDraft,
      getSelectedHotspotId,
      scheduleMarkerRender,
    } = options;

    function renderLinkEditor() {
      if (!linkTargetSceneSelect || !linkCommentInput) return;

      const selectedScene = getSelectedScene();
      const linkHotspot = getSelectedLinkHotspot();
      const pendingDraft = getPendingSceneLinkDraftForSelectedScene();
      const scenes = getLinkTargetSceneOptions(getSelectedSceneId());
      const allScenes = getProjectScenes();
      const currentSceneId = getSelectedSceneId();
      const canEditLink = Boolean((linkHotspot || pendingDraft) && getPlacementMode());
      const lockGlobalLinkControls = getPlacementMode();
      const activeColorKey = normalizeSceneLinkColorKey(linkHotspot?.linkColorKey || pendingDraft?.linkColorKey || getNewLinkColorKey());
      if (btnAddSceneLink) btnAddSceneLink.disabled = !selectedScene;
      if (btnDeleteSceneLink) btnDeleteSceneLink.disabled = lockGlobalLinkControls;
      if (btnRemoveAllLinks) btnRemoveAllLinks.disabled = lockGlobalLinkControls;
      if (linkNewColorSelect) linkNewColorSelect.disabled = !canEditLink;
      if (linkTargetAllGroupsToggle) {
        linkTargetAllGroupsToggle.disabled = !canEditLink;
        const flagLabel = linkTargetAllGroupsToggle.closest('.inline-flag');
        flagLabel?.classList.toggle('disabled', !canEditLink);
      }
      renderSceneLinkColorOptions(linkNewColorSelect, activeColorKey);
      updateLinkNoteModeUi();
      linkCommentInput.placeholder = 'Comment (optional)';
      if (linkTargetAllGroupsToggle) {
        linkTargetAllGroupsToggle.checked = Boolean(getLinkTargetAllGroups());
      }

      linkTargetSceneSelect.innerHTML = '';
      const none = document.createElement('option');
      none.value = '';
      none.textContent = 'None';
      linkTargetSceneSelect.appendChild(none);

      scenes.forEach((scene) => {
        if (scene.id === currentSceneId) return;
        const option = document.createElement('option');
        option.value = scene.id;
        option.textContent = formatTargetSceneOptionLabel(scene, {
          includeGroup: Boolean(getLinkTargetAllGroups())
        });
        linkTargetSceneSelect.appendChild(option);
      });

      if (!linkHotspot && !pendingDraft) {
        linkCommentInput.value = '';
        linkTargetSceneSelect.value = '';
        linkCommentInput.disabled = true;
        linkTargetSceneSelect.disabled = true;
        return;
      }

      let selectedTarget = '';
      let noteValue = '';

      if (linkHotspot) {
        const sceneLinkBlock = getSceneLinkBlock(linkHotspot);
        if (sceneLinkBlock && typeof sceneLinkBlock.comment !== 'string') {
          sceneLinkBlock.comment = '';
        }
        selectedTarget = sceneLinkBlock?.sceneId || '';
        noteValue = sceneLinkBlock?.comment || '';
      } else if (pendingDraft) {
        selectedTarget = pendingDraft.targetSceneId || '';
        noteValue = pendingDraft.comment || '';
      }

      if (selectedTarget && !scenes.some((scene) => scene.id === selectedTarget)) {
        const targetScene = allScenes.find((scene) => scene.id === selectedTarget);
        if (targetScene) {
          const option = document.createElement('option');
          option.value = targetScene.id;
          option.textContent = Boolean(getLinkTargetAllGroups())
            ? formatTargetSceneOptionLabel(targetScene, { includeGroup: true })
            : `${targetScene.name || targetScene.id} (other group)`;
          linkTargetSceneSelect.appendChild(option);
        }
      }

      linkCommentInput.disabled = !canEditLink;
      linkTargetSceneSelect.disabled = !canEditLink;
      linkCommentInput.value = noteValue;
      linkTargetSceneSelect.value = selectedTarget === currentSceneId ? '' : selectedTarget;
    }

    function renderInfoHotspotList() {
      if (!infoHotspotSelect) return;
      infoHotspotSelect.innerHTML = '';

      const scene = getSelectedScene();
      if (!scene) {
        if (getInfoHotspotCreateMode()) setInfoHotspotCreateModeState(false);
        if (getInfoHotspotEditMode()) setInfoHotspotEditModeState(false);
        updateInfoHotspotModeButtons();
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No scene selected';
        infoHotspotSelect.appendChild(option);
        infoHotspotSelect.disabled = true;
        if (infoHotspotColorSelect) {
          renderSceneLinkColorOptions(infoHotspotColorSelect, defaultInfoHotspotColorKey);
          infoHotspotColorSelect.disabled = true;
          syncCustomColorSelect(infoHotspotColorSelect);
        }
        if (btnAddHotspot) btnAddHotspot.disabled = true;
        if (btnDeleteHotspot) btnDeleteHotspot.disabled = true;
        if (btnEditHotspot) btnEditHotspot.disabled = true;
        if (btnSaveHotspot) btnSaveHotspot.disabled = true;
        return;
      }

      const infoHotspots = getSceneInfoHotspots(scene);
      const selectedInfo = getSelectedInfoHotspot();
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = infoHotspots.length ? 'Select info hotspot' : 'No info hotspots in this scene';
      infoHotspotSelect.appendChild(placeholder);

      infoHotspots.forEach((hotspot) => {
        const option = document.createElement('option');
        option.value = hotspot.id;
        option.textContent = hotspot.title || hotspot.id;
        if (selectedInfo?.id === hotspot.id) {
          option.selected = true;
        }
        infoHotspotSelect.appendChild(option);
      });

      if (!selectedInfo) {
        if (getInfoHotspotEditMode()) {
          setInfoHotspotEditModeState(false);
          if (getRichEditorModalVisible()) {
            closeRichEditorModal();
          }
        }
        infoHotspotSelect.value = '';
      }
      infoHotspotSelect.disabled = !infoHotspots.length;
      if (infoHotspotColorSelect) {
        renderSceneLinkColorOptions(
          infoHotspotColorSelect,
          selectedInfo ? getInfoHotspotColorKey(selectedInfo) : defaultInfoHotspotColorKey
        );
        infoHotspotColorSelect.disabled = !selectedInfo || !isInfoHotspotInteractionModeActive();
        syncCustomColorSelect(infoHotspotColorSelect);
      }
      if (infoHotspotModeSelect) {
        infoHotspotModeSelect.value = selectedInfo
          ? normalizeInfoHotspotDisplayMode(selectedInfo.displayMode)
          : defaultInfoHotspotDisplayMode;
        infoHotspotModeSelect.disabled = !selectedInfo || !isInfoHotspotInteractionModeActive();
      }
      if (btnAddHotspot) btnAddHotspot.disabled = false;
      if (btnDeleteHotspot) btnDeleteHotspot.disabled = !selectedInfo;
      if (btnEditHotspot) btnEditHotspot.disabled = !selectedInfo;
      if (btnSaveHotspot) btnSaveHotspot.disabled = !selectedInfo || !isInfoHotspotInteractionModeActive();
      updateInfoHotspotModeButtons();
    }

    function renderHotspotList() {
      renderInfoHotspotList();

      if (linkSelect) {
        linkSelect.innerHTML = '';
      }
      const scene = getSelectedScene();
      if (!scene) {
        if (linkSelect) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No scene selected';
          linkSelect.appendChild(option);
          linkSelect.disabled = true;
        }
        if (btnDeleteSceneLink) btnDeleteSceneLink.disabled = true;
        if (btnRemoveAllLinks) btnRemoveAllLinks.disabled = true;
        return;
      }

      const linkHotspots = getSceneLinkHotspots(scene);
      const pendingForScene = (() => {
        const pendingSceneLinkDraft = getPendingSceneLinkDraft();
        return pendingSceneLinkDraft && pendingSceneLinkDraft.sceneId === scene.id
          ? pendingSceneLinkDraft
          : null;
      })();

      if (linkSelect) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = linkHotspots.length ? 'Select link' : 'No links in this scene';
        linkSelect.appendChild(placeholder);

        if (pendingForScene) {
          const pendingOption = document.createElement('option');
          pendingOption.value = '__pending__';
          pendingOption.textContent = `${pendingForScene.linkCode} (new)`;
          pendingOption.selected = true;
          linkSelect.appendChild(pendingOption);
        }

        linkHotspots.forEach((hotspot) => {
          const option = document.createElement('option');
          option.value = hotspot.id;
          option.textContent = hotspot.linkCode || hotspot.title || hotspot.id;
          if (hotspot.id === getSelectedHotspotId()) {
            option.selected = true;
          }
          linkSelect.appendChild(option);
        });

        const selectedIsLink = linkHotspots.some((hotspot) => hotspot.id === getSelectedHotspotId());
        if (!selectedIsLink && !pendingForScene) {
          linkSelect.value = '';
        }
        linkSelect.disabled = linkHotspots.length === 0 && !pendingForScene;
      }
      if (btnDeleteSceneLink) btnDeleteSceneLink.disabled = linkHotspots.length === 0;
      if (btnRemoveAllLinks) btnRemoveAllLinks.disabled = linkHotspots.length === 0;

      scheduleMarkerRender();
    }

    return {
      renderLinkEditor,
      renderInfoHotspotList,
      renderHotspotList,
    };
  }

  window.IterpanoEditorHotspotSidebar = {
    createHotspotSidebarController,
  };
})();
