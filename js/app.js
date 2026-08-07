import { illustrations } from "./data/illustrations.js";
import { icons } from "./data/icons.js";

const SLIDE_DURATION = 500;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const galleryDefinitions = [
    {
        selector: '[data-gallery="illustration"]',
        kind: "illustration",
        items: illustrations,
        pageSize: 3,
        placeholderText: "일러스트 자리"
    },
    {
        selector: '[data-gallery="icon"]',
        kind: "icon",
        items: icons,
        pageSize: 20,
        placeholderText: "아이콘\n자리"
    }
];

function createPreviewMedia(
    item,
    className,
    placeholderText
) {
    const container = document.createElement("span");

    container.className = className;

    if (item.previewType === "svg" && item.previewPath) {
        const image = document.createElement("img");

        image.src = item.previewPath;
        image.alt = "";
        image.loading = "lazy";

        container.append(image);

        return container;
    }

    if (
        item.previewType === "html" &&
        item.previewPath &&
        item.thumbnailPath
    ) {
        const image = document.createElement("img");

        image.src = item.thumbnailPath;
        image.alt = "";
        image.loading = "lazy";

        container.append(image);

        return container;
    }

    container.textContent = placeholderText;

    return container;
}

function normalizeHexColor(value) {
    return value.trim().toUpperCase();
}

function isValidHexColor(value) {
    return HEX_COLOR_PATTERN.test(value);
}

