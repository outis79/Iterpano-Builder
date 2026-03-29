(function () {
  function createEditorUtilsController(options) {
    const {
      generatedTiles,
      floorplanColorMap,
    } = options;

    function sceneHasGeneratedTiles(scene) {
      if (!scene) return false;
      const generated = generatedTiles.get(scene.id);
      return Boolean(generated && Object.keys(generated).length > 0);
    }

    function countSceneLinksForScene(scene) {
      if (!scene) return 0;
      return (scene.hotspots || []).reduce((total, hotspot) => {
        return total + (hotspot.contentBlocks || []).filter((block) => block.type === 'scene' && block.sceneId).length;
      }, 0);
    }

    function collectStaticExportWarnings(project) {
      const scenes = Array.isArray(project?.scenes) ? project.scenes : [];
      const missingTiles = [];
      const insufficientLinks = [];
      scenes.forEach((scene) => {
        if (!sceneHasGeneratedTiles(scene)) {
          missingTiles.push(scene);
        }
        const linkCount = countSceneLinksForScene(scene);
        if (linkCount < 2) {
          insufficientLinks.push({ scene, linkCount });
        }
      });
      return { missingTiles, insufficientLinks };
    }

    function normalizeFloorplanColorKey(key) {
      return Object.prototype.hasOwnProperty.call(floorplanColorMap, key) ? key : 'yellow';
    }

    function hexToRgb(hex) {
      const clean = String(hex || '').replace('#', '');
      const value = clean.length === 3
        ? clean.split('').map((c) => c + c).join('')
        : clean;
      if (!/^[0-9a-f]{6}$/i.test(value)) return { r: 240, g: 200, b: 75 };
      return {
        r: Number.parseInt(value.slice(0, 2), 16),
        g: Number.parseInt(value.slice(2, 4), 16),
        b: Number.parseInt(value.slice(4, 6), 16),
      };
    }

    function rgbToHex(r, g, b) {
      const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
      return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
    }

    function darkenHex(hex, ratio = 0.22) {
      const rgb = hexToRgb(hex);
      const k = Math.max(0, Math.min(1, 1 - ratio));
      return rgbToHex(rgb.r * k, rgb.g * k, rgb.b * k);
    }

    function withAlpha(hex, alpha = 0.35) {
      const rgb = hexToRgb(hex);
      const a = Math.max(0, Math.min(1, alpha));
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    }

    function getContrastTextColor(hex) {
      const rgb = hexToRgb(hex);
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      return luminance >= 0.62 ? '#111111' : '#f8fafc';
    }

    return {
      sceneHasGeneratedTiles,
      countSceneLinksForScene,
      collectStaticExportWarnings,
      normalizeFloorplanColorKey,
      hexToRgb,
      rgbToHex,
      darkenHex,
      withAlpha,
      getContrastTextColor,
    };
  }

  window.IterpanoEditorUtils = {
    createEditorUtilsController,
  };
})();
