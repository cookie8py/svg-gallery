export const animatedIcons = [
    {
        id: "lantern",
        title: "등불",
        category: "general",
        motion: "animated",
        description:
            "빛의 번짐과 불꽃이 부드럽게 움직이는 애니메이션 등불 아이콘입니다.",
        source: "직접 제작",
        previewType: "html",
        previewPath:
            "./assets/icons/animated/lantern/lantern.html",
        thumbnailPath:
            "./assets/icons/animated/lantern/lantern.svg",
        svgPath:
            "./assets/icons/animated/lantern/lantern.svg",
        htmlPath:
            "./assets/icons/animated/lantern/lantern.html",
        colorCount: 3,
        editableColors: [
            {
                key: "--lantern-blue",
                label: "등불",
                defaultValue: "#427eff"
            },
            {
                key: "--lantern-white",
                label: "테두리와 빛",
                defaultValue: "#ffffff"
            },
            {
                key: "--lantern-glass",
                label: "유리",
                defaultValue: "#dce7ff"
            }
        ]
    },
    {
        id: "umbrella",
        title: "비와 우산",
        category: "climate",
        motion: "animated",
        description:
            "우산 위로 비가 내리는 애니메이션 아이콘입니다. HTML 버전에서는 빗방울이 우산에 부딪혀 양옆으로 튀는 효과가 적용됩니다.",
        source: "직접 제작",
        previewType: "html",
        previewPath:
            "./assets/icons/animated/umbrella/umbrella.html",
        thumbnailPath:
            "./assets/icons/animated/umbrella/umbrella.svg",
        svgPath:
            "./assets/icons/animated/umbrella/umbrella.svg",
        htmlPath:
            "./assets/icons/animated/umbrella/umbrella.html",
        colorCount: 2,
        editableColors: [
            {
                key: "--umbrella-color",
                label: "우산",
                defaultValue: "#427eff"
            },
            {
                key: "--rain-color",
                label: "빗방울",
                defaultValue: "#8fb3ff"
            }
        ]
    },
    {
        id: "pump-jack",
        title: "펌프잭",
        category: "climate",
        motion: "animated",
        description:
            "크랭크의 회전이 핏맨 암과 워킹빔으로 전달되는 석유 시추용 펌프잭 애니메이션 아이콘입니다.",
        source: "직접 제작",
        previewType: "html",
        previewPath:
            "./assets/icons/animated/pump-jack/pump-jack-animated.svg",
        thumbnailPath:
            "./assets/icons/animated/pump-jack/pump-jack-animated.svg",
        svgPath:
            "./assets/icons/animated/pump-jack/pump-jack-animated.svg",
        htmlPath: "",
        colorCount: 2,
        editableColors: [
            {
                key: "--pump-jack-fill",
                label: "도형 내부",
                defaultValue: "#ffffff"
            },
            {
                key: "--pump-jack-stroke",
                label: "윤곽선",
                defaultValue: "#000000"
            }
        ]
    }
];