function createGallery(definition) {
    const root = document.querySelector(definition.selector);

    if (!root) {
        return null;
    }

    const track = root.querySelector(
        "[data-gallery-track]"
    );

    const listView = root.querySelector(
        "[data-gallery-list-view]"
    );

    const previewView = root.querySelector(
        "[data-gallery-preview-view]"
    );

    const list = root.querySelector(
        "[data-gallery-list]"
    );

    const search = root.querySelector(
        "[data-gallery-search]"
    );

    const category = root.querySelector(
        "[data-gallery-category]"
    );

    const motion = root.querySelector(
        "[data-gallery-motion]"
    );

    const closeButton = root.querySelector(
        "[data-preview-close]"
    );

    const previewTitle = root.querySelector(
        "[data-preview-title]"
    );

    const previewPlaceholder = root.querySelector(
        "[data-preview-placeholder]"
    );

    const previewDescription = root.querySelector(
        "[data-preview-description]"
    );

    const previewSource = root.querySelector(
        "[data-preview-source]"
    );

    const svgDownload = root.querySelector(
        "[data-svg-download]"
    );

    const htmlDownload = root.querySelector(
        "[data-html-download]"
    );

    const downloadEmpty = root.querySelector(
        "[data-download-empty]"
    );

    const colorEditor = root.querySelector(
        "[data-detail-color-editor]"
    );

    const colorButton = root.querySelector(
        "[data-detail-color-button]"
    );

    const colorPopover = root.querySelector(
        "[data-detail-color-popover]"
    );

    const colorFields = root.querySelector(
        "[data-detail-color-fields]"
    );

    const colorReset = root.querySelector(
        "[data-detail-color-reset]"
    );

    const backgroundToggle = root.querySelector(
        "[data-preview-background-toggle]"
    );

    const backgroundColorField = root.querySelector(
        "[data-preview-background-color-field]"
    );

    const backgroundColor = root.querySelector(
        "[data-preview-background-color]"
    );

    const pagination = document.createElement("nav");

    pagination.className = "gallery-pagination";

    pagination.setAttribute(
        "aria-label",
        "작품 목록 페이지"
    );

    list.insertAdjacentElement(
        "afterend",
        pagination
    );

    let selectedItemId = null;
    let selectedItem = null;
    let currentPage = 1;
    let previewRenderId = 0;

    const currentColors = new Map();

    function getEditableColors(item) {
        if (
            Array.isArray(item.editableColors) &&
            item.editableColors.length > 0
        ) {
            return item.editableColors;
        }

        if (
            definition.kind === "icon" &&
            item.previewType === "placeholder"
        ) {
            return [
                {
                    key: "--placeholder-color",
                    label: "아이콘",
                    defaultValue: "#64748B"
                }
            ];
        }

        return [];
    }

    function hasColorEditor() {
        return Boolean(
            colorEditor &&
            colorButton &&
            colorPopover &&
            colorFields &&
            colorReset
        );
    }

    function hasEditableColors(item) {
        return Boolean(
            hasColorEditor() &&
            getEditableColors(item).length > 0
        );
    }

    function hasBackgroundControls() {
        return Boolean(
            backgroundToggle &&
            backgroundColorField &&
            backgroundColor
        );
    }

    function sendBackgroundToFrame(frame) {
        if (!frame || !hasBackgroundControls()) {
            return;
        }

        frame.contentWindow?.postMessage(
            {
                type: "svg-gallery-background",
                visible: backgroundToggle.checked,
                color: backgroundColor.value
            },
            "*"
        );
    }

    function updatePreviewBackground() {
        if (!hasBackgroundControls()) {
            return;
        }

        const isBackgroundVisible =
            backgroundToggle.checked;

        backgroundColorField.hidden =
            !isBackgroundVisible;

        previewPlaceholder.style.backgroundColor =
            isBackgroundVisible
                ? backgroundColor.value
                : "";

        const frame =
            previewPlaceholder.querySelector("iframe");

        if (frame) {
            frame.style.backgroundColor =
                isBackgroundVisible
                    ? backgroundColor.value
                    : "transparent";

            sendBackgroundToFrame(frame);
        }
    }

    function resetPreviewBackground() {
        if (!hasBackgroundControls()) {
            return;
        }

        backgroundToggle.checked = false;
        backgroundColorField.hidden = true;

        previewPlaceholder.style.backgroundColor = "";

        const frame =
            previewPlaceholder.querySelector("iframe");

        if (frame) {
            frame.style.backgroundColor = "transparent";

            sendBackgroundToFrame(frame);
        }
    }

    function setAccessibility(isPreviewOpen) {
        listView.setAttribute(
            "aria-hidden",
            String(isPreviewOpen)
        );

        previewView.setAttribute(
            "aria-hidden",
            String(!isPreviewOpen)
        );

        if (isPreviewOpen) {
            listView.setAttribute("inert", "");
            previewView.removeAttribute("inert");

            return;
        }

        previewView.setAttribute("inert", "");
        listView.removeAttribute("inert");
    }

    function updateDownloadLink(link, filePath) {
        if (!link) {
            return;
        }

        if (filePath) {
            link.href = filePath;
            link.hidden = false;

            return;
        }

        link.removeAttribute("href");
        link.hidden = true;
    }

    function updateDownloadArea(item) {
        updateDownloadLink(
            svgDownload,
            item.svgPath
        );

        updateDownloadLink(
            htmlDownload,
            item.htmlPath
        );

        if (downloadEmpty) {
            downloadEmpty.hidden = Boolean(
                item.svgPath ||
                item.htmlPath
            );
        }
    }

    function closeColorPopover() {
        if (!hasColorEditor()) {
            return false;
        }

        const wasOpen = !colorPopover.hidden;

        colorPopover.hidden = true;

        colorButton.setAttribute(
            "aria-expanded",
            "false"
        );

        return wasOpen;
    }

    function openColorPopover() {
        if (
            !hasColorEditor() ||
            colorEditor.hidden
        ) {
            return;
        }

        colorPopover.hidden = false;

        colorButton.setAttribute(
            "aria-expanded",
            "true"
        );

        const firstInput = colorFields.querySelector(
            ".detail-color-picker"
        );

        if (firstInput) {
            firstInput.focus();
        }
    }

    function toggleColorPopover() {
        if (!hasColorEditor()) {
            return;
        }

        if (colorPopover.hidden) {
            openColorPopover();

            return;
        }

        closeColorPopover();
    }

    function applyColorsToSvg(svgElement) {
        currentColors.forEach(function (
            colorValue,
            colorKey
        ) {
            svgElement.style.setProperty(
                colorKey,
                colorValue
            );
        });
    }

    function applyColorsToFrame(frame) {
        const colors = Object.fromEntries(
            currentColors
        );

        frame.contentWindow?.postMessage(
            {
                type: "svg-gallery-colors",
                colors
            },
            "*"
        );

        try {
            const frameDocument =
                frame.contentDocument;

            if (!frameDocument) {
                return;
            }

            currentColors.forEach(function (
                colorValue,
                colorKey
            ) {
                frameDocument.documentElement.style
                    .setProperty(
                        colorKey,
                        colorValue
                    );
            });
        } catch (error) {
            console.warn(
                "미리보기 문서에 색상을 적용할 수 없습니다.",
                error
            );
        }
    }

    function applyCurrentColors() {
        const svgElement =
            previewPlaceholder.querySelector("svg");

        if (svgElement) {
            applyColorsToSvg(svgElement);
        }

        const frame =
            previewPlaceholder.querySelector("iframe");

        if (frame) {
            applyColorsToFrame(frame);
        }

        const placeholder =
            previewPlaceholder.querySelector(
                ".preview-message--placeholder"
            );

        if (placeholder) {
            const placeholderColor =
                currentColors.get(
                    "--placeholder-color"
                );

            placeholder.style.color =
                placeholderColor || "";

            placeholder.style.borderColor =
                placeholderColor || "";
        }
    }

    function setColorValue(
        colorKey,
        colorValue
    ) {
        currentColors.set(
            colorKey,
            normalizeHexColor(colorValue)
        );

        applyCurrentColors();
    }

    function createColorField(
        colorDefinition,
        index
    ) {
        const field = document.createElement("div");

        field.className = "detail-color-field";

        const label = document.createElement("label");

        label.className = "detail-color-label";
        label.htmlFor =
            `${definition.kind}-color-value-${index}`;

        label.textContent =
            colorDefinition.label ||
            `색상 ${index + 1}`;

        const controls =
            document.createElement("div");

        controls.className = "detail-color-controls";

        const picker =
            document.createElement("input");

        picker.className = "detail-color-picker";
        picker.type = "color";
        picker.id =
            `${definition.kind}-color-picker-${index}`;

        picker.value =
            colorDefinition.defaultValue.toLowerCase();

        picker.setAttribute(
            "aria-label",
            `${label.textContent} 팔레트`
        );

        const valueInput =
            document.createElement("input");

        valueInput.className = "detail-color-value";
        valueInput.type = "text";
        valueInput.id =
            `${definition.kind}-color-value-${index}`;

        valueInput.value = normalizeHexColor(
            colorDefinition.defaultValue
        );

        valueInput.maxLength = 7;
        valueInput.spellcheck = false;
        valueInput.autocomplete = "off";
        valueInput.inputMode = "text";
        valueInput.placeholder = "#427EFF";

        picker.addEventListener(
            "input",
            function () {
                const newValue =
                    normalizeHexColor(picker.value);

                valueInput.value = newValue;

                valueInput.setAttribute(
                    "aria-invalid",
                    "false"
                );

                setColorValue(
                    colorDefinition.key,
                    newValue
                );
            }
        );

        valueInput.addEventListener(
            "input",
            function () {
                const newValue =
                    normalizeHexColor(
                        valueInput.value
                    );

                valueInput.value = newValue;

                const isValid =
                    isValidHexColor(newValue);

                valueInput.setAttribute(
                    "aria-invalid",
                    String(!isValid)
                );

                if (!isValid) {
                    return;
                }

                picker.value =
                    newValue.toLowerCase();

                setColorValue(
                    colorDefinition.key,
                    newValue
                );
            }
        );

        valueInput.addEventListener(
            "blur",
            function () {
                const currentValue =
                    currentColors.get(
                        colorDefinition.key
                    );

                if (
                    isValidHexColor(
                        valueInput.value
                    )
                ) {
                    return;
                }

                valueInput.value =
                    currentValue ||
                    colorDefinition.defaultValue;

                valueInput.setAttribute(
                    "aria-invalid",
                    "false"
                );
            }
        );

        controls.append(
            picker,
            valueInput
        );

        field.append(
            label,
            controls
        );

        return field;
    }

    function initializeColorValues(item) {
        currentColors.clear();

        getEditableColors(item).forEach(
            function (colorDefinition) {
                const defaultValue =
                    normalizeHexColor(
                        colorDefinition.defaultValue
                    );

                currentColors.set(
                    colorDefinition.key,
                    defaultValue
                );
            }
        );
    }

    function renderColorFields(item) {
        if (!hasColorEditor()) {
            return;
        }

        colorFields.replaceChildren();

        getEditableColors(item).forEach(
            function (colorDefinition, index) {
                const field = createColorField(
                    colorDefinition,
                    index
                );

                colorFields.append(field);
            }
        );
    }

    function showColorEditor(item) {
        if (!hasColorEditor()) {
            return;
        }

        closeColorPopover();
        colorFields.replaceChildren();
        currentColors.clear();

        if (!hasEditableColors(item)) {
            colorEditor.hidden = true;

            return;
        }

        initializeColorValues(item);
        renderColorFields(item);

        colorEditor.hidden = false;
    }

    function resetColors() {
        if (
            !selectedItem ||
            !hasEditableColors(selectedItem)
        ) {
            return;
        }

        initializeColorValues(selectedItem);
        renderColorFields(selectedItem);
        applyCurrentColors();
    }

    function createPreviewMessage(text) {
        const message = document.createElement("p");

        message.textContent = text;

        return message;
    }

    function createPlaceholderPreview(item) {
        const message = createPreviewMessage(
            `${item.title} ${definition.placeholderText}`
        );

        message.className =
            "preview-message--placeholder";

        return message;
    }

    async function renderSvgPreview(
        item,
        currentRenderId
    ) {
        previewPlaceholder.replaceChildren(
            createPreviewMessage(
                `${item.title} 미리보기를 불러오는 중입니다.`
            )
        );

        try {
            const response = await fetch(
                item.previewPath
            );

            if (!response.ok) {
                throw new Error(
                    `SVG 요청 실패: ${response.status}`
                );
            }

            const svgText = await response.text();

            if (
                currentRenderId !== previewRenderId
            ) {
                return;
            }

            const parser = new DOMParser();

            const svgDocument =
                parser.parseFromString(
                    svgText,
                    "image/svg+xml"
                );

            const parserError =
                svgDocument.querySelector(
                    "parsererror"
                );

            if (parserError) {
                throw new Error(
                    "SVG 문서를 해석하지 못했습니다."
                );
            }

            const svgElement =
                svgDocument.documentElement;

            svgElement.removeAttribute("width");
            svgElement.removeAttribute("height");

            svgElement.style.width = "100%";
            svgElement.style.height = "100%";
            svgElement.style.display = "block";

            svgElement.setAttribute(
                "role",
                "img"
            );

            svgElement.setAttribute(
                "aria-label",
                `${item.title} 미리보기`
            );

            applyColorsToSvg(svgElement);

            previewPlaceholder.replaceChildren(
                svgElement
            );
        } catch (error) {
            if (
                currentRenderId !== previewRenderId
            ) {
                return;
            }

            console.error(
                "SVG 미리보기를 불러오지 못했습니다.",
                error
            );

            const image =
                document.createElement("img");

            image.src = item.previewPath;
            image.alt = `${item.title} 미리보기`;

            previewPlaceholder.replaceChildren(
                image
            );
        }
    }

    function renderHtmlPreview(item) {
        const frame =
            document.createElement("iframe");

        frame.src = item.previewPath;

        frame.title =
            `${item.title} 실행 미리보기`;

        frame.loading = "lazy";

        frame.addEventListener(
            "load",
            function () {
                if (
                    !selectedItem ||
                    selectedItem.id !== item.id
                ) {
                    return;
                }

                applyColorsToFrame(frame);
                updatePreviewBackground();
            }
        );

        previewPlaceholder.replaceChildren(frame);
    }

    function renderLargePreview(item) {
        previewRenderId += 1;

        const currentRenderId = previewRenderId;

        previewPlaceholder.replaceChildren();

        if (
            item.previewType === "svg" &&
            item.previewPath
        ) {
            renderSvgPreview(
                item,
                currentRenderId
            );

            return;
        }

        if (
            item.previewType === "html" &&
            item.previewPath
        ) {
            renderHtmlPreview(item);

            return;
        }

        previewPlaceholder.append(
            createPlaceholderPreview(item)
        );

        applyCurrentColors();
    }

    function openPreview(item) {
        selectedItemId = item.id;
        selectedItem = item;

        previewTitle.textContent =
            item.title || "선택 작품";

        previewDescription.textContent =
            item.description ||
            "등록된 설명이 없습니다.";

        previewSource.textContent =
            item.source ||
            "등록된 출처 및 참고 자료가 없습니다.";

        showColorEditor(item);
        resetPreviewBackground();
        renderLargePreview(item);
        updateDownloadArea(item);
        setAccessibility(true);

        track.classList.add("is-preview-open");

        window.setTimeout(
            function () {
                closeButton.focus();
            },
            SLIDE_DURATION
        );
    }

    function closePreview() {
        closeColorPopover();
        resetPreviewBackground();

        previewRenderId += 1;
        selectedItem = null;
        currentColors.clear();

        if (hasColorEditor()) {
            colorEditor.hidden = true;
            colorFields.replaceChildren();
        }

        setAccessibility(false);

        track.classList.remove(
            "is-preview-open"
        );

        window.setTimeout(
            function () {
                if (!selectedItemId) {
                    return;
                }

                const selectedButton =
                    list.querySelector(
                        `[data-artwork-id="${CSS.escape(
                            selectedItemId
                        )}"]`
                    );

                if (selectedButton) {
                    selectedButton.focus();
                }
            },
            SLIDE_DURATION
        );
    }

    function createItemButton(item) {
        const button =
            document.createElement("button");

        button.className =
            `artwork-item artwork-item--${definition.kind}`;

        button.type = "button";
        button.dataset.artworkId = item.id;

        const cardPreview = createPreviewMedia(
            item,
            `artwork-placeholder artwork-placeholder--${definition.kind}`,
            definition.placeholderText
        );

        const title =
            document.createElement("span");

        title.className = "artwork-title";
        title.textContent = item.title;

        button.append(
            cardPreview,
            title
        );

        if (item.motion === "animated") {
            const motionBadge =
                document.createElement("span");

            motionBadge.className =
                "artwork-motion-badge";

            motionBadge.textContent = "▶";
            motionBadge.title = "애니메이션 있음";

            motionBadge.setAttribute(
                "aria-label",
                "애니메이션이 있는 동적 SVG"
            );

            button.append(motionBadge);
        }

        button.addEventListener(
            "click",
            function () {
                openPreview(item);
            }
        );

        return button;
    }

    function createPaginationButton(
        label,
        pageNumber,
        disabled = false,
        current = false
    ) {
        const button =
            document.createElement("button");

        button.className = "pagination-button";
        button.type = "button";
        button.textContent = label;
        button.disabled = disabled;

        if (current) {
            button.setAttribute(
                "aria-current",
                "page"
            );

            button.setAttribute(
                "aria-label",
                `${pageNumber}페이지, 현재 페이지`
            );
        } else {
            button.setAttribute(
                "aria-label",
                `${pageNumber}페이지로 이동`
            );
        }

        button.addEventListener(
            "click",
            function () {
                if (
                    disabled ||
                    currentPage === pageNumber
                ) {
                    return;
                }

                currentPage = pageNumber;

                renderList();

                list.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        );

        return button;
    }

    function renderPagination(totalItemCount) {
        pagination.replaceChildren();

        const totalPages = Math.ceil(
            totalItemCount /
            definition.pageSize
        );

        if (totalPages <= 1) {
            pagination.hidden = true;

            return;
        }

        pagination.hidden = false;

        const previousButton =
            createPaginationButton(
                "이전",
                currentPage - 1,
                currentPage === 1
            );

        pagination.append(previousButton);

        for (
            let pageNumber = 1;
            pageNumber <= totalPages;
            pageNumber += 1
        ) {
            const pageButton =
                createPaginationButton(
                    String(pageNumber),
                    pageNumber,
                    false,
                    pageNumber === currentPage
                );

            pagination.append(pageButton);
        }

        const nextButton =
            createPaginationButton(
                "다음",
                currentPage + 1,
                currentPage === totalPages
            );

        pagination.append(nextButton);
    }

    function getFilteredItems() {
        const searchWord =
            search.value
                .trim()
                .toLowerCase();

        const selectedCategory =
            category.value;

        const selectedFeature =
            motion.value;

        return definition.items.filter(
            function (item) {
                const title = item.title || "";

                const matchesSearch =
                    title
                        .toLowerCase()
                        .includes(searchWord);

                const matchesCategory =
                    selectedCategory === "all" ||
                    item.category ===
                        selectedCategory;

                let matchesFeature = false;

                if (selectedFeature === "all") {
                    matchesFeature = true;
                } else if (
                    selectedFeature === "static" ||
                    selectedFeature === "animated"
                ) {
                    matchesFeature =
                        item.motion ===
                        selectedFeature;
                } else if (
                    selectedFeature === "mono"
                ) {
                    matchesFeature =
                        item.colorCount === 1;
                } else if (
                    selectedFeature ===
                    "two-colors"
                ) {
                    matchesFeature =
                        item.colorCount === 2;
                } else if (
                    selectedFeature ===
                    "three-plus-colors"
                ) {
                    matchesFeature =
                        item.colorCount >= 3;
                }

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesFeature
                );
            }
        );
    }

    function renderList() {
        const filteredItems =
            getFilteredItems();

        const totalPages = Math.max(
            1,
            Math.ceil(
                filteredItems.length /
                definition.pageSize
            )
        );

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex =
            (currentPage - 1) *
            definition.pageSize;

        const endIndex =
            startIndex +
            definition.pageSize;

        const visibleItems =
            filteredItems.slice(
                startIndex,
                endIndex
            );

        list.replaceChildren();

        visibleItems.forEach(
            function (item) {
                list.append(
                    createItemButton(item)
                );
            }
        );

        if (filteredItems.length === 0) {
            const emptyMessage =
                document.createElement("p");

            emptyMessage.className =
                "empty-message";

            emptyMessage.textContent =
                "조건에 맞는 작품이 없습니다.";

            list.append(emptyMessage);
        }

        renderPagination(
            filteredItems.length
        );
    }

    function resetPageAndRender() {
        currentPage = 1;

        renderList();
    }

    if (colorButton) {
        colorButton.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                toggleColorPopover();
            }
        );
    }

    if (colorPopover) {
        colorPopover.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();
            }
        );
    }

    if (colorReset) {
        colorReset.addEventListener(
            "click",
            resetColors
        );
    }

    if (backgroundToggle) {
        backgroundToggle.addEventListener(
            "change",
            updatePreviewBackground
        );
    }

    if (backgroundColor) {
        backgroundColor.addEventListener(
            "input",
            updatePreviewBackground
        );
    }

    document.addEventListener(
        "click",
        function (event) {
            if (
                !hasColorEditor() ||
                colorPopover.hidden
            ) {
                return;
            }

            if (
                colorEditor.contains(
                    event.target
                )
            ) {
                return;
            }

            closeColorPopover();
        }
    );

    closeButton.addEventListener(
        "click",
        closePreview
    );

    search.addEventListener(
        "input",
        resetPageAndRender
    );

    category.addEventListener(
        "change",
        resetPageAndRender
    );

    motion.addEventListener(
        "change",
        resetPageAndRender
    );

    resetPreviewBackground();
    setAccessibility(false);
    renderList();

    return {
        closePreview,

        closeColorPopover,

        isPreviewOpen: function () {
            return track.classList.contains(
                "is-preview-open"
            );
        },

        isColorPopoverOpen: function () {
            return Boolean(
                hasColorEditor() &&
                !colorPopover.hidden
            );
        }
    };
}

const galleries = galleryDefinitions
    .map(createGallery)
    .filter(Boolean);

document.addEventListener(
    "keydown",
    function (event) {
        if (event.key !== "Escape") {
            return;
        }

        const galleryWithOpenColorPopover =
            galleries.find(
                function (gallery) {
                    return gallery
                        .isColorPopoverOpen();
                }
            );

        if (galleryWithOpenColorPopover) {
            galleryWithOpenColorPopover
                .closeColorPopover();

            return;
        }

        galleries.forEach(
            function (gallery) {
                if (gallery.isPreviewOpen()) {
                    gallery.closePreview();
                }
            }
        );
    }
);