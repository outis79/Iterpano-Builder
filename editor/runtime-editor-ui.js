(function () {
  function createEditorUiController(options) {
    const {
      state,
      windowRef,
      mapPanelBody,
      mapWindowBackdrop,
      btnFloorplanExpand,
      viewerCanvas,
      layoutRoot,
      refreshFloorplanCanvasLayout,
      miniMap,
      getFloorplanMapWindowOpen,
      setFloorplanMapWindowOpenState,
      floorplanZoomByGroup,
      btnToggleLinksPanel,
      linksPanelBody,
      getPlacementMode,
      togglePlacementMode,
      getInfoHotspotCreateMode,
      setInfoHotspotCreateModeState,
      getInfoHotspotEditMode,
      setInfoHotspotEditModeState,
      richSourceModal,
      getRichSourceContext,
      saveRichSourceModalContent,
      hideHotspotHoverCard,
      closeHotspotPreview,
      setHomePageEditModeState,
      richEditorModal,
      getRichEditorContext,
      saveRichEditorModalContent,
      updateInfoHotspotModeButtons,
      renderContentBlocks,
      updateStatus,
      openRichEditorModal,
      getProjectHomePage,
    } = options;

    function updateMapWindowBounds() {
      if (!getFloorplanMapWindowOpen() || !mapPanelBody) return;
      const sceneRect = viewerCanvas?.getBoundingClientRect();
      const layoutRect = layoutRoot?.getBoundingClientRect();
      const baseRect = sceneRect || layoutRect;
      if (!baseRect) return;

      const mapWidth = Math.max(160, Math.round(baseRect.width / 3));
      const leftPx = Math.max(8, Math.round(baseRect.right - mapWidth));
      const topPx = Math.max(8, Math.round(baseRect.top));
      const rightPx = Math.max(8, Math.round(windowRef.innerWidth - (leftPx + mapWidth)));
      const bottomPx = Math.max(8, Math.round(windowRef.innerHeight - baseRect.bottom));

      const setInsetVars = (element) => {
        if (!element) return;
        element.style.setProperty('--map-window-top', `${topPx}px`);
        element.style.setProperty('--map-window-right', `${rightPx}px`);
        element.style.setProperty('--map-window-bottom', `${bottomPx}px`);
        element.style.setProperty('--map-window-left', `${leftPx}px`);
      };

      setInsetVars(mapPanelBody);
      setInsetVars(mapWindowBackdrop);
    }

    function setFloorplanMapWindowOpen(nextMode) {
      const next = Boolean(nextMode);
      setFloorplanMapWindowOpenState(next);
      if (!next && state.selectedGroupId) {
        floorplanZoomByGroup.set(state.selectedGroupId, 1);
      }
      if (mapPanelBody) {
        mapPanelBody.classList.toggle('map-panel-window', next);
        if (!next) {
          mapPanelBody.style.removeProperty('--map-window-top');
          mapPanelBody.style.removeProperty('--map-window-right');
          mapPanelBody.style.removeProperty('--map-window-bottom');
          mapPanelBody.style.removeProperty('--map-window-left');
        }
      }
      if (mapWindowBackdrop) {
        mapWindowBackdrop.classList.toggle('visible', next);
        mapWindowBackdrop.setAttribute('aria-hidden', next ? 'false' : 'true');
        if (!next) {
          mapWindowBackdrop.style.removeProperty('--map-window-top');
          mapWindowBackdrop.style.removeProperty('--map-window-right');
          mapWindowBackdrop.style.removeProperty('--map-window-bottom');
          mapWindowBackdrop.style.removeProperty('--map-window-left');
        }
      }
      if (btnFloorplanExpand) {
        btnFloorplanExpand.classList.toggle('active', next);
        btnFloorplanExpand.textContent = next ? 'Minimise' : 'Maximise';
        btnFloorplanExpand.setAttribute('aria-pressed', next ? 'true' : 'false');
      }
      if (next) {
        updateMapWindowBounds();
      }
      windowRef.requestAnimationFrame(() => {
        refreshFloorplanCanvasLayout();
        if (!next && miniMap) {
          miniMap.scrollLeft = 0;
          miniMap.scrollTop = 0;
        }
      });
    }

    function setSectionCollapsed(buttonElement, bodyElement, next) {
      if (!buttonElement || !bodyElement) return;
      const collapsed = Boolean(next);
      bodyElement.classList.toggle('collapsed', collapsed);
      buttonElement.textContent = collapsed ? 'Show' : 'Hide';
      buttonElement.setAttribute('aria-expanded', String(!collapsed));
    }

    function toggleSection(buttonElement, bodyElement) {
      if (!buttonElement || !bodyElement) return;
      const isCollapsed = bodyElement.classList.contains('collapsed');
      setSectionCollapsed(buttonElement, bodyElement, !isCollapsed);
    }

    function setLinksPanelCollapsed(next) {
      setSectionCollapsed(btnToggleLinksPanel, linksPanelBody, next);
    }

    function setHomePageEditMode(nextMode, { silent = false } = {}) {
      const next = Boolean(nextMode);
      if (next) {
        if (getPlacementMode()) {
          togglePlacementMode();
        }
        if (getInfoHotspotCreateMode()) {
          setInfoHotspotCreateModeState(false);
        }
        if (getInfoHotspotEditMode()) {
          setInfoHotspotEditModeState(false);
        }
        if (richSourceModal?.classList.contains('visible') && getRichSourceContext()?.type !== 'home-page') {
          saveRichSourceModalContent({ closeAfterSave: true, refreshPanel: false });
        }
        hideHotspotHoverCard();
        closeHotspotPreview();
        setHomePageEditModeState(true);
        openRichEditorModal(getProjectHomePage(), { type: 'home-page' });
      } else {
        setHomePageEditModeState(false);
        if (richEditorModal?.classList.contains('visible') && getRichEditorContext()?.type === 'home-page') {
          saveRichEditorModalContent({ closeAfterSave: true, refreshPanel: true });
        }
        if (richSourceModal?.classList.contains('visible') && getRichSourceContext()?.type === 'home-page') {
          saveRichSourceModalContent({ closeAfterSave: true, refreshPanel: true });
        }
      }
      updateInfoHotspotModeButtons();
      renderContentBlocks();
      if (!silent) {
        updateStatus(next ? 'Home Page edit mode ON.' : 'Home Page edit mode OFF.');
      }
    }

    function toggleHomePageEditMode(currentValue) {
      setHomePageEditMode(!currentValue);
    }

    return {
      updateMapWindowBounds,
      setFloorplanMapWindowOpen,
      setSectionCollapsed,
      toggleSection,
      setLinksPanelCollapsed,
      setHomePageEditMode,
      toggleHomePageEditMode,
    };
  }

  window.IterpanoEditorUi = {
    createEditorUiController,
  };
})();
