const sampleTourUrl = '../shared/sample-tour.json';
const fallbackProject = {
  project: {
    name: 'Untitled Tour',
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  settings: {
    mouseViewMode: 'drag',
    autorotateEnabled: false,
    fullscreenButton: true,
    gyroEnabled: false,
    vrEnabled: true
  },
  homePage: {
    richContentHtml: ''
  },
  scenes: [],
  groups: [],
  assets: {
    media: []
  },
  minimap: {
    enabled: false,
    image: '',
    nodes: [],
    floorplans: []
  }
};

const DB_NAME = 'virtual-tour-builder';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const AUTOSAVE_KEY = 'autosave';

const state = {
  project: null,
  selectedGroupId: null,
  selectedSceneId: null,
  selectedHotspotId: null,
  selectedFloorplanId: null,
  multiSelectedSceneIds: [],
  sceneSelectionAnchorId: null,
  sceneSortKey: 'name',
  sceneSortDirection: 'asc',
  sceneLabelMode: 'name',
  linkTargetAllGroups: false,
  newLinkColorKey: 'yellow'
};

const sceneList = document.getElementById('scene-list');
const sceneGroupSelect = document.getElementById('group-select');
const linkSelect = document.getElementById('link-select');
const linkTargetSceneSelect = document.getElementById('link-target-scene');
const linkTargetAllGroupsToggle = document.getElementById('link-target-all-groups');
const linkCommentInput = document.getElementById('link-comment');
const linkNoteLabel = document.getElementById('link-note-label');
const linkNewColorSelect = document.getElementById('link-new-color');
const infoHotspotSelect = document.getElementById('info-hotspot-select');
const infoHotspotModeSelect = document.getElementById('info-hotspot-mode');
const infoHotspotColorSelect = document.getElementById('info-hotspot-color');
const contentBlocks = document.getElementById('content-blocks');
const infoContentSectionBody = contentBlocks?.closest('.section-body') || null;
const richContentTitle = document.getElementById('rich-content-title');
const richContentHint = document.getElementById('rich-content-hint');
const sceneTitle = document.getElementById('scene-title');
const projectNameInput = document.getElementById('project-name');
const projectFovInput = null;
const statusLeft = document.getElementById('status-left');
const rightPanel = document.querySelector('.panel.right');
const btnAddGroup = document.getElementById('btn-add-group');
const btnRenameGroup = document.getElementById('btn-rename-group');
const btnSetMainGroup = document.getElementById('btn-set-main-group');
const btnDeleteGroup = document.getElementById('btn-delete-group');
const btnEditHomePage = document.getElementById('btn-edit-home-page');
const btnSaveHomePage = document.getElementById('btn-save-home-page');
const btnViewHomePage = document.getElementById('btn-view-home-page');
const btnImport = document.getElementById('btn-import');
const btnSave = document.getElementById('btn-save');
const btnExport = document.getElementById('btn-export');
const btnExportPackage = document.getElementById('btn-export-package');
const btnExportStatic = document.getElementById('btn-export-static');
const btnResetProject = document.getElementById('btn-reset-project');
const btnUploadFloorplan = document.getElementById('btn-upload-minimap');
const btnDeleteFloorplan = document.getElementById('btn-delete-floorplan');
const btnUploadPanorama = document.getElementById('btn-upload-panorama');
const btnGenerateTiles = document.getElementById('btn-generate-tiles');
const btnGenerateAllTiles = document.getElementById('btn-generate-all-tiles');
const btnTilesInfo = document.getElementById('btn-tiles-info');
const btnDeleteSelectedScenes = document.getElementById('btn-delete-selected-scenes');
const btnCancelTiles = document.getElementById('btn-cancel-tiles');
const btnPauseTiles = document.getElementById('btn-pause-tiles');
const btnResumeTiles = document.getElementById('btn-resume-tiles');
const btnTogglePlacement = document.getElementById('btn-toggle-placement');
const btnSetMainScene = document.getElementById('btn-set-main-scene');
const btnSetOrientation = document.getElementById('btn-set-orientation');
const btnAddSceneLink = document.getElementById('btn-add-scene-link');
const btnDeleteSceneLink = document.getElementById('btn-delete-scene-link');
const btnRemoveAllLinks = document.getElementById('btn-remove-all-links');
const btnAddHotspot = document.getElementById('btn-add-hotspot');
const btnDeleteHotspot = document.getElementById('btn-delete-hotspot');
const btnEditHotspot = document.getElementById('btn-edit-hotspot');
const btnSaveHotspot = document.getElementById('btn-save-hotspot');
const btnToggleLinksPanel = document.getElementById('btn-toggle-links-panel');
const linksPanelBody = document.getElementById('links-panel-body');
const btnToggleProjectPanel = document.getElementById('btn-toggle-project-panel');
const projectPanelBody = document.getElementById('project-panel-body');
const btnToggleGroupsPanel = document.getElementById('btn-toggle-groups-panel');
const groupsPanelBody = document.getElementById('groups-panel-body');
const btnToggleScenesPanel = document.getElementById('btn-toggle-scenes-panel');
const scenesPanelBody = document.getElementById('scenes-panel-body');
const btnSceneSortName = document.getElementById('btn-scene-sort-name');
const btnSceneSortUpload = document.getElementById('btn-scene-sort-upload');
const btnSceneLabelMode = document.getElementById('btn-scene-label-mode');
const btnToggleMapPanel = document.getElementById('btn-toggle-map-panel');
const mapPanelBody = document.getElementById('map-panel-body');
const btnToggleSceneActionsPanel = document.getElementById('btn-toggle-scene-actions-panel');
const sceneActionsPanelBody = document.getElementById('scene-actions-panel-body');
const mapWindowBackdrop = document.getElementById('map-window-backdrop');
const layoutRoot = document.querySelector('.layout');
const fileImport = document.getElementById('file-import');
const fileFloorplan = document.getElementById('file-floorplan');
const filePanorama = document.getElementById('file-panorama');
const miniMap = document.getElementById('mini-map');
const btnFloorplanExpand = document.getElementById('btn-floorplan-expand');
const btnFloorplanPlaceScene = document.getElementById('btn-floorplan-place-scene');
const btnFloorplanEdit = document.getElementById('btn-floorplan-edit');
const btnFloorplanSelectAll = document.getElementById('btn-floorplan-select-all');
const btnFloorplanDeleteNode = document.getElementById('btn-floorplan-delete-node');
const btnFloorplanToggleLabels = document.getElementById('btn-floorplan-toggle-labels');
const btnFloorplanToggleAliases = document.getElementById('btn-floorplan-toggle-aliases');
const floorplanColorSelect = document.getElementById('floorplan-color-select');
const btnFloorplanZoomReset = document.getElementById('btn-floorplan-zoom-reset');
const btnFloorplanZoomOut = document.getElementById('btn-floorplan-zoom-out');
const btnFloorplanZoomIn = document.getElementById('btn-floorplan-zoom-in');
const tilingProgress = document.getElementById('tiling-progress');
const tilingProgressFill = document.getElementById('tiling-progress-fill');
const panoEditor = document.getElementById('pano-editor');
const viewerCanvas = document.getElementById('viewer-canvas');
const hotspotOverlay = document.getElementById('hotspot-overlay');
const hotspotHoverCard = document.getElementById('hotspot-hover-card');
const viewerPlaceholder = document.getElementById('viewer-placeholder');
const previewModal = document.getElementById('hotspot-preview-modal');
const previewModalContent = document.getElementById('preview-modal-content');
const previewModalTitle = document.getElementById('preview-modal-title');
const previewModalBody = document.getElementById('preview-modal-body');
const btnHomePagePreviewStart = document.getElementById('btn-home-page-preview-start');
const btnClosePreview = document.getElementById('btn-close-preview');
const richEditorModal = document.getElementById('rich-editor-modal');
const richEditorModalContent = document.getElementById('rich-editor-modal-content');
const richEditorSurface = document.getElementById('rich-editor-surface');
let runtimeRichModal = null;
let runtimeRichLayout = null;
let runtimeRichSelection = null;
let runtimeRichTypography = null;
let runtimeHotspotSelection = null;
let runtimeHotspotUi = null;
let runtimeHotspotActions = null;
let runtimeHotspotModes = null;
let runtimeHotspotSidebar = null;
let runtimeFloorplanSelection = null;
let runtimeFloorplanModes = null;
let runtimeFloorplanActions = null;
let runtimeFloorplanRender = null;
let runtimeSceneSelection = null;
let runtimeSceneActions = null;
let runtimeSceneSidebar = null;
let runtimeProjectIoUtils = null;
let runtimeProjectExport = null;
let runtimeProjectImport = null;
let runtimeEditorRender = null;
let runtimeEditorEvents = null;
let runtimeEditorUi = null;
let runtimeEditorUtils = null;
const runtimeEditorModuleFailures = [];
const richSourceModal = document.getElementById('rich-source-modal');
const richSourceTextarea = document.getElementById('rich-source-textarea');
const btnRichSourceClose = document.getElementById('btn-rich-source-close');
const btnRichSourceSave = document.getElementById('btn-rich-source-save');
const deleteLinksScopeModal = document.getElementById('delete-links-scope-modal');
const btnDeleteLinksScene = document.getElementById('btn-delete-links-scene');
const btnDeleteLinksGroup = document.getElementById('btn-delete-links-group');
const btnDeleteLinksCancel = document.getElementById('btn-delete-links-cancel');
const duplicatePanoramaModal = document.getElementById('duplicate-panorama-modal');
const duplicatePanoramaMessage = document.getElementById('duplicate-panorama-message');
const btnDuplicatePanoramaProceed = document.getElementById('btn-duplicate-panorama-proceed');
const btnDuplicatePanoramaAcceptAll = document.getElementById('btn-duplicate-panorama-accept-all');
const btnDuplicatePanoramaSkip = document.getElementById('btn-duplicate-panorama-skip');
const btnDuplicatePanoramaSkipAll = document.getElementById('btn-duplicate-panorama-skip-all');
const btnDuplicatePanoramaList = document.getElementById('btn-duplicate-panorama-list');
const btnDuplicatePanoramaCancel = document.getElementById('btn-duplicate-panorama-cancel');
const duplicatePanoramaListModal = document.getElementById('duplicate-panorama-list-modal');
const duplicatePanoramaListBody = document.getElementById('duplicate-panorama-list-body');
const btnCloseDuplicatePanoramaList = document.getElementById('btn-close-duplicate-panorama-list');
const generateAllTilesModal = document.getElementById('generate-all-tiles-modal');
const generateAllTilesMessage = document.getElementById('generate-all-tiles-message');
const btnGenerateAllTilesSkip = document.getElementById('btn-generate-all-tiles-skip');
const btnGenerateAllTilesOverwrite = document.getElementById('btn-generate-all-tiles-overwrite');
const btnGenerateAllTilesCancel = document.getElementById('btn-generate-all-tiles-cancel');

let dragState = null;
const generatedTiles = new Map();
let tilerWorker = null;
let lastProgressUpdate = 0;
let activeTilingRequestId = null;
let tilingPaused = false;
let editorViewer = null;
let editorScenes = new Map();
let placementMode = false;
let markerFrame = null;
let markerLoopId = null;
const hotspotMarkerElements = new Map();
let hotspotMarkerSceneId = null;
let lastMarkerRenderSignature = null;
let suppressSceneSwitch = false;
let draggingHotspotId = null;
let dragMoved = false;
let dragPointerId = null;
let viewerPointerDown = null;
let suppressNextViewerClick = false;
let renamingSceneId = null;
let hoveredLinkHotspotId = null;
let pendingSceneLinkDraft = null;
let floorplanZoomByGroup = new Map();
let floorplanPlaceMode = false;
let floorplanEditMode = false;
let floorplanSelectAllMode = false;
let floorplanShowLabels = false;
let floorplanShowAliases = false;
let floorplanMapWindowOpen = false;
let floorplanPanState = null;
let floorplanHoverActive = false;
const floorplanImageMetricsById = new Map();
let floorplanResizeObserver = null;
let deleteLinksScopeResolver = null;
let duplicatePanoramaResolver = null;
let duplicatePanoramaListEntries = [];
let generateAllTilesResolver = null;
let richEditorContext = null;
let richSourceContext = null;
let richEditorSavedRange = null;
let richEditorSavedExpandedRange = null;
function safeCreateRuntimeEditorModule(moduleName, factory, requiredDeps = []) {
  return window.IterpanoEditorBootstrap?.safeCreateRuntimeEditorModule(
    runtimeEditorModuleFailures,
    moduleName,
    factory,
    requiredDeps
  ) || null;
}

function getRichEditorSavedRanges() {
  return {
    range: richEditorSavedRange,
    expandedRange: richEditorSavedExpandedRange
  };
}

function setRichEditorSavedRanges(range, expandedRange = null) {
  richEditorSavedRange = range || null;
  richEditorSavedExpandedRange = expandedRange || null;
}

function clearRichEditorSavedRanges() {
  richEditorSavedRange = null;
  richEditorSavedExpandedRange = null;
}
let activeRichSizeInput = null;
let previewHotspotContext = null;
let previewModalDragState = null;
let quickPreviewOpenHotspotId = null;
let quickPreviewHoverMarkerId = null;
let quickPreviewHoverModal = false;
let quickPreviewOpenTimer = null;
let quickPreviewCloseTimer = null;
let infoHotspotCreateMode = false;
let infoHotspotEditMode = false;
let homePageEditMode = false;
const SCENE_ITEM_SINGLE_CLICK_DELAY_MS = 320;

const FLOORPLAN_COLOR_MAP = {
  yellow: '#f0c84b',
  red: '#ef4444',
  cyan: '#22d3ee',
  lightgreen: '#86efac',
  magenta: '#f472b6',
  white: '#ffffff',
  black: '#111111'
};
const TEXT_ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify']);
const DEFAULT_RICH_IMAGE_MAX_HEIGHT = '14.5em';
const DEFAULT_INFO_FRAME_WIDTH = 920;
const DEFAULT_INFO_FRAME_HEIGHT = 460;
const DEFAULT_INFO_FRAME_LEFT = 320;
const DEFAULT_INFO_FRAME_TOP = 112;
const DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_X = 0;
const DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_Y = 10;
const DEFAULT_INFO_HOTSPOT_COLOR_KEY = 'yellow';
const DEFAULT_INFO_HOTSPOT_DISPLAY_MODE = 'click';
const DEFAULT_INFO_BG_COLOR_KEY = 'black';
const DEFAULT_INFO_BG_TRANSPARENCY = 20;
const MIN_INFO_FRAME_WIDTH = 44;
const MAX_INFO_FRAME_WIDTH = 2400;
const MIN_INFO_FRAME_HEIGHT = 30;
const MAX_INFO_FRAME_HEIGHT = 1800;
const RICH_LAYOUT_COLUMN_MIN_WIDTH = 80;
const DEFAULT_RICH_LAYOUT_COLUMN_CHAR_WIDTH = 20;
const DEFAULT_RICH_LAYOUT_COLUMN_GAP_PX = 2;
const DEFAULT_INFO_FRAME_VIEWPORT_WIDTH = 1366;
const DEFAULT_INFO_FRAME_VIEWPORT_HEIGHT = 768;

runtimeEditorUtils = safeCreateRuntimeEditorModule(
  'editor-utils',
  () => window.IterpanoEditorUtils?.createEditorUtilsController({
    generatedTiles,
    floorplanColorMap: FLOORPLAN_COLOR_MAP,
  }),
  [
    { label: 'IterpanoEditorUtils', value: window.IterpanoEditorUtils }
  ]
);

function clampInfoFrameDimension(value, min, max, fallback) {
  const numeric = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function normalizeInfoFrameSize(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    width: clampInfoFrameDimension(
      source.width,
      MIN_INFO_FRAME_WIDTH,
      MAX_INFO_FRAME_WIDTH,
      DEFAULT_INFO_FRAME_WIDTH
    ),
    height: clampInfoFrameDimension(
      source.height,
      MIN_INFO_FRAME_HEIGHT,
      MAX_INFO_FRAME_HEIGHT,
      DEFAULT_INFO_FRAME_HEIGHT
    )
  };
}

function clampInfoFramePosition(value, fallback) {
  const numeric = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(8, Math.round(numeric));
}

function normalizeInfoFramePosition(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    left: clampInfoFramePosition(source.left, DEFAULT_INFO_FRAME_LEFT),
    top: clampInfoFramePosition(source.top, DEFAULT_INFO_FRAME_TOP)
  };
}

function normalizeInfoFrameViewport(value) {
  const source = value && typeof value === 'object' ? value : {};
  const widthRaw = Number.parseInt(String(source.width ?? ''), 10);
  const heightRaw = Number.parseInt(String(source.height ?? ''), 10);
  const width = Number.isFinite(widthRaw)
    ? Math.max(1, Math.min(10000, Math.round(widthRaw)))
    : Math.max(1, Math.round(window.innerWidth || DEFAULT_INFO_FRAME_VIEWPORT_WIDTH));
  const height = Number.isFinite(heightRaw)
    ? Math.max(1, Math.min(10000, Math.round(heightRaw)))
    : Math.max(1, Math.round(window.innerHeight || DEFAULT_INFO_FRAME_VIEWPORT_HEIGHT));
  return { width, height };
}

function normalizeInfoFrameAnchorOffset(value) {
  const source = value && typeof value === 'object' ? value : {};
  const offsetXRaw = Number.parseFloat(String(source.offsetX ?? ''));
  const offsetYRaw = Number.parseFloat(String(source.offsetY ?? ''));
  if (!Number.isFinite(offsetXRaw) || !Number.isFinite(offsetYRaw)) return null;
  return {
    offsetX: Math.max(-10000, Math.min(10000, Math.round(offsetXRaw))),
    offsetY: Math.max(-10000, Math.min(10000, Math.round(offsetYRaw)))
  };
}

function getInfoHotspotFrameSize(hotspot) {
  return normalizeInfoFrameSize(hotspot?.infoFrameSize);
}

function getInfoHotspotFramePosition(hotspot) {
  return normalizeInfoFramePosition(hotspot?.infoFramePosition);
}

function getInfoHotspotFrameViewport(hotspot) {
  return normalizeInfoFrameViewport(hotspot?.infoFrameViewport);
}

function getInfoHotspotFrameAnchorOffset(hotspot) {
  return normalizeInfoFrameAnchorOffset(hotspot?.infoFrameAnchorOffset);
}

function getHotspotViewportPoint(hotspot) {
  if (!hotspot) return null;
  const markerEl = hotspotMarkerElements.get(hotspot.id);
  if (markerEl instanceof HTMLElement && markerEl.style.display !== 'none') {
    const rect = markerEl.getBoundingClientRect();
    if (Number.isFinite(rect.left) && Number.isFinite(rect.top)) {
      return {
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
      };
    }
  }

  const active = editorScenes.get(state.selectedSceneId);
  if (!active?.view || !viewerCanvas) return null;
  const viewPoint = active.view.coordinatesToScreen({ yaw: hotspot.yaw, pitch: hotspot.pitch }, {});
  if (!viewPoint || viewPoint.x === null || viewPoint.y === null) return null;
  const scale = getViewScale(active);
  const sceneRect = viewerCanvas.getBoundingClientRect();
  const markerOffsetY = -5;
  return {
    x: sceneRect.left + (viewPoint.x / scale.x),
    y: sceneRect.top + (viewPoint.y / scale.y) + markerOffsetY
  };
}

function getScaledInfoFramePositionForViewport(hotspot) {
  const pos = getInfoHotspotFramePosition(hotspot);
  const baseViewport = getInfoHotspotFrameViewport(hotspot);
  const currentWidth = Math.max(1, Math.round(window.innerWidth || baseViewport.width));
  const currentHeight = Math.max(1, Math.round(window.innerHeight || baseViewport.height));
  return {
    left: Math.round((pos.left / Math.max(1, baseViewport.width)) * currentWidth),
    top: Math.round((pos.top / Math.max(1, baseViewport.height)) * currentHeight)
  };
}

function getDefaultInfoFramePositionFromHotspot(hotspot) {
  const fallback = getScaledInfoFramePositionForViewport(hotspot);
  const hotspotPoint = getHotspotViewportPoint(hotspot);
  if (!hotspotPoint) return fallback;
  return normalizeInfoFramePosition({
    left: Math.round(hotspotPoint.x + DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_X),
    top: Math.round(hotspotPoint.y + DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_Y)
  });
}

function getAnchoredInfoFramePosition(hotspot) {
  const fallback = getDefaultInfoFramePositionFromHotspot(hotspot);
  const anchorOffset = getInfoHotspotFrameAnchorOffset(hotspot);
  if (!anchorOffset) return fallback;
  const hotspotPoint = getHotspotViewportPoint(hotspot);
  if (!hotspotPoint) return fallback;
  return {
    left: Math.round(hotspotPoint.x + anchorOffset.offsetX),
    top: Math.round(hotspotPoint.y + anchorOffset.offsetY)
  };
}

function getViewportClampedInfoFrameSize(size) {
  const next = normalizeInfoFrameSize(size);
  const maxWidth = Math.max(MIN_INFO_FRAME_WIDTH, Math.floor(window.innerWidth * 0.92));
  const maxHeight = Math.max(MIN_INFO_FRAME_HEIGHT, Math.floor(window.innerHeight * 0.78));
  return {
    width: Math.min(next.width, maxWidth),
    height: Math.min(next.height, maxHeight)
  };
}

function applyRichEditorModalFrameSize(hotspot) {
  runtimeRichModal?.applyFrameSize(hotspot);
}

function captureRichEditorModalFrameSize(hotspot) {
  runtimeRichModal?.captureFrameSize(hotspot);
}

function applyRichEditorModalResizeConstraints() {
  runtimeRichModal?.applyResizeConstraints();
}

function parsePixelStyleValue(value, fallback) {
  const parsed = Number.parseFloat(String(value || ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampRichEditorModalPosition() {
  runtimeRichModal?.clampPosition();
}

function ensureRichModalResizeHandle() {
  return runtimeRichModal?.ensureResizeHandle() || null;
}

function hideRichModalResizeHandle() {
  runtimeRichModal?.hideResizeHandle();
}

function updateRichModalResizeHandle() {
  runtimeRichModal?.updateResizeHandle();
}

function stopRichModalResize() {
  runtimeRichModal?.stopResize();
}

function stopRichEditorDrag() {
  runtimeRichModal?.stopDrag();
}

function maybeStartRichEditorDrag(event) {
  return runtimeRichModal?.maybeStartDrag(event) || false;
}


function persistPreviewModalFramePosition() {
  const hotspot = getInfoHotspotByContext(previewHotspotContext);
  if (!hotspot || !previewModalContent) return;
  const rect = previewModalContent.getBoundingClientRect();
  const left = parsePixelStyleValue(previewModalContent.style.left, rect.left);
  const top = parsePixelStyleValue(previewModalContent.style.top, rect.top);
  hotspot.infoFramePosition = normalizeInfoFramePosition({ left, top });
  hotspot.infoFrameViewport = normalizeInfoFrameViewport({
    width: window.innerWidth,
    height: window.innerHeight
  });
  // Preview popup must stay independent from panorama pan/orbit.
  hotspot.infoFrameAnchorOffset = null;
}

function getPreviewModalAnchorOffset(hotspot) {
  const sessionOffset = normalizeInfoFrameAnchorOffset(previewHotspotContext?.anchorOffset);
  if (sessionOffset) return sessionOffset;
  const savedOffset = getInfoHotspotFrameAnchorOffset(hotspot);
  if (savedOffset) return savedOffset;
  return normalizeInfoFrameAnchorOffset({
    offsetX: DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_X,
    offsetY: DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_Y
  });
}

function updatePreviewModalAnchorOffsetFromCurrentPosition() {
  const hotspot = getInfoHotspotByContext(previewHotspotContext);
  if (!hotspot || !previewModalContent || !previewHotspotContext) return;
  const hotspotPoint = getHotspotViewportPoint(hotspot);
  if (!hotspotPoint) return;
  const rect = previewModalContent.getBoundingClientRect();
  const left = parsePixelStyleValue(previewModalContent.style.left, rect.left);
  const top = parsePixelStyleValue(previewModalContent.style.top, rect.top);
  previewHotspotContext.anchorOffset = normalizeInfoFrameAnchorOffset({
    offsetX: left - hotspotPoint.x,
    offsetY: top - hotspotPoint.y
  });
}

function stopPreviewModalDrag() {
  if (!previewModalDragState) return;
  previewModalDragState = null;
  window.removeEventListener('pointermove', handlePreviewModalDragMove);
  window.removeEventListener('pointerup', stopPreviewModalDrag);
  window.removeEventListener('pointercancel', stopPreviewModalDrag);
  // Keep drag temporary for this preview session, but preserve its anchor to the hotspot while panning.
  updatePreviewModalAnchorOffsetFromCurrentPosition();
}

function handlePreviewModalDragMove(event) {
  if (!previewModalDragState || !previewModalContent) return;
  const deltaX = event.clientX - previewModalDragState.startX;
  const deltaY = event.clientY - previewModalDragState.startY;
  const width = previewModalContent.offsetWidth || 0;
  const height = previewModalContent.offsetHeight || 0;
  const maxLeft = Math.max(8, window.innerWidth - width - 8);
  const maxTop = Math.max(8, window.innerHeight - height - 8);
  const nextLeft = Math.min(maxLeft, Math.max(8, previewModalDragState.startLeft + deltaX));
  const nextTop = Math.min(maxTop, Math.max(8, previewModalDragState.startTop + deltaY));
  previewModalContent.style.left = `${Math.round(nextLeft)}px`;
  previewModalContent.style.top = `${Math.round(nextTop)}px`;
  updatePreviewModalAnchorOffsetFromCurrentPosition();
}

function maybeStartPreviewModalDrag(event) {
  if (!previewModal?.classList.contains('visible')) return false;
  if (!previewModal?.classList.contains('preview-modal-rich-like')) return false;
  if (!previewModalContent || event.button !== 0) return false;
  if (event.target instanceof Element && event.target.closest('#btn-close-preview')) return false;
  const rect = previewModalContent.getBoundingClientRect();
  const withinDragZone = (event.clientY - rect.top) <= 20;
  if (!withinDragZone) return false;
  previewModalDragState = {
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top
  };
  event.preventDefault();
  event.stopPropagation();
  window.addEventListener('pointermove', handlePreviewModalDragMove);
  window.addEventListener('pointerup', stopPreviewModalDrag);
  window.addEventListener('pointercancel', stopPreviewModalDrag);
  return true;
}

function normalizeTextAlign(value) {
  const candidate = String(value || 'left').trim().toLowerCase();
  return TEXT_ALIGN_VALUES.has(candidate) ? candidate : 'left';
}

function normalizeInfoHotspotDisplayMode(value) {
  return String(value || '').trim().toLowerCase() === 'quick' ? 'quick' : 'click';
}

function isZeroCssValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  return raw === '0' || raw === '0px' || raw === '0rem' || raw === '0em' || raw === '0%';
}

function sanitizeImageSizeValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (/^\d{1,3}%$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 5 && amount <= 100) return `${amount}%`;
  }
  if (/^\d{1,4}px$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 24 && amount <= 4096) return `${amount}px`;
  }
  if (/^\d{1,4}$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 24 && amount <= 4096) return `${amount}px`;
  }
  return '';
}

function sanitizeImageMaxHeightValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (/^\d{1,4}px$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 24 && amount <= 2400) return `${amount}px`;
  }
  if (/^\d{1,3}(\.\d+)?em$/.test(raw)) {
    const amount = Number.parseFloat(raw);
    if (amount >= 1 && amount <= 120) return `${amount}em`;
  }
  if (/^\d{1,3}(\.\d+)?rem$/.test(raw)) {
    const amount = Number.parseFloat(raw);
    if (amount >= 1 && amount <= 120) return `${amount}rem`;
  }
  if (/^\d{1,4}$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 24 && amount <= 2400) return `${amount}px`;
  }
  return '';
}

function sanitizeRichFontSizeValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (/^\d{1,3}px$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 8 && amount <= 200) return `${amount}px`;
  }
  if (/^\d{1,3}$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 8 && amount <= 200) return `${amount}px`;
  }
  return '';
}

function sanitizeRichLineHeightValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (/^\d(?:\.\d+)?$/.test(raw)) {
    const amount = Number.parseFloat(raw);
    if (amount >= 0.1 && amount <= 3) return String(amount);
  }
  if (/^\d{2,3}%$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 10 && amount <= 300) return `${amount}%`;
  }
  if (/^\d{1,3}(\.\d+)?(px|em|rem)$/.test(raw)) {
    return raw;
  }
  return '';
}

function sanitizeRichParagraphSpacingValue(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (/^\d{1,2}px$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 0 && amount <= 48) return `${amount}px`;
  }
  if (/^\d{1,2}$/.test(raw)) {
    const amount = Number.parseInt(raw, 10);
    if (amount >= 0 && amount <= 48) return `${amount}px`;
  }
  return '';
}

function applyRichFontSizeInSelection(sizeValue) {
  const applied = runtimeRichTypography?.applyFontSizeInSelection(sizeValue) || false;
  if (applied) {
    syncAutoRichLayoutHeights();
  }
  return applied;
}

function applyRichLineHeightInSelection(lineHeightValue) {
  const applied = runtimeRichTypography?.applyLineHeightInSelection(lineHeightValue) || false;
  if (applied) {
    syncAutoRichLayoutHeights();
  }
  return applied;
}

function applyRichParagraphSpacingInSelection(spacingValue) {
  const applied = runtimeRichTypography?.applyParagraphSpacingInSelection(spacingValue) || false;
  if (applied) {
    syncAutoRichLayoutHeights();
  }
  return applied;
}

function syncClosestRichLayoutHeightFromNode(startNode) {
  if (!richEditorSurface) return;
  const layout = findClosestRichLayout(startNode);
  if (!(layout instanceof HTMLElement)) return;
  layout.removeAttribute('data-height-locked');
  layout.style.removeProperty('height');
  layout.style.removeProperty('min-height');
  syncAutoRichLayoutHeights();
}

