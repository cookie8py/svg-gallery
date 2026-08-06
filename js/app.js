import { artworks } from "./artworks.js";


const galleryTrack = document.querySelector("#gallery-track");

const galleryListView = document.querySelector(
    "#gallery-list-view"
);

const artworkPreviewView = document.querySelector(
    "#artwork-preview-view"
);

const artworkList = document.querySelector("#artwork-list");

const previewCloseButton = document.querySelector(
    "#preview-close-button"
);

const previewTitle = document.querySelector("#preview-title");

const previewPlaceholder = document.querySelector(
    "#preview-placeholder"
);

const previewDescription = document.querySelector(
    "#preview-description"
);

const previewSource = document.querySelector(
    "#preview-source"
);

const svgDownloadLink = document.querySelector(
    "#svg-download-link"
);

const htmlDownloadLink = document.querySelector(
    "#html-download-link"
);

const downloadEmptyMessage = document.querySelector(
    "#download-empty-message"
);

const artworkSearch = document.querySelector(
    "#artwork-search"
);

const categoryFilter = document.querySelector(
    "#category-filter"
);


let selectedArtworkId = null;


/*
 * 목록 카드 안의 미리보기 생성
 */

function createCardPreview(artwork) {
    const preview = document.createElement("span");

    preview.className = "artwork-placeholder";

    if (
        artwork.previewType === "svg" &&
        artwork.previewPath
    ) {
        const image = document.createElement("img");

        image.src = artwork.previewPath;
        image.alt = "";
        image.loading = "lazy";

        preview.append(image);

        return preview;
    }

    preview.textContent = "SVG 작품 자리";

    return preview;
}


/*
 * 작품 카드 생성
 */

function createArtworkButton(artwork) {
    const button = document.createElement("button");

    button.className = "artwork-item";
    button.type = "button";
    button.dataset.artworkId = artwork.id;

    const cardPreview = createCardPreview(artwork);

    const title = document.createElement("span");

    title.className = "artwork-title";
    title.textContent = artwork.title;

    button.append(cardPreview, title);

    button.addEventListener("click", function () {
        openArtworkPreview(artwork);
    });

    return button;
}


/*
 * 검색어와 분류에 맞는 작품 목록 표시
 */

function renderArtworkList() {
    const searchWord = artworkSearch.value
        .trim()
        .toLowerCase();

    const selectedCategory = categoryFilter.value;

    const filteredArtworks = artworks.filter(function (artwork) {
        const matchesSearch = artwork.title
            .toLowerCase()
            .includes(searchWord);

        const matchesCategory =
            selectedCategory === "all" ||
            artwork.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    artworkList.replaceChildren();

    filteredArtworks.forEach(function (artwork) {
        const artworkButton = createArtworkButton(artwork);

        artworkList.append(artworkButton);
    });

    if (filteredArtworks.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.textContent =
            "조건에 맞는 작품이 없습니다.";

        artworkList.append(emptyMessage);
    }
}


/*
 * 상세 미리보기 생성
 */

function renderArtworkPreview(artwork) {
    previewPlaceholder.replaceChildren();

    if (
        artwork.previewType === "svg" &&
        artwork.previewPath
    ) {
        const image = document.createElement("img");

        image.src = artwork.previewPath;
        image.alt = `${artwork.title} 미리보기`;

        previewPlaceholder.append(image);

        return;
    }

    if (
        artwork.previewType === "html" &&
        artwork.previewPath
    ) {
        const frame = document.createElement("iframe");

        frame.src = artwork.previewPath;
        frame.title = `${artwork.title} 실행 미리보기`;
        frame.loading = "lazy";

        previewPlaceholder.append(frame);

        return;
    }

    const message = document.createElement("p");

    message.textContent =
        `${artwork.title} 미리보기 영역`;

    previewPlaceholder.append(message);
}


/*
 * 다운로드 링크 설정
 */

function updateDownloadLink(link, filePath) {
    if (filePath) {
        link.href = filePath;
        link.hidden = false;

        return;
    }

    link.removeAttribute("href");
    link.hidden = true;
}


/*
 * 다운로드 안내 문구 표시 여부 설정
 */

function updateDownloadArea(artwork) {
    updateDownloadLink(
        svgDownloadLink,
        artwork.svgPath
    );

    updateDownloadLink(
        htmlDownloadLink,
        artwork.htmlPath
    );

    const hasDownloadFile =
        Boolean(artwork.svgPath) ||
        Boolean(artwork.htmlPath);

    downloadEmptyMessage.hidden = hasDownloadFile;
}


/*
 * 목록과 미리보기의 접근 가능 상태 설정
 */

function setViewAccessibility(isPreviewOpen) {
    galleryListView.setAttribute(
        "aria-hidden",
        String(isPreviewOpen)
    );

    artworkPreviewView.setAttribute(
        "aria-hidden",
        String(!isPreviewOpen)
    );

    if (isPreviewOpen) {
        galleryListView.setAttribute("inert", "");
        artworkPreviewView.removeAttribute("inert");

        return;
    }

    artworkPreviewView.setAttribute("inert", "");
    galleryListView.removeAttribute("inert");
}


/*
 * 선택한 작품의 미리보기 열기
 */

function openArtworkPreview(artwork) {
    selectedArtworkId = artwork.id;

    previewTitle.textContent = artwork.title;
    previewDescription.textContent = artwork.description;
    previewSource.textContent = artwork.source;

    renderArtworkPreview(artwork);
    updateDownloadArea(artwork);

    setViewAccessibility(true);

    /*
     * 이 클래스가 추가되면
     * 트랙이 왼쪽으로 밀리며 미리보기가 들어옵니다.
     */
    galleryTrack.classList.add("is-preview-open");

    window.setTimeout(function () {
        previewCloseButton.focus();
    }, 500);
}


/*
 * 미리보기에서 목록으로 돌아가기
 */

function closeArtworkPreview() {
    setViewAccessibility(false);

    /*
     * 클래스를 제거하면
     * 트랙이 오른쪽으로 돌아오며 목록이 나타납니다.
     */
    galleryTrack.classList.remove("is-preview-open");

    window.setTimeout(function () {
        if (!selectedArtworkId) {
            return;
        }

        const selectedArtworkButton =
            document.querySelector(
                `[data-artwork-id="${CSS.escape(selectedArtworkId)}"]`
            );

        if (selectedArtworkButton) {
            selectedArtworkButton.focus();
        }
    }, 500);
}


/*
 * 이벤트 연결
 */

previewCloseButton.addEventListener(
    "click",
    closeArtworkPreview
);

artworkSearch.addEventListener(
    "input",
    renderArtworkList
);

categoryFilter.addEventListener(
    "change",
    renderArtworkList
);


/*
 * Escape 키로 목록으로 돌아가기
 */

document.addEventListener("keydown", function (event) {
    const isPreviewOpen =
        galleryTrack.classList.contains("is-preview-open");

    if (
        event.key === "Escape" &&
        isPreviewOpen
    ) {
        closeArtworkPreview();
    }
});


/*
 * 첫 화면 생성
 */

setViewAccessibility(false);
renderArtworkList();