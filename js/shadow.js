
const SVG_NS = "http://www.w3.org/2000/svg";

const SHADOW_ATTRIBUTE = "data-svg-gallery-shadow";
const SHADOW_FILTER_ATTRIBUTE = "data-svg-gallery-shadow-filter";

const DEFAULT_OPTIONS = {
    direction: 135,
    distance: 2,
    blur: 1,
    opacity: 0.3,
    color: "#000000"
};

const MAX_DISTANCE_PERCENT = 4;
const MAX_BLUR_PERCENT = 2;
const MAX_OPACITY = 0.6;

const BLUR_PADDING_FACTOR = 3;

const DRAWABLE_TAGS = new Set([
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "text",
    "use"
]);

const SKIPPED_TAGS = new Set([
    "defs",
    "style",
    "script",
    "title",
    "desc",
    "metadata",
    "foreignObject"
]);

const shadowStates = new WeakMap();

function createSvgElement(name) {
    return document.createElementNS(SVG_NS, name);
}

function clamp(value, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return min;
    }

    return Math.min(max, Math.max(min, number));
}

function normalizeOptions(options = {}) {
    const directionValue = Number(
        options.direction ?? DEFAULT_OPTIONS.direction
    );

    const direction = Number.isFinite(directionValue)
        ? ((directionValue % 360) + 360) % 360
        : DEFAULT_OPTIONS.direction;

    const color = String(
        options.color ?? DEFAULT_OPTIONS.color
    );

    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
        throw new Error(
            "그림자 색상은 #RRGGBB 형식이어야 합니다."
        );
    }

    return {
        direction,
        distance: clamp(
            options.distance ?? DEFAULT_OPTIONS.distance,
            0,
            MAX_DISTANCE_PERCENT
        ),
        blur: clamp(
            options.blur ?? DEFAULT_OPTIONS.blur,
            0,
            MAX_BLUR_PERCENT
        ),
        opacity: clamp(
            options.opacity ?? DEFAULT_OPTIONS.opacity,
            0,
            MAX_OPACITY
        ),
        color
    };
}

function getViewBox(svgElement) {
    const viewBox = svgElement.viewBox.baseVal;

    if (
        viewBox.width <= 0 ||
        viewBox.height <= 0
    ) {
        throw new Error(
            "유효한 SVG viewBox가 필요합니다."
        );
    }

    return {
        x: viewBox.x,
        y: viewBox.y,
        width: viewBox.width,
        height: viewBox.height
    };
}

function setViewBox(svgElement, box) {
    svgElement.setAttribute(
        "viewBox",
        `${box.x} ${box.y} ${box.width} ${box.height}`
    );
}

function createShadowShape(source, color) {
    const clone = source.cloneNode(false);
    const style = getComputedStyle(source);

    clone.removeAttribute("id");
    clone.removeAttribute("class");
    clone.removeAttribute("data-shadow-exclude");
    clone.removeAttribute("style");

    clone.style.fill =
        style.fill === "none" ? "none" : color;

    clone.style.stroke =
        style.stroke === "none" ? "none" : color;

    clone.style.strokeWidth = style.strokeWidth;
    clone.style.strokeLinecap = style.strokeLinecap;
    clone.style.strokeLinejoin = style.strokeLinejoin;
    clone.style.strokeDasharray = style.strokeDasharray;
    clone.style.strokeDashoffset = style.strokeDashoffset;
    clone.style.fillRule = style.fillRule;
    clone.style.clipRule = style.clipRule;

    clone.style.fillOpacity = style.fillOpacity;
    clone.style.strokeOpacity = style.strokeOpacity;

    return clone;
}

