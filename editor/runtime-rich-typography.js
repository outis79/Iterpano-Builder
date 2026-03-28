(function () {
  function createRichTypographyController(options) {
    const {
      richEditorSurface,
      getActiveRichSizeInput,
      isRangeInsideRichEditor,
      sanitizeRichFontSizeValue,
      sanitizeRichLineHeightValue,
      sanitizeRichParagraphSpacingValue,
      getRichBlockNodeForSelection,
      getSavedRanges,
      setSavedRanges,
      clearSavedRanges,
    } = options;

    function applyFontSizeInSelection(sizeValue) {
      if (!richEditorSurface) return false;
      const safeSize = sanitizeRichFontSizeValue(sizeValue);
      if (!safeSize) return false;
      const saved = getSavedRanges();
      const baseRange =
        (saved.range && isRangeInsideRichEditor(saved.range))
          ? saved.range.cloneRange()
          : null;
      if (!baseRange) return false;
      const selection = window.getSelection();
      const activeRichSizeInput = getActiveRichSizeInput();
      const preserveInputFocus = document.activeElement === activeRichSizeInput;
      if (baseRange.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = safeSize;
        const placeholder = document.createTextNode('\u200b');
        span.appendChild(placeholder);
        baseRange.insertNode(span);
        const nextRange = document.createRange();
        nextRange.setStart(placeholder, 1);
        nextRange.collapse(true);
        setSavedRanges(nextRange.cloneRange(), null);
        if (!preserveInputFocus && selection) {
          selection.removeAllRanges();
          selection.addRange(nextRange);
        }
        return true;
      }
      try {
        const span = document.createElement('span');
        span.style.fontSize = safeSize;
        baseRange.surroundContents(span);
        const nextRange = document.createRange();
        nextRange.selectNodeContents(span);
        setSavedRanges(nextRange.cloneRange(), nextRange.cloneRange());
        if (!preserveInputFocus && selection) {
          selection.removeAllRanges();
          selection.addRange(nextRange);
        }
        return true;
      } catch {
        const blockNodes = new Set();
        const startBlock = getRichBlockNodeForSelection(baseRange.startContainer);
        const endBlock = getRichBlockNodeForSelection(baseRange.endContainer);
        if (startBlock) blockNodes.add(startBlock);
        if (endBlock) blockNodes.add(endBlock);
        if (blockNodes.size === 0) {
          return false;
        }
        blockNodes.forEach((block) => {
          block.style.fontSize = safeSize;
        });
        setSavedRanges(baseRange.cloneRange(), baseRange.cloneRange());
        return true;
      }
    }

    function applyLineHeightInSelection(lineHeightValue) {
      const safeValue = sanitizeRichLineHeightValue(lineHeightValue);
      if (!safeValue || !restoreSelectionRange()) return false;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      if (!isRangeInsideRichEditor(range)) return false;

      const blockNodes = new Set();
      const startBlock = getRichBlockNodeForSelection(range.startContainer);
      const endBlock = getRichBlockNodeForSelection(range.endContainer);
      if (startBlock) blockNodes.add(startBlock);
      if (endBlock) blockNodes.add(endBlock);

      if (blockNodes.size === 0) {
        const span = document.createElement('span');
        span.style.lineHeight = safeValue;
        if (range.collapsed) {
          span.innerHTML = '<br>';
          range.insertNode(span);
          range.selectNodeContents(span);
          range.collapse(false);
        } else {
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          range.selectNodeContents(span);
        }
        selection.removeAllRanges();
        selection.addRange(range);
        setSavedRanges(range.cloneRange(), null);
        return true;
      }

      blockNodes.forEach((block) => {
        block.style.lineHeight = safeValue;
      });
      setSavedRanges(range.cloneRange(), null);
      return true;
    }

    function applyParagraphSpacingInSelection(spacingValue) {
      const safeValue = sanitizeRichParagraphSpacingValue(spacingValue);
      if (!safeValue || !restoreSelectionRange()) return false;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;
      const range = selection.getRangeAt(0);
      if (!isRangeInsideRichEditor(range)) return false;

      const blockNodes = new Set();
      const startBlock = getRichBlockNodeForSelection(range.startContainer);
      const endBlock = getRichBlockNodeForSelection(range.endContainer);
      if (startBlock) blockNodes.add(startBlock);
      if (endBlock) blockNodes.add(endBlock);
      if (blockNodes.size === 0) return false;

      blockNodes.forEach((block) => {
        block.style.marginTop = '0';
        block.style.marginBottom = safeValue;
      });
      setSavedRanges(range.cloneRange(), null);
      return true;
    }

    function saveSelectionRange() {
      if (!richEditorSurface) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!isRangeInsideRichEditor(range)) return;
      setSavedRanges(
        range.cloneRange(),
        !range.collapsed ? range.cloneRange() : null
      );
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
      const saved = getSavedRanges();
      if (saved.expandedRange && isRangeInsideRichEditor(saved.expandedRange)) {
        const fromSavedExpanded = getFontSizeFromEditorRange(saved.expandedRange);
        if (fromSavedExpanded) return fromSavedExpanded;
      }
      if (saved.range && isRangeInsideRichEditor(saved.range)) {
        const fromSaved = getFontSizeFromEditorRange(saved.range);
        if (fromSaved) return fromSaved;
      }
      return '';
    }

    function syncTypographyControls(options = {}) {
      const activeRichSizeInput = getActiveRichSizeInput();
      if (!activeRichSizeInput) return;
      const force = Boolean(options?.force);
      if (!force && document.activeElement === activeRichSizeInput) return;
      const nextSize = getSelectionFontSizeForActiveEditor();
      activeRichSizeInput.value = nextSize;
    }

    function restoreSelectionRange(options = {}) {
      if (!richEditorSurface) return false;
      const saved = getSavedRanges();
      const preferExpanded = Boolean(options?.preferExpanded);
      const targetRange = preferExpanded
        ? (saved.expandedRange || saved.range)
        : (saved.range || saved.expandedRange);
      if (!targetRange) return false;
      if (!isRangeInsideRichEditor(targetRange)) {
        clearSavedRanges();
        return false;
      }
      const selection = window.getSelection();
      if (!selection) return false;
      richEditorSurface.focus({ preventScroll: true });
      selection.removeAllRanges();
      selection.addRange(targetRange.cloneRange());
      return true;
    }

    return {
      applyFontSizeInSelection,
      applyLineHeightInSelection,
      applyParagraphSpacingInSelection,
      saveSelectionRange,
      syncTypographyControls,
      restoreSelectionRange,
    };
  }

  window.IterpanoEditorRichTypography = {
    createRichTypographyController,
  };
})();
