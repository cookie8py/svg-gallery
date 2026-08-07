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
        thumbnailPath: "",
        svgPath: "",
        htmlPath:
            "./assets/icons/animated/lantern/lantern.html",
        colorCount: 3,
        editableColors: [
            {
                key: "--lantern-blue",
                label: "배경과 등불",
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
    }
];
