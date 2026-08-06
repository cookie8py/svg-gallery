import { illustrations } from "./data/illustrations.js";
import { icons } from "./data/icons.js";

const SLIDE_DURATION = 500;

const galleryDefinitions = [
    {
        selector: '[data-gallery="illustration"]',
        kind: "illustration",
        items: illustrations,
        placeholderText: "일러스트 자리"
    },
    {
        selector: '[data-gallery="icon"]',
        kind: "icon",
        items: icons,
        placeholderText: "아이콘 자리"
    }
];

function createPreviewMedia(item, className, placeholderText) {
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

    container.textContent = placeholderText;
    return container;
}

function createGallery(definition) {
    const root = document.querySelector(definition.selector);

    if (!root) {
        return null;
    }

    const track = root.querySelector("[data-gallery-track]");
    const listView = root.querySelector("[data-gallery-list-view]");
    const previewView = root.querySelector("[data-gallery-preview-view]");
    const list = root.querySelector("[data-gallery-list]");
    const search = root.querySelector("[data-gallery-search]");
    const category = root.querySelector("[data-gallery-category]");
    const motion = root.querySelector("[data-gallery-motion]");
    const closeButton = root.querySelector("[data-preview-close]");
    const previewTitle = root.querySelector("[data-preview-title]");
    const previewPlaceholder = root.querySelector(
        "[data-preview-placeholder]"
    );
    const previewDescription = root.querySelector(
        "[data-preview-description]"
    );
    const previewSource = root.querySelector("[data-preview-source]");
    const svgDownload = root.querySelector("[data-svg-download]");
    const htmlDownload = root.querySelector("[data-html-download]");
    const downloadEmpty = root.querySelector("[data-download-empty]");

    let selectedItemId = null;

    function setAccessibility(isPreviewOpen) {
        listView.setAttribute("aria-hidden", String(isPreviewOpen));
        previewView.setAttribute("aria-hidden", String(!isPreviewOpen));

        if (isPreviewOpen) {
            listView.setAttribute("inert", "");
            previewView.removeAttribute("inert");
            return;
        }

        previewView.setAttribute("inert", "");
        listView.removeAttribute("inert");
    }

    function updateDownloadLink(link, filePath) {
        if (filePath) {
            link.href = filePath;
            link.hidden = false;
            return;
        }

        link.removeAttribute("href");
        link.hidden = true;
    }

    function updateDownloadArea(item) {
        updateDownloadLink(svgDownload, item.svgPath);
        updateDownloadLink(htmlDownload, item.htmlPath);

        downloadEmpty.hidden = Boolean(
            item.svgPath || item.htmlPath
        );
    }

    function renderLargePreview(item) {
        previewPlaceholder.replaceChildren();

        if (item.previewType === "svg" && item.previewPath) {
            const image = document.createElement("img");
            image.src = item.previewPath;
            image.alt = `${item.title} 미리보기`;
            previewPlaceholder.append(image);
            return;
        }

        if (item.previewType === "html" && item.previewPath) {
            const frame = document.createElement("iframe");
            frame.src = item.previewPath;
            frame.title = `${item.title} 실행 미리보기`;
            frame.loading = "lazy";
            previewPlaceholder.append(frame);
            return;
        }

        const message = document.createElement("p");
        message.textContent =
            `${item.title} ${definition.placeholderText}`;
        previewPlaceholder.append(message);
    }

    function openPreview(item) {
        selectedItemId = item.id;
        previewTitle.textContent = item.title;
        previewDescription.textContent = item.description;
        previewSource.textContent = item.source;

        renderLargePreview(item);
        updateDownloadArea(item);
        setAccessibility(true);
        track.classList.add("is-preview-open");

        window.setTimeout(function () {
            closeButton.focus();
        }, SLIDE_DURATION);
    }

    function closePreview() {
        setAccessibility(false);
        track.classList.remove("is-preview-open");

        window.setTimeout(function () {
            if (!selectedItemId) {
                return;
            }

            const selectedButton = list.querySelector(
                `[data-artwork-id="${CSS.escape(selectedItemId)}"]`
            );

            if (selectedButton) {
                selectedButton.focus();
            }
        }, SLIDE_DURATION);
    }

    function createItemButton(item) {
        const button = document.createElement("button");
        button.className =
            `artwork-item artwork-item--${definition.kind}`;
        button.type = "button";
        button.dataset.artworkId = item.id;

        const cardPreview = createPreviewMedia(
            item,
            `artwork-placeholder artwork-placeholder--${definition.kind}`,
            definition.placeholderText
        );

        const title = document.createElement("span");
        title.className = "artwork-title";
        title.textContent = item.title;

        const motionLabel = document.createElement("span");
        motionLabel.className = "artwork-motion";
        motionLabel.textContent =
            item.motion === "animated" ? "동적 SVG" : "정적 SVG";

        button.append(cardPreview, title, motionLabel);
        button.addEventListener("click", function () {
            openPreview(item);
        });

        return button;
    }

    function renderList() {
        const searchWord = search.value.trim().toLowerCase();
        const selectedCategory = category.value;
        const selectedMotion = motion.value;

        const filteredItems = definition.items.filter(function (item) {
            const matchesSearch = item.title
                .toLowerCase()
                .includes(searchWord);
            const matchesCategory =
                selectedCategory === "all" ||
                item.category === selectedCategory;
            const matchesMotion =
                selectedMotion === "all" ||
                item.motion === selectedMotion;

            return matchesSearch && matchesCategory && matchesMotion;
        });

        list.replaceChildren();

        filteredItems.forEach(function (item) {
            list.append(createItemButton(item));
        });

        if (filteredItems.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "조건에 맞는 작품이 없습니다.";
            list.append(emptyMessage);
        }
    }

    closeButton.addEventListener("click", closePreview);
    search.addEventListener("input", renderList);
    category.addEventListener("change", renderList);
    motion.addEventListener("change", renderList);

    setAccessibility(false);
    renderList();

    return {
        closePreview,
        isPreviewOpen: function () {
            return track.classList.contains("is-preview-open");
        }
    };
}

const galleries = galleryDefinitions
    .map(createGallery)
    .filter(Boolean);

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
        return;
    }

    galleries.forEach(function (gallery) {
        if (gallery.isPreviewOpen()) {
            gallery.closePreview();
        }
    });
});
