
const SVG_NS = "http://www.w3.org/2000/svg";

const SHADOW_ATTRIBUTE = "data-svg-gallery-shadow";
const SHADOW_FILTER_ATTRIBUTE = "data-svg-gallery-shadow-filter";

const DEFAULT_OPTIONS = {
    direction: 135,
    distance: 20,
    blur: 5,
    opacity: 0.4,
    color: "#000000"
};

const MAX_DISTANCE = 60;
const MAX_BLUR = 30;

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
        throw new Error("그림자 색상은 #RRGGBB 형식이어야 합니다.");
    }

    return {
        direction,
        distance: clamp(
            options.distance ?? DEFAULT_OPTIONS.distance,
            0,
            MAX_DISTANCE
        ),
        blur: clamp(
            options.blur ?? DEFAULT_OPTIONS.blur,
            0,
            MAX_BLUR
        ),
        opacity: clamp(
            options.opacity ?? DEFAULT_OPTIONS.opacity,
            0,
            1
        ),
        color
    };
}

function getViewBox(svgElement) {
    const viewBox = svgElement.viewBox.baseVal;

    if (viewBox.width <= 0 || viewBox.height <= 0) {
        throw new Error("유효한 SVG viewBox가 필요합니다.");
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

    // 원본 ID를 복제하지 않는다.
    clone.removeAttribute("id");

    // 원본 CSS 선택자와 충돌하지 않도록 한다.
    clone.removeAttribute("class");

    clone.removeAttribute("data-shadow-exclude");

    // 원본 도형의 변환과 클리핑은 유지한다.
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

    // 개별 도형의 기존 투명도는 그림자에도 반영한다.
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
        const shape = createShadowShape(source, color);

        // 텍스트는 문자 노드도 필요하다.
        if (tag === "text") {
            shape.textContent = source.textContent;
        }

        target.append(shape);
        return;
    }

    // g, a 등의 컨테이너는 계층 구조를 유지한다.
    const group = createSvgElement("g");

    const transform = source.getAttribute("transform");
    const clipPath = source.getAttribute("clip-path");
    const mask = source.getAttribute("mask");

    if (transform) {
        group.setAttribute("transform", transform);
    }

    if (clipPath) {
        group.setAttribute("clip-path", clipPath);
    }

    if (mask) {
        group.setAttribute("mask", mask);
    }

    group.style.opacity = style.opacity;

    for (const child of source.children) {
        copyShadowGeometry(child, group, color);
    }

    if (group.childNodes.length > 0) {
        target.append(group);
    }
}

function populateShadowLayer(svgElement, layer, color) {
    for (const child of svgElement.children) {
        if (
            child.hasAttribute(SHADOW_ATTRIBUTE) ||
            child.hasAttribute(SHADOW_FILTER_ATTRIBUTE)
        ) {
            continue;
        }

        copyShadowGeometry(child, layer, color);
    }
}

function getShadowOffset(options) {
    const radians = options.direction * Math.PI / 180;

    return {
        x: Math.cos(radians) * options.distance,
        y: Math.sin(radians) * options.distance
    };
}

function updateViewBox(svgElement, state, options) {
    const box = state.originalViewBox;

    // 방향과 무관하게 충분한 여백을 확보한다.
    const padding = options.distance + options.blur * 4;

    setViewBox(svgElement, {
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2
    });
}

function applyShadowOptions(svgElement, state, options) {
    const offset = getShadowOffset(options);

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
        String(options.blur)
    );

    for (const shape of state.layer.querySelectorAll("*")) {
        if (DRAWABLE_TAGS.has(shape.localName)) {
            if (shape.style.fill !== "none") {
                shape.style.fill = options.color;
            }

            if (shape.style.stroke !== "none") {
                shape.style.stroke = options.color;
            }
        }
    }

    updateViewBox(svgElement, state, options);
    state.options = options;
}

/**
 * SVG 내부에 그림자 레이어를 생성한다.
 * 정적 SVG를 대상으로 한다.
 */
export function createShadowLayer(svgElement, options = {}) {
    if (!(svgElement instanceof SVGSVGElement)) {
        throw new TypeError("SVG 루트 요소가 필요합니다.");
    }

    if (shadowStates.has(svgElement)) {
        updateShadow(svgElement, options);
        return;
    }

    const normalized = normalizeOptions(options);
    const originalViewBox = getViewBox(svgElement);

    const defs = createSvgElement("defs");
    defs.setAttribute(SHADOW_FILTER_ATTRIBUTE, "");

    const filter = createSvgElement("filter");
    filter.setAttribute("x", "-100%");
    filter.setAttribute("y", "-100%");
    filter.setAttribute("width", "300%");
    filter.setAttribute("height", "300%");

    const filterId =
        `svg-gallery-shadow-${crypto.randomUUID()}`;

    filter.setAttribute("id", filterId);

    const blur = createSvgElement("feGaussianBlur");
    blur.setAttribute("in", "SourceGraphic");

    filter.append(blur);
    defs.append(filter);

    const layer = createSvgElement("g");
    layer.setAttribute(SHADOW_ATTRIBUTE, "");
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("filter", `url(#${filterId})`);
    layer.style.pointerEvents = "none";

    populateShadowLayer(svgElement, layer, normalized.color);

    // defs 뒤, 원본 그림 앞에 삽입한다.
    const firstDrawable = Array.from(svgElement.children).find(
        child => !SKIPPED_TAGS.has(child.localName)
    );

    svgElement.insertBefore(defs, firstDrawable || null);
    svgElement.insertBefore(layer, firstDrawable || null);

    const state = {
        defs,
        layer,
        blur,
        originalViewBox,
        originalViewBoxAttribute:
            svgElement.getAttribute("viewBox"),
        options: normalized
    };

    shadowStates.set(svgElement, state);

    applyShadowOptions(svgElement, state, normalized);
}

/**
 * 기존 그림자의 속성을 변경한다.
 * 그림자 레이어는 다시 생성하지 않는다.
 */
export function updateShadow(svgElement, options = {}) {
    const state = shadowStates.get(svgElement);

    if (!state) {
        createShadowLayer(svgElement, options);
        return;
    }

    const normalized = normalizeOptions({
        ...state.options,
        ...options
    });

    applyShadowOptions(svgElement, state, normalized);
}

/**
 * 그림자 요소를 제거하고 원래 viewBox로 복원한다.
 */
export function removeShadow(svgElement) {
    const state = shadowStates.get(svgElement);

    if (!state) {
        return;
    }

    state.layer.remove();
    state.defs.remove();

    if (state.originalViewBoxAttribute === null) {
        svgElement.removeAttribute("viewBox");
    } else {
        svgElement.setAttribute(
            "viewBox",
            state.originalViewBoxAttribute
        );
    }

    shadowStates.delete(svgElement);
}