function getRichBlockNodeForSelection(node) {
  if (!node || !richEditorSurface) return null;
  let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  while (current && current !== richEditorSurface) {
    if (current.matches?.('p,li,td,th,h1,h2,h3,h4')) return current;
    if (
      current.matches?.('div') &&
      !current.hasAttribute('data-col') &&
      !current.hasAttribute('data-layout')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function syncAutoRichLayoutHeights() {
  if (!richEditorSurface) return;
  const activeLayout = getSelectedRichLayoutElement();
  if (activeLayout instanceof HTMLElement && activeLayout.dataset.heightLocked === 'true') {
    activeLayout.removeAttribute('data-height-locked');
    activeLayout.style.removeProperty('height');
    activeLayout.style.removeProperty('min-height');
  }
  richEditorSurface.querySelectorAll('[data-layout^="columns-"]').forEach((layout) => {
    if (!(layout instanceof HTMLElement)) return;
    if (layout.dataset.heightLocked === 'true') return;
    layout.style.removeProperty('height');
    layout.style.removeProperty('min-height');
  });
  updateRichLayoutBlockResizeHandle();
}


function getClosestRichColumn(startNode) {
  if (!startNode || !richEditorSurface) return null;
  let node = startNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  if (!(node instanceof Element)) return null;
  const column = node.closest('[data-col]');
  if (!(column instanceof Element)) return null;
  if (!richEditorSurface.contains(column)) return null;
  return column;
}

function hasMeaningfulContent(node) {
  if (!node) return false;
  if (node.nodeType === Node.TEXT_NODE) {
    return String(node.textContent || '').replace(/\u200B/g, '').trim().length > 0;
  }
  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return false;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') return false;
    if (tag === 'img' || tag === 'video' || tag === 'iframe' || tag === 'audio' || tag === 'table' || tag === 'hr') {
      return true;
    }
  }
  return Array.from(node.childNodes || []).some((child) => hasMeaningfulContent(child));
}

function isRangeAtStartOfElement(range, element) {
  if (!range || !element || !range.collapsed) return false;
  const probe = document.createRange();
  probe.selectNodeContents(element);
  probe.setEnd(range.startContainer, range.startOffset);
  const fragment = probe.cloneContents();
  return !hasMeaningfulContent(fragment);
}

function normalizeImageWrap(value) {
  const candidate = String(value || '').trim().toLowerCase();
  if (candidate === 'left' || candidate === 'right' || candidate === 'none') return candidate;
  return 'none';
}

function buildDefaultRichImageStyle({ wrap = 'left' } = {}) {
  const normalizedWrap = normalizeImageWrap(wrap);
  const parts = [`max-height:${DEFAULT_RICH_IMAGE_MAX_HEIGHT}`, 'height:auto'];
  if (normalizedWrap === 'left') {
    parts.push('float:left', 'margin:0 0.85em 0.6em 0');
  } else if (normalizedWrap === 'right') {
    parts.push('float:right', 'margin:0 0 0.6em 0.85em');
  } else {
    parts.push('float:none', 'display:block', 'margin:0.5em 0');
  }
  return parts.join('; ');
}

function parseMediaReference(value) {
  const raw = String(value || '').trim();
  if (!raw.toLowerCase().startsWith('media:')) return '';
  const encodedId = raw.slice(6);
  if (!encodedId) return '';
  try {
    return decodeURIComponent(encodedId).trim();
  } catch (error) {
    return encodedId.trim();
  }
}

function buildMediaReference(mediaId) {
  const id = String(mediaId || '').trim();
  if (!id) return '';
  return `media:${encodeURIComponent(id)}`;
}

function ensureProjectMediaStore(projectRef = state.project) {
  if (!projectRef) return [];
  projectRef.assets = projectRef.assets || {};
  projectRef.assets.media = Array.isArray(projectRef.assets.media) ? projectRef.assets.media : [];
  return projectRef.assets.media;
}

function resolveProjectMediaPath(projectRef, mediaId, { preferDataUrl = true } = {}) {
  if (!projectRef || !mediaId) return '';
  const media = ensureProjectMediaStore(projectRef).find((asset) => asset.id === mediaId);
  if (!media) return '';
  if (preferDataUrl && media.dataUrl) return media.dataUrl;
  return media.path || media.dataUrl || '';
}

function createProjectMediaAssetId(projectRef, prefix = 'img') {
  const media = ensureProjectMediaStore(projectRef);
  const usedIds = new Set(media.map((asset) => asset.id));
  let id = '';
  do {
    id = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  } while (usedIds.has(id));
  return id;
}

function getOrCreateProjectMediaAsset(projectRef, { dataUrl = '', type = 'image', name = 'inline-image' } = {}) {
  if (!projectRef || !dataUrl) return null;
  const media = ensureProjectMediaStore(projectRef);
  const existing = media.find((asset) => asset.type === type && asset.dataUrl === dataUrl);
  if (existing) return existing;
  const id = createProjectMediaAssetId(projectRef, type === 'image' ? 'img' : 'asset');
  const entry = {
    id,
    type,
    name: String(name || id),
    dataUrl
  };
  media.push(entry);
  return entry;
}

function compactRichHtmlMediaRefs(rawHtml, projectRef = state.project, options = {}) {
  if (!projectRef) return String(rawHtml || '');
  const html = String(rawHtml || '');
  if (!html.includes('data:image/')) return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  let changed = false;
  const suggestedBaseName = String(options.suggestedName || 'inline-image');

  template.content.querySelectorAll('img[src]').forEach((node, index) => {
    const src = String(node.getAttribute('src') || '').trim();
    if (!src.startsWith('data:image/')) return;
    const media = getOrCreateProjectMediaAsset(projectRef, {
      dataUrl: src,
      type: 'image',
      name: `${suggestedBaseName}-${index + 1}`
    });
    if (!media?.id) return;
    node.setAttribute('src', buildMediaReference(media.id));
    changed = true;
  });

  return changed ? template.innerHTML : html;
}

function resolveRichMediaReferencesInContainer(container, projectRef = state.project, { preferDataUrl = true } = {}) {
  if (!container || !projectRef) return;
  container.querySelectorAll('[src]').forEach((node) => {
    const mediaId = parseMediaReference(node.getAttribute('src'));
    if (!mediaId) return;
    const resolved = resolveProjectMediaPath(projectRef, mediaId, { preferDataUrl });
    if (resolved) {
      node.setAttribute('src', resolved);
      return;
    }
    node.removeAttribute('src');
    if (node.tagName?.toLowerCase() === 'img') {
      node.setAttribute('alt', 'Missing media');
    }
  });
}

function isSafeRichUrl(value, { allowDataImage = false } = {}) {
  const url = String(value || '').trim();
  if (!url) return false;
  if (parseMediaReference(url)) return true;
  if (allowDataImage && url.startsWith('data:image/')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('./') || url.startsWith('../') || url.startsWith('/')) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return false;
  if (url.startsWith('//')) return false;
  return true;
}

function parseYouTubeTimeToSeconds(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Math.max(0, Number.parseInt(raw, 10) || 0);
  let total = 0;
  const hourMatch = raw.match(/(\d+)h/);
  const minMatch = raw.match(/(\d+)m/);
  const secMatch = raw.match(/(\d+)s/);
  if (hourMatch) total += (Number.parseInt(hourMatch[1], 10) || 0) * 3600;
  if (minMatch) total += (Number.parseInt(minMatch[1], 10) || 0) * 60;
  if (secMatch) total += Number.parseInt(secMatch[1], 10) || 0;
  return Math.max(0, total);
}

function normalizeVideoEmbedUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch (error) {
    return raw;
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const query = url.searchParams;

  const isYouTubeHost = /(^|\.)youtube\.com$/.test(host) || /(^|\.)youtu\.be$/.test(host);
  if (isYouTubeHost) {
    let videoId = '';
    if (/youtu\.be$/.test(host)) {
      videoId = path.replace(/^\/+/, '').split('/')[0] || '';
    } else if (path.startsWith('/watch')) {
      videoId = query.get('v') || '';
    } else if (path.startsWith('/embed/')) {
      videoId = path.split('/')[2] || '';
    } else if (path.startsWith('/shorts/')) {
      videoId = path.split('/')[2] || '';
    } else if (path.startsWith('/live/')) {
      videoId = path.split('/')[2] || '';
    }
    if (!videoId) return raw;

    const t = query.get('t') || query.get('start') || '';
    const startSeconds = parseYouTubeTimeToSeconds(t);
    const out = new URL(`https://www.youtube.com/embed/${videoId}`);
    if (startSeconds > 0) out.searchParams.set('start', String(startSeconds));
    return out.toString();
  }

  const isVimeoHost = /(^|\.)vimeo\.com$/.test(host) || /(^|\.)player\.vimeo\.com$/.test(host);
  if (isVimeoHost) {
    const segments = path.split('/').filter(Boolean);
    let videoId = '';
    if (host.includes('player.vimeo.com')) {
      const videoIndex = segments.indexOf('video');
      videoId = videoIndex >= 0 ? (segments[videoIndex + 1] || '') : '';
    } else {
      videoId = segments[0] || '';
    }
    if (!videoId || !/^\d+$/.test(videoId)) return raw;
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return raw;
}

function sanitizeRichHtml(rawHtml) {
  const template = document.createElement('template');
  template.innerHTML = String(rawHtml || '').replace(/\u200b/g, '');
  const root = document.createElement('div');
  root.appendChild(template.content);
  const allowedTags = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'u',
    'ul', 'ol', 'li', 'img', 'video', 'iframe',
    'a', 'div', 'span', 'h1', 'h2', 'h3', 'h4',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'
  ]);

  const cleanNode = (node) => {
    if (!node) return;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const parent = node.parentNode;
        if (parent) {
          while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
          }
          parent.removeChild(node);
        }
        return;
      }

      const originalAttrs = {};
      Array.from(node.attributes).forEach((attr) => {
        originalAttrs[attr.name.toLowerCase()] = attr.value;
      });
      Array.from(node.attributes).forEach((attr) => {
        node.removeAttribute(attr.name);
      });

      if (tag === 'p' || tag === 'div' || tag === 'span' || /^h[1-4]$/.test(tag) || tag === 'td' || tag === 'th') {
        const styleValue = String(originalAttrs.style || '');
        const alignMatch = styleValue.match(/text-align\s*:\s*(left|center|right|justify)/i);
        const align = normalizeTextAlign(alignMatch ? alignMatch[1] : 'left');
        const sizeMatch = styleValue.match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i);
        const fontSize = sanitizeRichFontSizeValue(sizeMatch ? sizeMatch[1] : '');
        const lineMatch = styleValue.match(/(?:^|;)\s*line-height\s*:\s*([^;]+)/i);
        const lineHeight = sanitizeRichLineHeightValue(lineMatch ? lineMatch[1] : '');
        const marginTopMatch = styleValue.match(/(?:^|;)\s*margin-top\s*:\s*([^;]+)/i);
        const marginBottomMatch = styleValue.match(/(?:^|;)\s*margin-bottom\s*:\s*([^;]+)/i);
        const marginTop = sanitizeRichParagraphSpacingValue(marginTopMatch ? marginTopMatch[1] : '');
        const marginBottom = sanitizeRichParagraphSpacingValue(marginBottomMatch ? marginBottomMatch[1] : '');
        const paddingTopMatch = styleValue.match(/(?:^|;)\s*padding-top\s*:\s*([^;]+)/i);
        const paddingBottomMatch = styleValue.match(/(?:^|;)\s*padding-bottom\s*:\s*([^;]+)/i);
        const paddingTop = sanitizeRichParagraphSpacingValue(paddingTopMatch ? paddingTopMatch[1] : '');
        const paddingBottom = sanitizeRichParagraphSpacingValue(paddingBottomMatch ? paddingBottomMatch[1] : '');
        if (align !== 'left') {
          node.style.textAlign = align;
        }
        if (fontSize) {
          node.style.fontSize = fontSize;
        }
        if (lineHeight) {
          node.style.lineHeight = lineHeight;
        }
        if (marginTop) {
          node.style.marginTop = marginTop;
        }
        if (marginBottom) {
          node.style.marginBottom = marginBottom;
        }
        if (tag === 'div') {
          if (paddingTop) {
            node.style.paddingTop = paddingTop;
          }
          if (paddingBottom) {
            node.style.paddingBottom = paddingBottom;
          }
        }
      }

      if (tag === 'div') {
        const layout = String(originalAttrs['data-layout'] || '').trim().toLowerCase();
        const col = Number.parseInt(String(originalAttrs['data-col'] || '').trim(), 10);
        const savedHeightLocked = String(originalAttrs['data-height-locked'] || '').trim().toLowerCase() === 'true';
        const styleValue = String(originalAttrs.style || '');
        const savedColWidths = String(originalAttrs['data-col-widths'] || '').trim();
        const savedBlockAlignRaw = String(originalAttrs['data-block-align'] || '').trim().toLowerCase();
        const widthMatch = styleValue.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
        const heightMatch = styleValue.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i);
        const minHeightMatch = styleValue.match(/(?:^|;)\s*min-height\s*:\s*([^;]+)/i);
        const gridTemplateMatch = styleValue.match(/(?:^|;)\s*grid-template-columns\s*:\s*([^;]+)/i);
        const marginLeftMatch = styleValue.match(/(?:^|;)\s*margin-left\s*:\s*([^;]+)/i);
        const marginRightMatch = styleValue.match(/(?:^|;)\s*margin-right\s*:\s*([^;]+)/i);
        const requestedWidth = sanitizeImageSizeValue(widthMatch ? widthMatch[1] : '');
        const requestedHeight = sanitizeImageMaxHeightValue(heightMatch ? heightMatch[1] : '');
        const requestedMinHeight = sanitizeImageMaxHeightValue(minHeightMatch ? minHeightMatch[1] : '');
        const layoutMatch = layout.match(/^columns-(\d+)$/i);
        if (layoutMatch) {
          const safeCols = normalizeRichLayoutColumns(layoutMatch[1], 2);
          node.setAttribute('data-layout', `columns-${safeCols}`);
          const colWeights =
            parseRichLayoutWeightsCsv(savedColWidths, safeCols)
            || parseRichLayoutWeightsTemplate(gridTemplateMatch ? gridTemplateMatch[1] : '', safeCols)
            || getDefaultRichLayoutWeights(safeCols);
          if (colWeights) {
            node.setAttribute('data-col-widths', serializeRichLayoutWeights(colWeights));
            node.style.gridTemplateColumns = colWeights
              .map((value) => `minmax(0,${Math.max(1, value).toFixed(4)}fr)`)
              .join(' ');
          }
          if (requestedWidth) {
            node.style.width = requestedWidth;
          }
          if (savedHeightLocked && requestedHeight) {
            node.style.height = requestedHeight;
          }
          if (savedHeightLocked && requestedMinHeight) {
            node.style.minHeight = requestedMinHeight;
          }
          if (savedHeightLocked) {
            node.setAttribute('data-height-locked', 'true');
          }
          let blockAlign = 'left';
          if (savedBlockAlignRaw === 'center' || savedBlockAlignRaw === 'right' || savedBlockAlignRaw === 'left') {
            blockAlign = savedBlockAlignRaw;
          } else {
            const ml = String(marginLeftMatch ? marginLeftMatch[1] : '').trim().toLowerCase();
            const mr = String(marginRightMatch ? marginRightMatch[1] : '').trim().toLowerCase();
            if (ml === 'auto' && mr === 'auto') blockAlign = 'center';
            else if (ml === 'auto' && isZeroCssValue(mr)) blockAlign = 'right';
            else blockAlign = 'left';
          }
          node.setAttribute('data-block-align', blockAlign);
          if (blockAlign === 'center') {
            node.style.marginLeft = 'auto';
            node.style.marginRight = 'auto';
          } else if (blockAlign === 'right') {
            node.style.marginLeft = 'auto';
            node.style.marginRight = '0';
          } else {
            node.style.marginLeft = '0';
            node.style.marginRight = 'auto';
          }
        }
        if (Number.isFinite(col) && col >= 1 && col <= 12) {
          node.setAttribute('data-col', String(col));
        }
      }

      if (tag === 'table') {
        const styleValue = String(originalAttrs.style || '');
        const widthMatch = styleValue.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
        const requestedWidth = sanitizeImageSizeValue(widthMatch ? widthMatch[1] : '');
        if (requestedWidth) {
          node.style.width = requestedWidth;
        }
        node.style.borderCollapse = 'collapse';
      }

      if (tag === 'tr') {
        const styleValue = String(originalAttrs.style || '');
        const heightMatch = styleValue.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i);
        const requestedHeight = sanitizeImageMaxHeightValue(heightMatch ? heightMatch[1] : '');
        if (requestedHeight) {
          node.style.height = requestedHeight;
        }
      }

      if (tag === 'td' || tag === 'th') {
        const styleValue = String(originalAttrs.style || '');
        const widthMatch = styleValue.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
        const heightMatch = styleValue.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i);
        const requestedWidth = sanitizeImageSizeValue(widthMatch ? widthMatch[1] : '');
        const requestedHeight = sanitizeImageMaxHeightValue(heightMatch ? heightMatch[1] : '');
        if (requestedWidth) {
          node.style.width = requestedWidth;
        }
        if (requestedHeight) {
          node.style.height = requestedHeight;
        }
      }

      if (tag === 'img') {
        const src = String(originalAttrs.src || '').trim();
        if (isSafeRichUrl(src, { allowDataImage: true })) {
          node.setAttribute('src', src);
          node.setAttribute('alt', String(originalAttrs.alt || '').trim());
          const styleValue = String(originalAttrs.style || '');
          const widthMatch = styleValue.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
          const maxHeightMatch = styleValue.match(/(?:^|;)\s*max-height\s*:\s*([^;]+)/i);
          const floatMatch = styleValue.match(/(?:^|;)\s*float\s*:\s*(left|right|none)/i);
          const marginLeftMatch = styleValue.match(/(?:^|;)\s*margin-left\s*:\s*([^;]+)/i);
          const marginRightMatch = styleValue.match(/(?:^|;)\s*margin-right\s*:\s*([^;]+)/i);
          const savedAlignRaw = String(originalAttrs['data-align'] || '').trim().toLowerCase();
          const wrapFromData = normalizeImageWrap(originalAttrs['data-wrap'] || '');
          const requestedWrap = normalizeImageWrap(wrapFromData !== 'none' ? wrapFromData : (floatMatch ? floatMatch[1] : 'none'));
          const requestedSize = sanitizeImageSizeValue(widthMatch ? widthMatch[1] : (originalAttrs.width || ''));
          const requestedMaxHeight = sanitizeImageMaxHeightValue(maxHeightMatch ? maxHeightMatch[1] : '');
          if (requestedSize) {
            node.style.width = requestedSize;
            node.style.height = 'auto';
          }
          if (requestedMaxHeight) {
            node.style.maxHeight = requestedMaxHeight;
            node.style.height = 'auto';
          }
          node.setAttribute('data-wrap', requestedWrap);
          if (requestedWrap === 'left') {
            node.style.float = 'left';
            node.style.margin = '0 0.85em 0.6em 0';
          } else if (requestedWrap === 'right') {
            node.style.float = 'right';
            node.style.margin = '0 0 0.6em 0.85em';
          } else {
            node.style.float = 'none';
            node.style.display = 'block';
            let mediaAlign = savedAlignRaw === 'center' || savedAlignRaw === 'right' || savedAlignRaw === 'left'
              ? savedAlignRaw
              : 'left';
            if (!originalAttrs['data-align']) {
              const ml = String(marginLeftMatch ? marginLeftMatch[1] : '').trim().toLowerCase();
              const mr = String(marginRightMatch ? marginRightMatch[1] : '').trim().toLowerCase();
              if (ml === 'auto' && mr === 'auto') mediaAlign = 'center';
              else if (ml === 'auto' && isZeroCssValue(mr)) mediaAlign = 'right';
            }
            node.setAttribute('data-align', mediaAlign);
            node.style.marginTop = '0.5em';
            node.style.marginBottom = '0.5em';
            if (mediaAlign === 'center') {
              node.style.marginLeft = 'auto';
              node.style.marginRight = 'auto';
            } else if (mediaAlign === 'right') {
              node.style.marginLeft = 'auto';
              node.style.marginRight = '0';
            } else {
              node.style.marginLeft = '0';
              node.style.marginRight = 'auto';
            }
          }
        } else {
          node.removeAttribute('src');
        }
        node.setAttribute('loading', 'lazy');
      }

      if (tag === 'video') {
        const src = String(originalAttrs.src || '').trim();
        if (isSafeRichUrl(src)) {
          node.setAttribute('src', src);
          node.setAttribute('controls', '');
          const styleValue = String(originalAttrs.style || '');
          const widthMatch = styleValue.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
          const heightMatch = styleValue.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i);
          const marginLeftMatch = styleValue.match(/(?:^|;)\s*margin-left\s*:\s*([^;]+)/i);
          const marginRightMatch = styleValue.match(/(?:^|;)\s*margin-right\s*:\s*([^;]+)/i);
          const savedAlignRaw = String(originalAttrs['data-align'] || '').trim().toLowerCase();
          const requestedWidth = sanitizeImageSizeValue(widthMatch ? widthMatch[1] : (originalAttrs.width || ''));
          const requestedHeight = sanitizeImageMaxHeightValue(heightMatch ? heightMatch[1] : (originalAttrs.height || ''));
          if (requestedWidth) {
            node.style.width = requestedWidth;
          } else {
            node.style.width = '100%';
            node.style.maxWidth = '100%';
          }
          if (requestedHeight) {
            node.style.height = requestedHeight;
          } else {
            node.style.height = 'auto';
            node.style.aspectRatio = '16 / 9';
          }
          node.style.display = 'block';
          node.style.marginTop = '0.5em';
          node.style.marginBottom = '0.5em';
          let mediaAlign = savedAlignRaw === 'center' || savedAlignRaw === 'right' || savedAlignRaw === 'left'
            ? savedAlignRaw
            : 'left';
          if (!originalAttrs['data-align']) {
            const ml = String(marginLeftMatch ? marginLeftMatch[1] : '').trim().toLowerCase();
            const mr = String(marginRightMatch ? marginRightMatch[1] : '').trim().toLowerCase();
            if (ml === 'auto' && mr === 'auto') mediaAlign = 'center';
            else if (ml === 'auto' && isZeroCssValue(mr)) mediaAlign = 'right';
          }
          node.setAttribute('data-align', mediaAlign);
          if (mediaAlign === 'center') {
            node.style.marginLeft = 'auto';
            node.style.marginRight = 'auto';
          } else if (mediaAlign === 'right') {
            node.style.marginLeft = 'auto';
            node.style.marginRight = '0';
          } else {
            node.style.marginLeft = '0';
            node.style.marginRight = 'auto';
          }
        } else {
          node.removeAttribute('src');
        }
      }

      if (tag === 'iframe') {
        const src = String(originalAttrs.src || '').trim();
        const normalizedSrc = normalizeVideoEmbedUrl(src);
        if (isSafeRichUrl(normalizedSrc)) {
          node.setAttribute('src', normalizedSrc);
          node.setAttribute('loading', 'lazy');
          node.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
          node.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
          node.setAttribute('allowfullscreen', '');
          node.setAttribute('frameborder', '0');
          const styleValue = String(originalAttrs.style || '');
          const widthMatch = styleValue.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i);
          const heightMatch = styleValue.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i);
          const marginLeftMatch = styleValue.match(/(?:^|;)\s*margin-left\s*:\s*([^;]+)/i);
          const marginRightMatch = styleValue.match(/(?:^|;)\s*margin-right\s*:\s*([^;]+)/i);
          const savedAlignRaw = String(originalAttrs['data-align'] || '').trim().toLowerCase();
          const requestedWidth = sanitizeImageSizeValue(widthMatch ? widthMatch[1] : (originalAttrs.width || ''));
          const requestedHeight = sanitizeImageMaxHeightValue(heightMatch ? heightMatch[1] : (originalAttrs.height || ''));
          if (requestedWidth) {
            node.style.width = requestedWidth;
          }
          if (requestedHeight) {
            node.style.height = requestedHeight;
          }
          node.style.display = 'block';
          node.style.marginTop = '0.5em';
          node.style.marginBottom = '0.5em';
          let mediaAlign = savedAlignRaw === 'center' || savedAlignRaw === 'right' || savedAlignRaw === 'left'
            ? savedAlignRaw
            : 'left';
          if (!originalAttrs['data-align']) {
            const ml = String(marginLeftMatch ? marginLeftMatch[1] : '').trim().toLowerCase();
            const mr = String(marginRightMatch ? marginRightMatch[1] : '').trim().toLowerCase();
            if (ml === 'auto' && mr === 'auto') mediaAlign = 'center';
            else if (ml === 'auto' && isZeroCssValue(mr)) mediaAlign = 'right';
          }
          node.setAttribute('data-align', mediaAlign);
          if (mediaAlign === 'center') {
            node.style.marginLeft = 'auto';
            node.style.marginRight = 'auto';
          } else if (mediaAlign === 'right') {
            node.style.marginLeft = 'auto';
            node.style.marginRight = '0';
          } else {
            node.style.marginLeft = '0';
            node.style.marginRight = 'auto';
          }
          node.style.border = '0';
        } else {
          const parent = node.parentNode;
          if (parent) {
            parent.removeChild(node);
          }
          return;
        }
      }

      if (tag === 'a') {
        const href = String(originalAttrs.href || '').trim();
        if (isSafeRichUrl(href)) {
          node.setAttribute('href', href);
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        } else {
          node.removeAttribute('href');
        }
      }
    }

    Array.from(node.childNodes || []).forEach(cleanNode);
  };

  Array.from(root.childNodes).forEach(cleanNode);
  trimTrailingEmptyParagraphs(root);
  return root.innerHTML;
}

function trimTrailingEmptyParagraphs(container) {
  if (!(container instanceof Element)) return;
  const isEmptyParagraph = (el) => {
    if (!(el instanceof HTMLElement) || el.tagName.toLowerCase() !== 'p') return false;
    const normalizedHtml = String(el.innerHTML || '')
      .replace(/&nbsp;/gi, '')
      .replace(/<br\s*\/?>/gi, '')
      .trim();
    const normalizedText = String(el.textContent || '')
      .replace(/\u00a0/g, '')
      .trim();
    return normalizedHtml === '' && normalizedText === '';
  };

  const trimContainerTail = (target) => {
    if (!(target instanceof Element)) return;
    while (target.lastElementChild && isEmptyParagraph(target.lastElementChild)) {
      target.lastElementChild.remove();
    }
  };

  trimContainerTail(container);
  container.querySelectorAll('[data-col], [data-layout^="columns-"], td, th, div').forEach(trimContainerTail);
}

function convertInfoBlocksToRichHtml(hotspot, projectRef = state.project) {
  const blocks = Array.isArray(hotspot?.contentBlocks) ? hotspot.contentBlocks : [];
  if (!blocks.length) return '';
  const mediaMap = new Map((projectRef?.assets?.media || []).map((m) => [m.id, m.dataUrl || m.path || '']));
  const parts = [];

  blocks.forEach((block) => {
    if (block.type === 'text') {
      const align = normalizeTextAlign(block.align);
      const text = escapeHtml(block.value || '').replace(/\n/g, '<br>');
      const style = align === 'left' ? '' : ` style="text-align:${align}"`;
      parts.push(`<p${style}>${text}</p>`);
      return;
    }
    if (block.type === 'image') {
      const src = String(block.url || '').trim() ||
        (block.assetId ? buildMediaReference(block.assetId) : '') ||
        String(mediaMap.get(block.assetId) || '').trim();
      if (src) {
        parts.push(`<p><img src="${escapeHtml(src)}" alt=""></p>`);
      }
      return;
    }
    if (block.type === 'video') {
      const src = String(block.url || '').trim() ||
        (block.assetId ? buildMediaReference(block.assetId) : '') ||
        String(mediaMap.get(block.assetId) || '').trim();
      if (src) {
        if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com')) {
          parts.push(`<p><iframe src="${escapeHtml(src)}"></iframe></p>`);
        } else {
          parts.push(`<p><video src="${escapeHtml(src)}" controls></video></p>`);
        }
      }
    }
  });
  return parts.join('\n');
}

function getInfoHotspotRichContent(hotspot) {
  if (!hotspot) return '';
  if (typeof hotspot.richContentHtml === 'string') {
    const compacted = compactRichHtmlMediaRefs(hotspot.richContentHtml, state.project, {
      suggestedName: hotspot.title || hotspot.id || 'inline-image'
    });
    hotspot.richContentHtml = compacted;
    return compacted;
  }
  const converted = convertInfoBlocksToRichHtml(hotspot, state.project);
  const compacted = compactRichHtmlMediaRefs(converted, state.project, {
    suggestedName: hotspot.title || hotspot.id || 'inline-image'
  });
  hotspot.richContentHtml = compacted;
  return compacted;
}

function setInfoHotspotRichContent(hotspot, html) {
  if (!hotspot) return;
  hotspot.richContentHtml = String(html || '');
  if (Array.isArray(hotspot.contentBlocks)) {
    hotspot.contentBlocks = hotspot.contentBlocks.filter((block) => block.type === 'scene');
  }
}

function getProjectHomePage() {
  if (!state.project) return null;
  if (!state.project.homePage || typeof state.project.homePage !== 'object') {
    state.project.homePage = {};
  }
  const homePage = state.project.homePage;
  if (typeof homePage.richContentHtml !== 'string') {
    homePage.richContentHtml = '';
  }
  homePage.infoFrameSize = normalizeInfoFrameSize(homePage.infoFrameSize);
  homePage.infoFramePosition = normalizeInfoFramePosition(homePage.infoFramePosition);
  homePage.infoFrameViewport = normalizeInfoFrameViewport(homePage.infoFrameViewport);
  homePage.infoFrameAnchorOffset = normalizeInfoFrameAnchorOffset(homePage.infoFrameAnchorOffset);
  return homePage;
}

function isHomePageRichEditorMode() {
  return richEditorContext?.type === 'home-page';
}

function isHomePagePreviewMode() {
  return previewHotspotContext?.type === 'home-page';
}

function getHomePageEditorViewportBounds() {
  const rightRect = rightPanel?.getBoundingClientRect?.() || null;
  const rightEdge = rightRect && Number.isFinite(rightRect.left) ? Math.max(0, Math.round(rightRect.left)) : Math.round(window.innerWidth);
  return {
    left: 0,
    top: 0,
    width: Math.max(1, rightEdge),
    height: Math.max(1, Math.round(window.innerHeight))
  };
}

runtimeRichModal = safeCreateRuntimeEditorModule(
  'rich-modal',
  () => window.IterpanoEditorRichModal?.createRichModalController({
    richEditorModal,
    richEditorModalContent,
    richEditorSurface,
    isHomePageRichEditorMode,
    getHomePageEditorViewportBounds,
    getViewportClampedInfoFrameSize,
    getAnchoredInfoFramePosition,
    getInfoHotspotFrameSize,
    getHotspotViewportPoint,
    parsePixelStyleValue,
    normalizeInfoFrameSize,
    normalizeInfoFramePosition,
    normalizeInfoFrameViewport,
    normalizeInfoFrameAnchorOffset,
    minInfoFrameWidth: MIN_INFO_FRAME_WIDTH,
    minInfoFrameHeight: MIN_INFO_FRAME_HEIGHT,
    maxInfoFrameWidth: MAX_INFO_FRAME_WIDTH,
    maxInfoFrameHeight: MAX_INFO_FRAME_HEIGHT
  }),
  [
    { label: 'richEditorModal', value: richEditorModal },
    { label: 'richEditorModalContent', value: richEditorModalContent },
    { label: 'richEditorSurface', value: richEditorSurface },
    { label: 'IterpanoEditorRichModal', value: window.IterpanoEditorRichModal }
  ]
);

function getRichContentTargetByContext(context) {
  if (!context) return null;
  if (context.type === 'home-page') {
    return getProjectHomePage();
  }
  return getInfoHotspotByContext(context);
}

function isRichEditorContextMatch(context) {
  if (!context || !richEditorModal?.classList.contains('visible') || !richEditorContext) return false;
  if (richEditorContext.type !== context.type) return false;
  if (context.type === 'home-page') return true;
  return richEditorContext.sceneId === context.sceneId && richEditorContext.hotspotId === context.hotspotId;
}

function insertIntoTextarea(textarea, value) {
  if (!textarea) return;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = `${before}${value}${after}`;
  const nextPos = start + value.length;
  textarea.setSelectionRange(nextPos, nextPos);
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function insertHtmlAtCursor(html) {
  if (!richEditorSurface) return;
  richEditorSurface.focus();
  document.execCommand('insertHTML', false, html);
}

function insertParagraphAtCurrentCursor() {
  if (!richEditorSurface) return false;
  richEditorSurface.focus();
  restoreRichEditorSelectionRange();

  const selectedLayout = getSelectedRichLayoutElement();
  const selectedMedia = getSelectedRichImageElement();
  if (selectedLayout || selectedMedia) {
    insertParagraphBelowSelectedBlock();
    return true;
  }

  if (typeof document.execCommand === 'function') {
    const ok = document.execCommand('insertParagraph', false, null);
    if (ok) {
      syncRichEditorSelectionState();
      saveRichEditorSelectionRange();
      return true;
    }
  }

  insertHtmlAtCursor('<p><br></p>');
  syncRichEditorSelectionState();
  saveRichEditorSelectionRange();
  return true;
}

function insertPlainTextAtCursor(text) {
  if (!richEditorSurface) return false;
  const plain = String(text ?? '').replace(/\r\n?/g, '\n');
  richEditorSurface.focus();

  const selection = window.getSelection();
  if (!selection) return false;

  if (selection.rangeCount === 0) {
    const endRange = document.createRange();
    endRange.selectNodeContents(richEditorSurface);
    endRange.collapse(false);
    selection.addRange(endRange);
  }

  let range = selection.getRangeAt(0);
  if (!isRangeInsideRichEditor(range)) {
    const endRange = document.createRange();
    endRange.selectNodeContents(richEditorSurface);
    endRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(endRange);
    range = endRange;
  }

  if (typeof document.execCommand === 'function') {
    const ok = document.execCommand('insertText', false, plain);
    if (ok) return true;
  }

  range.deleteContents();
  const fragment = document.createDocumentFragment();
  const lines = plain.split('\n');
  lines.forEach((line, index) => {
    fragment.appendChild(document.createTextNode(line));
    if (index < lines.length - 1) {
      fragment.appendChild(document.createElement('br'));
    }
  });

  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  return true;
}

function isRangeInsideRichEditor(range) {
  if (!range || !richEditorSurface) return false;
  const container = range.commonAncestorContainer;
  if (!container) return false;
  const anchorEl = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
  return !!(anchorEl && richEditorSurface.contains(anchorEl));
}

function saveRichEditorSelectionRange() {
  runtimeRichTypography?.saveSelectionRange();
}

function normalizeSelectionFontSizeToInput(fontSizeValue) {
  const numeric = Number.parseFloat(String(fontSizeValue || ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return String(Math.round(numeric));
}

function collectSelectionFontSizes(range) {
  const sizes = new Set();
  if (!range || !richEditorSurface || !isRangeInsideRichEditor(range)) return sizes;
  const root = range.commonAncestorContainer;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    if (!textNode || !String(textNode.textContent || '').trim()) continue;
    if (!range.intersectsNode(textNode)) continue;
    const parent = textNode.parentElement;
    if (!parent || !richEditorSurface.contains(parent)) continue;
    const computed = window.getComputedStyle(parent);
    const normalized = normalizeSelectionFontSizeToInput(computed.fontSize);
    if (normalized) sizes.add(normalized);
    if (sizes.size > 1) break;
  }
  return sizes;
}

function getFontSizeFromEditorRange(range) {
  if (!range || !richEditorSurface || !isRangeInsideRichEditor(range)) return '';
  if (range.collapsed) {
    const anchor = range.startContainer?.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer;
    if (!(anchor instanceof Element) || !richEditorSurface.contains(anchor)) return '';
    return normalizeSelectionFontSizeToInput(window.getComputedStyle(anchor).fontSize);
  }
  const sizes = collectSelectionFontSizes(range);
  if (sizes.size === 1) return Array.from(sizes)[0];
  return '';
}

function getSelectionFontSizeForActiveEditor() {
  if (!richEditorSurface) return '';
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const current = selection.getRangeAt(0);
    const fromCurrent = getFontSizeFromEditorRange(current);
    if (fromCurrent) return fromCurrent;
  }
  if (richEditorSavedExpandedRange && isRangeInsideRichEditor(richEditorSavedExpandedRange)) {
    const fromSavedExpanded = getFontSizeFromEditorRange(richEditorSavedExpandedRange);
    if (fromSavedExpanded) return fromSavedExpanded;
  }
  if (richEditorSavedRange && isRangeInsideRichEditor(richEditorSavedRange)) {
    const fromSaved = getFontSizeFromEditorRange(richEditorSavedRange);
    if (fromSaved) return fromSaved;
  }
  return '';
}

function syncRichEditorTypographyControls(options = {}) {
  runtimeRichTypography?.syncTypographyControls(options);
}

function restoreRichEditorSelectionRange(options = {}) {
  return runtimeRichTypography?.restoreSelectionRange(options) || false;
}


function normalizeRichLayoutColumns(value, fallback = 2) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed)) {
    return Math.max(1, Math.min(6, parsed));
  }
  return Math.max(1, Math.min(6, Number.parseInt(fallback, 10) || 2));
}

function getDefaultRichLayoutWeights(columnCount) {
  const safeCols = normalizeRichLayoutColumns(columnCount, 2);
  if (safeCols === 2) {
    // Keep text-focused layouts readable by default.
    return [1.35, 1];
  }
  return Array.from({ length: safeCols }, () => 1);
}

function parseRichLayoutWeightsCsv(rawValue, expectedCols = null) {
  const raw = String(rawValue || '').trim();
  if (!raw) return null;
  const parts = raw.split(',').map((item) => item.trim()).filter(Boolean);
  if (!parts.length) return null;
  if (Number.isFinite(expectedCols) && expectedCols > 0 && parts.length !== expectedCols) return null;
  const weights = parts.map((item) => Number.parseFloat(item));
  if (weights.some((value) => !Number.isFinite(value) || value <= 0)) return null;
  return weights;
}

function parseRichLayoutWeightsTemplate(rawTemplate, expectedCols = null) {
  const raw = String(rawTemplate || '').trim();
  if (!raw) return null;
  const tokens = raw.split(/\s+/).map((item) => item.trim()).filter(Boolean);
  if (!tokens.length) return null;
  if (Number.isFinite(expectedCols) && expectedCols > 0 && tokens.length !== expectedCols) return null;
  const weights = [];
  for (const token of tokens) {
    let match = token.match(/^minmax\(0,\s*([0-9]*\.?[0-9]+)fr\)$/i);
    if (match) {
      weights.push(Number.parseFloat(match[1]));
      continue;
    }
    match = token.match(/^([0-9]*\.?[0-9]+)fr$/i);
    if (match) {
      weights.push(Number.parseFloat(match[1]));
      continue;
    }
    match = token.match(/^([0-9]*\.?[0-9]+)%$/i);
    if (match) {
      weights.push(Number.parseFloat(match[1]));
      continue;
    }
    match = token.match(/^([0-9]*\.?[0-9]+)px$/i);
    if (match) {
      weights.push(Number.parseFloat(match[1]));
      continue;
    }
    return null;
  }
  if (weights.some((value) => !Number.isFinite(value) || value <= 0)) return null;
  return weights;
}

function serializeRichLayoutWeights(weights) {
  return (weights || [])
    .map((value) => Math.max(1, Number.parseFloat(value) || 1))
    .map((value) => value.toFixed(4))
    .join(',');
}

function applyRichLayoutColumnWidths(layoutEl, weights) {
  if (!layoutEl) return false;
  const columns = getRichLayoutDirectColumns(layoutEl);
  if (!columns.length || !Array.isArray(weights) || weights.length !== columns.length) return false;
  const safeWeights = weights
    .map((value) => Number.parseFloat(value))
    .map((value) => (Number.isFinite(value) && value > 0 ? value : 1));
  layoutEl.setAttribute('data-col-widths', serializeRichLayoutWeights(safeWeights));
  layoutEl.style.gridTemplateColumns = safeWeights
    .map((value) => `minmax(0,${value.toFixed(4)}fr)`)
    .join(' ');
  return true;
}

function buildDefaultRichLayoutWidthValue(columnCount, gapPx = DEFAULT_RICH_LAYOUT_COLUMN_GAP_PX) {
  const safeCols = normalizeRichLayoutColumns(columnCount, 2);
  const safeGap = Math.max(0, Number.parseInt(String(gapPx ?? DEFAULT_RICH_LAYOUT_COLUMN_GAP_PX), 10) || 0);
  const totalChars = safeCols * DEFAULT_RICH_LAYOUT_COLUMN_CHAR_WIDTH;
  const totalGap = Math.max(0, safeCols - 1) * safeGap;
  return `calc(${totalChars}ch + ${totalGap}px)`;
}

function parseRichLayoutColumns(layoutEl) {
  if (!layoutEl) return 2;
  const raw = String(layoutEl.getAttribute('data-layout') || '');
  const match = raw.match(/^columns-(\d+)$/i);
  return normalizeRichLayoutColumns(match ? match[1] : 2);
}

function findClosestRichLayout(startNode) {
  if (!startNode || !richEditorSurface) return null;
  let node = startNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  if (!(node instanceof Element)) return null;
  const layout = node.closest('[data-layout]');
  if (!(layout instanceof Element)) return null;
  if (!richEditorSurface.contains(layout)) return null;
  if (!/^columns-\d+$/i.test(String(layout.getAttribute('data-layout') || ''))) return null;
  return layout;
}

function getSelectedRichLayoutElement() {
  return runtimeRichSelection?.getSelectedLayoutElement() || null;
}

function setSelectedRichLayoutElement(layoutEl) {
  runtimeRichSelection?.setSelectedLayoutElement(layoutEl);
}


function renumberRichLayoutColumns(layoutEl) {
  if (!layoutEl) return;
  const columns = Array.from(layoutEl.querySelectorAll(':scope > [data-col]'));
  columns.forEach((col, index) => {
    col.setAttribute('data-col', String(index + 1));
  });
  const nextCount = normalizeRichLayoutColumns(columns.length || 2);
  layoutEl.setAttribute('data-layout', `columns-${nextCount}`);
  layoutEl.removeAttribute('data-col-widths');
  layoutEl.style.removeProperty('grid-template-columns');
}

function applySpacingToRichLayout(layoutEl, spacingValue) {
  if (!layoutEl) return false;
  const safeSpacing = sanitizeRichParagraphSpacingValue(spacingValue);
  if (!safeSpacing) return false;
  layoutEl.style.columnGap = safeSpacing;
  layoutEl.style.gap = safeSpacing;
  return true;
}

function setEqualRichLayoutColumnWidths() {
  const layout = getSelectedRichLayoutElement();
  if (!layout) {
    updateStatus('Select a columns layout first.');
    return;
  }
  const columns = getRichLayoutDirectColumns(layout);
  if (!columns.length) {
    updateStatus('Select a columns layout first.');
    return;
  }
  applyRichLayoutColumnWidths(layout, Array.from({ length: columns.length }, () => 1));
  updateRichLayoutBlockResizeHandle();
  updateStatus('All selected columns set to equal width.');
}

function applyRichLayoutBlockAlignment(layoutEl, alignValue) {
  if (!layoutEl) return false;
  const align = normalizeTextAlign(alignValue || 'left');
  if (align === 'center') {
    layoutEl.style.marginLeft = 'auto';
    layoutEl.style.marginRight = 'auto';
  } else if (align === 'right') {
    layoutEl.style.marginLeft = 'auto';
    layoutEl.style.marginRight = '0';
  } else {
    layoutEl.style.marginLeft = '0';
    layoutEl.style.marginRight = 'auto';
  }
  layoutEl.setAttribute('data-block-align', align);
  updateRichLayoutBlockResizeHandle();
  return true;
}

