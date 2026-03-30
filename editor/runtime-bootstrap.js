(function () {
  function reportRuntimeEditorModuleFailure(runtimeEditorModuleFailures, moduleName, reason, error = null) {
    const message = `[Iterpano Builder] Runtime module init failed: ${moduleName}${reason ? ` (${reason})` : ''}`;
    runtimeEditorModuleFailures.push({ moduleName, reason, error });
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }

  function safeCreateRuntimeEditorModule(runtimeEditorModuleFailures, moduleName, factory, requiredDeps = []) {
    const missing = requiredDeps
      .filter((entry) => !entry || !entry.value)
      .map((entry) => entry?.label || 'unknown');
    if (missing.length) {
      reportRuntimeEditorModuleFailure(runtimeEditorModuleFailures, moduleName, `missing dependencies: ${missing.join(', ')}`);
      return null;
    }
    try {
      const instance = typeof factory === 'function' ? factory() : null;
      if (!instance) {
        reportRuntimeEditorModuleFailure(runtimeEditorModuleFailures, moduleName, 'factory returned empty module');
        return null;
      }
      return instance;
    } catch (error) {
      reportRuntimeEditorModuleFailure(runtimeEditorModuleFailures, moduleName, 'exception during initialization', error);
      return null;
    }
  }

  function initializeEditorUiState(options) {
    const {
      setSectionCollapsed,
      setLinksPanelCollapsed,
      setFloorplanMapWindowOpen,
      btnToggleProjectPanel,
      projectPanelBody,
      btnToggleGroupsPanel,
      groupsPanelBody,
      btnToggleScenesPanel,
      scenesPanelBody,
      btnToggleHomePagePanel,
      homePagePanelBody,
      btnToggleInfoHotspotsPanel,
      infoHotspotsPanelBody,
      btnToggleMapPanel,
      mapPanelBody,
      btnToggleSceneActionsPanel,
      sceneActionsPanelBody,
    } = options;

      setSectionCollapsed(btnToggleProjectPanel, projectPanelBody, false);
      setSectionCollapsed(btnToggleGroupsPanel, groupsPanelBody, false);
      setSectionCollapsed(btnToggleScenesPanel, scenesPanelBody, false);
      setSectionCollapsed(btnToggleHomePagePanel, homePagePanelBody, true);
      setSectionCollapsed(btnToggleInfoHotspotsPanel, infoHotspotsPanelBody, true);
      setSectionCollapsed(btnToggleMapPanel, mapPanelBody, true);
      setSectionCollapsed(btnToggleSceneActionsPanel, sceneActionsPanelBody, true);
      setLinksPanelCollapsed(true);
    setFloorplanMapWindowOpen(false);
  }

  async function bootstrapEditor(options) {
    const {
      loadDraft,
      loadProject,
      updateStatus,
      fallbackProject,
      sampleTourUrl,
    } = options;

    const draft = await loadDraft();
    if (draft) {
      loadProject(draft);
      updateStatus('Loaded draft from browser storage.');
      return;
    }

    fetch(sampleTourUrl)
      .then((res) => res.json())
      .then(loadProject)
      .catch(() => loadProject(fallbackProject));
  }

  window.IterpanoEditorBootstrap = {
    reportRuntimeEditorModuleFailure,
    safeCreateRuntimeEditorModule,
    initializeEditorUiState,
    bootstrapEditor,
  };
})();