function copyShadowGeometry(source, target, color) {
    if (
        source.nodeType !== Node.ELEMENT_NODE ||
        source.getAttribute("data-shadow-exclude") === "true"
    ) {
        return;
    }

    const tag = source.localName;

    if (SKIPPED_TAGS.has(tag)) {
        return;
    }

    const style = getComputedStyle(source);

    if (
        style.display === "none" ||
        style.visibility === "hidden"
    ) {
        return;
    }

    if (DRAWABLE_TAGS.has(tag)) {
        const shape = createShadowShape(
            source,
            color
        );

        if (tag === "text") {
            shape.textContent = source.textContent;
        }

        target.append(shape);
        return;
    }

    const group = createSvgElement("g");

    const transform =
        source.getAttribute("transform");

    const clipPath =
        source.getAttribute("clip-path");

    const mask =
        source.getAttribute("mask");

    if (transform) {
        group.setAttribute(
            "transform",
            transform
        );
    }

    if (clipPath) {
        group.setAttribute(
            "clip-path",
            clipPath
        );
    }

    if (mask) {
        group.setAttribute(
            "mask",
            mask
        );
    }

    group.style.opacity = style.opacity;

    for (const child of source.children) {
        copyShadowGeometry(
            child,
            group,
            color
        );
    }

    if (group.childNodes.length > 0) {
        target.append(group);
    }
}

function populateShadowLayer(
    svgElement,
    layer,
    color
) {
    for (const child of svgElement.children) {
        if (
            child.hasAttribute(SHADOW_ATTRIBUTE) ||
            child.hasAttribute(SHADOW_FILTER_ATTRIBUTE)
        ) {
            continue;
        }

        copyShadowGeometry(
            child,
            layer,
            color
        );
    }
}

/**
 * 그림자 대상 도형의 실제 크기를 측정한다.
 * 기준 길이는 바운딩 박스의 짧은 변이다.
 */
function getShadowBaseSize(layer, originalViewBox) {
    try {
        const bounds = layer.getBBox();

        if (
            Number.isFinite(bounds.width) &&
            Number.isFinite(bounds.height) &&
            bounds.width > 0 &&
            bounds.height > 0
        ) {
            return Math.min(
                bounds.width,
                bounds.height
            );
        }
    } catch (error) {
        console.warn(
            "그림자 바운딩 박스를 측정하지 못했습니다.",
            error
        );
    }

    // 도형 크기를 측정할 수 없는 경우의 대체값
    return Math.min(
        originalViewBox.width,
        originalViewBox.height
    );
}

/**
 * 백분율 설정을 실제 SVG 좌표 단위로 변환한다.
 */
function getShadowDimensions(options, baseSize) {
    return {
        distance:
            baseSize * options.distance / 100,
        blur:
            baseSize * options.blur / 100
    };
}

function getShadowOffset(direction, distance) {
    const radians =
        direction * Math.PI / 180;

    return {
        x: Math.cos(radians) * distance,
        y: Math.sin(radians) * distance
    };
}

/**
 * 이동 방향에 필요한 여백과
 * 블러가 퍼지는 여백을 별도로 계산한다.
 */
function updateViewBox(
    svgElement,
    state,
    offset,
    blur
) {
    const box = state.originalViewBox;

    const blurPadding =
        blur * BLUR_PADDING_FACTOR;

    const left =
        blurPadding + Math.max(0, -offset.x);

    const right =
        blurPadding + Math.max(0, offset.x);

    const top =
        blurPadding + Math.max(0, -offset.y);

    const bottom =
        blurPadding + Math.max(0, offset.y);

    setViewBox(svgElement, {
        x: box.x - left,
        y: box.y - top,
        width: box.width + left + right,
        height: box.height + top + bottom
    });
}

function applyShadowOptions(
    svgElement,
    state,
    options
) {
    const dimensions = getShadowDimensions(
        options,
        state.baseSize
    );

    const offset = getShadowOffset(
        options.direction,
        dimensions.distance
    );

    state.layer.setAttribute(
        "transform",
        `translate(${offset.x} ${offset.y})`
    );

    state.layer.setAttribute(
        "opacity",
        String(options.opacity)
    );

    state.blur.setAttribute(
        "stdDeviation",
        String(dimensions.blur)
    );

    for (
        const shape of
        state.layer.querySelectorAll("*")
    ) {
        if (!DRAWABLE_TAGS.has(shape.localName)) {
            continue;
        }

        if (shape.style.fill !== "none") {
            shape.style.fill = options.color;
        }

        if (shape.style.stroke !== "none") {
            shape.style.stroke = options.color;
        }
    }

    updateViewBox(
        svgElement,
        state,
        offset,
        dimensions.blur
    );

    state.options = options;
}