function getRichLayoutDirectColumns(layoutEl) {
  if (!layoutEl) return [];
  return Array.from(layoutEl.querySelectorAll(':scope > [data-col]')).filter((column) => column instanceof Element);
}

runtimeRichLayout = safeCreateRuntimeEditorModule(
  'rich-layout',
  () => window.IterpanoEditorRichLayout?.createRichLayoutController({
    richEditorModal,
    richEditorSurface,
    parsePixelStyleValue,
    applyRichEditorModalResizeConstraints,
    applyRichLayoutColumnWidths,
    getRichLayoutDirectColumns,
    getSelectedRichLayoutElement,
    richLayoutColumnMinWidth: RICH_LAYOUT_COLUMN_MIN_WIDTH
  }),
  [
    { label: 'richEditorModal', value: richEditorModal },
    { label: 'richEditorSurface', value: richEditorSurface },
    { label: 'IterpanoEditorRichLayout', value: window.IterpanoEditorRichLayout }
  ]
);

runtimeRichSelection = safeCreateRuntimeEditorModule(
  'rich-selection',
  () => window.IterpanoEditorRichSelection?.createRichSelectionController({
    richEditorModal,
    richEditorSurface,
    syncRichEditorTypographyControls,
    applyRichEditorModalResizeConstraints,
    findClosestRichLayout,
    updateRichLayoutBlockResizeHandle,
    hideRichLayoutBlockResizeHandle
  }),
  [
    { label: 'richEditorModal', value: richEditorModal },
    { label: 'richEditorSurface', value: richEditorSurface },
    { label: 'IterpanoEditorRichSelection', value: window.IterpanoEditorRichSelection }
  ]
);

runtimeRichTypography = safeCreateRuntimeEditorModule(
  'rich-typography',
  () => window.IterpanoEditorRichTypography?.createRichTypographyController({
    richEditorSurface,
    getActiveRichSizeInput: () => activeRichSizeInput,
    isRangeInsideRichEditor,
    sanitizeRichFontSizeValue,
    sanitizeRichLineHeightValue,
    sanitizeRichParagraphSpacingValue,
    getRichBlockNodeForSelection,
    getSavedRanges: getRichEditorSavedRanges,
    setSavedRanges: setRichEditorSavedRanges,
    clearSavedRanges: clearRichEditorSavedRanges
  }),
  [
    { label: 'richEditorSurface', value: richEditorSurface },
    { label: 'IterpanoEditorRichTypography', value: window.IterpanoEditorRichTypography }
  ]
);

function stopRichLayoutResize() {
  runtimeRichLayout?.stopResize();
}

function maybeStartRichLayoutResize(event) {
  return runtimeRichLayout?.maybeStartResize(event) || false;
}

function hideRichLayoutBlockResizeHandle() {
  runtimeRichLayout?.hideBlockResizeHandle();
}

function updateRichLayoutBlockResizeHandle() {
  runtimeRichLayout?.updateBlockResizeHandle();
}

function stopRichLayoutBlockResize() {
  runtimeRichLayout?.stopBlockResize();
}


function syncRichEditorSelectionState() {
  runtimeRichSelection?.syncSelectionState();
}

function ensureRichImageResizeHandle() {
  return runtimeRichSelection?.ensureImageResizeHandle() || null;
}

function hideRichImageResizeHandle() {
  runtimeRichSelection?.hideImageResizeHandle();
}

function updateRichImageResizeHandle() {
  runtimeRichSelection?.updateRichImageResizeHandle();
}

function stopRichImageResize() {
  runtimeRichSelection?.stopImageResize();
}

function setSelectedRichImageElement(imageEl) {
  runtimeRichSelection?.setSelectedImageElement(imageEl);
}

function getSelectedRichImageElement() {
  return runtimeRichSelection?.getSelectedImageElement() || null;
}


function applyRichMediaAlignment(mediaEl, align = 'left') {
  if (!(mediaEl instanceof HTMLElement)) return false;
  const tag = mediaEl.tagName.toLowerCase();
  if (!['img', 'video', 'iframe'].includes(tag)) return false;
  const safeAlign = align === 'center' || align === 'right' ? align : 'left';
  mediaEl.setAttribute('data-align', safeAlign);
  mediaEl.style.float = 'none';
  mediaEl.style.display = 'block';
  if (tag === 'img') {
    mediaEl.setAttribute('data-wrap', 'none');
  }
  if (safeAlign === 'center') {
    mediaEl.style.marginLeft = 'auto';
    mediaEl.style.marginRight = 'auto';
  } else if (safeAlign === 'right') {
    mediaEl.style.marginLeft = 'auto';
    mediaEl.style.marginRight = '0';
  } else {
    mediaEl.style.marginLeft = '0';
    mediaEl.style.marginRight = 'auto';
  }
  if (!mediaEl.style.marginTop) {
    mediaEl.style.marginTop = '0.5em';
  }
  if (!mediaEl.style.marginBottom) {
    mediaEl.style.marginBottom = '0.5em';
  }
  return true;
}

function getRichMediaElementAtPoint(clientX, clientY) {
  if (!richEditorSurface) return null;
  const mediaElements = Array.from(richEditorSurface.querySelectorAll('img,video,iframe'));
  for (let i = mediaElements.length - 1; i >= 0; i -= 1) {
    const media = mediaElements[i];
    if (!(media instanceof Element) || !media.isConnected) continue;
    const rect = media.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return media;
    }
  }
  return null;
}

function buildRichColumnsHtml(columnCount = 2) {
  const safeCols = normalizeRichLayoutColumns(columnCount, 2);
  const defaultWeights = getDefaultRichLayoutWeights(safeCols);
  const defaultTemplate = defaultWeights
    .map((value) => `minmax(0,${Math.max(1, value).toFixed(4)}fr)`)
    .join(' ');
  const defaultWidth = buildDefaultRichLayoutWidthValue(safeCols);
  const columnsHtml = [];
  for (let index = 1; index <= safeCols; index += 1) {
    columnsHtml.push(
      `<div data-col="${index}"><p><br></p></div>`
    );
  }
  return `<div data-layout="columns-${safeCols}" data-col-widths="${serializeRichLayoutWeights(defaultWeights)}" style="grid-template-columns:${defaultTemplate};width:${defaultWidth};gap:${DEFAULT_RICH_LAYOUT_COLUMN_GAP_PX}px;">${columnsHtml.join('')}</div><p><br></p>`;
}

function isEffectivelyEmptyParagraph(node) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.tagName.toLowerCase() !== 'p') return false;
  const hasMedia = node.querySelector('img,video,iframe,table,[data-layout^="columns-"]');
  if (hasMedia) return false;
  return String(node.textContent || '').trim().length === 0;
}

function getClosestRichBlock(node) {
  if (!node || !richEditorSurface) return null;
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (!(el instanceof Element)) return null;
  let block = el.closest('p,div,h1,h2,h3,h4,ul,ol,li,table,blockquote');
  while (block && block !== richEditorSurface) {
    if (block.matches?.('div[data-col], div[data-layout]')) {
      block = block.parentElement?.closest?.('p,div,h1,h2,h3,h4,ul,ol,li,table,blockquote') || null;
      continue;
    }
    if (!richEditorSurface.contains(block)) return null;
    return block;
  }
  return null;
}

function insertStandaloneElementAtCurrentLine(element) {
  if (!richEditorSurface || !(element instanceof HTMLElement)) return null;
  const selection = window.getSelection();
  let range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  if (!range || !isRangeInsideRichEditor(range)) {
    const endRange = document.createRange();
    endRange.selectNodeContents(richEditorSurface);
    endRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(endRange);
    range = endRange;
  }

  const block = getClosestRichBlock(range.startContainer);
  const currentColumn = getClosestRichColumn(range.startContainer);
  const insertNode = currentColumn
    ? (() => {
      const wrapper = document.createElement('p');
      wrapper.appendChild(element);
      return wrapper;
    })()
    : element;
  if (block && block.parentNode) {
    const parent = block.parentNode;
    if (isEffectivelyEmptyParagraph(block)) {
      parent.insertBefore(insertNode, block);
      block.remove();
    } else {
      const beforeRange = document.createRange();
      beforeRange.selectNodeContents(block);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      const atStartOfBlock = String(beforeRange.toString() || '').trim().length === 0;
      if (atStartOfBlock) {
        parent.insertBefore(insertNode, block);
      } else if (block.nextSibling) {
        parent.insertBefore(insertNode, block.nextSibling);
      } else {
        parent.appendChild(insertNode);
      }
    }
  } else if (currentColumn) {
    const emptyParagraph = Array.from(currentColumn.children).find((child) => isEffectivelyEmptyParagraph(child));
    if (emptyParagraph instanceof HTMLElement) {
      currentColumn.insertBefore(insertNode, emptyParagraph);
      emptyParagraph.remove();
    } else {
      currentColumn.appendChild(insertNode);
    }
  } else {
    richEditorSurface.appendChild(insertNode);
  }

  setSelectedRichImageElement(element);
  const nextRange = document.createRange();
  nextRange.selectNode(element);
  selection?.removeAllRanges();
  selection?.addRange(nextRange);
  richEditorSavedRange = nextRange.cloneRange();
  return element;
}

function insertColumnsLayoutAtCurrentLine(columnCount = 2) {
  if (!richEditorSurface) return null;
  const safeCols = normalizeRichLayoutColumns(columnCount, 2);
  const template = document.createElement('template');
  template.innerHTML = buildRichColumnsHtml(safeCols);
  const layout = template.content.querySelector('[data-layout^="columns-"]');
  const trailingParagraph = template.content.querySelector('p');
  if (!(layout instanceof HTMLElement)) return null;
  const trailing = trailingParagraph instanceof HTMLElement ? trailingParagraph : null;

  const selection = window.getSelection();
  let range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  if (!range || !isRangeInsideRichEditor(range)) {
    const endRange = document.createRange();
    endRange.selectNodeContents(richEditorSurface);
    endRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(endRange);
    range = endRange;
  }

  const block = getClosestRichBlock(range.startContainer);
  if (block && block.parentNode) {
    const parent = block.parentNode;
    if (isEffectivelyEmptyParagraph(block)) {
      parent.insertBefore(layout, block);
      if (trailing) {
        parent.insertBefore(trailing, block);
      }
      block.remove();
    } else {
      const beforeRange = document.createRange();
      beforeRange.selectNodeContents(block);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      const atStartOfBlock = String(beforeRange.toString() || '').trim().length === 0;
      if (atStartOfBlock) {
        parent.insertBefore(layout, block);
        if (trailing) {
          parent.insertBefore(trailing, block);
        }
      } else if (block.nextSibling) {
        parent.insertBefore(layout, block.nextSibling);
        if (trailing) {
          parent.insertBefore(trailing, block.nextSibling);
        }
      } else {
        parent.appendChild(layout);
        if (trailing) {
          parent.appendChild(trailing);
        }
      }
    }
  } else {
    richEditorSurface.appendChild(layout);
    if (trailing) {
      richEditorSurface.appendChild(trailing);
    }
  }
  return layout;
}

function freezeRichLayoutDimensionsInSurface() {
  if (!richEditorSurface) return;
  const layouts = Array.from(richEditorSurface.querySelectorAll('[data-layout^="columns-"]'));
  layouts.forEach((layout) => {
    if (!(layout instanceof HTMLElement)) return;
    const rect = layout.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || rect.width <= 0) return;
    if (!layout.style.width) {
      layout.style.width = `${Math.round(rect.width)}px`;
    }
    if (layout.dataset.heightLocked !== 'true') {
      layout.style.removeProperty('height');
      layout.style.removeProperty('min-height');
    }
  });
}

function insertRichColumnsLayout(columnCount = 2) {
  const safeCols = normalizeRichLayoutColumns(columnCount, 2);
  const insertedLayout = insertColumnsLayoutAtCurrentLine(safeCols);
  if (insertedLayout instanceof HTMLElement) {
    renumberRichLayoutColumns(insertedLayout);
    insertedLayout.style.width = buildDefaultRichLayoutWidthValue(safeCols);
    applyRichLayoutColumnWidths(insertedLayout, getDefaultRichLayoutWeights(safeCols));
    applySpacingToRichLayout(insertedLayout, String(DEFAULT_RICH_LAYOUT_COLUMN_GAP_PX));
    setSelectedRichLayoutElement(insertedLayout);
  }
  const firstParagraph = insertedLayout?.querySelector('[data-col="1"] p');
  if (firstParagraph instanceof HTMLElement) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(firstParagraph);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  updateStatus(`${safeCols}-column layout inserted.`);
}

function addRichLayoutColumn() {
  const layout = getSelectedRichLayoutElement();
  if (!layout) {
    updateStatus('Select a columns layout first.');
    return;
  }
  const currentCols = parseRichLayoutColumns(layout);
  if (currentCols >= 6) {
    updateStatus('Maximum 6 columns for one layout.');
    return;
  }
  const newCol = document.createElement('div');
  newCol.setAttribute('data-col', String(currentCols + 1));
  newCol.innerHTML = `<p><strong>Column ${currentCols + 1}</strong></p><p><br></p>`;
  layout.appendChild(newCol);
  renumberRichLayoutColumns(layout);
  applySpacingToRichLayout(layout, '2');
  setSelectedRichLayoutElement(layout);
  updateStatus('Layout column added.');
}

function deleteRichLayoutColumn() {
  const layout = getSelectedRichLayoutElement();
  if (!layout) {
    updateStatus('Select a columns layout first.');
    return;
  }
  const columns = Array.from(layout.querySelectorAll(':scope > [data-col]'));
  if (columns.length <= 1) {
    updateStatus('Layout must keep at least 1 column.');
    return;
  }
  const selection = window.getSelection();
  const selectedCol = findClosestRichLayout(selection?.anchorNode)?.isSameNode(layout)
    ? (selection?.anchorNode instanceof Element
      ? selection.anchorNode.closest('[data-col]')
      : selection?.anchorNode?.parentElement?.closest('[data-col]'))
    : null;
  const removable = selectedCol && layout.contains(selectedCol)
    ? selectedCol
    : columns[columns.length - 1];
  removable?.remove();
  renumberRichLayoutColumns(layout);
  applySpacingToRichLayout(layout, '2');
  setSelectedRichLayoutElement(layout);
  updateStatus('Layout column removed.');
}

function insertParagraphBelowSelectedBlock() {
  const layout = getSelectedRichLayoutElement();
  const media = getSelectedRichImageElement();
  const mediaRow = media?.closest?.('p');
  const anchor = mediaRow || media || layout || getCurrentRichRowAnchor();
  if (!anchor || !anchor.parentNode) {
    updateStatus('Select a block/media or place the cursor in the target row first.');
    return;
  }
  const paragraph = document.createElement('p');
  paragraph.innerHTML = '<br>';
  if (anchor.nextSibling) {
    anchor.parentNode.insertBefore(paragraph, anchor.nextSibling);
  } else {
    anchor.parentNode.appendChild(paragraph);
  }
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);
  setSelectedRichLayoutElement(null);
  setSelectedRichImageElement(null);
  updateStatus('Cursor moved below selected block.');
}

function insertParagraphAboveSelectedBlock() {
  const layout = getSelectedRichLayoutElement();
  const media = getSelectedRichImageElement();
  const mediaRow = media?.closest?.('p');
  const anchor = mediaRow || media || layout || getCurrentRichRowAnchor();
  if (!anchor || !anchor.parentNode) {
    updateStatus('Select a block/media or place the cursor in the target row first.');
    return;
  }
  const paragraph = document.createElement('p');
  paragraph.innerHTML = '<br>';
  anchor.parentNode.insertBefore(paragraph, anchor);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);
  setSelectedRichLayoutElement(null);
  setSelectedRichImageElement(null);
  updateStatus('Cursor moved above selected block.');
}

function clearSelectedRichLayout() {
  const layout = getSelectedRichLayoutElement();
  if (!layout || !layout.parentNode) {
    updateStatus('Select a columns layout first.');
    return;
  }
  const paragraph = document.createElement('p');
  paragraph.innerHTML = '<br>';
  if (layout.nextSibling) {
    layout.parentNode.insertBefore(paragraph, layout.nextSibling);
  } else {
    layout.parentNode.appendChild(paragraph);
  }
  layout.remove();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);
  richEditorSavedRange = range.cloneRange();
  setSelectedRichLayoutElement(null);
  updateStatus('Columns layout removed.');
}

function getCurrentRichRowAnchor() {
  if (!richEditorSurface) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  let anchorNode = selection.anchorNode;
  if (anchorNode?.nodeType === Node.TEXT_NODE) {
    anchorNode = anchorNode.parentElement;
  }
  if (!(anchorNode instanceof Element)) return null;
  const row = anchorNode.closest('p,h1,h2,h3,h4,li,blockquote,table');
  if (row instanceof HTMLElement && richEditorSurface.contains(row)) {
    return row;
  }
  return null;
}

function deleteCurrentRichParagraph() {
  if (!richEditorSurface) {
    updateStatus('Open Visual Editor first.');
    return;
  }
  const selection = window.getSelection();
  const media = getSelectedRichImageElement();
  const row = media?.closest?.('p') || getCurrentRichRowAnchor();
  if (!(row instanceof HTMLElement) || !richEditorSurface.contains(row)) {
    updateStatus('Place the cursor inside the row you want to delete, or select a media row.');
    return;
  }
  const parent = row.parentNode;
  if (!parent) {
    updateStatus('Unable to delete current row.');
    return;
  }
  const fallbackParagraph = document.createElement('p');
  fallbackParagraph.innerHTML = '<br>';
  const previousSibling = row.previousSibling;
  const nextSibling = row.nextSibling;
  row.remove();
  let targetNode = null;
  if (previousSibling instanceof Node && previousSibling.parentNode === parent) {
    targetNode = previousSibling;
  } else if (nextSibling instanceof Node && nextSibling.parentNode === parent) {
    targetNode = nextSibling;
  } else {
    parent.appendChild(fallbackParagraph);
    targetNode = fallbackParagraph;
  }
  const range = document.createRange();
  if (targetNode instanceof HTMLParagraphElement) {
    range.selectNodeContents(targetNode);
    range.collapse(true);
  } else {
    range.setStartAfter(targetNode);
    range.collapse(true);
  }
  selection.removeAllRanges();
  selection.addRange(range);
  richEditorSavedRange = range.cloneRange();
  setSelectedRichImageElement(null);
  syncRichEditorSelectionState();
  updateStatus('Current row deleted.');
}

function getInfoHotspotByContext(context) {
  if (context?.type === 'home-page') {
    return getProjectHomePage();
  }
  if (!context?.sceneId || !context?.hotspotId || !state.project) return null;
  const scene = state.project.scenes.find((item) => item.id === context.sceneId);
  if (!scene) return null;
  const hotspot = (scene.hotspots || []).find((item) => item.id === context.hotspotId);
  if (!hotspot || !isInfoHotspot(hotspot)) return null;
  return hotspot;
}

function getPreviewHotspotByContext() {
  return getInfoHotspotByContext(previewHotspotContext);
}

function openRichEditorModal(hotspot = getSelectedInfoHotspot(), options = {}) {
  if (!hotspot || !richEditorModal || !richEditorSurface) {
    updateStatus('Select content to edit first.');
    return;
  }
  const contextType = options.type || (hotspot === getProjectHomePage() ? 'home-page' : 'info-hotspot');
  const scene = contextType === 'home-page' ? null : getSelectedScene();
  if (contextType !== 'home-page' && !scene) {
    updateStatus('Select a scene first.');
    return;
  }

  const isSwitchingContext =
    richEditorModal.classList.contains('visible') &&
    richEditorContext &&
    (
      richEditorContext.type !== contextType ||
      (contextType !== 'home-page' && (
        richEditorContext.sceneId !== scene.id || richEditorContext.hotspotId !== hotspot.id
      ))
    );
  if (isSwitchingContext) {
    saveRichEditorModalContent({ closeAfterSave: false, refreshPanel: false });
  }

  richEditorContext = contextType === 'home-page'
    ? { type: 'home-page' }
    : {
        type: 'info-hotspot',
        sceneId: scene.id,
        hotspotId: hotspot.id
      };

  const sourceHtml = sanitizeRichHtml(getInfoHotspotRichContent(hotspot));
  const template = document.createElement('template');
  template.innerHTML = sourceHtml || '';
  resolveRichMediaReferencesInContainer(template.content, state.project, { preferDataUrl: true });
  richEditorSurface.innerHTML = template.innerHTML || '';
  // Keep layouts independent from viewport size by freezing their initial dimensions.
  freezeRichLayoutDimensionsInSurface();
  applyRichEditorSurfaceVisualStyle(hotspot);
  ensureRichModalResizeHandle();
  ensureRichImageResizeHandle();
  setSelectedRichLayoutElement(null);
  setSelectedRichImageElement(null);
  clearRichEditorSavedRanges();
  richEditorModal.classList.add('visible');
  richEditorModal.setAttribute('aria-hidden', 'false');
  richEditorModal.classList.toggle('home-page-editor-mode', contextType === 'home-page');
  setTimeout(() => {
    applyRichEditorModalFrameSize(hotspot);
    updateRichModalResizeHandle();
    richEditorSurface.focus();
    syncRichEditorSelectionState();
  }, 0);
}

function closeRichEditorModal() {
  if (!richEditorModal || !richEditorSurface) return;
  stopRichEditorDrag();
  stopRichModalResize();
  stopRichImageResize();
  stopRichLayoutResize();
  stopRichLayoutBlockResize();
  setSelectedRichLayoutElement(null);
  setSelectedRichImageElement(null);
  hideRichImageResizeHandle();
  hideRichLayoutBlockResizeHandle();
  hideRichModalResizeHandle();
  richEditorSurface.classList.remove('drag-zone');
  richEditorSurface.style.removeProperty('background-color');
  richEditorModal.classList.remove('visible');
  richEditorModal.classList.remove('home-page-editor-mode');
  richEditorModal.setAttribute('aria-hidden', 'true');
  if (richEditorModalContent) {
    richEditorModalContent.style.removeProperty('width');
    richEditorModalContent.style.removeProperty('height');
    richEditorModalContent.style.removeProperty('min-width');
    richEditorModalContent.style.removeProperty('min-height');
  }
  richEditorSurface.innerHTML = '';
  richEditorSavedRange = null;
  richEditorSavedExpandedRange = null;
  richEditorContext = null;
}

function openRichSourceModal(hotspot = getSelectedInfoHotspot(), options = {}) {
  if (!hotspot || !richSourceModal || !richSourceTextarea) {
    updateStatus('Select content to edit first.');
    return;
  }
  const contextType = options.type || (hotspot === getProjectHomePage() ? 'home-page' : 'info-hotspot');
  const scene = contextType === 'home-page' ? null : getSelectedScene();
  if (contextType !== 'home-page' && !scene) {
    updateStatus('Select a scene first.');
    return;
  }
  richSourceContext = contextType === 'home-page'
    ? { type: 'home-page' }
    : {
        type: 'info-hotspot',
        sceneId: scene.id,
        hotspotId: hotspot.id
      };
  richSourceTextarea.value = getInfoHotspotRichContent(hotspot);
  richSourceModal.classList.add('visible');
  richSourceModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    richSourceTextarea.focus();
    const end = richSourceTextarea.value.length;
    richSourceTextarea.setSelectionRange(end, end);
  }, 0);
}

function closeRichSourceModal() {
  if (!richSourceModal || !richSourceTextarea) return;
  richSourceModal.classList.remove('visible');
  richSourceModal.setAttribute('aria-hidden', 'true');
  richSourceTextarea.value = '';
  richSourceContext = null;
}

function saveRichSourceModalContent({ closeAfterSave = false, refreshPanel = false } = {}) {
  const hotspot = getInfoHotspotByContext(richSourceContext);
  if (!hotspot || !richSourceTextarea) {
    if (closeAfterSave) closeRichSourceModal();
    return;
  }
  let nextHtml = richSourceTextarea.value || '';
  if (nextHtml.includes('data:image/')) {
    const compacted = compactRichHtmlMediaRefs(nextHtml, state.project, {
      suggestedName: hotspot.title || hotspot.id || 'inline-image'
    });
    if (compacted !== nextHtml) {
      nextHtml = compacted;
      richSourceTextarea.value = nextHtml;
      updateStatus('Inline image converted to short media reference.');
    }
  }
  setInfoHotspotRichContent(hotspot, nextHtml);
  if (refreshPanel) {
    renderContentBlocks();
  }
  autosave();
  updateStatus(closeAfterSave ? 'Rich source saved.' : 'Rich source saved (window still open).');
  if (closeAfterSave) {
    closeRichSourceModal();
  }
}

function ensureRichSourceModalOpen(hotspot = getSelectedInfoHotspot()) {
  if (!richSourceModal || !richSourceTextarea) return false;
  if (!richSourceModal.classList.contains('visible')) {
    openRichSourceModal(hotspot);
  }
  return richSourceModal.classList.contains('visible');
}

function insertIntoRichSourceModal(value, hotspot = getSelectedInfoHotspot()) {
  if (!ensureRichSourceModalOpen(hotspot)) return false;
  insertIntoTextarea(richSourceTextarea, value);
  saveRichSourceModalContent({ closeAfterSave: false });
  return true;
}

function wrapSelectionInRichSourceModal(before, after, hotspot = getSelectedInfoHotspot()) {
  if (!ensureRichSourceModalOpen(hotspot)) return false;
  const textarea = richSourceTextarea;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const selected = textarea.value.slice(start, end);
  const replacement = `${before}${selected}${after}`;
  const nextValue = `${textarea.value.slice(0, start)}${replacement}${textarea.value.slice(end)}`;
  textarea.value = nextValue;
  const cursor = start + replacement.length;
  textarea.setSelectionRange(cursor, cursor);
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  saveRichSourceModalContent({ closeAfterSave: false });
  return true;
}

function applyAlignmentInRichSourceModal(align, hotspot = getSelectedInfoHotspot()) {
  const safeAlign = normalizeTextAlign(align || 'left');
  return wrapSelectionInRichSourceModal(
    `<div style="text-align:${safeAlign};">`,
    '</div>',
    hotspot
  );
}

function applyFontSizeInRichSourceModal(fontSizeValue, hotspot = getSelectedInfoHotspot()) {
  const safeSize = sanitizeRichFontSizeValue(fontSizeValue);
  if (!safeSize) return false;
  return wrapSelectionInRichSourceModal(
    `<span style="font-size:${safeSize};">`,
    '</span>',
    hotspot
  );
}

function applyLineHeightInRichSourceModal(lineHeightValue, hotspot = getSelectedInfoHotspot()) {
  const safeLine = sanitizeRichLineHeightValue(lineHeightValue);
  if (!safeLine) return false;
  return wrapSelectionInRichSourceModal(
    `<div style="line-height:${safeLine};">`,
    '</div>',
    hotspot
  );
}

function applyParagraphSpacingInRichSourceModal(spaceValue, hotspot = getSelectedInfoHotspot()) {
  const safeSpace = sanitizeRichParagraphSpacingValue(spaceValue);
  if (!safeSpace) return false;
  return wrapSelectionInRichSourceModal(
    `<div style="margin-top:0;margin-bottom:${safeSpace};">`,
    '</div>',
    hotspot
  );
}

function applyColumnsSpacingInRichSourceModal(spaceValue, hotspot = getSelectedInfoHotspot()) {
  const safeSpace = sanitizeRichParagraphSpacingValue(spaceValue);
  if (!safeSpace) return false;
  return insertIntoRichSourceModal(
    `\n<!-- Set Cols.Space in Visual Editor for selected layout. Suggested: ${safeSpace} -->\n`,
    hotspot
  );
}

function insertLinkInRichSourceModal(hotspot = getSelectedInfoHotspot()) {
  if (!ensureRichSourceModalOpen(hotspot)) return false;
  const url = prompt('Link URL');
  if (!url) return false;
  const safeUrl = escapeHtml(String(url).trim());
  return wrapSelectionInRichSourceModal(`<a href="${safeUrl}">`, '</a>', hotspot);
}

function clearFormattingInRichSourceModal(hotspot = getSelectedInfoHotspot()) {
  if (!ensureRichSourceModalOpen(hotspot)) return false;
  const textarea = richSourceTextarea;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  if (start === end) return false;
  const selected = textarea.value.slice(start, end);
  const plain = selected.replace(/<[^>]*>/g, '');
  const nextValue = `${textarea.value.slice(0, start)}${plain}${textarea.value.slice(end)}`;
  textarea.value = nextValue;
  textarea.setSelectionRange(start, start + plain.length);
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  saveRichSourceModalContent({ closeAfterSave: false });
  return true;
}

function saveRichEditorModalContent({ closeAfterSave = false, refreshPanel = false } = {}) {
  const hotspot = getInfoHotspotByContext(richEditorContext);
  if (!hotspot || !richEditorSurface) {
    if (closeAfterSave) {
      closeRichEditorModal();
    }
    return;
  }
  let html = sanitizeRichHtml(richEditorSurface.innerHTML || '');
  applyRichEditorModalResizeConstraints();
  html = compactRichHtmlMediaRefs(html, state.project, {
    suggestedName: hotspot.title || hotspot.id || 'inline-image'
  });
  setInfoHotspotRichContent(hotspot, html);
  captureRichEditorModalFrameSize(hotspot);
  if (closeAfterSave) {
    closeRichEditorModal();
  }
  if (refreshPanel) {
    renderContentBlocks();
  }
  autosave();
  updateStatus(closeAfterSave ? 'Info content saved.' : 'Info content saved (editor still open).');
}

function updateStatus(message) {
  statusLeft.textContent = message;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDraft(project) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(project, AUTOSAVE_KEY);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    updateStatus('Draft saved locally.');
  } catch (error) {
    console.error(error);
    updateStatus('Draft save failed.');
  }
}

async function loadDraft() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(AUTOSAVE_KEY);
    return await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

