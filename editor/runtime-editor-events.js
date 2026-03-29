(function () {
  function createEditorEventsController(options) {
    const {
      state,
      windowRef,
      documentRef,
      btnSave,
      btnExport,
      btnExportPackage,
      btnExportStatic,
      btnImport,
      btnUploadFloorplan,
      btnDeleteFloorplan,
      btnFloorplanPlaceScene,
      btnFloorplanEdit,
      btnFloorplanSelectAll,
      btnFloorplanDeleteNode,
      btnFloorplanToggleLabels,
      btnFloorplanToggleAliases,
      btnFloorplanExpand,
      floorplanColorSelect,
      btnFloorplanZoomReset,
      btnFloorplanZoomOut,
      btnFloorplanZoomIn,
      miniMap,
      btnUploadPanorama,
      btnGenerateTiles,
      btnGenerateAllTiles,
      btnTilesInfo,
      btnDeleteSelectedScenes,
      btnPauseTiles,
      btnResumeTiles,
      btnTogglePlacement,
      btnSetMainScene,
      btnSetOrientation,
      btnAddSceneLink,
      btnDeleteSceneLink,
      btnRemoveAllLinks,
      btnEditHotspot,
      btnSaveHotspot,
      btnToggleLinksPanel,
      linksPanelBody,
      btnToggleProjectPanel,
      projectPanelBody,
      btnToggleGroupsPanel,
      groupsPanelBody,
      btnToggleScenesPanel,
      scenesPanelBody,
      btnSceneSortName,
      btnSceneSortUpload,
      btnSceneLabelMode,
      btnToggleMapPanel,
      mapPanelBody,
      btnToggleSceneActionsPanel,
      sceneActionsPanelBody,
      btnCancelTiles,
      btnClosePreview,
      btnHomePagePreviewStart,
      previewModal,
      previewModalContent,
      btnRichSourceClose,
      btnRichSourceSave,
      richSourceTextarea,
      richEditorSurface,
      richEditorModal,
      richSourceModal,
      btnEditHomePage,
      btnSaveHomePage,
      btnViewHomePage,
      btnDeleteLinksScene,
      btnDeleteLinksGroup,
      btnDeleteLinksCancel,
      btnDuplicatePanoramaProceed,
      btnDuplicatePanoramaAcceptAll,
      btnDuplicatePanoramaSkip,
      btnDuplicatePanoramaSkipAll,
      btnDuplicatePanoramaList,
      btnDuplicatePanoramaCancel,
      btnCloseDuplicatePanoramaList,
      btnGenerateAllTilesSkip,
      btnGenerateAllTilesOverwrite,
      btnGenerateAllTilesCancel,
      deleteLinksScopeModal,
      duplicatePanoramaModal,
      duplicatePanoramaListModal,
      generateAllTilesModal,
      mapWindowBackdrop,
      fileImport,
      fileFloorplan,
      filePanorama,
      saveDraft,
      exportProject,
      exportProjectPackageZip,
      exportStaticPackage,
      updateStatus,
      deleteFloorplan,
      getFloorplanPlaceMode,
      setFloorplanPlaceMode,
      getFloorplanEditMode,
      setFloorplanEditMode,
      getFloorplanSelectAllMode,
      setFloorplanSelectAllMode,
      deleteSelectedFloorplanNode,
      getFloorplanShowLabels,
      setFloorplanShowLabels,
      getFloorplanShowAliases,
      setFloorplanShowAliases,
      getFloorplanMapWindowOpen,
      setFloorplanMapWindowOpen,
      setSelectedFloorplanColor,
      setFloorplanZoom,
      getFloorplanZoom,
      getSelectedFloorplan,
      zoomFloorplanAt,
      setFloorplanHoverActive,
      getFloorplanHoverActive,
      uploadPanoramaFiles,
      generateTilesForSelectedScenes,
      generateAllTiles,
      showTileSizingInfo,
      deleteSelectedScenes,
      pauseTiling,
      resumeTiling,
      togglePlacementMode,
      setMainSceneForSelectedGroup,
      setSceneOrientationById,
      addSceneLinkBlock,
      deleteSceneLinkBlock,
      removeAllSceneLinksForCurrentScene,
      editSelectedInfoHotspot,
      saveSelectedInfoHotspotState,
      toggleSection,
      toggleSceneSort,
      toggleSceneLabelMode,
      tilerWorkerRef,
      getActiveTilingRequestId,
      closeHotspotPreview,
      startTourFromHomePagePreview,
      getQuickPreviewOpenHotspotId,
      setQuickPreviewHoverModal,
      cancelQuickPreviewClose,
      scheduleQuickPreviewClose,
      maybeStartPreviewModalDrag,
      saveRichSourceModalContent,
      maybeStartRichLayoutResize,
      maybeStartRichEditorDrag,
      saveRichEditorModalContent,
      findClosestRichLayout,
      setSelectedRichLayoutElement,
      getRichMediaElementAtPoint,
      setSelectedRichImageElement,
      saveRichEditorSelectionRange,
      insertPlainTextAtCursor,
      syncAutoRichLayoutHeights,
      syncRichEditorSelectionState,
      updateRichImageResizeHandle,
      updateRichLayoutBlockResizeHandle,
      isRangeInsideRichEditor,
      syncRichEditorTypographyControls,
      getClosestRichColumn,
      isRangeAtStartOfElement,
      runtimeRichModal,
      toggleHomePageEditMode,
      saveHomePageState,
      openHomePagePreview,
      resolveDeleteLinksScope,
      resolveDuplicatePanoramaChoice,
      openDuplicatePanoramaListModal,
      closeDuplicatePanoramaListModal,
      duplicatePanoramaListEntriesRef,
      resolveGenerateAllTilesChoice,
      isTypingTarget,
      moveSceneSelectionBy,
      getBlockingModalState,
      getRichEditorContext,
      setHomePageEditMode,
      setInfoHotspotEditMode,
      handleResize,
      importProjectFile,
      uploadFloorplanFile,
    } = options;

    function isPointerInsideFloorplanMap(event) {
      if (!miniMap || !getSelectedFloorplan()) return false;
      const rect = miniMap.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    }

    function normalizeLegacyWheelEvent(event) {
      if (typeof event.deltaY === 'number') return event;
      if (typeof event.wheelDelta === 'number') {
        event.deltaY = -event.wheelDelta;
        return event;
      }
      if (typeof event.detail === 'number') {
        event.deltaY = event.detail * 40;
        return event;
      }
      return event;
    }

    function bindEvents() {
      btnSave?.addEventListener('click', () => saveDraft(state.project));
      btnExport?.addEventListener('click', exportProject);
      btnExportPackage?.addEventListener('click', () => {
        exportProjectPackageZip().catch((error) => {
          console.error(error);
          updateStatus('Project package ZIP export failed.');
        });
      });
      btnExportStatic?.addEventListener('click', exportStaticPackage);
      btnImport?.addEventListener('click', () => fileImport.click());
      btnUploadFloorplan?.addEventListener('click', () => fileFloorplan.click());
      btnDeleteFloorplan?.addEventListener('click', deleteFloorplan);
      btnFloorplanPlaceScene?.addEventListener('click', () => {
        if (btnFloorplanPlaceScene.disabled) return;
        setFloorplanPlaceMode(!getFloorplanPlaceMode());
      });
      btnFloorplanEdit?.addEventListener('click', () => {
        if (btnFloorplanEdit.disabled) return;
        setFloorplanEditMode(!getFloorplanEditMode());
      });
      btnFloorplanSelectAll?.addEventListener('click', () => {
        if (btnFloorplanSelectAll.disabled) return;
        setFloorplanSelectAllMode(!getFloorplanSelectAllMode());
      });
      btnFloorplanDeleteNode?.addEventListener('click', () => {
        if (btnFloorplanDeleteNode.disabled) return;
        deleteSelectedFloorplanNode();
      });
      btnFloorplanToggleLabels?.addEventListener('click', () => {
        if (btnFloorplanToggleLabels.disabled) return;
        setFloorplanShowLabels(!getFloorplanShowLabels());
      });
      btnFloorplanToggleAliases?.addEventListener('click', () => {
        if (btnFloorplanToggleAliases.disabled) return;
        setFloorplanShowAliases(!getFloorplanShowAliases());
      });
      btnFloorplanExpand?.addEventListener('click', () => {
        setFloorplanMapWindowOpen(!getFloorplanMapWindowOpen());
      });
      floorplanColorSelect?.addEventListener('change', (event) => {
        setSelectedFloorplanColor(event.target.value || 'yellow');
      });
      btnFloorplanZoomReset?.addEventListener('click', () => setFloorplanZoom(1));
      btnFloorplanZoomOut?.addEventListener('click', () => setFloorplanZoom(getFloorplanZoom() * 0.9));
      btnFloorplanZoomIn?.addEventListener('click', () => setFloorplanZoom(getFloorplanZoom() * 1.1));

      miniMap?.addEventListener('mouseenter', () => setFloorplanHoverActive(true));
      miniMap?.addEventListener('mouseleave', () => setFloorplanHoverActive(false));
      miniMap?.addEventListener('wheel', (event) => {
        if (!isPointerInsideFloorplanMap(event)) return;
        event.preventDefault();
        event.stopPropagation();
        zoomFloorplanAt(normalizeLegacyWheelEvent(event), state.selectedGroupId);
      }, { passive: false, capture: true });
      miniMap?.addEventListener('mousewheel', (event) => {
        if (!isPointerInsideFloorplanMap(event)) return;
        event.preventDefault();
        event.stopPropagation();
        zoomFloorplanAt(normalizeLegacyWheelEvent(event), state.selectedGroupId);
      }, { passive: false, capture: true });
      windowRef.addEventListener('wheel', (event) => {
        if (!getFloorplanHoverActive() && !isPointerInsideFloorplanMap(event)) return;
        event.preventDefault();
        event.stopPropagation();
        zoomFloorplanAt(normalizeLegacyWheelEvent(event), state.selectedGroupId);
      }, { passive: false, capture: true });
      windowRef.addEventListener('mousewheel', (event) => {
        if (!getFloorplanHoverActive() && !isPointerInsideFloorplanMap(event)) return;
        event.preventDefault();
        event.stopPropagation();
        zoomFloorplanAt(normalizeLegacyWheelEvent(event), state.selectedGroupId);
      }, { passive: false, capture: true });

      btnUploadPanorama?.addEventListener('click', () => filePanorama.click());
      btnGenerateTiles?.addEventListener('click', generateTilesForSelectedScenes);
      btnGenerateAllTiles?.addEventListener('click', generateAllTiles);
      btnTilesInfo?.addEventListener('click', showTileSizingInfo);
      btnDeleteSelectedScenes?.addEventListener('click', deleteSelectedScenes);
      btnPauseTiles?.addEventListener('click', pauseTiling);
      btnResumeTiles?.addEventListener('click', resumeTiling);
      btnTogglePlacement?.addEventListener('click', togglePlacementMode);
      btnSetMainScene?.addEventListener('click', setMainSceneForSelectedGroup);
      btnSetOrientation?.addEventListener('click', () => {
        if (!state.selectedSceneId) {
          updateStatus('Select a scene first.');
          return;
        }
        setSceneOrientationById(state.selectedSceneId);
      });
      btnAddSceneLink?.addEventListener('click', addSceneLinkBlock);
      btnDeleteSceneLink?.addEventListener('click', deleteSceneLinkBlock);
      btnRemoveAllLinks?.addEventListener('click', removeAllSceneLinksForCurrentScene);
      btnEditHotspot?.addEventListener('click', editSelectedInfoHotspot);
      btnSaveHotspot?.addEventListener('click', saveSelectedInfoHotspotState);
      btnToggleLinksPanel?.addEventListener('click', () => toggleSection(btnToggleLinksPanel, linksPanelBody));
      btnToggleProjectPanel?.addEventListener('click', () => toggleSection(btnToggleProjectPanel, projectPanelBody));
      btnToggleGroupsPanel?.addEventListener('click', () => toggleSection(btnToggleGroupsPanel, groupsPanelBody));
      btnToggleScenesPanel?.addEventListener('click', () => toggleSection(btnToggleScenesPanel, scenesPanelBody));
      btnSceneSortName?.addEventListener('click', () => toggleSceneSort('name'));
      btnSceneSortUpload?.addEventListener('click', () => toggleSceneSort('date'));
      btnSceneLabelMode?.addEventListener('click', toggleSceneLabelMode);
      btnToggleMapPanel?.addEventListener('click', () => {
        if (getFloorplanMapWindowOpen()) {
          setFloorplanMapWindowOpen(false);
        }
        toggleSection(btnToggleMapPanel, mapPanelBody);
      });
      btnToggleSceneActionsPanel?.addEventListener('click', () => toggleSection(btnToggleSceneActionsPanel, sceneActionsPanelBody));
      btnCancelTiles?.addEventListener('click', () => {
        const tilerWorker = tilerWorkerRef();
        const activeTilingRequestId = getActiveTilingRequestId();
        if (tilerWorker && activeTilingRequestId) {
          tilerWorker.postMessage({ type: 'cancel', requestId: activeTilingRequestId });
        }
      });
      btnClosePreview?.addEventListener('click', closeHotspotPreview);
      btnHomePagePreviewStart?.addEventListener('click', startTourFromHomePagePreview);

      previewModalContent?.addEventListener('mouseenter', () => {
        if (getQuickPreviewOpenHotspotId()) {
          setQuickPreviewHoverModal(true);
          cancelQuickPreviewClose();
        }
      });
      previewModalContent?.addEventListener('mouseleave', () => {
        if (getQuickPreviewOpenHotspotId()) {
          setQuickPreviewHoverModal(false);
          scheduleQuickPreviewClose();
        }
      });
      previewModalContent?.addEventListener('pointerdown', maybeStartPreviewModalDrag);

      btnRichSourceClose?.addEventListener('click', () => saveRichSourceModalContent({ closeAfterSave: true, refreshPanel: true }));
      btnRichSourceSave?.addEventListener('click', () => saveRichSourceModalContent({ closeAfterSave: false, refreshPanel: true }));
      richSourceTextarea?.addEventListener('input', () => saveRichSourceModalContent({ closeAfterSave: false }));

      richEditorSurface?.addEventListener('pointerdown', (event) => {
        if (maybeStartRichLayoutResize(event)) return;
        maybeStartRichEditorDrag(event);
      });
      richEditorSurface?.addEventListener('pointerup', () => {
        if (richEditorModal?.classList.contains('visible')) {
          saveRichEditorModalContent({ closeAfterSave: false });
        }
      });
      richEditorSurface?.addEventListener('mousemove', (event) => {
        runtimeRichModal?.handleSurfaceHover(event);
      });
      richEditorSurface?.addEventListener('mouseleave', () => {
        runtimeRichModal?.handleSurfaceLeave();
      });
      richEditorSurface?.addEventListener('click', (event) => {
        const layout = event.target instanceof Element ? findClosestRichLayout(event.target) : null;
        setSelectedRichLayoutElement(layout);
        const mediaByTarget = event.target instanceof Element ? event.target.closest('img,video,iframe') : null;
        const mediaByPoint = getRichMediaElementAtPoint(event.clientX, event.clientY);
        const media = mediaByTarget || mediaByPoint;
        if (media && richEditorSurface.contains(media)) {
          setSelectedRichImageElement(media);
          const selection = windowRef.getSelection();
          if (selection) {
            const range = documentRef.createRange();
            range.selectNode(media);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          return;
        }
        setSelectedRichImageElement(null);
        saveRichEditorSelectionRange();
      });
      richEditorSurface?.addEventListener('paste', (event) => {
        event.preventDefault();
        const plainText = event.clipboardData?.getData('text/plain') ?? '';
        insertPlainTextAtCursor(plainText);
        syncAutoRichLayoutHeights();
        syncRichEditorSelectionState();
        saveRichEditorSelectionRange();
        saveRichEditorModalContent({ closeAfterSave: false });
      });
      richEditorSurface?.addEventListener('input', () => {
        syncAutoRichLayoutHeights();
        syncRichEditorSelectionState();
        saveRichEditorSelectionRange();
        saveRichEditorModalContent({ closeAfterSave: false });
      });
      richEditorSurface?.addEventListener('scroll', () => {
        updateRichImageResizeHandle();
        updateRichLayoutBlockResizeHandle();
      });
      richEditorSurface?.addEventListener('keyup', () => {
        syncRichEditorSelectionState();
        saveRichEditorSelectionRange();
      });
      richEditorSurface?.addEventListener('mouseup', () => {
        syncRichEditorSelectionState();
        saveRichEditorSelectionRange();
      });
      richEditorSurface?.addEventListener('focus', () => {
        saveRichEditorSelectionRange();
      });
      documentRef.addEventListener('selectionchange', () => {
        if (!richEditorModal?.classList.contains('visible')) return;
        const selection = windowRef.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (isRangeInsideRichEditor(range)) {
            saveRichEditorSelectionRange();
          }
        }
        syncRichEditorTypographyControls({ force: false });
      });
      richEditorSurface?.addEventListener('keydown', (event) => {
        if (event.key !== 'Backspace') return;
        const selection = windowRef.getSelection();
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        if (!isRangeInsideRichEditor(range)) return;
        const column = getClosestRichColumn(range.startContainer);
        if (!column) return;
        if (isRangeAtStartOfElement(range, column)) {
          event.preventDefault();
          saveRichEditorSelectionRange();
        }
      });
      windowRef.addEventListener('resize', () => {
        updateRichImageResizeHandle();
        updateRichLayoutBlockResizeHandle();
        runtimeRichModal?.updateResizeHandle();
      });

      btnEditHomePage?.addEventListener('click', toggleHomePageEditMode);
      btnSaveHomePage?.addEventListener('click', saveHomePageState);
      btnViewHomePage?.addEventListener('click', openHomePagePreview);
      btnDeleteLinksScene?.addEventListener('click', () => resolveDeleteLinksScope('scene'));
      btnDeleteLinksGroup?.addEventListener('click', () => resolveDeleteLinksScope('group'));
      btnDeleteLinksCancel?.addEventListener('click', () => resolveDeleteLinksScope(null));
      btnDuplicatePanoramaProceed?.addEventListener('click', () => resolveDuplicatePanoramaChoice('proceed'));
      btnDuplicatePanoramaAcceptAll?.addEventListener('click', () => resolveDuplicatePanoramaChoice('accept-all'));
      btnDuplicatePanoramaSkip?.addEventListener('click', () => resolveDuplicatePanoramaChoice('skip'));
      btnDuplicatePanoramaSkipAll?.addEventListener('click', () => resolveDuplicatePanoramaChoice('skip-all'));
      btnDuplicatePanoramaList?.addEventListener('click', () => openDuplicatePanoramaListModal(duplicatePanoramaListEntriesRef()));
      btnDuplicatePanoramaCancel?.addEventListener('click', () => resolveDuplicatePanoramaChoice('cancel'));
      btnCloseDuplicatePanoramaList?.addEventListener('click', closeDuplicatePanoramaListModal);
      btnGenerateAllTilesSkip?.addEventListener('click', () => resolveGenerateAllTilesChoice('skip'));
      btnGenerateAllTilesOverwrite?.addEventListener('click', () => resolveGenerateAllTilesChoice('overwrite'));
      btnGenerateAllTilesCancel?.addEventListener('click', () => resolveGenerateAllTilesChoice('cancel'));
      deleteLinksScopeModal?.addEventListener('click', (event) => {
        if (event.target === deleteLinksScopeModal) {
          resolveDeleteLinksScope(null);
        }
      });
      duplicatePanoramaModal?.addEventListener('click', (event) => {
        if (event.target === duplicatePanoramaModal) {
          resolveDuplicatePanoramaChoice('cancel');
        }
      });
      duplicatePanoramaListModal?.addEventListener('click', (event) => {
        if (event.target === duplicatePanoramaListModal) {
          closeDuplicatePanoramaListModal();
        }
      });
      generateAllTilesModal?.addEventListener('click', (event) => {
        if (event.target === generateAllTilesModal) {
          resolveGenerateAllTilesChoice('cancel');
        }
      });
      mapWindowBackdrop?.addEventListener('click', () => setFloorplanMapWindowOpen(false));
      windowRef.addEventListener('keydown', (event) => {
        const blockingModalState = getBlockingModalState();
        const blockingModalOpen =
          blockingModalState.preview ||
          blockingModalState.richEditor ||
          blockingModalState.deleteLinksScope ||
          blockingModalState.duplicatePanorama ||
          blockingModalState.duplicatePanoramaList ||
          blockingModalState.generateAllTiles;
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !isTypingTarget(event.target) && !blockingModalOpen) {
          const moved = moveSceneSelectionBy(event.key === 'ArrowDown' ? 1 : -1);
          if (moved) {
            event.preventDefault();
            return;
          }
        }
        if (event.key === 'Escape' && blockingModalState.duplicatePanoramaList) {
          closeDuplicatePanoramaListModal();
          return;
        }
        if (event.key === 'Escape' && blockingModalState.preview) {
          closeHotspotPreview();
          return;
        }
        if (event.key === 'Escape' && blockingModalState.duplicatePanorama) {
          resolveDuplicatePanoramaChoice('cancel');
          return;
        }
        if (event.key === 'Escape' && blockingModalState.generateAllTiles) {
          resolveGenerateAllTilesChoice('cancel');
          return;
        }
        if (event.key === 'Escape' && blockingModalState.richEditor) {
          if (getRichEditorContext()?.type === 'home-page') {
            setHomePageEditMode(false);
          } else {
            setInfoHotspotEditMode(false);
          }
          return;
        }
        if (event.key === 'Escape' && blockingModalState.richSource) {
          saveRichSourceModalContent({ closeAfterSave: true, refreshPanel: true });
          return;
        }
        if (event.key === 'Escape' && blockingModalState.floorplanMapWindowOpen) {
          setFloorplanMapWindowOpen(false);
        }
      });

      fileImport?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          importProjectFile(file);
        }
      });
      fileFloorplan?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          uploadFloorplanFile(file);
        }
        fileFloorplan.value = '';
      });
      filePanorama?.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (files?.length) {
          await uploadPanoramaFiles(files);
        }
        filePanorama.value = '';
      });

      windowRef.addEventListener('resize', handleResize);
    }

    return {
      bindEvents,
    };
  }

  window.IterpanoEditorEvents = {
    createEditorEventsController,
  };
})();