/**
 * SVG 내부에 정적 그림자 레이어를 생성한다.
 *
 * distance: 객체 크기 대비 0~4(%)
 * blur: 객체 크기 대비 0~2(%)
 * opacity: 0~0.6
 */
export function createShadowLayer(
    svgElement,
    options = {}
) {
    if (!(svgElement instanceof SVGSVGElement)) {
        throw new TypeError(
            "SVG 루트 요소가 필요합니다."
        );
    }

    if (shadowStates.has(svgElement)) {
        updateShadow(svgElement, options);
        return;
    }

    const normalized =
        normalizeOptions(options);

    const originalViewBox =
        getViewBox(svgElement);

    const originalViewBoxAttribute =
        svgElement.getAttribute("viewBox");

    const defs = createSvgElement("defs");

    defs.setAttribute(
        SHADOW_FILTER_ATTRIBUTE,
        ""
    );

    const filter = createSvgElement("filter");

    filter.setAttribute("x", "-100%");
    filter.setAttribute("y", "-100%");
    filter.setAttribute("width", "300%");
    filter.setAttribute("height", "300%");

    const filterId =
        `svg-gallery-shadow-${crypto.randomUUID()}`;

    filter.setAttribute("id", filterId);

    const blur =
        createSvgElement("feGaussianBlur");

    blur.setAttribute(
        "in",
        "SourceGraphic"
    );

    filter.append(blur);
    defs.append(filter);

    const layer = createSvgElement("g");

    layer.setAttribute(
        SHADOW_ATTRIBUTE,
        ""
    );

    layer.setAttribute(
        "aria-hidden",
        "true"
    );

    layer.setAttribute(
        "filter",
        `url(#${filterId})`
    );

    layer.style.pointerEvents = "none";

    populateShadowLayer(
        svgElement,
        layer,
        normalized.color
    );

    const firstDrawable =
        Array.from(svgElement.children).find(
            child => !SKIPPED_TAGS.has(
                child.localName
            )
        );

    svgElement.insertBefore(
        defs,
        firstDrawable || null
    );

    svgElement.insertBefore(
        layer,
        firstDrawable || null
    );

    // 원본 좌표계에서 한 번만 측정한다.
    const baseSize = getShadowBaseSize(
        layer,
        originalViewBox
    );

    const state = {
        defs,
        layer,
        blur,
        baseSize,
        originalViewBox,
        originalViewBoxAttribute,
        options: normalized
    };

    shadowStates.set(
        svgElement,
        state
    );

    applyShadowOptions(
        svgElement,
        state,
        normalized
    );
}

/**
 * 기존 그림자의 설정을 갱신한다.
 * 그림자 레이어는 다시 생성하지 않는다.
 */
export function updateShadow(
    svgElement,
    options = {}
) {
    const state =
        shadowStates.get(svgElement);

    if (!state) {
        createShadowLayer(
            svgElement,
            options
        );
        return;
    }

    const normalized = normalizeOptions({
        ...state.options,
        ...options
    });

    applyShadowOptions(
        svgElement,
        state,
        normalized
    );
}

/**
 * 그림자 관련 요소를 제거하고
 * 원래 viewBox를 복원한다.
 */
export function removeShadow(svgElement) {
    const state =
        shadowStates.get(svgElement);

    if (!state) {
        return;
    }

    state.layer.remove();
    state.defs.remove();

    if (
        state.originalViewBoxAttribute === null
    ) {
        svgElement.removeAttribute(
            "viewBox"
        );
    } else {
        svgElement.setAttribute(
            "viewBox",
            state.originalViewBoxAttribute
        );
    }

    shadowStates.delete(svgElement);
}