function debounce(fn, wait = 600) {
  let timeoutId = null;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

const autosave = debounce(() => {
  if (state.project) {
    state.project.project.updatedAt = new Date().toISOString();
    saveDraft(state.project);
  }
}, 700);

if (typeof ResizeObserver !== 'undefined' && miniMap) {
  floorplanResizeObserver = new ResizeObserver(() => {
    refreshFloorplanCanvasLayout();
  });
  floorplanResizeObserver.observe(miniMap);
}

function loadProject(project) {
  floorplanZoomByGroup = new Map();
  floorplanImageMetricsById.clear();
  project.groups = project.groups || [{ id: 'group-main', name: 'Main Group' }];
  if (!project.groups.length) {
    project.groups.push({ id: `group-${Date.now()}`, name: 'Main Group' });
  }
  project.minimap = project.minimap || { enabled: false, floorplans: [] };
  project.minimap.floorplans = project.minimap.floorplans || [];
  project.scenes = project.scenes || [];
  project.assets = project.assets || {};
  project.assets.media = Array.isArray(project.assets.media) ? project.assets.media : [];
  project.homePage = project.homePage && typeof project.homePage === 'object' ? project.homePage : {};
  project.homePage.richContentHtml = typeof project.homePage.richContentHtml === 'string' ? project.homePage.richContentHtml : '';
  project.homePage.infoFrameSize = normalizeInfoFrameSize(project.homePage.infoFrameSize);
  project.homePage.infoFramePosition = normalizeInfoFramePosition(project.homePage.infoFramePosition);
  project.homePage.infoFrameViewport = normalizeInfoFrameViewport(project.homePage.infoFrameViewport);
  project.homePage.infoFrameAnchorOffset = normalizeInfoFrameAnchorOffset(project.homePage.infoFrameAnchorOffset);

  const defaultGroupId = project.groups[0].id;
  project.activeGroupId = project.groups.some((group) => group.id === project.activeGroupId)
    ? project.activeGroupId
    : defaultGroupId;
  project.scenes.forEach((scene) => {
    if (!scene.groupId) {
      scene.groupId = defaultGroupId;
    }
    scene.alias = typeof scene.alias === 'string' ? scene.alias : '';
    scene.comment = typeof scene.comment === 'string' ? scene.comment : '';
    scene.hotspots = scene.hotspots || [];
    scene.hotspots.forEach((hotspot) => {
      hotspot.contentBlocks = hotspot.contentBlocks || [];
      hotspot.infoFrameSize = normalizeInfoFrameSize(hotspot.infoFrameSize);
      hotspot.infoFramePosition = normalizeInfoFramePosition(hotspot.infoFramePosition);
      hotspot.infoFrameViewport = normalizeInfoFrameViewport(hotspot.infoFrameViewport);
      hotspot.infoFrameAnchorOffset = normalizeInfoFrameAnchorOffset(hotspot.infoFrameAnchorOffset);
      hotspot.displayMode = normalizeInfoHotspotDisplayMode(hotspot.displayMode);
      hotspot.contentBlocks.forEach((block) => {
        if (block.type === 'text') {
          block.align = normalizeTextAlign(block.align);
        }
        if (block.type === 'scene') {
          block.comment = typeof block.comment === 'string' ? block.comment : '';
          if (Object.prototype.hasOwnProperty.call(block, 'alias')) {
            delete block.alias;
          }
        }
      });
      if (!isSceneLinkHotspot(hotspot)) {
        if (typeof hotspot.richContentHtml !== 'string') {
          hotspot.richContentHtml = convertInfoBlocksToRichHtml(hotspot, project);
        }
        hotspot.richContentHtml = compactRichHtmlMediaRefs(hotspot.richContentHtml, project, {
          suggestedName: hotspot.title || hotspot.id || scene.id || 'inline-image'
        });
        hotspot.richContentHtml = sanitizeRichHtml(hotspot.richContentHtml);
        hotspot.contentBlocks = (hotspot.contentBlocks || []).filter((block) => block.type === 'scene');
      }
    });
  });
  project.minimap.floorplans.forEach((floorplan) => {
    if (!floorplan.groupId) {
      floorplan.groupId = defaultGroupId;
    }
    floorplan.markerColorKey = normalizeFloorplanColorKey(floorplan.markerColorKey || 'yellow');
    floorplan.nodes = (floorplan.nodes || []).map((node) => ({
      ...node,
      colorKey: normalizeFloorplanColorKey(node?.colorKey || floorplan.markerColorKey || 'yellow')
    }));
  });
  project.groups.forEach((group) => {
    const groupScenes = project.scenes.filter((scene) => scene.groupId === group.id);
    if (!groupScenes.length) {
      group.mainSceneId = null;
      return;
    }
    if (!group.mainSceneId || !groupScenes.some((scene) => scene.id === group.mainSceneId)) {
      group.mainSceneId = groupScenes[0].id;
    }
  });

  state.project = project;
  state.selectedGroupId = project.activeGroupId || project.groups[0]?.id || null;
  const firstScene =
    getPreferredSceneForGroup(state.selectedGroupId) ||
    project.scenes[0] ||
    null;
  state.selectedSceneId = firstScene?.id || null;
  state.selectedHotspotId = firstScene?.hotspots?.[0]?.id || null;
  state.selectedFloorplanId = getFloorplanForGroup(state.selectedGroupId)?.id || null;
  const fixedLinkCodes = ensureUniqueSceneLinkCodes();

  projectNameInput.value = project.project.name || 'Untitled';
  syncSceneFovInput();
  renderAll();
  updatePlacementButtonLabel();
  initEditorViewer(project);
  if (fixedLinkCodes > 0) {
    updateStatus('Duplicate link codes were fixed automatically.');
  }
}

function renderAll() {
  runtimeEditorRender?.renderAll();
}

function syncOpenRichEditorContexts() {
  runtimeEditorRender?.syncOpenRichEditorContexts();
}

function updateSceneTitle() {
  runtimeEditorRender?.updateSceneTitle();
}

function syncSceneFovInput() {
  runtimeEditorRender?.syncSceneFovInput();
}

runtimeEditorRender = safeCreateRuntimeEditorModule(
  'editor-render',
  () => window.IterpanoEditorRender?.createEditorRenderController({
    richEditorModal,
    richSourceModal,
    previewModal,
    closeRichEditorModal,
    getRichEditorHotspotByContext: () => getInfoHotspotByContext(richEditorContext),
    getRichSourceHotspotByContext: () => getInfoHotspotByContext(richSourceContext),
    getIsInfoHotspotEditMode: () => infoHotspotEditMode,
    setIsInfoHotspotEditMode: (value) => {
      infoHotspotEditMode = Boolean(value);
    },
    updateInfoHotspotModeButtons,
    getPreviewHotspotByContext,
    closeRichSourceModal,
    closeHotspotPreview,
    getSelectedScene,
    sceneTitle,
    projectFovInput,
    getSelectedSceneFov,
    renderSceneGroupOptions,
    renderSceneList,
    renderHotspotList,
    renderLinkEditor,
    renderContentBlocks,
    renderFloorplans,
    switchEditorScene,
  }),
  [
    { label: 'IterpanoEditorRender', value: window.IterpanoEditorRender }
  ]
);

runtimeEditorEvents = safeCreateRuntimeEditorModule(
  'editor-events',
  () => window.IterpanoEditorEvents?.createEditorEventsController({
    state,
    windowRef: window,
    documentRef: document,
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
    getFloorplanPlaceMode: () => floorplanPlaceMode,
    setFloorplanPlaceMode,
    getFloorplanEditMode: () => floorplanEditMode,
    setFloorplanEditMode,
    getFloorplanSelectAllMode: () => floorplanSelectAllMode,
    setFloorplanSelectAllMode,
    deleteSelectedFloorplanNode,
    getFloorplanShowLabels: () => floorplanShowLabels,
    setFloorplanShowLabels,
    getFloorplanShowAliases: () => floorplanShowAliases,
    setFloorplanShowAliases,
    getFloorplanMapWindowOpen: () => floorplanMapWindowOpen,
    setFloorplanMapWindowOpen,
    setSelectedFloorplanColor,
    setFloorplanZoom,
    getFloorplanZoom,
    getSelectedFloorplan,
    zoomFloorplanAt,
    setFloorplanHoverActive: (value) => {
      floorplanHoverActive = Boolean(value);
    },
    getFloorplanHoverActive: () => floorplanHoverActive,
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
    tilerWorkerRef: () => tilerWorker,
    getActiveTilingRequestId: () => activeTilingRequestId,
    closeHotspotPreview,
    startTourFromHomePagePreview,
    getQuickPreviewOpenHotspotId: () => quickPreviewOpenHotspotId,
    setQuickPreviewHoverModal: (value) => {
      quickPreviewHoverModal = Boolean(value);
    },
    cancelQuickPreviewClose,
    scheduleQuickPreviewClose,
    maybeStartPreviewModalDrag,
    saveRichSourceModalContent,
    maybeStartRichLayoutResize,
    maybeStartRichEditorDrag,
    saveRichEditorModalContent,
    getSelectedRichLayoutElement: () => selectedRichLayoutElement,
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
    duplicatePanoramaListEntriesRef: () => duplicatePanoramaListEntries,
    resolveGenerateAllTilesChoice,
    isTypingTarget,
    moveSceneSelectionBy,
    getBlockingModalState: () => ({
      preview: previewModal?.classList.contains('visible'),
      richEditor: richEditorModal?.classList.contains('visible'),
      deleteLinksScope: deleteLinksScopeModal?.classList.contains('visible'),
      duplicatePanorama: duplicatePanoramaModal?.classList.contains('visible'),
      duplicatePanoramaList: duplicatePanoramaListModal?.classList.contains('visible'),
      generateAllTiles: generateAllTilesModal?.classList.contains('visible'),
      richSource: richSourceModal?.classList.contains('visible'),
      floorplanMapWindowOpen,
    }),
    getRichEditorContext: () => richEditorContext,
    setHomePageEditMode,
    setInfoHotspotEditMode,
    handleResize,
    importProjectFile,
    uploadFloorplanFile,
  }),
  [
    { label: 'IterpanoEditorEvents', value: window.IterpanoEditorEvents }
  ]
);

runtimeEditorUi = safeCreateRuntimeEditorModule(
  'editor-ui',
  () => window.IterpanoEditorUi?.createEditorUiController({
    state,
    windowRef: window,
    mapPanelBody,
    mapWindowBackdrop,
    btnFloorplanExpand,
    viewerCanvas,
    layoutRoot,
    refreshFloorplanCanvasLayout,
    miniMap,
    getFloorplanMapWindowOpen: () => floorplanMapWindowOpen,
    setFloorplanMapWindowOpenState: (value) => {
      floorplanMapWindowOpen = Boolean(value);
    },
    floorplanZoomByGroup,
    btnToggleLinksPanel,
    linksPanelBody,
    getPlacementMode: () => placementMode,
    togglePlacementMode,
    getInfoHotspotCreateMode: () => infoHotspotCreateMode,
    setInfoHotspotCreateModeState: (value) => {
      infoHotspotCreateMode = Boolean(value);
    },
    getInfoHotspotEditMode: () => infoHotspotEditMode,
    setInfoHotspotEditModeState: (value) => {
      infoHotspotEditMode = Boolean(value);
    },
    richSourceModal,
    getRichSourceContext: () => richSourceContext,
    saveRichSourceModalContent,
    hideHotspotHoverCard,
    closeHotspotPreview,
    setHomePageEditModeState: (value) => {
      homePageEditMode = Boolean(value);
    },
    richEditorModal,
    getRichEditorContext: () => richEditorContext,
    saveRichEditorModalContent,
    updateInfoHotspotModeButtons,
    renderContentBlocks,
    updateStatus,
    openRichEditorModal,
    getProjectHomePage,
  }),
  [
    { label: 'IterpanoEditorUi', value: window.IterpanoEditorUi }
  ]
);

runtimeSceneSelection = safeCreateRuntimeEditorModule(
  'scene-selection',
  () => window.IterpanoEditorSceneSelection?.createSceneSelectionController({
    getProjectData: () => state.project,
    getSelectedSceneId: () => state.selectedSceneId,
    getSelectedGroupId: () => state.selectedGroupId,
    getSceneLabelMode: () => state.sceneLabelMode,
    getSceneSortKey: () => state.sceneSortKey,
    getSceneSortDirection: () => state.sceneSortDirection,
  }),
  [
    { label: 'IterpanoEditorSceneSelection', value: window.IterpanoEditorSceneSelection }
  ]
);

runtimeSceneActions = safeCreateRuntimeEditorModule(
  'scene-actions',
  () => window.IterpanoEditorSceneActions?.createSceneActionsController({
    state,
    generatedTiles,
    editorScenes,
    windowRef: window,
    getSelectedScene,
    getSelectedGroup,
    getGroupById,
    getScenesForSelectedGroup,
    getPreferredSceneForGroup,
    getSelectedSceneFov,
    getFloorplanForGroup,
    getPendingSceneLinkDraft: () => pendingSceneLinkDraft,
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
  }),
  [
    { label: 'IterpanoEditorSceneActions', value: window.IterpanoEditorSceneActions }
  ]
);

runtimeSceneSidebar = safeCreateRuntimeEditorModule(
  'scene-sidebar',
  () => window.IterpanoEditorSceneSidebar?.createSceneSidebarController({
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
    getRenamingSceneId: () => renamingSceneId,
    singleClickDelayMs: SCENE_ITEM_SINGLE_CLICK_DELAY_MS,
  }),
  [
    { label: 'IterpanoEditorSceneSidebar', value: window.IterpanoEditorSceneSidebar }
  ]
);

runtimeProjectIoUtils = safeCreateRuntimeEditorModule(
  'project-io-utils',
  () => window.IterpanoEditorProjectIoUtils?.createProjectIoUtilsController({}),
  [
    { label: 'IterpanoEditorProjectIoUtils', value: window.IterpanoEditorProjectIoUtils }
  ]
);

runtimeProjectExport = safeCreateRuntimeEditorModule(
  'project-export',
  () => window.IterpanoEditorProjectExport?.createProjectExportController({
    state,
    generatedTiles,
    updateStatus,
    ensureProjectMediaStore,
    dataUrlToFile,
    downloadBlob,
    collectStaticExportWarnings,
    isSceneLinkHotspot,
    convertInfoBlocksToRichHtml,
    sanitizeRichHtml,
    parseMediaReference,
    collectViewerRuntimeFiles,
    blobToString,
    buildStaticPackageRootIndexHtml,
    writeFile,
    writePathFile,
  }),
  [
    { label: 'IterpanoEditorProjectExport', value: window.IterpanoEditorProjectExport }
  ]
);

runtimeProjectImport = safeCreateRuntimeEditorModule(
  'project-import',
  () => window.IterpanoEditorProjectImport?.createProjectImportController({
    generatedTiles,
    loadProject,
    autosave,
    updateStatus,
    blobToDataUrl,
  }),
  [
    { label: 'IterpanoEditorProjectImport', value: window.IterpanoEditorProjectImport }
  ]
);

function getSelectedScene() {
  return runtimeSceneSelection?.getSelectedScene() || null;
}

function getSelectedGroup() {
  return runtimeSceneSelection?.getSelectedGroup() || null;
}

function getGroupById(groupId) {
  return runtimeSceneSelection?.getGroupById(groupId) || null;
}

function getSceneListLabel(scene) {
  return runtimeSceneSelection?.getSceneListLabel(scene) || '';
}

function compareScenesByName(a, b) {
  return runtimeSceneSelection?.compareScenesByName(a, b) || 0;
}

function compareScenesByUploadId(a, b) {
  return runtimeSceneSelection?.compareScenesByUploadId(a, b) || 0;
}

function sortScenesForList(scenes) {
  return runtimeSceneSelection?.sortScenesForList(scenes) || [];
}

function getScenesForSelectedGroup() {
  return runtimeSceneSelection?.getScenesForSelectedGroup() || [];
}

function getPreferredSceneForGroup(groupId) {
  return runtimeSceneSelection?.getPreferredSceneForGroup(groupId) || null;
}

function updateSceneSortButtons() {
  runtimeSceneSidebar?.updateSceneSortButtons();
}

function toggleSceneSort(sortKey) {
  runtimeSceneActions?.toggleSceneSort(sortKey);
}

function toggleSceneLabelMode() {
  runtimeSceneActions?.toggleSceneLabelMode();
}

function isTypingTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return false;
}

function moveSceneSelectionBy(delta) {
  const handled = runtimeSceneActions?.moveSceneSelectionBy(delta) || false;
  if (!handled) return false;
  const scenes = getScenesForSelectedGroup();
  const nextScene = scenes.find((scene) => scene.id === state.selectedSceneId);
  if (!nextScene) return false;
  const activeButton = sceneList?.querySelector(`.scene-item-main[data-scene-id="${nextScene.id}"]`);
  activeButton?.scrollIntoView({ block: 'nearest' });
  return true;
}

runtimeHotspotSelection = safeCreateRuntimeEditorModule(
  'hotspot-selection',
  () => window.IterpanoEditorHotspotSelection?.createHotspotSelectionController({
    getSelectedScene,
    getSelectedHotspotId: () => state.selectedHotspotId,
    getPendingSceneLinkDraft: () => pendingSceneLinkDraft,
    getSelectedSceneId: () => state.selectedSceneId,
    normalizeInfoHotspotDisplayMode,
  }),
  [
    { label: 'IterpanoEditorHotspotSelection', value: window.IterpanoEditorHotspotSelection }
  ]
);

function getSelectedHotspot() {
  return runtimeHotspotSelection?.getSelectedHotspot() || null;
}

function isSceneLinkHotspot(hotspot) {
  return runtimeHotspotSelection?.isSceneLinkHotspot(hotspot) || false;
}

function isInfoHotspot(hotspot) {
  return runtimeHotspotSelection?.isInfoHotspot(hotspot) || false;
}

function isQuickInfoHotspot(hotspot) {
  return runtimeHotspotSelection?.isQuickInfoHotspot(hotspot) || false;
}

function getSceneLinkHotspots(scene = getSelectedScene()) {
  return runtimeHotspotSelection?.getSceneLinkHotspots(scene) || [];
}

function getSceneInfoHotspots(scene = getSelectedScene()) {
  return runtimeHotspotSelection?.getSceneInfoHotspots(scene) || [];
}

function getSceneLinkBlock(hotspot) {
  return runtimeHotspotSelection?.getSceneLinkBlock(hotspot) || null;
}

function getSelectedLinkHotspot() {
  return runtimeHotspotSelection?.getSelectedLinkHotspot() || null;
}

function getSelectedInfoHotspot() {
  return runtimeHotspotSelection?.getSelectedInfoHotspot() || null;
}

function getPendingSceneLinkDraftForSelectedScene() {
  return runtimeHotspotSelection?.getPendingSceneLinkDraftForSelectedScene() || null;
}

function normalizeSceneLinkColorKey(key) {
  return normalizeFloorplanColorKey(key || 'yellow');
}

function getSceneLinkColorHex(colorKey) {
  return FLOORPLAN_COLOR_MAP[normalizeSceneLinkColorKey(colorKey)];
}

function getInfoHotspotColorKey(hotspot) {
  return normalizeFloorplanColorKey(hotspot?.markerColorKey || DEFAULT_INFO_HOTSPOT_COLOR_KEY);
}

function colorLabelFromKey(colorKey) {
  const labels = {
    yellow: 'Yellow',
    red: 'Red',
    cyan: 'Cyan',
    lightgreen: 'Light Green',
    magenta: 'Magenta',
    white: 'White',
    black: 'Black'
  };
  return labels[colorKey] || colorKey;
}

function renderSceneLinkColorOptions(selectElement, selectedKey) {
  if (!selectElement) return;
  const normalized = normalizeSceneLinkColorKey(selectedKey);
  selectElement.innerHTML = '';
  Object.keys(FLOORPLAN_COLOR_MAP).forEach((key) => {
    const option = document.createElement('option');
    const optionColor = getSceneLinkColorHex(key);
    option.value = key;
    option.textContent = '⬤';
    option.title = colorLabelFromKey(key);
    option.style.color = getContrastTextColor(optionColor);
    option.style.backgroundColor = optionColor;
    selectElement.appendChild(option);
  });
  selectElement.value = normalized;
  selectElement.style.color = getSceneLinkColorHex(normalized);
  syncCustomColorSelect(selectElement);
}

function createRichColorPicker(selectedKey, { title = 'Color' } = {}) {
  const root = document.createElement('div');
  root.className = 'rich-color-picker';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'rich-color-picker-button';
  button.title = title;
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');

  const swatch = document.createElement('span');
  swatch.className = 'rich-color-picker-swatch';
  button.appendChild(swatch);

  const caret = document.createElement('span');
  caret.className = 'rich-color-picker-caret';
  caret.textContent = '▼';
  button.appendChild(caret);

  const panel = document.createElement('div');
  panel.className = 'rich-color-picker-panel hidden';
  panel.setAttribute('role', 'listbox');
  root.append(button, panel);

  let value = normalizeFloorplanColorKey(selectedKey);
  let changeHandler = null;

  const closePanel = () => {
    panel.classList.add('hidden');
    button.setAttribute('aria-expanded', 'false');
  };

  const openPanel = () => {
    if (button.disabled) return;
    panel.classList.remove('hidden');
    button.setAttribute('aria-expanded', 'true');
  };

  const syncValue = () => {
    const color = getSceneLinkColorHex(value);
    swatch.style.backgroundColor = color;
    swatch.style.borderColor = darkenHex(color, 0.28);
    button.dataset.colorKey = value;
  };

  Object.keys(FLOORPLAN_COLOR_MAP).forEach((key) => {
    const optionColor = getSceneLinkColorHex(key);
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'rich-color-picker-option';
    option.title = colorLabelFromKey(key);
    option.dataset.colorKey = key;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-label', colorLabelFromKey(key));
    option.style.backgroundColor = optionColor;
    option.style.borderColor = darkenHex(optionColor, 0.28);
    option.style.color = getContrastTextColor(optionColor);
    option.textContent = '●';
    option.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    option.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      value = normalizeFloorplanColorKey(key);
      syncValue();
      closePanel();
      panel.querySelectorAll('.rich-color-picker-option').forEach((node) => {
        node.classList.toggle('active', node.dataset.colorKey === value);
      });
      if (typeof changeHandler === 'function') {
        changeHandler(value);
      }
    });
    panel.appendChild(option);
  });

  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (panel.classList.contains('hidden')) openPanel();
    else closePanel();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!root.contains(event.target)) {
      closePanel();
    }
  });

  syncValue();
  panel.querySelectorAll('.rich-color-picker-option').forEach((node) => {
    node.classList.toggle('active', node.dataset.colorKey === value);
  });

  return {
    root,
    button,
    close: closePanel,
    open: openPanel,
    getValue() {
      return value;
    },
    setValue(nextValue) {
      value = normalizeFloorplanColorKey(nextValue);
      syncValue();
      panel.querySelectorAll('.rich-color-picker-option').forEach((node) => {
        node.classList.toggle('active', node.dataset.colorKey === value);
      });
    },
    setDisabled(disabled) {
      button.disabled = !!disabled;
      root.classList.toggle('disabled', !!disabled);
      if (disabled) closePanel();
    },
    onChange(handler) {
      changeHandler = handler;
    }
  };
}

const enhancedColorSelects = new WeakMap();

function ensureCustomColorSelect(selectElement, { title = 'Color' } = {}) {
  if (!(selectElement instanceof HTMLSelectElement)) return null;
  let controller = enhancedColorSelects.get(selectElement);
  if (controller) return controller;
  const picker = createRichColorPicker(selectElement.value || DEFAULT_INFO_BG_COLOR_KEY, { title });
  selectElement.classList.add('native-color-select-hidden');
  selectElement.insertAdjacentElement('afterend', picker.root);
  picker.onChange((value) => {
    const nextValue = normalizeFloorplanColorKey(value);
    selectElement.value = nextValue;
    selectElement.style.color = getSceneLinkColorHex(nextValue);
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
  });
  controller = {
    selectElement,
    picker,
    sync() {
      const fallbackValue = selectElement.value
        || selectElement.querySelector('option')?.value
        || DEFAULT_INFO_BG_COLOR_KEY;
      picker.setValue(fallbackValue);
      picker.setDisabled(selectElement.disabled);
    }
  };
  enhancedColorSelects.set(selectElement, controller);
  controller.sync();
  return controller;
}

function syncCustomColorSelect(selectElement) {
  enhancedColorSelects.get(selectElement)?.sync();
}

ensureCustomColorSelect(infoHotspotColorSelect, { title: 'Hotspot color' });

function sanitizeInfoBackgroundTransparencyPercent(value, fallback = DEFAULT_INFO_BG_TRANSPARENCY) {
  return runtimeHotspotUi?.sanitizeInfoBackgroundTransparencyPercent(value, fallback) ?? fallback;
}

function getInfoHotspotEditorVisualStyle(hotspot) {
  return runtimeHotspotUi?.getInfoHotspotEditorVisualStyle(hotspot) || {
    backgroundColorKey: DEFAULT_INFO_BG_COLOR_KEY,
    backgroundTransparency: DEFAULT_INFO_BG_TRANSPARENCY
  };
}

function setInfoHotspotEditorVisualStyle(hotspot, colorKey, transparencyPercent) {
  runtimeHotspotUi?.setInfoHotspotEditorVisualStyle(hotspot, colorKey, transparencyPercent);
}

function applyRichEditorSurfaceVisualStyle(hotspot) {
  runtimeHotspotUi?.applyRichEditorSurfaceVisualStyle(hotspot);
}

function applyPreviewModalFrameSize(hotspot) {
  runtimeHotspotUi?.applyPreviewModalFrameSize(hotspot);
}

function measurePreviewRichContentFrame(maxWidth, maxHeight) {
  return runtimeHotspotUi?.measurePreviewRichContentFrame(maxWidth, maxHeight) || null;
}

function schedulePreviewRichContentFrameRefresh(hotspot) {
  runtimeHotspotUi?.schedulePreviewRichContentFrameRefresh(hotspot);
}

function resetPreviewModalFrameSize() {
  runtimeHotspotUi?.resetPreviewModalFrameSize();
}

function applyPreviewModalVisualStyle(hotspot) {
  runtimeHotspotUi?.applyPreviewModalVisualStyle(hotspot);
}

function getLinkTargetSceneOptions(currentSceneId) {
  return runtimeHotspotUi?.getLinkTargetSceneOptions(currentSceneId) || [];
}

function formatTargetSceneOptionLabel(scene, { includeGroup = false } = {}) {
  return runtimeHotspotUi?.formatTargetSceneOptionLabel(scene, { includeGroup }) || '';
}

function updateLinkNoteModeUi() {
  runtimeHotspotUi?.updateLinkNoteModeUi();
}

runtimeHotspotUi = safeCreateRuntimeEditorModule(
  'hotspot-ui',
  () => window.IterpanoEditorHotspotUi?.createHotspotUiController({
    state,
    linkNoteLabel,
    richEditorSurface,
    previewModal,
    previewModalContent,
    previewModalBody,
    getGroupById,
    getInfoHotspotFrameSize,
    getViewportClampedInfoFrameSize,
    getPreviewModalAnchorOffset,
    getHotspotViewportPoint,
    getScaledInfoFramePositionForViewport,
    isHomePagePreviewMode,
    getSelectedGroupId: () => state.selectedGroupId,
    getProjectScenes: () => state.project?.scenes || [],
    getLinkTargetAllGroups: () => state.linkTargetAllGroups,
    normalizeFloorplanColorKey,
    sanitizeInfoBackgroundTransparencyPercent,
    floorplanColorMap: FLOORPLAN_COLOR_MAP,
    withAlpha,
    defaultInfoBgColorKey: DEFAULT_INFO_BG_COLOR_KEY,
    defaultInfoBgTransparency: DEFAULT_INFO_BG_TRANSPARENCY,
    minInfoFrameWidth: MIN_INFO_FRAME_WIDTH,
    minInfoFrameHeight: MIN_INFO_FRAME_HEIGHT,
  }),
  [
    { label: 'IterpanoEditorHotspotUi', value: window.IterpanoEditorHotspotUi }
  ]
);

runtimeHotspotSidebar = safeCreateRuntimeEditorModule(
  'hotspot-sidebar',
  () => window.IterpanoEditorHotspotSidebar?.createHotspotSidebarController({
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
    getProjectScenes: () => state.project?.scenes || [],
    getSelectedSceneId: () => state.selectedSceneId,
    getPlacementMode: () => placementMode,
    getNewLinkColorKey: () => state.newLinkColorKey,
    getLinkTargetAllGroups: () => state.linkTargetAllGroups,
    normalizeSceneLinkColorKey,
    renderSceneLinkColorOptions,
    updateLinkNoteModeUi,
    formatTargetSceneOptionLabel,
    getSceneLinkBlock,
    getSceneInfoHotspots,
    getSelectedInfoHotspot,
    getInfoHotspotCreateMode: () => infoHotspotCreateMode,
    setInfoHotspotCreateModeState: (nextMode) => {
      infoHotspotCreateMode = nextMode;
    },
    getInfoHotspotEditMode: () => infoHotspotEditMode,
    setInfoHotspotEditModeState: (nextMode) => {
      infoHotspotEditMode = nextMode;
    },
    updateInfoHotspotModeButtons,
    closeRichEditorModal,
    getRichEditorModalVisible: () => richEditorModal?.classList.contains('visible'),
    getInfoHotspotColorKey,
    defaultInfoHotspotColorKey: DEFAULT_INFO_HOTSPOT_COLOR_KEY,
    syncCustomColorSelect,
    normalizeInfoHotspotDisplayMode,
    defaultInfoHotspotDisplayMode: DEFAULT_INFO_HOTSPOT_DISPLAY_MODE,
    isInfoHotspotInteractionModeActive,
    getSceneLinkHotspots,
    getPendingSceneLinkDraft: () => pendingSceneLinkDraft,
    getSelectedHotspotId: () => state.selectedHotspotId,
    scheduleMarkerRender,
  }),
  [
    { label: 'IterpanoEditorHotspotSidebar', value: window.IterpanoEditorHotspotSidebar }
  ]
);

function renderLinkEditor() {
  runtimeHotspotSidebar?.renderLinkEditor();
}

runtimeFloorplanSelection = safeCreateRuntimeEditorModule(
  'floorplan-selection',
  () => window.IterpanoEditorFloorplanSelection?.createFloorplanSelectionController({
    getProjectData: () => state.project,
    getSelectedGroupId: () => state.selectedGroupId,
    getSelectedSceneId: () => state.selectedSceneId,
    getFloorplanSelectAllMode: () => floorplanSelectAllMode,
    normalizeFloorplanColorKey,
  }),
  [
    { label: 'IterpanoEditorFloorplanSelection', value: window.IterpanoEditorFloorplanSelection }
  ]
);

function getFloorplanForGroup(groupId) {
  return runtimeFloorplanSelection?.getFloorplanForGroup(groupId) || null;
}

function getSelectedFloorplan() {
  return runtimeFloorplanSelection?.getSelectedFloorplan() || null;
}

function getSelectedFloorplanNode() {
  return runtimeFloorplanSelection?.getSelectedFloorplanNode() || null;
}

function getSelectedFloorplanNodes() {
  return runtimeFloorplanSelection?.getSelectedFloorplanNodes() || [];
}

function sceneHasGeneratedTiles(scene) {
  return runtimeEditorUtils?.sceneHasGeneratedTiles(scene) || false;
}

function countSceneLinksForScene(scene) {
  return runtimeEditorUtils?.countSceneLinksForScene(scene) || 0;
}

function collectStaticExportWarnings(project) {
  return runtimeEditorUtils?.collectStaticExportWarnings(project) || { missingTiles: [], insufficientLinks: [] };
}

function updateFloorplanDeleteNodeUi() {
  if (!btnFloorplanDeleteNode) return;
  const hasFloorplan = Boolean(getSelectedFloorplan());
  const hasSelectedNodes = getSelectedFloorplanNodes().length > 0;
  btnFloorplanDeleteNode.disabled = !hasFloorplan || !floorplanEditMode || !hasSelectedNodes;
}

function updateFloorplanSelectAllUi() {
  if (!btnFloorplanSelectAll) return;
  const floorplan = getSelectedFloorplan();
  const hasNodes = (floorplan?.nodes || []).length > 0;
  btnFloorplanSelectAll.disabled = !floorplanEditMode || !hasNodes;
  btnFloorplanSelectAll.classList.toggle('active', floorplanSelectAllMode && floorplanEditMode);
  btnFloorplanSelectAll.textContent = floorplanSelectAllMode && floorplanEditMode ? 'All Selected' : 'Select All';
}

function normalizeFloorplanColorKey(key) {
  return runtimeEditorUtils?.normalizeFloorplanColorKey(key) || 'yellow';
}

function getSelectedFloorplanColorKey() {
  return runtimeFloorplanSelection?.getSelectedFloorplanColorKey() || 'yellow';
}

function hexToRgb(hex) {
  return runtimeEditorUtils?.hexToRgb(hex) || { r: 240, g: 200, b: 75 };
}

function rgbToHex(r, g, b) {
  return runtimeEditorUtils?.rgbToHex(r, g, b) || '#f0c84b';
}

function darkenHex(hex, ratio = 0.22) {
  return runtimeEditorUtils?.darkenHex(hex, ratio) || '#b08f35';
}

function withAlpha(hex, alpha = 0.35) {
  return runtimeEditorUtils?.withAlpha(hex, alpha) || 'rgba(240, 200, 75, 0.35)';
}

function getContrastTextColor(hex) {
  return runtimeEditorUtils?.getContrastTextColor(hex) || '#111111';
}

function applyFloorplanNodeColorStyles(nodeElement, colorKey) {
  runtimeFloorplanRender?.applyFloorplanNodeColorStyles(nodeElement, colorKey);
}

function updateFloorplanColorPaletteUi() {
  runtimeFloorplanRender?.updateFloorplanColorPaletteUi();
}

function setSelectedFloorplanColor(colorKey) {
  runtimeFloorplanRender?.setSelectedFloorplanColor(colorKey);
}

function getFloorplanZoom(groupId = state.selectedGroupId) {
  return runtimeFloorplanRender?.getFloorplanZoom(groupId) ?? 1;
}

function getFloorplanImageMetrics(floorplan) {
  return runtimeFloorplanRender?.getFloorplanImageMetrics(floorplan) || null;
}

function setFloorplanImageMetrics(floorplan, width, height) {
  runtimeFloorplanRender?.setFloorplanImageMetrics(floorplan, width, height);
}

function syncFloorplanCanvasSize(canvas, floorplan) {
  runtimeFloorplanRender?.syncFloorplanCanvasSize(canvas, floorplan);
}

function refreshFloorplanCanvasLayout() {
  runtimeFloorplanRender?.refreshFloorplanCanvasLayout();
}

function setFloorplanZoom(nextZoom) {
  runtimeFloorplanRender?.setFloorplanZoom(nextZoom);
}

function zoomFloorplanAt(event, groupId) {
  if (!groupId || !miniMap) return;
  event.preventDefault();
  const oldZoom = getFloorplanZoom(groupId);
  const factor = event.deltaY < 0 ? 1.1 : 0.9;
  const nextZoom = Math.min(8, Math.max(0.5, oldZoom * factor));
  if (Math.abs(nextZoom - oldZoom) < 0.0001) return;

  const rect = miniMap.getBoundingClientRect();
  const anchorX = event.clientX - rect.left;
  const anchorY = event.clientY - rect.top;
  const previousCanvas = miniMap.querySelector('.floorplan-canvas');
  const previousWidth = previousCanvas?.offsetWidth || 1;
  const previousHeight = previousCanvas?.offsetHeight || 1;
  const worldX = miniMap.scrollLeft + anchorX;
  const worldY = miniMap.scrollTop + anchorY;

  setFloorplanZoom(nextZoom);
  requestAnimationFrame(() => {
    const nextCanvas = miniMap.querySelector('.floorplan-canvas');
    const nextWidth = nextCanvas?.offsetWidth || previousWidth;
    const nextHeight = nextCanvas?.offsetHeight || previousHeight;
    const scaleX = nextWidth / previousWidth;
    const scaleY = nextHeight / previousHeight;
    miniMap.scrollLeft = (worldX * scaleX) - anchorX;
    miniMap.scrollTop = (worldY * scaleY) - anchorY;
  });
}

function startFloorplanPan(event) {
  if (floorplanPlaceMode) return;
  if (event.button !== 0 || !miniMap) return;
  if (event.target.closest('.floorplan-node')) return;
  floorplanPanState = {
    x: event.clientX,
    y: event.clientY,
    scrollLeft: miniMap.scrollLeft,
    scrollTop: miniMap.scrollTop
  };
  miniMap.classList.add('is-panning');
  window.addEventListener('mousemove', handleFloorplanPanMove);
  window.addEventListener('mouseup', stopFloorplanPan);
  event.preventDefault();
}

function handleFloorplanPanMove(event) {
  if (!floorplanPanState || !miniMap) return;
  const dx = event.clientX - floorplanPanState.x;
  const dy = event.clientY - floorplanPanState.y;
  miniMap.scrollLeft = floorplanPanState.scrollLeft - dx;
  miniMap.scrollTop = floorplanPanState.scrollTop - dy;
}

function stopFloorplanPan() {
  floorplanPanState = null;
  if (miniMap) {
    miniMap.classList.remove('is-panning');
  }
  window.removeEventListener('mousemove', handleFloorplanPanMove);
  window.removeEventListener('mouseup', stopFloorplanPan);
}

runtimeFloorplanModes = safeCreateRuntimeEditorModule(
  'floorplan-modes',
  () => window.IterpanoEditorFloorplanModes?.createFloorplanModesController({
    btnFloorplanPlaceScene,
    btnFloorplanEdit,
    btnFloorplanSelectAll,
    btnFloorplanToggleLabels,
    btnFloorplanToggleAliases,
    miniMap,
    getFloorplanShowLabels: () => floorplanShowLabels,
    setFloorplanShowLabelsState: (nextMode) => {
      floorplanShowLabels = nextMode;
    },
    getFloorplanShowAliases: () => floorplanShowAliases,
    setFloorplanShowAliasesState: (nextMode) => {
      floorplanShowAliases = nextMode;
    },
    getFloorplanPlaceMode: () => floorplanPlaceMode,
    setFloorplanPlaceModeState: (nextMode) => {
      floorplanPlaceMode = nextMode;
    },
    getFloorplanEditMode: () => floorplanEditMode,
    setFloorplanEditModeState: (nextMode) => {
      floorplanEditMode = nextMode;
    },
    getFloorplanSelectAllMode: () => floorplanSelectAllMode,
    setFloorplanSelectAllModeState: (nextMode) => {
      floorplanSelectAllMode = nextMode;
    },
    getSelectedFloorplan,
    stopFloorplanPan,
    updateFloorplanColorPaletteUi,
    updateFloorplanDeleteNodeUi,
    updateFloorplanSelectAllUi,
    renderFloorplans,
    updateStatus,
  }),
  [
    { label: 'IterpanoEditorFloorplanModes', value: window.IterpanoEditorFloorplanModes }
  ]
);

runtimeFloorplanActions = safeCreateRuntimeEditorModule(
  'floorplan-actions',
  () => window.IterpanoEditorFloorplanActions?.createFloorplanActionsController({
    miniMap,
    getSelectedScene,
    getSelectedFloorplan,
    getSelectedSceneId: () => state.selectedSceneId,
    getFloorplanEditMode: () => floorplanEditMode,
    getFloorplanPlaceMode: () => floorplanPlaceMode,
    getFloorplanSelectAllMode: () => floorplanSelectAllMode,
    setFloorplanSelectAllModeState: (nextMode) => {
      floorplanSelectAllMode = nextMode;
    },
    getFloorplanColorValue: () => floorplanColorSelect?.value,
    normalizeFloorplanColorKey,
    renderFloorplans,
    autosave,
    updateStatus,
    selectScene,
    zoomFloorplanAt,
    startFloorplanPan,
  }),
  [
    { label: 'IterpanoEditorFloorplanActions', value: window.IterpanoEditorFloorplanActions },
    { label: 'miniMap', value: miniMap }
  ]
);

runtimeFloorplanRender = safeCreateRuntimeEditorModule(
  'floorplan-render',
  () => window.IterpanoEditorFloorplanRender?.createFloorplanRenderController({
    miniMap,
    btnFloorplanPlaceScene,
    btnFloorplanEdit,
    btnFloorplanSelectAll,
    btnFloorplanDeleteNode,
    btnFloorplanToggleLabels,
    btnFloorplanToggleAliases,
    btnFloorplanZoomReset,
    btnFloorplanZoomOut,
    btnFloorplanZoomIn,
    floorplanColorSelect,
    state,
    FLOORPLAN_COLOR_MAP,
    colorLabelFromKey,
    floorplanZoomByGroup,
    floorplanImageMetricsById,
    normalizeFloorplanColorKey,
    getSelectedGroup,
    getSelectedScene,
    getSelectedFloorplan,
    getSelectedFloorplanNodes,
    getSelectedFloorplanColorKey,
    getFloorplanPlaceMode: () => floorplanPlaceMode,
    getFloorplanEditMode: () => floorplanEditMode,
    getFloorplanSelectAllMode: () => floorplanSelectAllMode,
    getFloorplanShowLabels: () => floorplanShowLabels,
    getFloorplanShowAliases: () => floorplanShowAliases,
    setFloorplanPlaceMode,
    setFloorplanEditMode,
    updateFloorplanLabelToggleUi,
    updateFloorplanDeleteNodeUi,
    updateFloorplanSelectAllUi,
    stopFloorplanPan,
    autosave,
    updateStatus,
    getSceneName,
    getSceneAlias,
    getRuntimeFloorplanActions: () => runtimeFloorplanActions,
  }),
  [
    { label: 'IterpanoEditorFloorplanRender', value: window.IterpanoEditorFloorplanRender },
    { label: 'miniMap', value: miniMap }
  ]
);

function updateFloorplanLabelToggleUi() {
  runtimeFloorplanModes?.updateFloorplanLabelToggleUi();
}

function setFloorplanShowLabels(nextMode) {
  runtimeFloorplanModes?.setFloorplanShowLabels(nextMode);
}

function setFloorplanShowAliases(nextMode) {
  runtimeFloorplanModes?.setFloorplanShowAliases(nextMode);
}

function updateFloorplanPlaceUi() {
  runtimeFloorplanModes?.updateFloorplanPlaceUi();
}

function updateFloorplanEditUi() {
  runtimeFloorplanModes?.updateFloorplanEditUi();
}

function setFloorplanSelectAllMode(nextMode, { silent = false } = {}) {
  runtimeFloorplanModes?.setFloorplanSelectAllMode(nextMode, { silent });
}

function setFloorplanPlaceMode(nextMode) {
  runtimeFloorplanModes?.setFloorplanPlaceMode(nextMode);
}

function setFloorplanEditMode(nextMode) {
  runtimeFloorplanModes?.setFloorplanEditMode(nextMode);
}

function updateMapWindowBounds() {
  runtimeEditorUi?.updateMapWindowBounds();
}

function setFloorplanMapWindowOpen(nextMode) {
  runtimeEditorUi?.setFloorplanMapWindowOpen(nextMode);
}

function selectScene(sceneId) {
  runtimeSceneActions?.selectScene(sceneId);
}

function handleSceneMultiSelectClick(sceneId, event, scenesInGroup) {
  const sceneIds = scenesInGroup.map((scene) => scene.id);
  let selected = new Set((state.multiSelectedSceneIds || []).filter((id) => sceneIds.includes(id)));
  if (!selected.size && state.selectedSceneId && sceneIds.includes(state.selectedSceneId)) {
    selected.add(state.selectedSceneId);
  }

  const withCtrl = Boolean(event.ctrlKey || event.metaKey);
  if (event.shiftKey) {
    const anchor = sceneIds.includes(state.sceneSelectionAnchorId)
      ? state.sceneSelectionAnchorId
      : (sceneIds.includes(state.selectedSceneId) ? state.selectedSceneId : sceneId);
    const anchorIndex = sceneIds.indexOf(anchor);
    const currentIndex = sceneIds.indexOf(sceneId);
    if (anchorIndex !== -1 && currentIndex !== -1) {
      const [start, end] = anchorIndex <= currentIndex
        ? [anchorIndex, currentIndex]
        : [currentIndex, anchorIndex];
      const rangeIds = sceneIds.slice(start, end + 1);
      selected = withCtrl ? new Set([...selected, ...rangeIds]) : new Set(rangeIds);
      state.sceneSelectionAnchorId = anchor;
    }
  } else if (withCtrl) {
    if (selected.has(sceneId)) {
      selected.delete(sceneId);
    } else {
      selected.add(sceneId);
    }
    state.sceneSelectionAnchorId = sceneId;
  }

  state.multiSelectedSceneIds = Array.from(selected);
  renderSceneList();
  renderFloorplans();
  const count = state.multiSelectedSceneIds.length;
  updateStatus(count ? `${count} scene(s) selected.` : 'No scene selected for batch actions.');
}

function renderSceneGroupOptions() {
  runtimeSceneSidebar?.renderSceneGroupOptions();
}

function renderSceneList() {
  runtimeSceneSidebar?.renderSceneList();
}

function renameScene(scene, newValue, mode = 'name') {
  if (mode === 'alias') {
    scene.alias = String(newValue || '').trim();
    renderSceneList();
    scheduleMarkerRender();
    autosave();
    return;
  }
  scene.name = (newValue || '').trim() || 'Untitled Scene';
  if (scene.id === state.selectedSceneId) {
    updateSceneTitle();
  }
  renderSceneList();
  scheduleMarkerRender();
  autosave();
}

function startInlineSceneRename(scene, listButton) {
  if (!scene || !listButton) return;
  if (renamingSceneId && renamingSceneId !== scene.id) {
    renamingSceneId = null;
    renderSceneList();
  }
  renamingSceneId = scene.id;
  listButton.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  const renameMode = state.sceneLabelMode === 'alias' ? 'alias' : 'name';
  input.value = renameMode === 'alias' ? (scene.alias || '') : (scene.name || '');
  input.className = 'input';
  input.style.width = '100%';
  listButton.appendChild(input);
  input.focus();
  input.select();

  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    renamingSceneId = null;
    renameScene(scene, input.value, renameMode);
  };
  const cancel = () => {
    if (committed) return;
    committed = true;
    renamingSceneId = null;
    renderSceneList();
  };

  input.addEventListener('click', (event) => event.stopPropagation());
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  });
  input.addEventListener('blur', commit);
}

function initEditorViewer(project) {
  if (!window.Marzipano || !panoEditor) {
    return;
  }

  if (!editorViewer) {
    editorViewer = createEditorViewer(project);
    panoEditor.addEventListener('click', handleViewerClick);
    viewerCanvas.addEventListener('click', handleViewerClick);
    viewerCanvas.addEventListener('dblclick', handleViewerDoubleClick);
    viewerCanvas.addEventListener('mousemove', handleViewerMouseMove);
    viewerCanvas.addEventListener('mouseleave', hideHotspotHoverCard);
    viewerCanvas.addEventListener('pointerdown', onViewerPointerDown, true);
    viewerCanvas.addEventListener('pointerup', onViewerPointerUp, true);
    window.addEventListener('resize', scheduleMarkerRender);
    startMarkerLoop();
  }

  refreshEditorScenes();
}

function createEditorViewer(project) {
  return new Marzipano.Viewer(panoEditor, {
    controls: {
      mouseViewMode: project.settings?.mouseViewMode || 'drag'
    }
  });
}

function resetEditorViewer() {
  updateStatus('Viewer reset requested. Please refresh the page if preview fails.');
}

function refreshEditorScenes() {
  if (!editorViewer || !state.project) return;
  state.project.scenes.forEach((sceneData) => {
    const preview = buildScenePreview(sceneData);
    if (!preview) {
      return;
    }

    const signature = getSceneSignature(sceneData);
    const existing = editorScenes.get(sceneData.id);
    if (existing && existing.signature === signature) {
      existing.data = sceneData;
      return;
    }

    const view = new Marzipano.RectilinearView(
      sceneData.initialViewParameters || { yaw: 0, pitch: 0, fov: 1.4 },
      preview.limiter
    );
    const scene = editorViewer.createScene({
      source: preview.source,
      geometry: preview.geometry,
      view,
      pinFirstLevel: true
    });
    editorScenes.set(sceneData.id, { scene, view, data: sceneData, signature });
  });

  scheduleMarkerRender();
}

function getSceneSignature(sceneData) {
  const src = sceneData?.sourceImage?.dataUrl || '';
  const srcHead = src.slice(0, 128);
  const srcTail = src.slice(-128);
  const tilesPath = sceneData?.tilesPath || '';
  const previewPath = sceneData?.previewPath || '';
  const levels = JSON.stringify(sceneData?.levels || []);
  return `${src.length}|${srcHead}|${srcTail}|${tilesPath}|${previewPath}|${levels}`;
}

function buildScenePreview(sceneData) {
  if (sceneData?.sourceImage?.dataUrl) {
    const width = sceneData.sourceImage.width || sceneData.faceSize || 4096;
    return {
      source: Marzipano.ImageUrlSource.fromString(sceneData.sourceImage.dataUrl),
      geometry: new Marzipano.EquirectGeometry([{ width }]),
      limiter: Marzipano.RectilinearView.limit.traditional(width, Math.PI, Math.PI)
    };
  }

  const levels = (sceneData.levels || []).filter((level) => level.size && level.tileSize);
  const hasSelectable = levels.some((level) => !level.fallbackOnly);
  if (levels.length === 0 || !hasSelectable) {
    return null;
  }

  const tilesPath = sceneData.tilesPath || `tiles/${sceneData.id}`;
  const previewPath = sceneData.previewPath || `${tilesPath}/preview.jpg`;
  return {
    source: Marzipano.ImageUrlSource.fromString(
      `${tilesPath}/{z}/{f}/{y}/{x}.jpg`,
      { cubeMapPreviewUrl: previewPath }
    ),
    geometry: new Marzipano.CubeGeometry(levels),
    limiter: Marzipano.RectilinearView.limit.traditional(sceneData.faceSize || 2048, Math.PI, Math.PI)
  };
}

function switchEditorScene() {
  hideHotspotHoverCard();
  const selected = editorScenes.get(state.selectedSceneId);
  if (!selected) {
    viewerPlaceholder.style.display = 'block';
    panoEditor.style.visibility = 'hidden';
    clearHotspotMarkerElements();
    return;
  }

  panoEditor.style.visibility = 'visible';
  viewerPlaceholder.style.display = 'none';
  if (suppressSceneSwitch) {
    return;
  }
  try {
    selected.view.setParameters(selected.data.initialViewParameters || { yaw: 0, pitch: 0, fov: 1.4 });
    selected.scene.switchTo();
  } catch (error) {
    console.warn('Viewer switch failed:', error);
    if (String(error?.message || '').includes('Stage not in sync')) {
      updateStatus('Viewer sync error. Reload the page if preview disappears.');
    }
  }
  scheduleMarkerRender();
}

function handleViewerClick(event) {
  if (suppressNextViewerClick) {
    suppressNextViewerClick = false;
    return;
  }

  if (!state.project) {
    return;
  }
  const hasPendingLink = Boolean(
    pendingSceneLinkDraft &&
    pendingSceneLinkDraft.sceneId === state.selectedSceneId
  );
  if (!state.selectedHotspotId && placementMode && !hasPendingLink) {
    updateStatus('Select a hotspot first.');
    return;
  }
  const active = editorScenes.get(state.selectedSceneId);
  if (!active) return;

  const viewPoint = getViewPointFromEvent(event);
  if (!viewPoint) return;
  const { x, y } = viewPoint;

  if (!placementMode) {
    if (isInfoHotspotInteractionModeActive() || richEditorModal?.classList.contains('visible')) {
      return;
    }
    const markerHit = findMarkerAtScreen(event.clientX, event.clientY, 12);
    if (markerHit) {
      openHotspotPreviewOrFollowLink(markerHit);
      return;
    }
    const hotspot = findHotspotAtScreen(x, y, active, 10);
    if (hotspot) {
      openHotspotPreviewOrFollowLink(hotspot.id);
    }
    return;
  }

  if (hasPendingLink) {
    updateStatus('Double-click on the panorama to place the new link.');
    return;
  }

  const linkHotspot = getSelectedLinkHotspot();
  if (linkHotspot) {
    updateStatus('Drag the selected link marker or double-click on panorama to move it.');
    return;
  }
  const infoHotspot = getSelectedInfoHotspot();
  if (infoHotspot) {
    updateStatus('Drag the selected info hotspot or double-click on panorama to move it.');
    return;
  }
  updateStatus('Select a link or info hotspot first.');
}

function handleViewerDoubleClick(event) {
  if (!state.project) return;
  const active = editorScenes.get(state.selectedSceneId);
  if (!active) return;

  const viewPoint = getViewPointFromEvent(event);
  if (!viewPoint) return;
  const coords = active.view.screenToCoordinates(viewPoint, {});
  if (!coords || typeof coords.yaw !== 'number' || typeof coords.pitch !== 'number') return;

  const hasPendingLink = Boolean(
    pendingSceneLinkDraft &&
    pendingSceneLinkDraft.sceneId === state.selectedSceneId
  );

  if (hasPendingLink) {
    if (!placementMode) {
      updateStatus('Enable Edit to place the new scene link.');
      return;
    }
    commitPendingSceneLinkAt(coords, { statusMessage: 'Link created and placed.' });
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (infoHotspotCreateMode) {
    createInfoHotspotAt(coords);
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (infoHotspotEditMode) {
    const hotspot = getSelectedInfoHotspot();
    if (!hotspot) {
      updateStatus('Select an info hotspot first, then double-click to move it.');
      return;
    }
    hotspot.yaw = coords.yaw;
    hotspot.pitch = coords.pitch;
    autosave();
    scheduleMarkerRender();
    updateStatus(`Info hotspot ${hotspot.title || hotspot.id} moved.`);
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const hotspot = placementMode ? getSelectedLinkHotspot() : null;
  if (!hotspot) {
    updateStatus(
      placementMode
        ? 'Select a link first, then double-click to move it.'
        : 'No active edit mode. Enable New or Edit for info hotspots.'
    );
    return;
  }

  hotspot.yaw = coords.yaw;
  hotspot.pitch = coords.pitch;
  autosave();
  scheduleMarkerRender();
  updateStatus(`Link ${hotspot.linkCode || hotspot.title || hotspot.id} moved.`);
  event.preventDefault();
  event.stopPropagation();
}

function commitPendingSceneLinkAt(coords, { statusMessage = 'Link created and placed.' } = {}) {
  const draft = pendingSceneLinkDraft;
  const scene = getSelectedScene();
  if (!draft || !scene || draft.sceneId !== scene.id) return false;
  if (!coords || typeof coords.yaw !== 'number' || typeof coords.pitch !== 'number') return false;

  const hotspot = createHotspotRecord(
    draft.linkCode,
    [{
      type: 'scene',
      sceneId: draft.targetSceneId || '',
      comment: draft.comment || ''
    }],
    {
      linkCode: draft.linkCode,
      linkColorKey: normalizeSceneLinkColorKey(draft.linkColorKey || state.newLinkColorKey)
    }
  );
  hotspot.yaw = coords.yaw;
  hotspot.pitch = coords.pitch;
  scene.hotspots.push(hotspot);
  state.selectedHotspotId = hotspot.id;
  clearPendingSceneLinkDraft(false);
  renderHotspotList();
  renderLinkEditor();
  renderContentBlocks();
  renderFloorplans();
  updateStatus(statusMessage);
  autosave();
  scheduleMarkerRender();
  return true;
}

function onViewerPointerDown(event) {
  if (!event.isPrimary || event.button !== 0) return;
  viewerPointerDown = { x: event.clientX, y: event.clientY };
}

function onViewerPointerUp(event) {
  if (!event.isPrimary || event.button !== 0) return;
  if (!viewerPointerDown) return;
  const dx = event.clientX - viewerPointerDown.x;
  const dy = event.clientY - viewerPointerDown.y;
  const moved = Math.hypot(dx, dy);
  viewerPointerDown = null;
  if (moved > 5) {
    suppressNextViewerClick = true;
    return;
  }

  if (!placementMode && !isInfoHotspotInteractionModeActive()) {
    if (richEditorModal?.classList.contains('visible')) {
      return;
    }
    const markerHit = findMarkerAtScreen(event.clientX, event.clientY, 16);
    if (markerHit) {
      openHotspotPreviewOrFollowLink(markerHit);
      suppressNextViewerClick = true;
    }
  }
}

function getHotspotSceneLinkTarget(hotspot) {
  if (!hotspot) return null;
  const block = (hotspot.contentBlocks || []).find((item) => item.type === 'scene' && item.sceneId);
  if (!block) return null;
  return state.project?.scenes?.find((scene) => scene.id === block.sceneId) || null;
}

function getSceneLinkDisplayName(hotspot, targetScene = null) {
  const sceneAlias = String(targetScene?.alias || '').trim();
  if (sceneAlias) return sceneAlias;
  return targetScene?.name || targetScene?.id || 'Unassigned target';
}

function clearQuickPreviewTimers() {
  if (quickPreviewOpenTimer) {
    clearTimeout(quickPreviewOpenTimer);
    quickPreviewOpenTimer = null;
  }
  if (quickPreviewCloseTimer) {
    clearTimeout(quickPreviewCloseTimer);
    quickPreviewCloseTimer = null;
  }
}

function cancelQuickPreviewClose() {
  if (quickPreviewCloseTimer) {
    clearTimeout(quickPreviewCloseTimer);
    quickPreviewCloseTimer = null;
  }
}

function scheduleQuickPreviewClose() {
  cancelQuickPreviewClose();
  quickPreviewCloseTimer = setTimeout(() => {
    quickPreviewCloseTimer = null;
    if (!quickPreviewHoverMarkerId && !quickPreviewHoverModal && quickPreviewOpenHotspotId) {
      closeHotspotPreview();
    }
  }, 120);
}

function maybeOpenQuickInfoPreview(hotspotId) {
  const scene = getSelectedScene();
  const hotspot = scene?.hotspots?.find((item) => item.id === hotspotId) || null;
  if (
    !hotspot ||
    !isQuickInfoHotspot(hotspot) ||
    placementMode ||
    isInfoHotspotInteractionModeActive() ||
    homePageEditMode ||
    richEditorModal?.classList.contains('visible')
  ) {
    return;
  }
  cancelQuickPreviewClose();
  if (quickPreviewOpenHotspotId === hotspotId && previewModal?.classList.contains('visible')) {
    return;
  }
  if (quickPreviewOpenTimer) {
    clearTimeout(quickPreviewOpenTimer);
  }
  quickPreviewOpenTimer = setTimeout(() => {
    quickPreviewOpenTimer = null;
    const currentScene = getSelectedScene();
    const currentHotspot = currentScene?.hotspots?.find((item) => item.id === hotspotId) || null;
    if (!currentHotspot || !isQuickInfoHotspot(currentHotspot) || quickPreviewHoverMarkerId !== hotspotId) {
      return;
    }
    openHotspotPreview(hotspotId);
  }, 120);
}

function openHotspotPreviewOrFollowLink(hotspotId) {
  const scene = getSelectedScene();
  const hotspot = scene?.hotspots?.find((item) => item.id === hotspotId) || null;
  if (!hotspot) return;
  hideHotspotHoverCard();
  const targetScene = getHotspotSceneLinkTarget(hotspot);
  if (targetScene) {
    selectScene(targetScene.id);
    updateStatus(`Go to "${getSceneLinkDisplayName(hotspot, targetScene)}".`);
    return;
  }
  openHotspotPreview(hotspotId);
}

function findHotspotAtScreen(x, y, active, radius) {
  const scene = getSelectedScene();
  if (!scene) return null;
  const viewWidth = active.view.width();
  const viewHeight = active.view.height();
  const scale = getViewScale(active);
  let closest = null;
  let closestDist = radius * radius;
  const markerOffsetY = -5;

  scene.hotspots.forEach((hotspot) => {
    const coords = active.view.coordinatesToScreen({ yaw: hotspot.yaw, pitch: hotspot.pitch }, {});
    if (!coords || coords.x === null || coords.y === null) return;
    if (coords.x < 0 || coords.y < 0 || coords.x > viewWidth || coords.y > viewHeight) return;
    const cssX = coords.x / scale.x;
    const cssY = coords.y / scale.y + markerOffsetY;
    const dx = cssX - x;
    const dy = cssY - y;
    const dist = dx * dx + dy * dy;
    if (dist <= closestDist) {
      closest = hotspot;
      closestDist = dist;
    }
  });

  return closest;
}

function getLinkHoverDetails(hotspotId) {
  const scene = getSelectedScene();
  if (!scene) return null;
  const hotspot = (scene.hotspots || []).find((item) => item.id === hotspotId) || null;
  if (!hotspot || !isSceneLinkHotspot(hotspot)) return null;
  const targetScene = getHotspotSceneLinkTarget(hotspot);
  const sceneBlock = getSceneLinkBlock(hotspot);
  const targetSceneName = (targetScene?.name || targetScene?.id || 'Unassigned target').trim();
  return {
    linkName: hotspot.linkCode || hotspot.title || hotspot.id,
    linkColor: getSceneLinkColorHex(hotspot.linkColorKey),
    targetSceneName,
    targetName: getSceneLinkDisplayName(hotspot, targetScene),
    comment: (sceneBlock?.comment || '').trim()
  };
}

function positionHoverCard(clientX, clientY) {
  if (!hotspotHoverCard || hotspotHoverCard.getAttribute('aria-hidden') === 'true') return;
  const rect = viewerCanvas.getBoundingClientRect();
  const margin = 8;
  const offset = 14;
  const cardWidth = hotspotHoverCard.offsetWidth || 220;
  const cardHeight = hotspotHoverCard.offsetHeight || 72;
  let x = clientX - rect.left + offset;
  let y = clientY - rect.top + offset;

  if (x + cardWidth + margin > rect.width) {
    x = rect.width - cardWidth - margin;
  }
  if (y + cardHeight + margin > rect.height) {
    y = rect.height - cardHeight - margin;
  }
  x = Math.max(margin, x);
  y = Math.max(margin, y);

  hotspotHoverCard.style.left = `${x}px`;
  hotspotHoverCard.style.top = `${y}px`;
}

function showHotspotHoverCard(hotspotId, event) {
  if (!hotspotHoverCard) return;
  const details = getLinkHoverDetails(hotspotId);
  if (!details) {
    hideHotspotHoverCard();
    return;
  }

  hoveredLinkHotspotId = hotspotId;
  hotspotHoverCard.style.setProperty('--hover-link-color', details.linkColor || getSceneLinkColorHex('yellow'));
  const commentHtml = details.comment
    ? `<div class="hover-card-comment">${escapeHtml(details.comment)}</div>`
    : '';
  hotspotHoverCard.innerHTML = `
    <div class="hover-card-title">
      <span class="hover-card-link-code">${escapeHtml(details.linkName)}</span>
      <span class="hover-card-scene-name">${escapeHtml(details.targetSceneName)}</span>
    </div>
    <div class="hover-card-target">Go to ${escapeHtml(details.targetName)}</div>
    ${commentHtml}
  `;
  hotspotHoverCard.setAttribute('aria-hidden', 'false');
  hotspotHoverCard.classList.add('visible');
  positionHoverCard(event.clientX, event.clientY);
}

function hideHotspotHoverCard() {
  hoveredLinkHotspotId = null;
  if (!hotspotHoverCard) return;
  hotspotHoverCard.setAttribute('aria-hidden', 'true');
  hotspotHoverCard.classList.remove('visible');
}

function handleViewerMouseMove(event) {
  if (!viewerCanvas || !state.selectedSceneId || draggingHotspotId) {
    hideHotspotHoverCard();
    return;
  }

  const markerHit = findMarkerAtScreen(event.clientX, event.clientY, 16);
  if (!markerHit) {
    hideHotspotHoverCard();
    return;
  }

  if (hoveredLinkHotspotId !== markerHit) {
    showHotspotHoverCard(markerHit, event);
    return;
  }

  positionHoverCard(event.clientX, event.clientY);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clearHotspotMarkerElements() {
  hotspotMarkerElements.forEach((marker) => marker.remove());
  hotspotMarkerElements.clear();
  hotspotMarkerSceneId = null;
  lastMarkerRenderSignature = null;
  if (hotspotOverlay) {
    hotspotOverlay.innerHTML = '';
  }
}

function makeMarkerRenderSignature(scene, active) {
  if (!scene || !active) return '';
  const params = active.view?.parameters ? active.view.parameters() : active.data?.initialViewParameters || {};
  const yaw = Number(params.yaw || 0).toFixed(4);
  const pitch = Number(params.pitch || 0).toFixed(4);
  const fov = Number(params.fov || 1.4).toFixed(4);
  const previewHotspotId = previewModal?.classList.contains('visible') ? (previewHotspotContext?.hotspotId || '') : '';
  return `${scene.id}|${state.selectedHotspotId || ''}|${previewHotspotId}|${yaw}|${pitch}|${fov}`;
}

function buildHotspotMarkerElement(hotspotId) {
  const marker = document.createElement('div');
  marker.className = 'hotspot-marker';
  marker.dataset.hotspotId = hotspotId;
  marker.addEventListener('pointerdown', (event) => startMarkerDrag(event, hotspotId));
  marker.addEventListener('mouseenter', () => {
    quickPreviewHoverMarkerId = hotspotId;
    maybeOpenQuickInfoPreview(hotspotId);
  });
  marker.addEventListener('mouseleave', () => {
    if (quickPreviewHoverMarkerId === hotspotId) {
      quickPreviewHoverMarkerId = null;
    }
    scheduleQuickPreviewClose();
  });
  hotspotOverlay.appendChild(marker);
  hotspotMarkerElements.set(hotspotId, marker);
  return marker;
}

function updateHotspotMarkerElement(marker, hotspot, active, scale) {
  const coords = active.view.coordinatesToScreen({ yaw: hotspot.yaw, pitch: hotspot.pitch }, {});
  const viewWidth = active.view.width();
  const viewHeight = active.view.height();
  if (!coords || coords.x === null || coords.y === null || coords.x < 0 || coords.y < 0 || coords.x > viewWidth || coords.y > viewHeight) {
    marker.style.display = 'none';
    return;
  }

  marker.style.display = '';
  const isSceneLink = isSceneLinkHotspot(hotspot);
  const isPreviewOpenForHotspot = Boolean(
    previewModal?.classList.contains('visible') &&
    previewHotspotContext?.hotspotId === hotspot.id
  );
  marker.className = `hotspot-marker${isSceneLink ? ' scene-link-marker' : ' info-hotspot-marker'}${hotspot.id === state.selectedHotspotId ? ' active' : ''}${isPreviewOpenForHotspot ? ' preview-open' : ''}`;
  if (isSceneLink) {
    const linkColor = getSceneLinkColorHex(hotspot.linkColorKey);
    marker.style.setProperty('--scene-link-color', linkColor);
    marker.style.setProperty('--scene-link-border', darkenHex(linkColor, 0.24));
    marker.style.setProperty('--scene-link-ring', withAlpha(linkColor, 0.35));
    marker.style.setProperty('--marker-active-ring', withAlpha(linkColor, 0.25));
    marker.style.setProperty('--marker-active-glow', withAlpha(linkColor, 0.7));
  } else {
    const markerColor = FLOORPLAN_COLOR_MAP[getInfoHotspotColorKey(hotspot)] || FLOORPLAN_COLOR_MAP[DEFAULT_INFO_HOTSPOT_COLOR_KEY];
    marker.style.setProperty('--info-hotspot-color', markerColor);
    marker.style.setProperty('--info-hotspot-border', darkenHex(markerColor, 0.28));
    marker.style.setProperty('--marker-active-ring', withAlpha(markerColor, 0.25));
    marker.style.setProperty('--marker-active-glow', withAlpha(markerColor, 0.7));
    marker.style.removeProperty('--scene-link-color');
    marker.style.removeProperty('--scene-link-border');
    marker.style.removeProperty('--scene-link-ring');
  }
  marker.style.left = `${coords.x / scale.x}px`;
  marker.style.top = `${coords.y / scale.y - 5}px`;
  const linkTarget = getHotspotSceneLinkTarget(hotspot);
  marker.title = linkTarget ? `Go to "${getSceneLinkDisplayName(hotspot, linkTarget)}"` : (hotspot.title || hotspot.id);
}

function scheduleMarkerRender() {
  if (!hotspotOverlay) return;
  if (markerFrame) return;
  markerFrame = requestAnimationFrame(() => {
    markerFrame = null;
    renderHotspotMarkers(true);
  });
}

function startMarkerLoop() {
  if (markerLoopId) return;
  const loop = () => {
    markerLoopId = requestAnimationFrame(loop);
    renderHotspotMarkers();
  };
  markerLoopId = requestAnimationFrame(loop);
}

function renderHotspotMarkers(force = false) {
  if (!hotspotOverlay) return;
  const scene = getSelectedScene();
  const active = editorScenes.get(state.selectedSceneId);
  if (!scene || !active) {
    clearHotspotMarkerElements();
    return;
  }

  if (hotspotMarkerSceneId !== scene.id) {
    clearHotspotMarkerElements();
    hotspotMarkerSceneId = scene.id;
  }

  const renderSignature = makeMarkerRenderSignature(scene, active);
  if (!force && renderSignature === lastMarkerRenderSignature && !draggingHotspotId) {
    return;
  }
  lastMarkerRenderSignature = renderSignature;

  const scale = getViewScale(active);
  const sceneHotspotIds = new Set((scene.hotspots || []).map((hotspot) => hotspot.id));
  sceneHotspotIds.forEach((hotspotId) => {
    if (!hotspotMarkerElements.has(hotspotId)) {
      buildHotspotMarkerElement(hotspotId);
    }
  });

  hotspotMarkerElements.forEach((marker, hotspotId) => {
    if (!sceneHotspotIds.has(hotspotId)) {
      marker.remove();
      hotspotMarkerElements.delete(hotspotId);
      return;
    }
    const hotspot = scene.hotspots.find((item) => item.id === hotspotId);
    if (!hotspot) return;
    updateHotspotMarkerElement(marker, hotspot, active, scale);
  });
}

function startMarkerDrag(event, hotspotId) {
  if (!event.isPrimary || event.button !== 0) return;
  const scene = getSelectedScene();
  const hotspot = scene?.hotspots?.find((item) => item.id === hotspotId) || null;
  if (!hotspot) return;
  const canDrag = isSceneLinkHotspot(hotspot)
    ? placementMode
    : isInfoHotspotInteractionModeActive();
  if (!canDrag) return;
  event.preventDefault();
  event.stopPropagation();
  if (state.selectedHotspotId !== hotspotId) {
    state.selectedHotspotId = hotspotId;
    renderHotspotList();
    renderLinkEditor();
    renderContentBlocks();
    scheduleMarkerRender();
  }
  draggingHotspotId = hotspotId;
  dragMoved = false;
  dragPointerId = event.pointerId;
  hotspotOverlay.setPointerCapture(event.pointerId);
  hotspotOverlay.addEventListener('pointermove', handleMarkerDrag);
  hotspotOverlay.addEventListener('pointerup', stopMarkerDrag);
  hotspotOverlay.addEventListener('pointercancel', stopMarkerDrag);
}

function handleMarkerDrag(event) {
  if (!draggingHotspotId || event.pointerId !== dragPointerId) return;
  const active = editorScenes.get(state.selectedSceneId);
  if (!active) return;
  const viewPoint = getViewPointFromEvent(event);
  if (!viewPoint) return;
  const coords = active.view.screenToCoordinates(viewPoint, {});
  if (!coords || typeof coords.yaw !== 'number' || typeof coords.pitch !== 'number') return;
  const scene = getSelectedScene();
  const hotspot = scene?.hotspots.find((h) => h.id === draggingHotspotId);
  if (!hotspot) return;
  hotspot.yaw = coords.yaw;
  hotspot.pitch = coords.pitch;
  dragMoved = true;
  scheduleMarkerRender();
}

function stopMarkerDrag(event) {
  if (event.pointerId !== dragPointerId) return;
  hotspotOverlay.releasePointerCapture(event.pointerId);
  hotspotOverlay.removeEventListener('pointermove', handleMarkerDrag);
  hotspotOverlay.removeEventListener('pointerup', stopMarkerDrag);
  hotspotOverlay.removeEventListener('pointercancel', stopMarkerDrag);
  const draggedId = draggingHotspotId;
  if (draggedId && dragMoved) {
    autosave();
    updateStatus('Hotspot position updated.');
  } else if (draggedId) {
    const scene = getSelectedScene();
    const hotspot = scene?.hotspots?.find((item) => item.id === draggedId) || null;
    if (hotspot) {
      state.selectedHotspotId = draggedId;
      renderHotspotList();
      renderLinkEditor();
      renderContentBlocks();
      const hotspotLabel = isSceneLinkHotspot(hotspot) ? 'Link' : 'Info hotspot';
      updateStatus(`${hotspotLabel} ${hotspot.linkCode || hotspot.title || hotspot.id} selected.`);
    }
  }
  draggingHotspotId = null;
  dragPointerId = null;
  setTimeout(() => {
    dragMoved = false;
  }, 0);
}

function openHotspotPreview(hotspotId) {
  const scene = getSelectedScene();
  const hotspot = scene?.hotspots.find((h) => h.id === hotspotId) || null;
  if (!hotspot || !previewModal) return;
  quickPreviewOpenHotspotId = isQuickInfoHotspot(hotspot) ? hotspot.id : null;
  previewHotspotContext = null;
  btnHomePagePreviewStart?.classList.add('hidden');

  previewModalTitle.textContent = hotspot.title || 'Hotspot';
  previewModalBody.innerHTML = '';
  previewModal.classList.remove('preview-modal-rich-like');
  previewModal.classList.remove('home-page-preview-mode');
  previewModalContent?.classList.remove('modal-content-rich-preview');
  previewModalBody.classList.remove('preview-rich-surface');
  previewModalBody.removeAttribute('contenteditable');
  resetPreviewModalFrameSize();
  previewModalBody.style.removeProperty('background-color');

  if (isInfoHotspot(hotspot)) {
    previewHotspotContext = {
      sceneId: scene.id,
      hotspotId: hotspot.id,
      anchorOffset: getInfoHotspotFrameAnchorOffset(hotspot) || normalizeInfoFrameAnchorOffset({
        offsetX: DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_X,
        offsetY: DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_Y
      })
    };
    previewModal.classList.add('preview-modal-rich-like');
    previewModalContent?.classList.add('modal-content-rich-preview');
    const richHtml = sanitizeRichHtml(getInfoHotspotRichContent(hotspot));
    previewModalBody.classList.add('preview-rich-surface');
    previewModalBody.setAttribute('contenteditable', 'false');
    previewModalBody.innerHTML = richHtml || '<p><br></p>';
    trimTrailingEmptyParagraphs(previewModalBody);
    resolveRichMediaReferencesInContainer(previewModalBody, state.project, { preferDataUrl: true });
    applyPreviewModalFrameSize(hotspot);
    applyPreviewModalVisualStyle(hotspot);
    previewModal.classList.add('visible');
    previewModal.setAttribute('aria-hidden', 'false');
    schedulePreviewRichContentFrameRefresh(hotspot);
    scheduleMarkerRender();
    return;
  }

  const mediaMap = new Map(
    (state.project?.assets?.media || []).map((m) => [m.id, m.dataUrl || m.path || ''])
  );

  (hotspot.contentBlocks || []).forEach((block) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'block';

    const isInfoInlineBlock = block.type === 'text' || block.type === 'image' || block.type === 'video';
    if (!isInfoInlineBlock) {
      const heading = document.createElement('h4');
      heading.textContent = block.type || 'content';
      wrapper.appendChild(heading);
    }

    if (block.type === 'text') {
      const p = document.createElement('p');
      p.textContent = block.value || '';
      p.style.whiteSpace = 'pre-wrap';
      p.style.textAlign = normalizeTextAlign(block.align);
      wrapper.appendChild(p);
    }

    if (block.type === 'image') {
      const src = String(block.url || '').trim() || mediaMap.get(block.assetId) || '';
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = hotspot.title || 'Hotspot image';
        wrapper.appendChild(img);
      }
    }

    if (block.type === 'video') {
      if (block.url) {
        const iframe = document.createElement('iframe');
        iframe.src = normalizeVideoEmbedUrl(block.url);
        iframe.width = '100%';
        iframe.height = '360';
        iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        iframe.style.border = '0';
        wrapper.appendChild(iframe);
      } else {
        const src = mediaMap.get(block.assetId) || '';
        if (src) {
          const video = document.createElement('video');
          video.controls = true;
          video.src = src;
          wrapper.appendChild(video);
        }
      }
    }

    if (block.type === 'audio') {
      const src = mediaMap.get(block.assetId) || '';
      if (src) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = src;
        wrapper.appendChild(audio);
      }
    }

    if (block.type === 'link') {
      const link = document.createElement('a');
      link.href = block.url || '#';
      link.textContent = block.label || 'Open link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      wrapper.appendChild(link);
    }

    if (block.type === 'scene') {
      const targetScene = state.project?.scenes?.find((sceneItem) => sceneItem.id === block.sceneId) || null;
      const targetSceneName = getSceneName(block.sceneId || '');
      const p = document.createElement('p');
      const sceneAlias = String(targetScene?.alias || '').trim();
      const targetText = sceneAlias || targetSceneName;
      p.textContent = block.sceneId ? `Go to: ${targetText}` : 'No target scene selected.';
      wrapper.appendChild(p);
      if (block.comment && String(block.comment).trim()) {
        const comment = document.createElement('p');
        comment.textContent = `Comment: ${block.comment}`;
        wrapper.appendChild(comment);
      }
    }

    previewModalBody.appendChild(wrapper);
  });

  previewModal.classList.add('visible');
  previewModal.setAttribute('aria-hidden', 'false');
  scheduleMarkerRender();
}

function closeHotspotPreview() {
  if (!previewModal) return;
  clearQuickPreviewTimers();
  quickPreviewHoverMarkerId = null;
  quickPreviewHoverModal = false;
  quickPreviewOpenHotspotId = null;
  stopPreviewModalDrag();
  previewHotspotContext = null;
  btnHomePagePreviewStart?.classList.add('hidden');
  if (previewModalBody) {
    previewModalBody.querySelectorAll('video,audio').forEach((mediaEl) => {
      try {
        mediaEl.pause();
      } catch (_) {}
    });
    previewModalBody.querySelectorAll('iframe').forEach((iframeEl) => {
      try {
        iframeEl.setAttribute('src', 'about:blank');
      } catch (_) {}
    });
    previewModalBody.innerHTML = '';
    previewModalBody.classList.remove('preview-rich-surface');
    previewModalBody.removeAttribute('contenteditable');
    previewModalBody.style.removeProperty('background-color');
  }
  previewModal.classList.remove('preview-modal-rich-like');
  previewModalContent?.classList.remove('modal-content-rich-preview');
  resetPreviewModalFrameSize();
  previewModal.classList.remove('visible');
  previewModal.setAttribute('aria-hidden', 'true');
  scheduleMarkerRender();
}

function startTourFromHomePagePreview() {
  if (!state.project) {
    closeHotspotPreview();
    return;
  }
  const mainGroupId = state.project.activeGroupId || state.project.groups?.[0]?.id || null;
  if (mainGroupId) {
    state.selectedGroupId = mainGroupId;
  }
  const preferredScene = getPreferredSceneForGroup(state.selectedGroupId) || state.project.scenes?.[0] || null;
  if (preferredScene) {
    state.selectedSceneId = preferredScene.id;
    state.multiSelectedSceneIds = [preferredScene.id];
    state.sceneSelectionAnchorId = preferredScene.id;
    state.selectedFloorplanId = getFloorplanForGroup(state.selectedGroupId)?.id || null;
  }
  closeHotspotPreview();
  renderAll();
  updateStatus('Main group and main scene loaded.');
}

function setSectionCollapsed(buttonElement, bodyElement, next) {
  runtimeEditorUi?.setSectionCollapsed(buttonElement, bodyElement, next);
}

function toggleSection(buttonElement, bodyElement) {
  runtimeEditorUi?.toggleSection(buttonElement, bodyElement);
}

function setLinksPanelCollapsed(next) {
  runtimeEditorUi?.setLinksPanelCollapsed(next);
}

function openDeleteLinksScopeModal() {
  if (!deleteLinksScopeModal) return;
  deleteLinksScopeModal.classList.add('visible');
  deleteLinksScopeModal.setAttribute('aria-hidden', 'false');
}

function closeDeleteLinksScopeModal() {
  if (!deleteLinksScopeModal) return;
  deleteLinksScopeModal.classList.remove('visible');
  deleteLinksScopeModal.setAttribute('aria-hidden', 'true');
}

function resolveDeleteLinksScope(value) {
  if (!deleteLinksScopeResolver) return;
  const resolver = deleteLinksScopeResolver;
  deleteLinksScopeResolver = null;
  closeDeleteLinksScopeModal();
  resolver(value);
}

function askDeleteLinksScope() {
  if (!deleteLinksScopeModal || !btnDeleteLinksScene || !btnDeleteLinksGroup || !btnDeleteLinksCancel) {
    const scopeInput = prompt('Type "scene" to delete all links in the current scene, or "group" to delete all links in the current group.');
    if (scopeInput === null) return Promise.resolve(null);
    const scope = String(scopeInput).trim().toLowerCase();
    if (scope !== 'scene' && scope !== 'group') return Promise.resolve('__invalid__');
    return Promise.resolve(scope);
  }
  return new Promise((resolve) => {
    deleteLinksScopeResolver = resolve;
    openDeleteLinksScopeModal();
  });
}

function openGenerateAllTilesModal(message) {
  if (!generateAllTilesModal) return;
  if (generateAllTilesMessage) {
    generateAllTilesMessage.textContent = message || '';
  }
  generateAllTilesModal.classList.add('visible');
  generateAllTilesModal.setAttribute('aria-hidden', 'false');
}

function closeGenerateAllTilesModal() {
  if (!generateAllTilesModal) return;
  generateAllTilesModal.classList.remove('visible');
  generateAllTilesModal.setAttribute('aria-hidden', 'true');
}

function resolveGenerateAllTilesChoice(value) {
  if (!generateAllTilesResolver) return;
  const resolver = generateAllTilesResolver;
  generateAllTilesResolver = null;
  closeGenerateAllTilesModal();
  resolver(value);
}

function askGenerateAllTilesExistingPolicy(alreadyTiledScenes) {
  if (!alreadyTiledScenes?.length) return Promise.resolve('skip');
  const names = alreadyTiledScenes
    .slice(0, 8)
    .map((scene) => `- ${scene.name || scene.id}`);
  if (alreadyTiledScenes.length > 8) {
    names.push(`- ...and ${alreadyTiledScenes.length - 8} more`);
  }
  const message = [
    `${alreadyTiledScenes.length} scene(s) already have tiles.`,
    '',
    ...names,
    '',
    'Choose an action:',
    '- Skip Existing: keep existing tiles and generate only missing ones',
    '- Overwrite: regenerate tiles for all scenes',
    '- Cancel: stop the process'
  ].join('\n');
  if (!generateAllTilesModal || !btnGenerateAllTilesSkip || !btnGenerateAllTilesOverwrite || !btnGenerateAllTilesCancel) {
    const input = window.prompt(message, 'skip');
    if (input === null) return Promise.resolve('cancel');
    const normalized = String(input || '').trim().toLowerCase();
    if (normalized === 'overwrite') return Promise.resolve('overwrite');
    if (normalized === 'skip') return Promise.resolve('skip');
    return Promise.resolve('cancel');
  }
  return new Promise((resolve) => {
    generateAllTilesResolver = resolve;
    openGenerateAllTilesModal(message);
  });
}

runtimeHotspotModes = safeCreateRuntimeEditorModule(
  'hotspot-modes',
  () => window.IterpanoEditorHotspotModes?.createHotspotModesController({
    btnAddHotspot,
    btnEditHotspot,
    btnSaveHotspot,
    btnTogglePlacement,
    viewerCanvas,
    getSelectedScene,
    getSelectedInfoHotspot,
    getProjectHomePage,
    updateHomePageButtons,
    setHomePageEditMode,
    getPlacementMode: () => placementMode,
    setPlacementMode: (nextPlacementMode) => {
      placementMode = nextPlacementMode;
    },
    getInfoHotspotCreateMode: () => infoHotspotCreateMode,
    setInfoHotspotCreateModeState: (nextMode) => {
      infoHotspotCreateMode = nextMode;
    },
    getInfoHotspotEditMode: () => infoHotspotEditMode,
    setInfoHotspotEditModeState: (nextMode) => {
      infoHotspotEditMode = nextMode;
    },
    getHomePageEditMode: () => homePageEditMode,
    getPendingSceneLinkDraft: () => pendingSceneLinkDraft,
    clearPendingSceneLinkDraft,
    hideHotspotHoverCard,
    closeHotspotPreview,
    saveRichEditorModalContent,
    saveRichSourceModalContent,
    openRichEditorModal,
    renderInfoHotspotList,
    renderContentBlocks,
    renderLinkEditor,
    updateStatus,
    getRichEditorModalVisible: () => richEditorModal?.classList.contains('visible'),
    getRichSourceModalVisible: () => richSourceModal?.classList.contains('visible'),
    getRichEditorContext: () => richEditorContext,
    getRichSourceContext: () => richSourceContext,
  }),
  [
    { label: 'IterpanoEditorHotspotModes', value: window.IterpanoEditorHotspotModes }
  ]
);

function updatePlacementButtonLabel() {
  runtimeHotspotModes?.updatePlacementButtonLabel();
}

function isInfoHotspotInteractionModeActive() {
  return runtimeHotspotModes?.isInfoHotspotInteractionModeActive() || false;
}

function updateHomePageButtons() {
  if (btnEditHomePage) {
    btnEditHomePage.classList.toggle('active', homePageEditMode);
    btnEditHomePage.textContent = homePageEditMode ? 'Edit ON' : 'Edit';
    btnEditHomePage.setAttribute('aria-pressed', homePageEditMode ? 'true' : 'false');
  }
  if (btnSaveHomePage) {
    btnSaveHomePage.disabled = !homePageEditMode;
  }
  if (btnViewHomePage) {
    const homePage = getProjectHomePage();
    const hasContent = Boolean(String(homePage?.richContentHtml || '').trim());
    btnViewHomePage.disabled = !hasContent;
  }
}

function updateInfoHotspotModeButtons() {
  runtimeHotspotModes?.updateInfoHotspotModeButtons();
}

function setInfoHotspotCreateMode(nextMode, { silent = false } = {}) {
  runtimeHotspotModes?.setInfoHotspotCreateMode(nextMode, { silent });
}

function setInfoHotspotEditMode(nextMode, { silent = false } = {}) {
  runtimeHotspotModes?.setInfoHotspotEditMode(nextMode, { silent });
}

function toggleInfoHotspotCreateMode() {
  runtimeHotspotModes?.toggleInfoHotspotCreateMode();
}

function toggleInfoHotspotEditMode() {
  runtimeHotspotModes?.toggleInfoHotspotEditMode();
}

function setHomePageEditMode(nextMode, { silent = false } = {}) {
  runtimeEditorUi?.setHomePageEditMode(nextMode, { silent });
}

function toggleHomePageEditMode() {
  runtimeEditorUi?.toggleHomePageEditMode(homePageEditMode);
}

function saveHomePageState() {
  const homePage = getProjectHomePage();
  if (!homePage) return;
  if (richEditorModal?.classList.contains('visible') && richEditorContext?.type === 'home-page') {
    saveRichEditorModalContent({ closeAfterSave: false, refreshPanel: true });
  }
  if (richSourceModal?.classList.contains('visible') && richSourceContext?.type === 'home-page') {
    saveRichSourceModalContent({ closeAfterSave: false, refreshPanel: true });
  }
  autosave();
  updateStatus('Home Page saved.');
}

function openHomePagePreview() {
  const homePage = getProjectHomePage();
  if (!homePage || !previewModal || !previewModalBody) return;
  const richHtml = sanitizeRichHtml(getInfoHotspotRichContent(homePage));
  if (!String(richHtml || '').trim()) {
    updateStatus('Home Page is empty.');
    return;
  }
  previewHotspotContext = {
    type: 'home-page',
    anchorOffset: null
  };
  btnHomePagePreviewStart?.classList.remove('hidden');
  previewModalTitle.textContent = 'Home Page';
  previewModalBody.innerHTML = '';
  previewModal.classList.add('preview-modal-rich-like');
  previewModalContent?.classList.add('modal-content-rich-preview');
  previewModalBody.classList.add('preview-rich-surface');
  previewModalBody.setAttribute('contenteditable', 'false');
  previewModalBody.innerHTML = richHtml;
  trimTrailingEmptyParagraphs(previewModalBody);
  resolveRichMediaReferencesInContainer(previewModalBody, state.project, { preferDataUrl: true });
  applyPreviewModalFrameSize(homePage);
  applyPreviewModalVisualStyle(homePage);
  previewModal.classList.add('visible');
  previewModal.setAttribute('aria-hidden', 'false');
  schedulePreviewRichContentFrameRefresh(homePage);
  scheduleMarkerRender();
}

function clearPendingSceneLinkDraft(shouldRender = true) {
  pendingSceneLinkDraft = null;
  if (!shouldRender) return;
  renderHotspotList();
  renderLinkEditor();
  renderContentBlocks();
  scheduleMarkerRender();
}

function togglePlacementMode() {
  runtimeHotspotModes?.togglePlacementMode();
}

function getViewScale(active) {
  const rect = viewerCanvas.getBoundingClientRect();
  const viewWidth = active.view.width();
  const viewHeight = active.view.height();
  const scaleX = rect.width ? viewWidth / rect.width : 1;
  const scaleY = rect.height ? viewHeight / rect.height : 1;
  return { x: scaleX, y: scaleY };
}

function getViewPointFromEvent(event) {
  const active = editorScenes.get(state.selectedSceneId);
  if (!active) return null;
  const rect = viewerCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
  const scale = getViewScale(active);
  return { x: x * scale.x, y: y * scale.y };
}

function findMarkerAtScreen(clientX, clientY, radius) {
  if (!hotspotOverlay) return null;
  const markers = hotspotOverlay.querySelectorAll('.hotspot-marker');
  let closestId = null;
  let closestDist = radius * radius;
  markers.forEach((marker) => {
    if (marker.style.display === 'none') return;
    const rect = marker.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - clientX;
    const dy = cy - clientY;
    const dist = dx * dx + dy * dy;
    if (dist <= closestDist) {
      closestId = marker.dataset.hotspotId || null;
      closestDist = dist;
    }
  });
  return closestId;
}

function renderInfoHotspotList() {
  runtimeHotspotSidebar?.renderInfoHotspotList();
}


function renderHotspotList() {
  runtimeHotspotSidebar?.renderHotspotList();
}

function renderFloorplans() {
  runtimeFloorplanRender?.renderFloorplans();
}

function addFloorplanNode(x, y) {
  runtimeFloorplanActions?.addFloorplanNode(x, y);
}

function removeFloorplanNode(index) {
  runtimeFloorplanActions?.removeFloorplanNode(index);
}

function deleteSelectedFloorplanNode() {
  runtimeFloorplanActions?.deleteSelectedFloorplanNode();
}

function rotateFloorplanNode(index, delta) {
  runtimeFloorplanActions?.rotateFloorplanNode(index, delta);
}

function startDrag(event, index) {
  runtimeFloorplanActions?.startDrag(event, index);
}

function handleDrag(event) {
  // handled inside runtimeFloorplanActions
}

function stopDrag() {
  runtimeFloorplanActions?.stopDrag();
}

function getSceneName(sceneId) {
  const scene = state.project?.scenes.find((item) => item.id === sceneId);
  return scene?.name || sceneId;
}

function getSceneAlias(sceneId) {
  const scene = state.project?.scenes.find((item) => item.id === sceneId);
  return String(scene?.alias || '').trim();
}

function renderContentBlocks() {
  contentBlocks.innerHTML = '';
  activeRichSizeInput = null;
  const homePage = getProjectHomePage();
  const editingHomePage = homePageEditMode;
  const hotspot = editingHomePage ? homePage : getSelectedInfoHotspot();
  const scene = editingHomePage ? null : getSelectedScene();
  const infoContentEnabled = editingHomePage || isInfoHotspotInteractionModeActive();
  const editorContext = editingHomePage
    ? { type: 'home-page' }
    : (scene && hotspot ? { type: 'info-hotspot', sceneId: scene.id, hotspotId: hotspot.id } : null);
  if (infoContentSectionBody) {
    infoContentSectionBody.hidden = !infoContentEnabled;
    infoContentSectionBody.setAttribute('aria-hidden', infoContentEnabled ? 'false' : 'true');
  }
  if (richContentTitle) {
    richContentTitle.textContent = editingHomePage ? 'Home Page Content' : 'Info Content';
  }
  if (richContentHint) {
    richContentHint.textContent = editingHomePage
      ? 'Edit the welcome page shown before the tour starts.'
      : 'Use one rich content editor per info hotspot. Type: Normal = click open. Quick = hover on desktop, tap on touch.';
  }
  if (!infoContentEnabled) {
    return;
  }
  if (!hotspot) {
    const hint = document.createElement('div');
    hint.className = 'panel-hint';
    hint.textContent = editingHomePage
      ? 'Home page is not available.'
      : 'Select an info hotspot to edit rich content.';
    contentBlocks.appendChild(hint);
    return;
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'inline-actions';
  toolbar.classList.add('rich-toolbar-actions');

  const btnOpenVisualEditor = document.createElement('button');
  btnOpenVisualEditor.className = 'btn';
  btnOpenVisualEditor.type = 'button';
  const visualEditorOpenForHotspot = isRichEditorContextMatch(editorContext);
  btnOpenVisualEditor.textContent = visualEditorOpenForHotspot ? 'Close Visual Editor' : 'Open Visual Editor';
  toolbar.appendChild(btnOpenVisualEditor);

  const btnOpenRichSource = document.createElement('button');
  btnOpenRichSource.className = 'btn ghost';
  btnOpenRichSource.type = 'button';
  btnOpenRichSource.textContent = 'Open HTML Source';
  toolbar.appendChild(btnOpenRichSource);

  const btnInsertBold = document.createElement('button');
  btnInsertBold.className = 'btn ghost';
  btnInsertBold.type = 'button';
  btnInsertBold.textContent = 'B';
  toolbar.appendChild(btnInsertBold);

  const btnInsertItalic = document.createElement('button');
  btnInsertItalic.className = 'btn ghost';
  btnInsertItalic.type = 'button';
  btnInsertItalic.textContent = 'I';
  toolbar.appendChild(btnInsertItalic);

  const btnInsertUnderline = document.createElement('button');
  btnInsertUnderline.className = 'btn ghost';
  btnInsertUnderline.type = 'button';
  btnInsertUnderline.textContent = 'U';
  toolbar.appendChild(btnInsertUnderline);

  const sizeLabel = document.createElement('label');
  sizeLabel.className = 'rich-font-size-control';
  sizeLabel.textContent = 'Size';
  toolbar.appendChild(sizeLabel);

  const sizeInput = document.createElement('input');
  sizeInput.className = 'rich-font-size-input';
  sizeInput.classList.add('rich-font-size-input-compact');
  sizeInput.classList.add('rich-font-size-input-3digits');
  sizeInput.type = 'number';
  sizeInput.min = '8';
  sizeInput.max = '200';
  sizeInput.step = '1';
  sizeInput.value = '12';
  toolbar.appendChild(sizeInput);
  activeRichSizeInput = sizeInput;

  const lineLabel = document.createElement('label');
  lineLabel.className = 'rich-font-size-control';
  lineLabel.textContent = 'Line';
  toolbar.appendChild(lineLabel);

  const lineInput = document.createElement('input');
  lineInput.className = 'rich-font-size-input';
  lineInput.classList.add('rich-font-size-input-compact');
  lineInput.classList.add('rich-font-size-input-3digits');
  lineInput.type = 'number';
  lineInput.min = '0.1';
  lineInput.max = '3';
  lineInput.step = '0.1';
  lineInput.value = '1.2';
  toolbar.appendChild(lineInput);

  const pSpaceLabel = document.createElement('label');
  pSpaceLabel.className = 'rich-font-size-control';
  pSpaceLabel.textContent = 'P.Space';
  toolbar.appendChild(pSpaceLabel);

  const pSpaceInput = document.createElement('input');
  pSpaceInput.className = 'rich-font-size-input';
  pSpaceInput.classList.add('rich-font-size-input-3digits');
  pSpaceInput.type = 'number';
  pSpaceInput.min = '0';
  pSpaceInput.max = '48';
  pSpaceInput.step = '1';
  pSpaceInput.value = '4';
  toolbar.appendChild(pSpaceInput);

  const textColorLabel = document.createElement('label');
  textColorLabel.className = 'rich-font-size-control';
  textColorLabel.textContent = 'T.Col';
  toolbar.appendChild(textColorLabel);

  const textColorPicker = createRichColorPicker('white', { title: 'Text color' });
  toolbar.appendChild(textColorPicker.root);

  const bgColorLabel = document.createElement('label');
  bgColorLabel.className = 'rich-font-size-control';
  bgColorLabel.textContent = 'B.Col';
  toolbar.appendChild(bgColorLabel);

  const existingVisualStyle = getInfoHotspotEditorVisualStyle(hotspot);
  const bgColorPicker = createRichColorPicker(
    existingVisualStyle?.backgroundColorKey || DEFAULT_INFO_BG_COLOR_KEY,
    { title: 'Background color' }
  );
  toolbar.appendChild(bgColorPicker.root);

  const bgOpacityLabel = document.createElement('label');
  bgOpacityLabel.className = 'rich-font-size-control';
  bgOpacityLabel.textContent = 'B.Tr';
  toolbar.appendChild(bgOpacityLabel);

  const bgOpacityInput = document.createElement('input');
  bgOpacityInput.className = 'rich-font-size-input rich-font-size-input-3digits';
  bgOpacityInput.type = 'number';
  bgOpacityInput.min = '0';
  bgOpacityInput.max = '100';
  bgOpacityInput.step = '1';
  bgOpacityInput.value = String(existingVisualStyle?.backgroundTransparency ?? DEFAULT_INFO_BG_TRANSPARENCY);
  toolbar.appendChild(bgOpacityInput);

  const btnAlignLeft = document.createElement('button');
  btnAlignLeft.className = 'btn ghost';
  btnAlignLeft.type = 'button';
  btnAlignLeft.textContent = 'Left';
  toolbar.appendChild(btnAlignLeft);

  const btnAlignCenter = document.createElement('button');
  btnAlignCenter.className = 'btn ghost';
  btnAlignCenter.type = 'button';
  btnAlignCenter.textContent = 'Center';
  toolbar.appendChild(btnAlignCenter);

  const btnAlignRight = document.createElement('button');
  btnAlignRight.className = 'btn ghost';
  btnAlignRight.type = 'button';
  btnAlignRight.textContent = 'Right';
  toolbar.appendChild(btnAlignRight);

  const btnAlignJustify = document.createElement('button');
  btnAlignJustify.className = 'btn ghost';
  btnAlignJustify.type = 'button';
  btnAlignJustify.textContent = 'Justify';
  toolbar.appendChild(btnAlignJustify);

  const btnInsertLink = document.createElement('button');
  btnInsertLink.className = 'btn ghost';
  btnInsertLink.type = 'button';
  btnInsertLink.textContent = 'Link';
  toolbar.appendChild(btnInsertLink);

  const btnInsertParagraph = document.createElement('button');
  btnInsertParagraph.className = 'btn ghost';
  btnInsertParagraph.type = 'button';
  btnInsertParagraph.textContent = 'Paragraph';
  toolbar.appendChild(btnInsertParagraph);

  const btnInsertImageUrl = document.createElement('button');
  btnInsertImageUrl.className = 'btn ghost';
  btnInsertImageUrl.type = 'button';
  btnInsertImageUrl.textContent = 'Image URL';
  toolbar.appendChild(btnInsertImageUrl);

  const btnUploadLocalImage = document.createElement('button');
  btnUploadLocalImage.className = 'btn ghost';
  btnUploadLocalImage.type = 'button';
  btnUploadLocalImage.textContent = 'Upload Image';
  toolbar.appendChild(btnUploadLocalImage);

  const btnInsertVideoUrl = document.createElement('button');
  btnInsertVideoUrl.className = 'btn ghost';
  btnInsertVideoUrl.type = 'button';
  btnInsertVideoUrl.textContent = 'Video URL';
  toolbar.appendChild(btnInsertVideoUrl);

  const btnUploadLocalVideo = document.createElement('button');
  btnUploadLocalVideo.className = 'btn ghost';
  btnUploadLocalVideo.type = 'button';
  btnUploadLocalVideo.textContent = 'Upload Video';
  toolbar.appendChild(btnUploadLocalVideo);

  const btnInsertCols = document.createElement('button');
  btnInsertCols.className = 'btn ghost';
  btnInsertCols.type = 'button';
  btnInsertCols.textContent = 'Block';
  toolbar.appendChild(btnInsertCols);

  const btnLayoutAddCol = document.createElement('button');
  btnLayoutAddCol.className = 'btn ghost';
  btnLayoutAddCol.type = 'button';
  btnLayoutAddCol.textContent = '+LCol';
  toolbar.appendChild(btnLayoutAddCol);

  const btnLayoutDelCol = document.createElement('button');
  btnLayoutDelCol.className = 'btn ghost';
  btnLayoutDelCol.type = 'button';
  btnLayoutDelCol.textContent = '-LCol';
  toolbar.appendChild(btnLayoutDelCol);

  const btnLayoutDeleteBlock = document.createElement('button');
  btnLayoutDeleteBlock.className = 'btn ghost';
  btnLayoutDeleteBlock.type = 'button';
  btnLayoutDeleteBlock.textContent = 'Delete Block';
  toolbar.appendChild(btnLayoutDeleteBlock);

  const colsSpaceLabel = document.createElement('label');
  colsSpaceLabel.className = 'rich-font-size-control';
  colsSpaceLabel.textContent = 'Cols.Space';
  toolbar.appendChild(colsSpaceLabel);

  const colsSpaceInput = document.createElement('input');
  colsSpaceInput.className = 'rich-font-size-input';
  colsSpaceInput.type = 'number';
  colsSpaceInput.min = '0';
  colsSpaceInput.max = '48';
  colsSpaceInput.step = '1';
  colsSpaceInput.value = '2';
  toolbar.appendChild(colsSpaceInput);

  const btnLayoutEqual = document.createElement('button');
  btnLayoutEqual.className = 'btn ghost';
  btnLayoutEqual.type = 'button';
  btnLayoutEqual.textContent = 'Equal';
  toolbar.appendChild(btnLayoutEqual);

  const btnLayoutBelow = document.createElement('button');
  btnLayoutBelow.className = 'btn ghost';
  btnLayoutBelow.type = 'button';
  btnLayoutBelow.textContent = 'L.Below';
  toolbar.appendChild(btnLayoutBelow);

  const btnLayoutAbove = document.createElement('button');
  btnLayoutAbove.className = 'btn ghost';
  btnLayoutAbove.type = 'button';
  btnLayoutAbove.textContent = 'L.Above';
  toolbar.appendChild(btnLayoutAbove);

  const btnDeleteRow = document.createElement('button');
  btnDeleteRow.className = 'btn ghost';
  btnDeleteRow.type = 'button';
  btnDeleteRow.textContent = 'L.Delete';
  toolbar.appendChild(btnDeleteRow);

  const btnImageSize = document.createElement('button');
  btnImageSize.className = 'btn ghost';
  btnImageSize.type = 'button';
  btnImageSize.textContent = 'Image Size';
  toolbar.appendChild(btnImageSize);

  const btnClearFormat = document.createElement('button');
  btnClearFormat.className = 'btn ghost';
  btnClearFormat.type = 'button';
  btnClearFormat.textContent = 'Clear';
  toolbar.appendChild(btnClearFormat);

  const localImageInput = document.createElement('input');
  localImageInput.type = 'file';
  localImageInput.accept = 'image/*';
  localImageInput.hidden = true;

  const localVideoInput = document.createElement('input');
  localVideoInput.type = 'file';
  localVideoInput.accept = 'video/*';
  localVideoInput.hidden = true;

  const infoContentControls = [
    btnOpenVisualEditor,
    btnOpenRichSource,
    btnInsertBold,
    btnInsertItalic,
    btnInsertUnderline,
    btnAlignLeft,
    btnAlignCenter,
    btnAlignRight,
    btnAlignJustify,
    btnInsertLink,
    btnInsertParagraph,
    btnInsertImageUrl,
    btnUploadLocalImage,
    btnInsertVideoUrl,
    btnUploadLocalVideo,
    btnInsertCols,
    btnLayoutAddCol,
    btnLayoutDelCol,
    btnLayoutDeleteBlock,
    btnLayoutEqual,
    colsSpaceInput,
    btnLayoutBelow,
    btnDeleteRow,
    btnImageSize,
    btnClearFormat,
    sizeInput,
    lineInput,
    pSpaceInput,
    textColorPicker.button,
    bgColorPicker.button,
    bgOpacityInput
  ];
  infoContentControls.forEach((control) => {
    if (control) control.disabled = !infoContentEnabled;
  });

  const isVisualEditorActiveForHotspot = () => isRichEditorContextMatch(editorContext);

  const runVisualEditorAction = (action, { save = true } = {}) => {
    if (!isVisualEditorActiveForHotspot()) return false;
    action();
    if (save) {
      saveRichEditorModalContent({ closeAfterSave: false });
    }
    return true;
  };

  // Capture selected range before toolbar interactions (labels/buttons/inputs),
  // so formatting controls can still apply to the previous text selection.
  toolbar.addEventListener('pointerdown', () => {
    if (!isVisualEditorActiveForHotspot()) return;
    saveRichEditorSelectionRange();
  }, true);
  toolbar.addEventListener('mousedown', () => {
    if (!isVisualEditorActiveForHotspot()) return;
    saveRichEditorSelectionRange();
  }, true);

  const execVisualEditorCommand = (command, value = null) => runVisualEditorAction(() => {
    richEditorSurface?.focus();
    restoreRichEditorSelectionRange();
    document.execCommand(command, false, value);
    syncRichEditorSelectionState();
    saveRichEditorSelectionRange();
  });

  const applyVisualEditorAlignment = (align, command) => runVisualEditorAction(() => {
    const selectedLayout = getSelectedRichLayoutElement();
    if (selectedLayout) {
      applyRichLayoutBlockAlignment(selectedLayout, align);
      syncRichEditorSelectionState();
      saveRichEditorSelectionRange();
      return;
    }
    const selectedMedia = getSelectedRichImageElement();
    if (selectedMedia) {
      applyRichMediaAlignment(selectedMedia, align);
      syncRichEditorSelectionState();
      saveRichEditorSelectionRange();
      return;
    }
    richEditorSurface?.focus();
    restoreRichEditorSelectionRange();
    document.execCommand(command, false, null);
    syncRichEditorSelectionState();
    saveRichEditorSelectionRange();
  });

  const applyBackgroundStyleFromControls = ({ silentNoEditor = false } = {}) => {
    if (!isVisualEditorActiveForHotspot()) {
      if (!silentNoEditor) {
        updateStatus('Open Visual Editor to change background style.');
      }
      return false;
    }
    const colorKey = normalizeFloorplanColorKey(bgColorPicker.getValue() || DEFAULT_INFO_BG_COLOR_KEY);
    const transparencyPercent = sanitizeInfoBackgroundTransparencyPercent(bgOpacityInput.value, DEFAULT_INFO_BG_TRANSPARENCY);
    bgColorPicker.setValue(colorKey);
    bgOpacityInput.value = String(transparencyPercent);
    setInfoHotspotEditorVisualStyle(hotspot, colorKey, transparencyPercent);
    applyRichEditorSurfaceVisualStyle(hotspot);
    autosave();
    updateStatus(`Visual background set: ${colorLabelFromKey(colorKey)} transparency ${transparencyPercent}%`);
    return true;
  };

  btnOpenRichSource.addEventListener('click', () => {
    openRichSourceModal(hotspot, { type: editingHomePage ? 'home-page' : 'info-hotspot' });
  });

  btnInsertBold.addEventListener('click', () => {
    if (execVisualEditorCommand('bold')) return;
    wrapSelectionInRichSourceModal('<strong>', '</strong>', hotspot);
  });

  btnInsertItalic.addEventListener('click', () => {
    if (execVisualEditorCommand('italic')) return;
    wrapSelectionInRichSourceModal('<em>', '</em>', hotspot);
  });

  btnInsertUnderline.addEventListener('click', () => {
    if (execVisualEditorCommand('underline')) return;
    wrapSelectionInRichSourceModal('<u>', '</u>', hotspot);
  });

  // Keep selected text range before focusing numeric controls.
  [sizeInput, lineInput, pSpaceInput].forEach((inputControl) => {
    inputControl.addEventListener('pointerdown', () => {
      saveRichEditorSelectionRange();
    });
    inputControl.addEventListener('mousedown', () => {
      saveRichEditorSelectionRange();
    });
  });
  sizeInput.addEventListener('pointerdown', () => {
    syncRichEditorTypographyControls({ force: true });
  });
  sizeInput.addEventListener('mousedown', () => {
    syncRichEditorTypographyControls({ force: true });
  });

  sizeInput.addEventListener('input', () => {
    if (!sanitizeRichFontSizeValue(sizeInput.value)) return;
    if (runVisualEditorAction(() => applyRichFontSizeInSelection(sizeInput.value))) return;
  });
  sizeInput.addEventListener('change', () => {
    if (runVisualEditorAction(() => applyRichFontSizeInSelection(sizeInput.value))) return;
    updateStatus('Open Visual Editor to change font size.');
  });
  sizeInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (runVisualEditorAction(() => applyRichFontSizeInSelection(sizeInput.value))) return;
    updateStatus('Open Visual Editor to change font size.');
  });

  lineInput.addEventListener('input', () => {
    if (runVisualEditorAction(() => applyRichLineHeightInSelection(lineInput.value))) return;
    updateStatus('Open Visual Editor to change line height.');
  });
  lineInput.addEventListener('change', () => {
    if (runVisualEditorAction(() => applyRichLineHeightInSelection(lineInput.value))) return;
    updateStatus('Open Visual Editor to change line height.');
  });
  lineInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (runVisualEditorAction(() => applyRichLineHeightInSelection(lineInput.value))) return;
    updateStatus('Open Visual Editor to change line height.');
  });

  pSpaceInput.addEventListener('input', () => {
    if (runVisualEditorAction(() => applyRichParagraphSpacingInSelection(pSpaceInput.value))) return;
    updateStatus('Open Visual Editor to change paragraph spacing.');
  });
  pSpaceInput.addEventListener('change', () => {
    if (runVisualEditorAction(() => applyRichParagraphSpacingInSelection(pSpaceInput.value))) return;
    updateStatus('Open Visual Editor to change paragraph spacing.');
  });
  pSpaceInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (runVisualEditorAction(() => applyRichParagraphSpacingInSelection(pSpaceInput.value))) return;
    updateStatus('Open Visual Editor to change paragraph spacing.');
  });

  textColorPicker.button.addEventListener('mousedown', () => {
    saveRichEditorSelectionRange();
  });
  textColorPicker.onChange((nextValue) => {
    const colorKey = normalizeFloorplanColorKey(nextValue || 'yellow');
    textColorPicker.setValue(colorKey);
    if (runVisualEditorAction(() => {
      richEditorSurface?.focus();
      restoreRichEditorSelectionRange();
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, FLOORPLAN_COLOR_MAP[colorKey]);
      saveRichEditorSelectionRange();
      syncRichEditorSelectionState();
    })) return;
    updateStatus('Open Visual Editor to change text color.');
  });

  bgColorPicker.onChange(() => {
    applyBackgroundStyleFromControls();
  });
  bgOpacityInput.addEventListener('input', () => {
    applyBackgroundStyleFromControls({ silentNoEditor: true });
  });
  bgOpacityInput.addEventListener('change', () => {
    applyBackgroundStyleFromControls();
  });
  bgOpacityInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    applyBackgroundStyleFromControls();
  });

  btnAlignLeft.addEventListener('click', () => {
    if (applyVisualEditorAlignment('left', 'justifyLeft')) return;
    applyAlignmentInRichSourceModal('left', hotspot);
  });
  btnAlignCenter.addEventListener('click', () => {
    if (applyVisualEditorAlignment('center', 'justifyCenter')) return;
    applyAlignmentInRichSourceModal('center', hotspot);
  });
  btnAlignRight.addEventListener('click', () => {
    if (applyVisualEditorAlignment('right', 'justifyRight')) return;
    applyAlignmentInRichSourceModal('right', hotspot);
  });
  btnAlignJustify.addEventListener('click', () => {
    if (execVisualEditorCommand('justifyFull')) return;
    applyAlignmentInRichSourceModal('justify', hotspot);
  });
  btnInsertLink.addEventListener('click', () => {
    if (runVisualEditorAction(() => {
      const url = prompt('Link URL');
      if (!url) return;
      richEditorSurface?.focus();
      restoreRichEditorSelectionRange();
      document.execCommand('createLink', false, String(url).trim());
      saveRichEditorSelectionRange();
      syncRichEditorSelectionState();
    })) return;
    insertLinkInRichSourceModal(hotspot);
  });

  btnInsertParagraph.addEventListener('click', () => {
    if (runVisualEditorAction(() => insertParagraphAtCurrentCursor())) return;
    insertIntoRichSourceModal('\n<p></p>\n', hotspot);
  });

  btnOpenVisualEditor.addEventListener('click', () => {
    const isOpen = Boolean(
      isRichEditorContextMatch(editorContext)
    );
    if (isOpen) {
      if (editingHomePage) {
        setHomePageEditMode(false);
      } else {
        setInfoHotspotEditMode(false);
      }
      return;
    }
    if (editingHomePage) {
      openRichEditorModal(hotspot, { type: 'home-page' });
      return;
    }
    state.selectedHotspotId = hotspot.id;
    setInfoHotspotEditMode(true);
    openRichEditorModal(hotspot, { type: 'info-hotspot' });
    renderContentBlocks();
  });

  btnInsertImageUrl.addEventListener('click', () => {
    const url = prompt('Image URL');
    if (!url) return;
    const escaped = escapeHtml(url);
    if (runVisualEditorAction(() => {
      const img = document.createElement('img');
      img.setAttribute('src', String(url).trim());
      img.setAttribute('alt', '');
      img.setAttribute('data-wrap', 'none');
      img.setAttribute('style', buildDefaultRichImageStyle({ wrap: 'none' }));
      insertStandaloneElementAtCurrentLine(img);
      syncClosestRichLayoutHeightFromNode(img);
    })) return;
    insertIntoRichSourceModal(`\n<p><img src="${escaped}" alt="" data-wrap="none" style="${buildDefaultRichImageStyle({ wrap: 'none' })}"></p>\n`, hotspot);
  });

  btnUploadLocalImage.addEventListener('click', () => localImageInput.click());
  localImageInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const media = getOrCreateProjectMediaAsset(state.project, {
        dataUrl,
        type: 'image',
        name: file.name || 'uploaded-image'
      });
      if (!media?.id) {
        updateStatus('Unable to create media reference for local image.');
        return;
      }
      const mediaRef = buildMediaReference(media.id);
      if (runVisualEditorAction(() => {
        const src = media.dataUrl || mediaRef;
        const img = document.createElement('img');
        img.setAttribute('src', src);
        img.setAttribute('alt', file.name || '');
        img.setAttribute('data-wrap', 'none');
        img.setAttribute('style', buildDefaultRichImageStyle({ wrap: 'none' }));
        insertStandaloneElementAtCurrentLine(img);
        syncClosestRichLayoutHeightFromNode(img);
      })) {
        updateStatus(`Local image inserted: ${file.name} (${media.id}).`);
        return;
      }
      insertIntoRichSourceModal(`\n<p><img src="${mediaRef}" alt="${escapeHtml(file.name)}" data-wrap="none" style="${buildDefaultRichImageStyle({ wrap: 'none' })}"></p>\n`, hotspot);
      updateStatus(`Local image inserted: ${file.name} (${media.id}).`);
    } catch (error) {
      console.error(error);
      updateStatus('Unable to read local image file.');
    } finally {
      localImageInput.value = '';
    }
  });

  btnInsertVideoUrl.addEventListener('click', () => {
    const url = prompt('Video URL or embed URL');
    if (!url) return;
    const normalizedUrl = String(url).trim();
    const embedUrl = normalizeVideoEmbedUrl(normalizedUrl);
    const isEmbed = /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(embedUrl);
    if (runVisualEditorAction(() => {
      if (isEmbed) {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', embedUrl);
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.width = '100%';
        iframe.style.maxWidth = '100%';
        iframe.style.height = 'auto';
        iframe.style.aspectRatio = '16 / 9';
        iframe.style.display = 'block';
        iframe.style.marginTop = '0.5em';
        iframe.style.marginBottom = '0.5em';
        iframe.style.marginLeft = '0';
        iframe.style.marginRight = 'auto';
        iframe.setAttribute('data-align', 'left');
        insertStandaloneElementAtCurrentLine(iframe);
        syncClosestRichLayoutHeightFromNode(iframe);
      } else {
        const video = document.createElement('video');
        video.setAttribute('src', normalizedUrl);
        video.setAttribute('controls', '');
        insertStandaloneElementAtCurrentLine(video);
        syncClosestRichLayoutHeightFromNode(video);
      }
    })) return;
    if (isEmbed) {
      insertIntoRichSourceModal(`\n<p><iframe src="${escapeHtml(embedUrl)}"></iframe></p>\n`, hotspot);
    } else {
      insertIntoRichSourceModal(`\n<p><video src="${escapeHtml(normalizedUrl)}" controls></video></p>\n`, hotspot);
    }
  });

  btnUploadLocalVideo.addEventListener('click', () => localVideoInput.click());
  localVideoInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const media = getOrCreateProjectMediaAsset(state.project, {
        dataUrl,
        type: 'video',
        name: file.name || 'uploaded-video'
      });
      if (!media?.id) {
        updateStatus('Unable to create media reference for local video.');
        return;
      }
      const mediaRef = buildMediaReference(media.id);
      if (runVisualEditorAction(() => {
        const src = media.dataUrl || mediaRef;
        const video = document.createElement('video');
        video.setAttribute('src', src);
        video.setAttribute('controls', '');
        insertStandaloneElementAtCurrentLine(video);
      })) {
        updateStatus(`Local video inserted: ${file.name} (${media.id}).`);
        return;
      }
      insertIntoRichSourceModal(`\n<p><video src="${mediaRef}" controls></video></p>\n`, hotspot);
      updateStatus(`Local video inserted: ${file.name} (${media.id}).`);
    } catch (error) {
      console.error(error);
      updateStatus('Unable to read local video file.');
    } finally {
      localVideoInput.value = '';
    }
  });

  btnInsertCols.addEventListener('click', () => {
    const input = prompt('How many columns? (1-6)', '3');
    if (input === null) return;
    const safeCols = normalizeRichLayoutColumns(input, 3);
    if (runVisualEditorAction(() => insertRichColumnsLayout(safeCols))) return;
    insertIntoRichSourceModal(`\n${buildRichColumnsHtml(safeCols)}\n`, hotspot);
  });
  btnLayoutAddCol.addEventListener('click', () => {
    if (runVisualEditorAction(() => addRichLayoutColumn())) return;
    updateStatus('Open Visual Editor to edit layout columns.');
    openRichEditorModal(hotspot, { type: editingHomePage ? 'home-page' : 'info-hotspot' });
  });
  btnLayoutDelCol.addEventListener('click', () => {
    if (runVisualEditorAction(() => deleteRichLayoutColumn())) return;
    updateStatus('Open Visual Editor to edit layout columns.');
    openRichEditorModal(hotspot, { type: editingHomePage ? 'home-page' : 'info-hotspot' });
  });
  btnLayoutDeleteBlock.addEventListener('click', () => {
    if (runVisualEditorAction(() => clearSelectedRichLayout())) return;
    updateStatus('Open Visual Editor to delete selected columns block.');
    openRichEditorModal(hotspot, { type: editingHomePage ? 'home-page' : 'info-hotspot' });
  });
  btnLayoutEqual.addEventListener('click', () => {
    if (runVisualEditorAction(() => setEqualRichLayoutColumnWidths())) return;
    updateStatus('Open Visual Editor to normalize selected columns width.');
    openRichEditorModal(hotspot, { type: editingHomePage ? 'home-page' : 'info-hotspot' });
  });
  colsSpaceInput.addEventListener('input', () => {
    if (runVisualEditorAction(() => {
      const layout = getSelectedRichLayoutElement();
      if (!layout) {
        updateStatus('Select a columns block first.');
        return;
      }
      applySpacingToRichLayout(layout, colsSpaceInput.value);
    })) return;
    updateStatus('Open Visual Editor and select a columns block first.');
  });
  colsSpaceInput.addEventListener('change', () => {
    if (runVisualEditorAction(() => {
      const layout = getSelectedRichLayoutElement();
      if (!layout) {
        updateStatus('Select a columns block first.');
        return;
      }
      applySpacingToRichLayout(layout, colsSpaceInput.value);
    })) return;
    updateStatus('Open Visual Editor and select a columns block first.');
  });
  btnLayoutBelow.addEventListener('click', () => {
    if (runVisualEditorAction(() => insertParagraphBelowSelectedBlock())) return;
    insertIntoRichSourceModal('\n<p><br></p>\n', hotspot);
  });
  btnLayoutAbove.addEventListener('click', () => {
    if (runVisualEditorAction(() => insertParagraphAboveSelectedBlock())) return;
    insertIntoRichSourceModal('\n<p><br></p>\n', hotspot);
  });
  btnDeleteRow.addEventListener('click', () => {
    if (runVisualEditorAction(() => deleteCurrentRichParagraph())) return;
    updateStatus('Open Visual Editor and place the cursor inside the row to delete.');
  });
  btnImageSize.addEventListener('click', () => {
    if (runVisualEditorAction(() => {
      const selectedMedia = getSelectedRichImageElement();
      if (!selectedMedia) {
        updateStatus('Select an image or video in visual editor first.');
        return;
      }
      const tagName = String(selectedMedia.tagName || '').toLowerCase();
      const isAspectLocked = tagName === 'video' || tagName === 'iframe';
      const currentRawSize = selectedMedia.style?.width || selectedMedia.getAttribute('width') || '';
      const input = prompt('Media size (examples: 50%, 320px, 640). Leave empty to reset.', currentRawSize);
      if (input === null) return;
      const nextSize = sanitizeImageSizeValue(input);
      if (!String(input).trim()) {
        if (tagName === 'img') {
          selectedMedia.style.maxHeight = DEFAULT_RICH_IMAGE_MAX_HEIGHT;
        } else {
          selectedMedia.style.removeProperty('max-height');
        }
        selectedMedia.style.removeProperty('width');
        selectedMedia.style.removeProperty('height');
        updateRichImageResizeHandle();
        return;
      }
      if (!nextSize) {
        updateStatus('Invalid size. Use % or px (e.g. 50% or 320px).');
        return;
      }
      selectedMedia.style.removeProperty('max-height');
      selectedMedia.style.width = nextSize;
      if (isAspectLocked) {
        const rect = selectedMedia.getBoundingClientRect();
        const widthPx =
          nextSize.endsWith('%')
            ? Math.max(24, rect.width)
            : Number.parseInt(nextSize, 10);
        if (Number.isFinite(widthPx) && widthPx > 0 && Number.isFinite(rect.width) && rect.width > 0) {
          const ratio = rect.height / rect.width;
          selectedMedia.style.height = `${Math.round(widthPx * ratio)}px`;
        } else {
          selectedMedia.style.removeProperty('height');
        }
      } else {
        selectedMedia.style.height = 'auto';
      }
      updateRichImageResizeHandle();
    })) return;
    updateStatus('Open Visual Editor to resize media.');
    openRichEditorModal(hotspot, { type: editingHomePage ? 'home-page' : 'info-hotspot' });
  });
  btnClearFormat.addEventListener('click', () => {
    if (execVisualEditorCommand('removeFormat')) return;
    clearFormattingInRichSourceModal(hotspot);
  });

  const toolbarRow1 = document.createElement('div');
  toolbarRow1.className = 'inline-actions rich-toolbar-row';
  toolbarRow1.append(
    btnOpenVisualEditor,
    btnOpenRichSource
  );

  const toolbarRow2 = document.createElement('div');
  toolbarRow2.className = 'inline-actions rich-toolbar-row';
  toolbarRow2.append(
    btnUploadLocalImage,
    btnInsertImageUrl
  );

  const toolbarRow3 = document.createElement('div');
  toolbarRow3.className = 'inline-actions rich-toolbar-row';
  toolbarRow3.append(
    btnUploadLocalVideo,
    btnInsertVideoUrl
  );

  const toolbarRow4 = document.createElement('div');
  toolbarRow4.className = 'inline-actions rich-toolbar-row';
  toolbarRow4.append(
    btnInsertBold,
    btnInsertItalic,
    btnInsertUnderline,
    btnAlignLeft,
    btnAlignCenter,
    btnAlignRight,
    btnAlignJustify
  );

  const toolbarRow5 = document.createElement('div');
  toolbarRow5.className = 'inline-actions rich-toolbar-row';
  toolbarRow5.append(
    sizeLabel,
    sizeInput,
    lineLabel,
    lineInput,
    pSpaceLabel,
    pSpaceInput
  );

  const toolbarRow6 = document.createElement('div');
  toolbarRow6.className = 'inline-actions rich-toolbar-row';
  toolbarRow6.append(
    textColorLabel,
    textColorPicker.root,
    bgColorLabel,
    bgColorPicker.root,
    bgOpacityLabel,
    bgOpacityInput
  );

  const toolbarRow7 = document.createElement('div');
  toolbarRow7.className = 'inline-actions rich-toolbar-row';
  toolbarRow7.append(
    btnInsertParagraph,
    btnInsertLink
  );

  const toolbarRow8 = document.createElement('div');
  toolbarRow8.className = 'inline-actions rich-toolbar-row';
  toolbarRow8.append(
    btnInsertCols,
    btnLayoutAddCol,
    btnLayoutDelCol,
    btnLayoutDeleteBlock
  );

  const toolbarRow9 = document.createElement('div');
  toolbarRow9.className = 'inline-actions rich-toolbar-row';
  toolbarRow9.append(
    colsSpaceLabel,
    colsSpaceInput,
    btnLayoutEqual
  );

  const toolbarRow10 = document.createElement('div');
  toolbarRow10.className = 'inline-actions rich-toolbar-row';
  toolbarRow10.append(
    btnLayoutBelow,
    btnLayoutAbove,
    btnDeleteRow
  );

  const toolbarRow11 = document.createElement('div');
  toolbarRow11.className = 'inline-actions rich-toolbar-row';
  toolbarRow11.append(
    btnImageSize,
    btnClearFormat
  );

  toolbar.replaceChildren(
    toolbarRow1,
    toolbarRow2,
    toolbarRow3,
    toolbarRow4,
    toolbarRow5,
    toolbarRow6,
    toolbarRow7,
    toolbarRow8,
    toolbarRow9,
    toolbarRow10,
    toolbarRow11
  );
  if (!infoContentEnabled) {
    const hint = document.createElement('div');
    hint.className = 'panel-hint';
    hint.textContent = 'Info Content is enabled only when New or Edit mode is ON.';
    contentBlocks.appendChild(hint);
  }
  contentBlocks.appendChild(toolbar);
  contentBlocks.appendChild(localImageInput);
  contentBlocks.appendChild(localVideoInput);
}

function addScene() {
  runtimeSceneActions?.addScene();
}

function createSceneRecord(name = 'New Scene', groupId = null) {
  return runtimeSceneActions?.createSceneRecord(name, groupId) || null;
}

function sceneNameFromFile(fileName) {
  return (fileName || 'New Scene').replace(/\.[^/.]+$/, '') || 'New Scene';
}

function setMainSceneForSelectedGroup() {
  runtimeSceneActions?.setMainSceneForSelectedGroup();
}

function ensureMainSceneForGroup(groupId, candidateSceneId = null) {
  runtimeSceneActions?.ensureMainSceneForGroup(groupId, candidateSceneId);
}

function normalizeGroupName(name) {
  return runtimeSceneActions?.normalizeGroupName(name) || '';
}

function hasDuplicateGroupName(nextName, currentGroupId = null) {
  return runtimeSceneActions?.hasDuplicateGroupName(nextName, currentGroupId) || false;
}

function addGroup() {
  runtimeSceneActions?.addGroup();
}

function setSelectedGroupAsMain() {
  runtimeSceneActions?.setSelectedGroupAsMain();
}

function renameSelectedGroup() {
  runtimeSceneActions?.renameSelectedGroup();
}

function deleteGroup() {
  runtimeSceneActions?.deleteGroup();
}

function deleteGroupById(groupId) {
  runtimeSceneActions?.deleteGroupById(groupId);
}

function deleteSceneById(sceneId) {
  runtimeSceneActions?.deleteSceneById(sceneId);
}

function deleteSelectedScenes() {
  runtimeSceneActions?.deleteSelectedScenes();
}

function clearSceneTargetReferences(deletedSceneIds) {
  runtimeSceneActions?.clearSceneTargetReferences(deletedSceneIds);
}

function deleteAllScenes() {
  const group = getSelectedGroup();
  if (!group) {
    updateStatus('Select a group first.');
    return;
  }

  const scenesInGroup = (state.project?.scenes || []).filter((scene) => scene.groupId === group.id);
  const total = scenesInGroup.length;
  if (!total) {
    updateStatus(`No images to delete in "${group.name}".`);
    return;
  }
  const confirmed = window.confirm(`Delete all ${total} image(s) in group "${group.name}"? This cannot be undone.`);
  if (!confirmed) {
    return;
  }

  const deletedSceneIds = new Set(scenesInGroup.map((scene) => scene.id));
  if (pendingSceneLinkDraft && deletedSceneIds.has(pendingSceneLinkDraft.sceneId)) {
    clearPendingSceneLinkDraft(false);
  }

  state.project.scenes = (state.project.scenes || []).filter((scene) => !deletedSceneIds.has(scene.id));
  clearSceneTargetReferences(deletedSceneIds);

  scenesInGroup.forEach((scene) => {
    generatedTiles.delete(scene.id);
    editorScenes.delete(scene.id);
  });

  const floorplans = (state.project?.minimap?.floorplans || []).filter((floorplan) => floorplan.groupId === group.id);
  floorplans.forEach((floorplan) => {
    floorplan.nodes = (floorplan.nodes || []).filter((node) => !deletedSceneIds.has(node.sceneId));
  });

  group.mainSceneId = null;
  ensureMainSceneForGroup(group.id);

  const fallbackScene = getPreferredSceneForGroup(group.id);
  state.selectedSceneId = fallbackScene?.id || null;
  state.selectedHotspotId = fallbackScene?.hotspots?.[0]?.id || null;
  state.multiSelectedSceneIds = state.selectedSceneId ? [state.selectedSceneId] : [];
  state.sceneSelectionAnchorId = state.selectedSceneId || null;

  renderAll();
  updateStatus(`Deleted ${total} image(s) from group "${group.name}".`);
  autosave();
}

function createInfoHotspotAt(coords = null) {
  const scene = getSelectedScene();
  if (!scene) {
    updateStatus('Select a scene first.');
    return null;
  }
  const infoCount = getSceneInfoHotspots(scene).length + 1;
  const hotspot = createHotspotRecord(`Info ${String(infoCount).padStart(2, '0')}`, [], {
    richContentHtml: '',
    markerColorKey: DEFAULT_INFO_HOTSPOT_COLOR_KEY,
    displayMode: DEFAULT_INFO_HOTSPOT_DISPLAY_MODE,
    infoFrameSize: {
      width: DEFAULT_INFO_FRAME_WIDTH,
      height: DEFAULT_INFO_FRAME_HEIGHT
    },
    infoFramePosition: {
      left: DEFAULT_INFO_FRAME_LEFT,
      top: DEFAULT_INFO_FRAME_TOP
    },
    infoFrameViewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    infoFrameAnchorOffset: {
      offsetX: DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_X,
      offsetY: DEFAULT_INFO_FRAME_HOTSPOT_OFFSET_Y
    },
    editorVisualStyle: {
      backgroundColorKey: DEFAULT_INFO_BG_COLOR_KEY,
      backgroundTransparency: DEFAULT_INFO_BG_TRANSPARENCY,
      backgroundOpacity: 100 - DEFAULT_INFO_BG_TRANSPARENCY
    }
  });
  const active = editorScenes.get(scene.id);
  const currentView = active?.view?.parameters ? active.view.parameters() : null;
  if (coords && typeof coords.yaw === 'number' && typeof coords.pitch === 'number') {
    hotspot.yaw = coords.yaw;
    hotspot.pitch = coords.pitch;
  } else if (currentView) {
    hotspot.yaw = Number(currentView.yaw) || 0;
    hotspot.pitch = Number(currentView.pitch) || 0;
  }
  hotspot.infoFramePosition = getDefaultInfoFramePositionFromHotspot(hotspot);
  scene.hotspots.push(hotspot);
  state.selectedHotspotId = hotspot.id;
  // Avoid full render/switchScene here so current yaw/pitch/fov stays unchanged.
  renderHotspotList();
  renderLinkEditor();
  renderContentBlocks();
  renderFloorplans();
  scheduleMarkerRender();
  updateStatus(`Info hotspot "${hotspot.title}" created.`);
  autosave();
  return hotspot;
}

function editSelectedInfoHotspot() {
  toggleInfoHotspotEditMode();
}

function saveSelectedInfoHotspotState() {
  const scene = getSelectedScene();
  if (!scene) {
    updateStatus('Select a scene first.');
    return;
  }
  const hotspot = getSelectedInfoHotspot();
  if (!hotspot) {
    updateStatus('Select an info hotspot first.');
    return;
  }
  if (!isInfoHotspotInteractionModeActive()) {
    updateStatus('Enable New or Edit mode first.');
    return;
  }

  const richEditorOpenForHotspot =
    richEditorModal?.classList.contains('visible') &&
    richEditorContext?.sceneId === scene.id &&
    richEditorContext?.hotspotId === hotspot.id;
  const richSourceOpenForHotspot =
    richSourceModal?.classList.contains('visible') &&
    richSourceContext?.sceneId === scene.id &&
    richSourceContext?.hotspotId === hotspot.id;

  if (richEditorOpenForHotspot) {
    saveRichEditorModalContent({ closeAfterSave: false, refreshPanel: true });
  }
  if (richSourceOpenForHotspot) {
    saveRichSourceModalContent({ closeAfterSave: false, refreshPanel: true });
  }
  if (!richEditorOpenForHotspot && !richSourceOpenForHotspot) {
    autosave();
  }

  updateStatus(`Info hotspot "${hotspot.title || hotspot.id}" saved.`);
}

function createHotspotRecord(title, contentBlocks, extra = null) {
  return {
    id: `hs-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    yaw: 0,
    pitch: 0,
    title: title || 'Hotspot',
    contentBlocks: contentBlocks || [],
    ...(extra || {})
  };
}

function getDefaultLinkTargetSceneId(currentScene) {
  if (!currentScene) return '';
  const options = getLinkTargetSceneOptions(currentScene.id);
  return options[0]?.id || '';
}

function normalizeLinkCode(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return '';
  return String(parsed).padStart(4, '0');
}

function ensureUniqueSceneLinkCodes() {
  if (!state.project) return 0;
  const used = new Set();
  let next = 1;
  let changes = 0;

  const reserve = (code) => {
    used.add(code);
    const numeric = Number.parseInt(code, 10);
    if (Number.isFinite(numeric) && numeric >= next) {
      next = numeric + 1;
    }
  };

  (state.project.scenes || []).forEach((scene) => {
    (scene.hotspots || []).forEach((hotspot) => {
      if (!isSceneLinkHotspot(hotspot)) return;

      let code = normalizeLinkCode(hotspot.linkCode || hotspot.title);
      if (!code || used.has(code)) {
        while (used.has(String(next).padStart(4, '0'))) {
          next += 1;
        }
        code = String(next).padStart(4, '0');
        next += 1;
        changes += 1;
      }

      reserve(code);
      if (hotspot.linkCode !== code) {
        hotspot.linkCode = code;
        changes += 1;
      }
      if (hotspot.title !== code) {
        hotspot.title = code;
        changes += 1;
      }
    });
  });

  return changes;
}

function getNextSceneLinkCode() {
  ensureUniqueSceneLinkCodes();
  let maxCode = 0;
  (state.project?.scenes || []).forEach((scene) => {
    (scene.hotspots || []).forEach((hotspot) => {
      const hasSceneLink = (hotspot.contentBlocks || []).some((block) => block.type === 'scene');
      if (!hasSceneLink) return;

      const codeFromField = Number.parseInt(String(hotspot.linkCode || ''), 10);
      if (Number.isFinite(codeFromField)) {
        maxCode = Math.max(maxCode, codeFromField);
        return;
      }

      const titleMatch = String(hotspot.title || '').match(/(\d{4,})/);
      if (titleMatch) {
        const codeFromTitle = Number.parseInt(titleMatch[1], 10);
        if (Number.isFinite(codeFromTitle)) {
          maxCode = Math.max(maxCode, codeFromTitle);
        }
      }
    });
  });

  return String(maxCode + 1).padStart(4, '0');
}

function refreshHotspotPanelsWithoutSceneSwitch() {
  // Keep current panorama orientation by avoiding renderAll()/switchEditorScene().
  syncOpenRichEditorContexts();
  renderHotspotList();
  renderLinkEditor();
  renderContentBlocks();
  scheduleMarkerRender();
}

runtimeHotspotActions = safeCreateRuntimeEditorModule(
  'hotspot-actions',
  () => window.IterpanoEditorHotspotActions?.createHotspotActionsController({
    getSelectedScene,
    getSelectedInfoHotspot,
    getSceneInfoHotspots,
    getSceneLinkHotspots,
    getSelectedHotspot,
    getPendingSceneLinkDraft: () => pendingSceneLinkDraft,
    setPendingSceneLinkDraft: (nextDraft) => {
      pendingSceneLinkDraft = nextDraft;
    },
    clearPendingSceneLinkDraft,
    getDefaultLinkTargetSceneId,
    getNextSceneLinkCode,
    normalizeSceneLinkColorKey,
    getNewLinkColorKey: () => state.newLinkColorKey,
    isPlacementMode: () => placementMode,
    togglePlacementMode,
    refreshHotspotPanelsWithoutSceneSwitch,
    renderHotspotList,
    renderLinkEditor,
    renderContentBlocks,
    updateStatus,
    autosave,
    getSelectedHotspotId: () => state.selectedHotspotId,
    setSelectedHotspotId: (nextHotspotId) => {
      state.selectedHotspotId = nextHotspotId;
    },
  }),
  [
    { label: 'IterpanoEditorHotspotActions', value: window.IterpanoEditorHotspotActions }
  ]
);

function deleteHotspot() {
  runtimeHotspotActions?.deleteInfoHotspot();
}

function addSceneLinkBlock() {
  runtimeHotspotActions?.addSceneLinkDraft();
}

function deleteSceneLinkBlock() {
  runtimeHotspotActions?.deleteSceneLink();
}

async function removeAllSceneLinksForCurrentScene() {
  const scope = await askDeleteLinksScope();
  if (scope === null) {
    updateStatus('Delete All cancelled.');
    return;
  }
  if (scope !== 'scene' && scope !== 'group') {
    updateStatus('Invalid choice. Type exactly "scene" or "group".');
    return;
  }

  const removeLinksFromScene = (scene) => {
    if (!scene) return 0;
    const before = (scene.hotspots || []).length;
    scene.hotspots = (scene.hotspots || []).filter((hotspot) => !isSceneLinkHotspot(hotspot));
    return before - scene.hotspots.length;
  };

  if (scope === 'scene') {
    const scene = getSelectedScene();
    if (!scene) {
      updateStatus('Select a scene first.');
      return;
    }
    if (pendingSceneLinkDraft?.sceneId === scene.id) {
      clearPendingSceneLinkDraft(false);
    }
    const removed = removeLinksFromScene(scene);
    if (!removed) {
      updateStatus('No links to remove in current scene.');
      return;
    }
    state.selectedHotspotId = scene.hotspots[0]?.id || null;
    refreshHotspotPanelsWithoutSceneSwitch();
    updateStatus(`Removed ${removed} link(s) from current scene.`);
    autosave();
    return;
  }

  const groupId = state.selectedGroupId;
  if (!groupId) {
    updateStatus('Select a group first.');
    return;
  }
  const groupScenes = (state.project?.scenes || []).filter((scene) => scene.groupId === groupId);
  if (!groupScenes.length) {
    updateStatus('No scenes in current group.');
    return;
  }
  const existingLinksInGroup = groupScenes.reduce((total, scene) => {
    return total + getSceneLinkHotspots(scene).length;
  }, 0);
  if (!existingLinksInGroup) {
    updateStatus('No links to remove in current group.');
    return;
  }
  const confirmDeleteGroupLinks = window.confirm(
    `Delete all ${existingLinksInGroup} link(s) in current group? This cannot be undone.`
  );
  if (!confirmDeleteGroupLinks) {
    updateStatus('Delete All cancelled.');
    return;
  }
  if (pendingSceneLinkDraft) {
    const pendingScene = state.project?.scenes?.find((scene) => scene.id === pendingSceneLinkDraft.sceneId);
    if (pendingScene?.groupId === groupId) {
      clearPendingSceneLinkDraft(false);
    }
  }

  let removed = 0;
  groupScenes.forEach((scene) => {
    removed += removeLinksFromScene(scene);
  });

  if (!removed) {
    updateStatus('No links to remove in current group.');
    return;
  }

  const selectedScene = getSelectedScene();
  state.selectedHotspotId = selectedScene?.hotspots?.[0]?.id || null;
  refreshHotspotPanelsWithoutSceneSwitch();
  updateStatus(`Removed ${removed} link(s) from current group.`);
  autosave();
}

function clampFov(value) {
  return Math.max(0.1, Math.min(Math.PI - 0.01, value));
}

function getSelectedSceneFov() {
  const scene = getSelectedScene();
  const sceneValue = Number(scene?.initialViewParameters?.fov);
  if (Number.isFinite(sceneValue)) {
    return clampFov(sceneValue);
  }
  const inputValue = Number(projectFovInput?.value);
  if (Number.isFinite(inputValue)) {
    return clampFov(inputValue);
  }
  return 1.4;
}

function applySelectedSceneFov(fov) {
  const scene = getSelectedScene();
  if (!scene) return;
  const safeFov = clampFov(fov);

  scene.initialViewParameters = {
    yaw: Number(scene.initialViewParameters?.yaw) || 0,
    pitch: Number(scene.initialViewParameters?.pitch) || 0,
    fov: safeFov
  };
  const sceneEntry = editorScenes.get(scene.id);
  if (sceneEntry?.data) {
    sceneEntry.data.initialViewParameters = { ...scene.initialViewParameters };
  }

  const active = editorScenes.get(scene.id);
  if (active?.view) {
    const current = active.view.parameters ? active.view.parameters() : active.data?.initialViewParameters;
    active.view.setParameters({
      yaw: Number(current?.yaw) || 0,
      pitch: Number(current?.pitch) || 0,
      fov: safeFov
    });
    scheduleMarkerRender();
  }
}

function updateProjectFov(value, { commit = false } = {}) {
  const scene = getSelectedScene();
  if (!scene) return;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    if (commit && projectFovInput) {
      projectFovInput.value = String(Number(getSelectedSceneFov().toFixed(2)));
    }
    return;
  }

  const safeFov = clampFov(parsed);
  applySelectedSceneFov(safeFov);

  if (commit && projectFovInput) {
    projectFovInput.value = String(Number(safeFov.toFixed(2)));
    updateStatus(`Scene FOV set to ${safeFov.toFixed(2)}.`);
    autosave();
  }
}

function updateProjectName(value) {
  if (!state.project) return;
  state.project.project.name = value;
  autosave();
}

function createResetProjectPayload() {
  const now = new Date().toISOString();
  const mainGroupId = `group-${Date.now()}`;
  const source = state.project || fallbackProject;
  return {
    project: {
      name: source?.project?.name || 'Sample Tour',
      version: source?.project?.version || '1.0',
      createdAt: source?.project?.createdAt || now,
      updatedAt: now
    },
    settings: {
      ...(source?.settings || fallbackProject.settings || {})
    },
    activeGroupId: mainGroupId,
    homePage: {
      richContentHtml: '',
      infoFrameSize: normalizeInfoFrameSize(null),
      infoFramePosition: normalizeInfoFramePosition(null),
      infoFrameViewport: normalizeInfoFrameViewport(null),
      infoFrameAnchorOffset: null
    },
    groups: [
      {
        id: mainGroupId,
        name: 'Main Group',
        mainSceneId: null
      }
    ],
    scenes: [],
    assets: {
      media: []
    },
    minimap: {
      enabled: false,
      image: '',
      nodes: [],
      floorplans: []
    }
  };
}

function resetProjectWithConfirmation() {
  if (!state.project) return;
  const warningMessage = [
    'Project reset will permanently remove:',
    '- all scenes and groups content',
    '- all generated tiles',
    '- all hotspots and links',
    '- all map/floorplan data',
    '- all uploaded media',
    '',
    'Type "reset" to continue:'
  ].join('\n');
  const input = window.prompt(warningMessage);
  if (input === null) {
    updateStatus('Project reset cancelled.');
    return;
  }
  if (String(input).trim().toLowerCase() !== 'reset') {
    updateStatus('Project reset aborted (confirmation word mismatch).');
    return;
  }

  if (tilerWorker && activeTilingRequestId) {
    tilerWorker.postMessage({ type: 'cancel', requestId: activeTilingRequestId });
    activeTilingRequestId = null;
    tilingPaused = false;
    showProgress(0, true);
  }

  generatedTiles.clear();
  editorScenes.clear();
  clearPendingSceneLinkDraft(false);
  clearHotspotMarkerElements();
  hideHotspotHoverCard();

  const payload = createResetProjectPayload();
  loadProject(payload);
  autosave();
  updateStatus('Project reset complete.');
}

function handleResize() {
  if (editorViewer) {
    editorViewer.updateSize();
  }
  if (richEditorModal?.classList.contains('visible')) {
    const hotspot = getInfoHotspotByContext(richEditorContext);
    if (hotspot) {
      applyRichEditorModalFrameSize(hotspot);
    } else {
      clampRichEditorModalPosition();
    }
    updateRichLayoutBlockResizeHandle();
    updateRichModalResizeHandle();
  }
  if (previewModal?.classList.contains('visible') && previewModal.classList.contains('preview-modal-rich-like')) {
    const hotspot = getPreviewHotspotByContext();
    if (hotspot) {
      applyPreviewModalFrameSize(hotspot);
    }
  }
  if (floorplanMapWindowOpen) {
    updateMapWindowBounds();
  }
  refreshFloorplanCanvasLayout();
}

function exportProject() {
  runtimeProjectExport?.exportProject();
}

async function exportProjectPackageZip() {
  return runtimeProjectExport?.exportProjectPackageZip() || Promise.resolve();
}

async function exportStaticPackage() {
  return runtimeProjectExport?.exportStaticPackage() || Promise.resolve();
}

function dataUrlToFile(dataUrl, fallbackName) {
  return runtimeProjectIoUtils?.dataUrlToFile(dataUrl, fallbackName) || null;
}

function sanitizeFilename(name) {
  return runtimeProjectIoUtils?.sanitizeFilename(name) || 'asset';
}

function downloadBlob(blob, filename) {
  runtimeProjectIoUtils?.downloadBlob(blob, filename);
}

async function exportZipPackage(project, jsonBlob, assets, tiles, runtimeFiles) {
  return runtimeProjectExport?.exportZipPackage(project, jsonBlob, assets, tiles, runtimeFiles) || Promise.resolve();
}

function blobToString(blob) {
  return runtimeProjectIoUtils?.blobToString(blob) || Promise.resolve('');
}

function blobToDataUrl(blob) {
  return runtimeProjectIoUtils?.blobToDataUrl(blob) || Promise.resolve('');
}

async function exportWithFileSystemAccess(project, jsonBlob, assets, tiles, runtimeFiles) {
  return runtimeProjectExport?.exportWithFileSystemAccess(project, jsonBlob, assets, tiles, runtimeFiles) || Promise.resolve();
}

function buildStaticPackageRootIndexHtml() {
  return runtimeProjectIoUtils?.buildStaticPackageRootIndexHtml() || '';
}

async function writeFile(directoryHandle, filename, blob) {
  return runtimeProjectIoUtils?.writeFile(directoryHandle, filename, blob);
}

async function writePathFile(root, path, blob) {
  return runtimeProjectIoUtils?.writePathFile(root, path, blob);
}

async function collectViewerRuntimeFiles() {
  return runtimeProjectIoUtils?.collectViewerRuntimeFiles() || [];
}

async function fetchRuntimeFile(path) {
  return runtimeProjectIoUtils?.fetchRuntimeFile(path) || null;
}

async function ensureFolder(root, name) {
  await root.getDirectoryHandle(name, { create: true });
}

function importProjectFile(file) {
  runtimeProjectImport?.importProjectFile(file);
}

async function importProjectPackageZip(file) {
  return runtimeProjectImport?.importProjectPackageZip(file) || Promise.resolve();
}

function uploadFloorplanFile(file) {
  const group = getSelectedGroup();
  if (!group) {
    updateStatus('Select a group first.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const existing = getFloorplanForGroup(group.id);
    const id = existing?.id || `floorplan-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const next = {
      id,
      groupId: group.id,
      name: file.name,
      dataUrl: reader.result,
      nodes: existing?.nodes || [],
      markerColorKey: normalizeFloorplanColorKey(existing?.markerColorKey || 'yellow')
    };
    state.project.minimap.floorplans = (state.project.minimap.floorplans || []).filter((fp) => fp.groupId !== group.id);
    state.project.minimap.floorplans.push(next);
    state.selectedFloorplanId = id;
    renderFloorplans();
    autosave();
  };
  reader.readAsDataURL(file);
}

function deleteFloorplan() {
  const group = getSelectedGroup();
  if (!group) return;
  const floorplans = state.project.minimap.floorplans || [];
  const index = floorplans.findIndex((fp) => fp.groupId === group.id);
  if (index === -1) return;
  const confirmed = window.confirm(`Delete map for group "${group.name}"?`);
  if (!confirmed) {
    updateStatus('Map delete cancelled.');
    return;
  }
  floorplans.splice(index, 1);
  state.selectedFloorplanId = null;
  renderFloorplans();
  updateStatus(`Map deleted for group "${group.name}".`);
  autosave();
}

function resetSceneTiles(scene) {
  generatedTiles.delete(scene.id);
  scene.tilesPath = undefined;
  scene.previewPath = undefined;
  scene.levels = [{ tileSize: 256, size: 256, fallbackOnly: true }];
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function computeFileHash(file) {
  try {
    if (!window.crypto?.subtle) return '';
    const buffer = await readFileAsArrayBuffer(file);
    const digest = await window.crypto.subtle.digest('SHA-256', buffer);
    const bytes = new Uint8Array(digest);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Hash generation failed:', error);
    return '';
  }
}

function readImageMetadata(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
}

function isDuplicatePanoramaInGroup(groupId, dataUrl, hash) {
  const scenes = (state.project?.scenes || []).filter((scene) => scene.groupId === groupId);
  return scenes.some((scene) => {
    const source = scene.sourceImage;
    if (!source) return false;
    if (hash && source.hash && source.hash === hash) return true;
    if (dataUrl && source.dataUrl && source.dataUrl === dataUrl) return true;
    return false;
  });
}

function normalizePanoramaFileName(name) {
  return String(name || '').trim().toLowerCase();
}

function getDuplicateMatchesInOtherGroups(groupId, { dataUrl = '', hash = '', fileName = '' } = {}) {
  const normalizedFileName = normalizePanoramaFileName(fileName);
  const scenes = state.project?.scenes || [];
  let matches = [];

  if (hash) {
    matches = scenes.filter((scene) =>
      scene?.sourceImage &&
      scene.groupId !== groupId &&
      String(scene.sourceImage.hash || '').trim() === hash
    );
  }
  if (!matches.length && dataUrl) {
    matches = scenes.filter((scene) =>
      scene?.sourceImage &&
      scene.groupId !== groupId &&
      scene.sourceImage.dataUrl &&
      scene.sourceImage.dataUrl === dataUrl
    );
  }
  if (!matches.length && normalizedFileName) {
    matches = scenes.filter((scene) =>
      scene?.sourceImage &&
      scene.groupId !== groupId &&
      normalizePanoramaFileName(scene.sourceImage.name) === normalizedFileName
    );
  }

  const uniqueByScene = new Map();
  matches.forEach((scene) => {
    const group = getGroupById(scene.groupId);
    uniqueByScene.set(scene.id, {
      sceneId: scene.id,
      sceneName: scene.name || scene.id,
      groupId: scene.groupId,
      groupName: group?.name || scene.groupId || 'Unknown Group'
    });
  });
  return Array.from(uniqueByScene.values());
}

function findDuplicatePanoramaInOtherGroups(groupId, dataUrl, hash, fileName = '') {
  const matches = getDuplicateMatchesInOtherGroups(groupId, { dataUrl, hash, fileName });
  return matches[0] || null;
}

async function precomputeCrossGroupDuplicates(fileList, groupId) {
  const duplicateByFile = new Map();
  const hashByFile = new Map();
  const dataUrlByFile = new Map();
  const entries = [];

  for (const file of fileList) {
    const hash = await computeFileHash(file);
    if (hash) {
      hashByFile.set(file, hash);
    }

    let matches = getDuplicateMatchesInOtherGroups(groupId, { hash, fileName: file.name });
    let dataUrl = '';
    if (!matches.length) {
      dataUrl = await readFileAsDataUrl(file);
      dataUrlByFile.set(file, dataUrl);
      matches = getDuplicateMatchesInOtherGroups(groupId, { dataUrl, hash, fileName: file.name });
    }

    if (!matches.length) continue;
    duplicateByFile.set(file, matches);
    entries.push({
      fileName: file.name,
      matches
    });
  }

  return {
    entries,
    totalDuplicates: entries.length,
    skipAll: false,
    proceedAll: false,
    duplicateByFile,
    hashByFile,
    dataUrlByFile
  };
}

function formatDuplicatePanoramaList(entries = []) {
  return entries.map((entry, index) => ({
    index: index + 1,
    fileName: entry.fileName || 'Unknown file',
    matches: (entry.matches || []).map((match) => ({
      groupName: match.groupName || match.groupId || 'Unknown group',
      sceneName: match.sceneName || match.sceneId || 'Unknown scene'
    }))
  }));
}

function getDuplicateGroupSummary(entries = []) {
  const groupToFiles = new Map();
  entries.forEach((entry) => {
    const fileKey = String(entry.fileName || '').trim();
    const seenGroups = new Set();
    (entry.matches || []).forEach((match) => {
      const groupName = String(match.groupName || match.groupId || 'Unknown Group').trim();
      if (!groupName || seenGroups.has(groupName)) return;
      seenGroups.add(groupName);
      if (!groupToFiles.has(groupName)) {
        groupToFiles.set(groupName, new Set());
      }
      groupToFiles.get(groupName).add(fileKey);
    });
  });
  return Array.from(groupToFiles.entries())
    .map(([groupName, files]) => ({ groupName, count: files.size }))
    .sort((a, b) => b.count - a.count || a.groupName.localeCompare(b.groupName, undefined, { sensitivity: 'base' }));
}

function openDuplicatePanoramaListModal(entries = []) {
  if (!duplicatePanoramaListModal || !duplicatePanoramaListBody) return;
  const rows = formatDuplicatePanoramaList(entries);
  const groupSummary = getDuplicateGroupSummary(entries);
  const summaryHtml = groupSummary.length
    ? `
      <div class="duplicate-list-item">
        <div class="duplicate-file">Groups summary</div>
        ${groupSummary.map((item) => `<div>${escapeHtml(item.groupName)}: ${item.count}</div>`).join('')}
      </div>
    `
    : '';
  if (!rows.length) {
    duplicatePanoramaListBody.innerHTML = '<div class="panel-hint">No duplicate images found.</div>';
  } else {
    duplicatePanoramaListBody.innerHTML = `
      <div class="duplicate-list">
        ${summaryHtml}
        ${rows.map((row) => `
          <div class="duplicate-list-item">
            <div class="duplicate-file">${row.index}. ${escapeHtml(row.fileName)}</div>
            ${row.matches.map((match) => `
              <div>Group: ${escapeHtml(match.groupName)}</div>
              <div>Scene: ${escapeHtml(match.sceneName)}</div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }
  duplicatePanoramaListModal.classList.add('visible');
  duplicatePanoramaListModal.setAttribute('aria-hidden', 'false');
}

function closeDuplicatePanoramaListModal() {
  if (!duplicatePanoramaListModal) return;
  duplicatePanoramaListModal.classList.remove('visible');
  duplicatePanoramaListModal.setAttribute('aria-hidden', 'true');
}

function openDuplicatePanoramaModal(fileName, duplicateInfo, context = null) {
  if (!duplicatePanoramaModal || !duplicatePanoramaMessage) return;
  const sceneName = duplicateInfo?.sceneName || duplicateInfo?.sceneId || 'Unknown Scene';
  const groupName = duplicateInfo?.groupName || duplicateInfo?.groupId || 'Unknown Group';
  const duplicateCount = Math.max(1, Number(context?.totalDuplicates) || context?.entries?.length || 1);
  const groupSummary = getDuplicateGroupSummary(context?.entries || []);
  const groupSummaryLines = groupSummary.length
    ? ['Groups involved:', ...groupSummary.map((item) => `- ${item.groupName}: ${item.count}`), '']
    : [];
  duplicatePanoramaMessage.textContent = [
    `${duplicateCount} Image(s) already exist in other groups.`,
    '',
    ...groupSummaryLines,
    `Current file: "${fileName}"`,
    `Group: ${groupName}`,
    `Scene: ${sceneName}`,
    '',
    'Choose what to do:'
  ].join('\n');
  duplicatePanoramaListEntries = Array.isArray(context?.entries) ? [...context.entries] : [];
  duplicatePanoramaModal.classList.add('visible');
  duplicatePanoramaModal.setAttribute('aria-hidden', 'false');
}

function closeDuplicatePanoramaModal() {
  if (!duplicatePanoramaModal) return;
  duplicatePanoramaModal.classList.remove('visible');
  duplicatePanoramaModal.setAttribute('aria-hidden', 'true');
  closeDuplicatePanoramaListModal();
}

function resolveDuplicatePanoramaChoice(choice) {
  if (!duplicatePanoramaResolver) return;
  const resolver = duplicatePanoramaResolver;
  duplicatePanoramaResolver = null;
  closeDuplicatePanoramaModal();
  resolver(choice);
}

async function askCrossGroupDuplicateAction(fileName, duplicateInfo, context = { entries: [], skipAll: false }) {
  if (
    duplicatePanoramaModal &&
    duplicatePanoramaMessage &&
    btnDuplicatePanoramaProceed &&
    btnDuplicatePanoramaAcceptAll &&
    btnDuplicatePanoramaSkip &&
    btnDuplicatePanoramaCancel
  ) {
    return new Promise((resolve) => {
      duplicatePanoramaResolver = resolve;
      openDuplicatePanoramaModal(fileName, duplicateInfo, context);
    });
  }

  const sceneName = duplicateInfo?.sceneName || duplicateInfo?.sceneId || 'Unknown Scene';
  const groupName = duplicateInfo?.groupName || duplicateInfo?.groupId || 'Unknown Group';
  while (true) {
    const choice = prompt(
      [
        `Image "${fileName}" already exists in another group.`,
        `Group: ${groupName}`,
        `Scene: ${sceneName}`,
        '',
        'Type one option:',
        '- proceed',
        '- accept all',
        '- skip',
        '- skip all',
        '- list',
        '- cancel'
      ].join('\n'),
      'skip'
    );
    if (choice === null) return 'cancel';
    const normalized = String(choice).trim().toLowerCase();
    if (normalized === 'list') {
      const rows = formatDuplicatePanoramaList(context.entries);
      alert(rows.length
        ? rows.map((row) => `${row.index}. ${row.fileName}\n${row.matches.map((match) => `   Group: ${match.groupName}\n   Scene: ${match.sceneName}`).join('\n')}`).join('\n')
        : 'No duplicate images found.');
      continue;
    }
    if (normalized === 'accept all' || normalized === 'acceptall') {
      return 'accept-all';
    }
    if (normalized === 'proceed' || normalized === 'skip' || normalized === 'skip all' || normalized === 'skipall' || normalized === 'cancel') {
      if (normalized === 'skip all' || normalized === 'skipall') return 'skip-all';
      return normalized;
    }
    alert('Invalid option. Type exactly: proceed, accept all, skip, skip all, list, or cancel.');
  }
}

function applyPanoramaToScene(scene, file, dataUrl, meta, hash = '') {
  if (meta) {
    scene.sourceImage = {
      name: file.name,
      dataUrl,
      hash,
      width: meta.width,
      height: meta.height
    };
  } else {
    scene.sourceImage = {
      name: file.name,
      dataUrl,
      hash
    };
  }
  resetSceneTiles(scene);
}

async function uploadPanoramaFile(file, options = {}) {
  const groupId = options.groupId || options.scene?.groupId || state.selectedGroupId || state.project?.groups?.[0]?.id || null;
  if (!groupId) {
    updateStatus('Create a group first.');
    return { ok: false, duplicate: false };
  }

  const dataUrl = options.dataUrl || await readFileAsDataUrl(file);
  const meta = options.meta || await readImageMetadata(dataUrl);
  const hash = options.hash || await computeFileHash(file);

  if (isDuplicatePanoramaInGroup(groupId, dataUrl, hash)) {
    if (!options.suppressDuplicateStatus) {
      alert(`Image "${file.name}" already exists in this group.`);
      updateStatus(`Image "${file.name}" ignored: already exists in this group.`);
    }
    return { ok: false, duplicate: true, duplicateScope: 'same-group' };
  }

  const duplicateInOtherGroup =
    (options.precomputedDuplicateMatchesInOtherGroup?.[0] || null) ||
    findDuplicatePanoramaInOtherGroups(groupId, dataUrl, hash, file.name);
  if (duplicateInOtherGroup) {
    const duplicateBatchContext = options.duplicateBatchContext || { entries: [], totalDuplicates: 1, skipAll: false };

    let action = 'skip';
    if (duplicateBatchContext.skipAll) {
      action = 'skip-all';
    } else if (duplicateBatchContext.proceedAll) {
      action = 'proceed';
    } else {
      action = await askCrossGroupDuplicateAction(file.name, duplicateInOtherGroup, duplicateBatchContext);
    }
    if (action === 'cancel') {
      updateStatus('Upload cancelled.');
      return { ok: false, cancelled: true };
    }
    if (action === 'accept-all') {
      duplicateBatchContext.proceedAll = true;
      action = 'proceed';
    }
    if (action === 'skip-all') {
      duplicateBatchContext.skipAll = true;
      updateStatus(`Image "${file.name}" skipped (Skip All active).`);
      return { ok: false, duplicate: true, duplicateScope: 'other-group' };
    }
    if (action === 'skip') {
      updateStatus(`Image "${file.name}" skipped: already exists in group "${duplicateInOtherGroup.groupName}".`);
      return { ok: false, duplicate: true, duplicateScope: 'other-group' };
    }
  }

  let scene = options.scene || null;
  if (!scene) {
    scene = createSceneRecord(sceneNameFromFile(file.name), groupId);
    state.project.scenes.push(scene);
    ensureMainSceneForGroup(groupId, scene.id);
    state.selectedSceneId = scene.id;
    state.selectedHotspotId = null;
  }
  applyPanoramaToScene(scene, file, dataUrl, meta, hash);

  if (!options.skipRender) {
    updateStatus(meta ? 'Panorama loaded. Ready to generate tiles.' : 'Panorama loaded (size unknown). Ready to generate tiles.');
    refreshEditorScenes();
    renderAll();
    autosave();
  }
  return { ok: true, duplicate: false, sceneId: scene.id };
}

async function uploadPanoramaFiles(files) {
  const fileList = Array.from(files || []);
  if (!fileList.length) return;

  let imported = 0;
  let cancelled = false;
  const ignoredSameGroup = [];
  const ignoredOtherGroup = [];
  const createdSceneIds = [];
  const targetGroupId = state.selectedGroupId || state.project?.groups?.[0]?.id || null;
  const duplicateBatchContext = await precomputeCrossGroupDuplicates(fileList, targetGroupId);

  for (const file of fileList) {
    try {
      const result = await uploadPanoramaFile(file, {
        groupId: targetGroupId,
        dataUrl: duplicateBatchContext.dataUrlByFile.get(file) || undefined,
        skipRender: true,
        suppressDuplicateStatus: true,
        duplicateBatchContext,
        hash: duplicateBatchContext.hashByFile.get(file) || '',
        precomputedDuplicateMatchesInOtherGroup: duplicateBatchContext.duplicateByFile.get(file) || null
      });
      if (result?.duplicate) {
        if (result.duplicateScope === 'other-group') {
          ignoredOtherGroup.push(file.name);
        } else {
          ignoredSameGroup.push(file.name);
        }
        continue;
      }
      if (result?.cancelled) {
        cancelled = true;
        break;
      }
      if (result?.ok && result.sceneId) {
        createdSceneIds.push(result.sceneId);
        imported += 1;
      }
    } catch (error) {
      console.error('Panorama upload failed:', file.name, error);
    }
  }

  if (createdSceneIds.length) {
    const preferredScene = getPreferredSceneForGroup(targetGroupId) || state.project.scenes.find((scene) => scene.id === createdSceneIds[0]) || null;
    state.selectedSceneId = preferredScene?.id || null;
    state.selectedHotspotId = null;
  }

  refreshEditorScenes();
  renderAll();
  const ignoredCount = ignoredSameGroup.length + ignoredOtherGroup.length;
  if (ignoredCount) {
    const scopes = [];
    if (ignoredSameGroup.length) scopes.push(`same group: ${ignoredSameGroup.length}`);
    if (ignoredOtherGroup.length) scopes.push(`other groups skipped: ${ignoredOtherGroup.length}`);
    const cancelPart = cancelled ? ' Upload stopped by user.' : '';
    const scopesPart = scopes.length ? ` (${scopes.join(', ')})` : '';
    updateStatus(`Loaded ${imported}/${fileList.length} panoramas. Ignored duplicates: ${ignoredCount}${scopesPart}.${cancelPart}`);
  } else {
    updateStatus(cancelled
      ? `Loaded ${imported}/${fileList.length} panoramas. Upload stopped by user.`
      : `Loaded ${imported}/${fileList.length} panoramas. Double-click a scene name to rename.`);
  }
  autosave();
}

function askTileOptions() {
  const faceInput = prompt('Face size (e.g., 1024, 2048, 4096)', '1024');
  if (faceInput === null) return null;
  const tileInput = prompt('Tile size (e.g., 256, 512)', '512');
  if (tileInput === null) return null;
  return {
    faceSize: Number(faceInput) || 1024,
    tileSize: Number(tileInput) || 512
  };
}

function highestPowerOfTwoAtOrBelow(value) {
  const n = Math.floor(Number(value) || 0);
  if (n < 1) return 1;
  return 2 ** Math.floor(Math.log2(n));
}

async function showTileSizingInfo() {
  const scene = getSelectedScene();
  if (!scene || !scene.sourceImage?.dataUrl) {
    updateStatus('Select a scene with an uploaded 360 image first.');
    return;
  }

  let width = Number(scene.sourceImage.width) || 0;
  let height = Number(scene.sourceImage.height) || 0;
  if (!width || !height) {
    const meta = await readImageMetadata(scene.sourceImage.dataUrl);
    if (meta?.width && meta?.height) {
      width = meta.width;
      height = meta.height;
      scene.sourceImage.width = width;
      scene.sourceImage.height = height;
    }
  }

  if (!width || !height) {
    updateStatus('Could not detect image resolution for this scene.');
    return;
  }

  const maxUsefulFaceRaw = Math.max(256, Math.floor(Math.min(width / 4, height / 2)));
  const maxUsefulFacePow2 = highestPowerOfTwoAtOrBelow(maxUsefulFaceRaw);
  const maxUsefulTile = Math.max(256, highestPowerOfTwoAtOrBelow(maxUsefulFacePow2 / 4));
  const suggestedFaceSizes = [512, 1024, 2048, 4096, 8192].filter((v) => v <= maxUsefulFacePow2);
  const suggestedTileSizes = [256, 512, 1024, 2048].filter((v) => v <= maxUsefulTile);

  const lines = [
    `Scene: ${scene.name || scene.id}`,
    `Source image: ${width} x ${height}`,
    '',
    `Max useful face size (no upscaling): ${maxUsefulFaceRaw}px`,
    `Recommended face size (power of 2): ${maxUsefulFacePow2}px`,
    `Max useful tile size: ${maxUsefulTile}px`,
    '',
    `Suggested face sizes: ${suggestedFaceSizes.length ? suggestedFaceSizes.join(', ') : maxUsefulFacePow2}`,
    `Suggested tile sizes: ${suggestedTileSizes.length ? suggestedTileSizes.join(', ') : maxUsefulTile}`,
    '',
    'Note: larger tiles create fewer files but reduce zoom detail granularity.'
  ];

  alert(lines.join('\n'));
  updateStatus(`Tile info ready for "${scene.name || scene.id}".`);
}

async function generateTilesForScene(options = {}) {
  const scene = options.scene || getSelectedScene();
  if (!scene || !scene.sourceImage?.dataUrl) {
    updateStatus('Upload a 360 image first.');
    return;
  }

  try {
    const tileOptions = options.tileOptions || askTileOptions();
    if (!tileOptions) {
      updateStatus('Tiling cancelled.');
      return;
    }
    const faceSize = tileOptions.faceSize;
    const tileSize = tileOptions.tileSize;
    const sceneLabel = options.sceneLabel ? ` (${options.sceneLabel})` : '';
    updateStatus(`Generating tiles for "${scene.name || scene.id}"${sceneLabel}...`);
    showProgress(0);
    tilingPaused = false;
    const tiles = await buildCubemapTiles(scene.id, scene.sourceImage.dataUrl, faceSize, tileSize);
    generatedTiles.set(scene.id, tiles);

    scene.tilesPath = `tiles/${scene.id}`;
    scene.previewPath = `tiles/${scene.id}/preview.jpg`;
    scene.levels = [
      { tileSize, size: faceSize }
    ];
    scene.faceSize = faceSize;

    if (!options.skipViewerRefresh) {
      // Avoid rebuilding scenes during tiling completion to prevent stage sync errors.
      suppressSceneSwitch = true;
      setTimeout(() => {
        suppressSceneSwitch = false;
        switchEditorScene();
        scheduleMarkerRender();
      }, 250);
    }

    updateStatus(`Tiles generated for "${scene.name || scene.id}". Export static to save files.`);
    showProgress(100, true);
    autosave();
    return true;
  } catch (error) {
    console.error('Tiling error:', error);
    if (error?.message === 'cancelled') {
      updateStatus('Tiling cancelled.');
      showProgress(0, true);
      throw error;
    }
    updateStatus(`Tiling failed${error?.message ? `: ${error.message}` : '.'}`);
    showProgress(0, true);
    throw error;
  }
}

function getTileSelectionScenes() {
  const scenes = state.project?.scenes || [];
  const selectedIds = (state.multiSelectedSceneIds || []).filter(Boolean);
  if (selectedIds.length) {
    const selectedSet = new Set(selectedIds);
    return scenes.filter((scene) => selectedSet.has(scene.id));
  }
  const selectedScene = getSelectedScene();
  return selectedScene ? [selectedScene] : [];
}

async function generateTilesForSelectedScenes() {
  if (!state.project?.scenes?.length) {
    updateStatus('No scenes available.');
    return;
  }

  const selectedScenes = getTileSelectionScenes();
  if (!selectedScenes.length) {
    updateStatus('Select at least one scene.');
    return;
  }

  const alreadyTiled = selectedScenes.filter((scene) => sceneHasGeneratedTiles(scene));
  const scenesToProcess = selectedScenes.filter((scene) => !sceneHasGeneratedTiles(scene));
  const scenesWithPanorama = scenesToProcess.filter((scene) => scene.sourceImage?.dataUrl);
  const skippedNoPanorama = scenesToProcess.length - scenesWithPanorama.length;

  if (!scenesWithPanorama.length) {
    if (alreadyTiled.length && !skippedNoPanorama) {
      updateStatus(`All selected scenes already have tiles. Skipped: ${alreadyTiled.length}.`);
      renderSceneList();
      return;
    }
    if (alreadyTiled.length && skippedNoPanorama) {
      updateStatus(`No new scenes to tile. Already tiled: ${alreadyTiled.length}. Without image: ${skippedNoPanorama}.`);
      renderSceneList();
      return;
    }
    updateStatus('Selected scenes have no uploaded 360 image.');
    return;
  }

  const tileOptions = askTileOptions();
  if (!tileOptions) {
    updateStatus('Tiling cancelled.');
    return;
  }

  const originalSceneId = state.selectedSceneId;
  let completed = 0;

  try {
    for (let i = 0; i < scenesWithPanorama.length; i += 1) {
      const scene = scenesWithPanorama[i];
      await generateTilesForScene({
        scene,
        tileOptions,
        skipViewerRefresh: true,
        sceneLabel: `${i + 1}/${scenesWithPanorama.length}`
      });
      completed += 1;
    }
    const skippedParts = [];
    if (alreadyTiled.length) skippedParts.push(`already tiled: ${alreadyTiled.length}`);
    if (skippedNoPanorama) skippedParts.push(`without image: ${skippedNoPanorama}`);
    const skippedPart = skippedParts.length ? ` Skipped ${skippedParts.join(', ')}.` : '';
    updateStatus(`Tiles generated for ${completed}/${scenesWithPanorama.length} selected scenes.${skippedPart}`);
  } catch (error) {
    if (error?.message === 'cancelled') {
      updateStatus(`Tiling cancelled (${completed}/${scenesWithPanorama.length} selected scenes completed).`);
    } else {
      updateStatus(`Selected tiling failed (${completed}/${scenesWithPanorama.length} completed).`);
    }
  } finally {
    const stillExists = state.project.scenes.some((scene) => scene.id === originalSceneId);
    state.selectedSceneId = stillExists ? originalSceneId : state.project.scenes[0]?.id || null;
    renderSceneList();
    switchEditorScene();
    scheduleMarkerRender();
  }
}

async function generateAllTiles() {
  if (!state.project?.scenes?.length) {
    updateStatus('No scenes available.');
    return;
  }

  const allScenes = [...(state.project.scenes || [])];
  const alreadyTiled = allScenes.filter((scene) => sceneHasGeneratedTiles(scene));
  const tilePolicy = await askGenerateAllTilesExistingPolicy(alreadyTiled);
  if (tilePolicy === 'cancel') {
    updateStatus('Generate all tiles cancelled.');
    return;
  }

  const candidateScenes = tilePolicy === 'overwrite'
    ? allScenes
    : allScenes.filter((scene) => !sceneHasGeneratedTiles(scene));
  const scenesWithPanorama = candidateScenes.filter((scene) => scene.sourceImage?.dataUrl);
  const skippedAlreadyTiled = tilePolicy === 'skip' ? alreadyTiled.length : 0;
  const skippedNoPanorama = candidateScenes.length - scenesWithPanorama.length;

  if (!scenesWithPanorama.length) {
    if (skippedAlreadyTiled || skippedNoPanorama) {
      const parts = [];
      if (skippedAlreadyTiled) parts.push(`already tiled: ${skippedAlreadyTiled}`);
      if (skippedNoPanorama) parts.push(`without image: ${skippedNoPanorama}`);
      updateStatus(`No scenes to process. Skipped ${parts.join(', ')}.`);
    } else {
      updateStatus('No scenes with uploaded 360 images.');
    }
    renderSceneList();
    return;
  }

  const tileOptions = askTileOptions();
  if (!tileOptions) {
    updateStatus('Tiling cancelled.');
    return;
  }

  if (tilePolicy === 'overwrite') {
    scenesWithPanorama.forEach((scene) => resetSceneTiles(scene));
  }

  const originalSceneId = state.selectedSceneId;
  let completed = 0;

  try {
    for (let i = 0; i < scenesWithPanorama.length; i += 1) {
      const scene = scenesWithPanorama[i];
      await generateTilesForScene({
        scene,
        tileOptions,
        skipViewerRefresh: true,
        sceneLabel: `${i + 1}/${scenesWithPanorama.length}`
      });
      completed += 1;
    }
    const skippedParts = [];
    if (tilePolicy === 'skip' && skippedAlreadyTiled) skippedParts.push(`already tiled: ${skippedAlreadyTiled}`);
    if (skippedNoPanorama) skippedParts.push(`without image: ${skippedNoPanorama}`);
    const skippedPart = skippedParts.length ? ` Skipped ${skippedParts.join(', ')}.` : '';
    updateStatus(`Tiles generated for ${completed}/${scenesWithPanorama.length} scenes.${skippedPart}`);
  } catch (error) {
    if (error?.message === 'cancelled') {
      updateStatus(`Generate all tiles cancelled (${completed}/${scenesWithPanorama.length} completed).`);
    } else {
      updateStatus(`Generate all tiles failed (${completed}/${scenesWithPanorama.length} completed).`);
    }
  } finally {
    const stillExists = state.project.scenes.some((scene) => scene.id === originalSceneId);
    state.selectedSceneId = stillExists ? originalSceneId : state.project.scenes[0]?.id || null;
    renderSceneList();
    switchEditorScene();
    scheduleMarkerRender();
  }
}

async function buildCubemapTiles(sceneId, dataUrl, faceSize, tileSize) {
  const worker = getTilerWorker();
  if (worker) {
    return new Promise((resolve, reject) => {
      const requestId = `${sceneId}-${Date.now()}`;
      activeTilingRequestId = requestId;
      worker.postMessage({ type: 'start', requestId, sceneId, dataUrl, faceSize, tileSize });

      const handler = (event) => {
        const message = event.data;
        if (message.requestId !== requestId) return;

        if (message.type === 'progress') {
          updateProgress(message.value);
          return;
        }

        if (message.type === 'result') {
          worker.removeEventListener('message', handler);
          updateProgress(100);
          activeTilingRequestId = null;
          resolve(message.tiles);
        }

        if (message.type === 'error') {
          worker.removeEventListener('message', handler);
          activeTilingRequestId = null;
          console.warn('Worker tiling failed:', message.reason || 'unknown');
          updateStatus(`Tiling failed in worker${message.reason ? `: ${message.reason}` : ''}. Falling back to main thread.`);
          buildCubemapTilesMain(sceneId, dataUrl, faceSize, tileSize)
            .then(resolve)
            .catch(reject);
        }
        if (message.type === 'cancelled') {
          worker.removeEventListener('message', handler);
          activeTilingRequestId = null;
          updateStatus('Tiling cancelled.');
          showProgress(0, true);
          reject(new Error('cancelled'));
        }
      };

      worker.addEventListener('message', handler);
    });
  }

  return buildCubemapTilesMain(sceneId, dataUrl, faceSize, tileSize);
}

async function buildCubemapTilesMain(sceneId, dataUrl, faceSize, tileSize) {
  updateStatus('Generating tiles (main thread)...');
  const img = await loadImage(dataUrl);
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = img.width;
  sourceCanvas.height = img.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  sourceCtx.drawImage(img, 0, 0);
  const sourceData = sourceCtx.getImageData(0, 0, img.width, img.height).data;

  const faces = ['f', 'b', 'l', 'r', 'u', 'd'];
  const tiles = {};

  const faceCanvases = faces.map((face) =>
    renderFace(sourceData, img.width, img.height, face, faceSize)
  );
  const preview = document.createElement('canvas');
  preview.width = 512;
  preview.height = 256;
  const ctx = preview.getContext('2d');
  ctx.drawImage(img, 0, 0, preview.width, preview.height);
  tiles[`${sceneTilePath(sceneId)}/preview.jpg`] = preview.toDataURL('image/jpeg', 0.8);

  const tilesPerSide = Math.ceil(faceSize / tileSize);
  faceCanvases.forEach((faceCanvas, faceIndex) => {
    for (let y = 0; y < tilesPerSide; y += 1) {
      for (let x = 0; x < tilesPerSide; x += 1) {
        const tile = document.createElement('canvas');
        tile.width = tileSize;
        tile.height = tileSize;
        const tctx = tile.getContext('2d');
        tctx.drawImage(
          faceCanvas,
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          tileSize,
          tileSize
        );
        const path = `${sceneTilePath(sceneId)}/0/${faces[faceIndex]}/${y}/${x}.jpg`;
        tiles[path] = tile.toDataURL('image/jpeg', 0.85);
      }
    }
  });

  return tiles;
}

function getTilerWorker() {
  if (!window.Worker || !window.OffscreenCanvas) {
    return null;
  }

  if (!tilerWorker) {
    tilerWorker = new Worker('tiler.worker.js');
  }

  return tilerWorker;
}

function updateProgress(value) {
  const now = Date.now();
  if (now - lastProgressUpdate < 120) return;
  lastProgressUpdate = now;
  updateStatus(`Generating tiles: ${Math.round(value)}%`);
  showProgress(value);
}

function pauseTiling() {
  if (!tilerWorker || !activeTilingRequestId) {
    updateStatus('No active tiling task.');
    return;
  }
  tilingPaused = true;
  tilerWorker.postMessage({ type: 'pause', requestId: activeTilingRequestId });
  updateStatus('Tiling paused.');
}

function resumeTiling() {
  if (!tilerWorker || !activeTilingRequestId) {
    updateStatus('No active tiling task.');
    return;
  }
  tilingPaused = false;
  tilerWorker.postMessage({ type: 'resume', requestId: activeTilingRequestId });
  updateStatus('Tiling resumed.');
}

function showProgress(value, done = false) {
  tilingProgress.style.display = 'block';
  tilingProgressFill.style.width = `${Math.max(0, Math.min(100, value))}%`;
  if (done) {
    setTimeout(() => {
      tilingProgress.style.display = 'none';
      tilingProgressFill.style.width = '0%';
    }, 800);
  }
}

function sceneTilePath(sceneId) {
  return `tiles/${sceneId}`;
}

function setSceneOrientationById(sceneId) {
  const scene = state.project?.scenes?.find((item) => item.id === sceneId) || null;
  const active = scene ? editorScenes.get(scene.id) : null;
  if (!scene || !active?.view) {
    updateStatus('Select a scene with a visible preview first.');
    return false;
  }

  const current = active.view.parameters ? active.view.parameters() : null;
  if (!current) {
    updateStatus('Unable to read current view orientation.');
    return false;
  }

  scene.initialViewParameters = {
    yaw: Number(current.yaw) || 0,
    pitch: Number(current.pitch) || 0,
    fov: Number(current.fov) || scene.initialViewParameters?.fov || 1.4
  };
  scene.orientationSaved = true;
  active.data.initialViewParameters = { ...scene.initialViewParameters };
  active.data.orientationSaved = true;
  if (state.selectedSceneId !== scene.id) {
    state.selectedSceneId = scene.id;
    state.selectedHotspotId = scene.hotspots[0]?.id || null;
  }
  renderSceneList();
  updateSceneTitle();
  updateStatus(`Orientation saved for "${scene.name || scene.id}".`);
  autosave();
  return true;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function renderFace(sourceData, sourceWidth, sourceHeight, face, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (2 * (x + 0.5) / size) - 1;
      const v = (2 * (y + 0.5) / size) - 1;
      const dir = faceDirection(face, u, v);
      const theta = Math.atan2(dir.z, dir.x);
      const phi = Math.acos(dir.y);

      const uf = (theta + Math.PI) / (2 * Math.PI);
      const vf = phi / Math.PI;

      const ix = Math.floor(uf * (sourceWidth - 1));
      const iy = Math.floor(vf * (sourceHeight - 1));

      const pixel = samplePixel(sourceData, sourceWidth, ix, iy);
      const idx = (y * size + x) * 4;
      data[idx] = pixel[0];
      data[idx + 1] = pixel[1];
      data[idx + 2] = pixel[2];
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function faceDirection(face, u, v) {
  switch (face) {
    case 'f': return normalize({ x: 1, y: -v, z: -u });
    case 'b': return normalize({ x: -1, y: -v, z: u });
    case 'l': return normalize({ x: u, y: -v, z: 1 });
    case 'r': return normalize({ x: -u, y: -v, z: -1 });
    case 'u': return normalize({ x: u, y: 1, z: v });
    case 'd': return normalize({ x: u, y: -1, z: -v });
    default: return normalize({ x: 1, y: -v, z: -u });
  }
}

function normalize(vec) {
  const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
  return {
    x: vec.x / length,
    y: vec.y / length,
    z: vec.z / length
  };
}

function samplePixel(sourceData, sourceWidth, x, y) {
  const idx = (y * sourceWidth + x) * 4;
  return [
    sourceData[idx],
    sourceData[idx + 1],
    sourceData[idx + 2]
  ];
}

document.getElementById('btn-delete-all-scenes').addEventListener('click', deleteAllScenes);
btnAddGroup.addEventListener('click', addGroup);
btnRenameGroup.addEventListener('click', renameSelectedGroup);
btnSetMainGroup?.addEventListener('click', setSelectedGroupAsMain);
btnDeleteGroup.addEventListener('click', deleteGroup);
btnAddHotspot?.addEventListener('click', toggleInfoHotspotCreateMode);
btnDeleteHotspot?.addEventListener('click', deleteHotspot);

projectNameInput.addEventListener('input', (event) => updateProjectName(event.target.value));
projectFovInput?.addEventListener('input', (event) => updateProjectFov(event.target.value));
projectFovInput?.addEventListener('change', (event) => updateProjectFov(event.target.value, { commit: true }));
btnResetProject?.addEventListener('click', resetProjectWithConfirmation);
linkTargetAllGroupsToggle?.addEventListener('change', (event) => {
  state.linkTargetAllGroups = Boolean(event.target.checked);
  renderLinkEditor();
});
sceneGroupSelect.addEventListener('change', (event) => {
  clearPendingSceneLinkDraft(false);
  state.selectedGroupId = event.target.value;
  const preferredScene = getPreferredSceneForGroup(state.selectedGroupId);
  state.selectedSceneId = preferredScene?.id || null;
  state.selectedHotspotId = preferredScene?.hotspots?.[0]?.id || null;
  state.selectedFloorplanId = getFloorplanForGroup(state.selectedGroupId)?.id || null;
  renderAll();
  autosave();
});

linkTargetSceneSelect.addEventListener('change', (event) => {
  const hotspot = getSelectedLinkHotspot();
  const selectedTarget = event.target.value === state.selectedSceneId ? '' : event.target.value;
  if (hotspot) {
    hotspot.contentBlocks = hotspot.contentBlocks || [];
    let block = getSceneLinkBlock(hotspot);
    if (!block) {
      block = { type: 'scene', sceneId: '', comment: '' };
      hotspot.contentBlocks.push(block);
    }
    block.sceneId = selectedTarget;
    renderLinkEditor();
    renderContentBlocks();
    autosave();
    return;
  }
  const pendingDraft = getPendingSceneLinkDraftForSelectedScene();
  if (pendingDraft) {
    pendingDraft.targetSceneId = selectedTarget;
  }
  renderLinkEditor();
});

linkNewColorSelect?.addEventListener('change', (event) => {
  const next = normalizeSceneLinkColorKey(event.target.value);
  state.newLinkColorKey = next;
  const hotspot = getSelectedLinkHotspot();
  if (hotspot && placementMode) {
    hotspot.linkColorKey = next;
    autosave();
  }
  if (pendingSceneLinkDraft) {
    pendingSceneLinkDraft.linkColorKey = next;
  }
  renderLinkEditor();
  scheduleMarkerRender();
});

linkCommentInput.addEventListener('input', (event) => {
  const hotspot = getSelectedLinkHotspot();
  if (hotspot) {
    hotspot.contentBlocks = hotspot.contentBlocks || [];
    let block = getSceneLinkBlock(hotspot);
    if (!block) {
      block = { type: 'scene', sceneId: '', comment: '' };
      hotspot.contentBlocks.push(block);
    }
    block.comment = event.target.value;
    autosave();
    return;
  }
  const pendingDraft = getPendingSceneLinkDraftForSelectedScene();
  if (pendingDraft) {
    pendingDraft.comment = event.target.value;
  }
});

infoHotspotSelect?.addEventListener('change', (event) => {
  const hotspotId = String(event.target.value || '');
  if (!hotspotId) {
    state.selectedHotspotId = null;
    renderInfoHotspotList();
    renderContentBlocks();
    scheduleMarkerRender();
    return;
  }
  const scene = getSelectedScene();
  const hotspot = (scene?.hotspots || []).find((item) => item.id === hotspotId) || null;
  if (!hotspot || !isInfoHotspot(hotspot)) {
    return;
  }
  state.selectedHotspotId = hotspot.id;
  renderInfoHotspotList();
  renderContentBlocks();
  scheduleMarkerRender();
});

infoHotspotColorSelect?.addEventListener('change', (event) => {
  const hotspot = getSelectedInfoHotspot();
  if (!hotspot) {
    renderInfoHotspotList();
    return;
  }
  if (!isInfoHotspotInteractionModeActive()) {
    renderInfoHotspotList();
    updateStatus('Enable New or Edit to change info hotspot color.');
    return;
  }
  hotspot.markerColorKey = normalizeFloorplanColorKey(event.target.value || DEFAULT_INFO_HOTSPOT_COLOR_KEY);
  renderInfoHotspotList();
  scheduleMarkerRender();
  autosave();
});

infoHotspotModeSelect?.addEventListener('change', (event) => {
  const hotspot = getSelectedInfoHotspot();
  if (!hotspot) {
    renderInfoHotspotList();
    return;
  }
  if (!isInfoHotspotInteractionModeActive()) {
    renderInfoHotspotList();
    updateStatus('Enable New or Edit to change info hotspot mode.');
    return;
  }
  hotspot.displayMode = normalizeInfoHotspotDisplayMode(event.target.value || DEFAULT_INFO_HOTSPOT_DISPLAY_MODE);
  if (previewHotspotContext?.hotspotId === hotspot.id && !isQuickInfoHotspot(hotspot)) {
    quickPreviewOpenHotspotId = null;
  }
  renderInfoHotspotList();
  autosave();
});

linkSelect.addEventListener('change', (event) => {
  const hotspotId = event.target.value;
  if (!hotspotId) return;
  if (hotspotId === '__pending__') {
    state.selectedHotspotId = null;
    renderLinkEditor();
    renderContentBlocks();
    scheduleMarkerRender();
    return;
  }
  state.selectedHotspotId = hotspotId;
  renderLinkEditor();
  renderContentBlocks();
  scheduleMarkerRender();
});

runtimeEditorEvents?.bindEvents();
window.IterpanoEditorBootstrap?.initializeEditorUiState({
  setSectionCollapsed,
  setLinksPanelCollapsed,
  setFloorplanMapWindowOpen,
  btnToggleProjectPanel,
  projectPanelBody,
  btnToggleGroupsPanel,
  groupsPanelBody,
  btnToggleScenesPanel,
  scenesPanelBody,
  btnToggleMapPanel,
  mapPanelBody,
  btnToggleSceneActionsPanel,
  sceneActionsPanelBody,
});

window.IterpanoEditorBootstrap?.bootstrapEditor({
  loadDraft,
  loadProject,
  updateStatus,
  fallbackProject,
  sampleTourUrl,
});
