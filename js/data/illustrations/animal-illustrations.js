export const animalIllustrations = [
    {
        id: "pigeon",
        title: "비둘기",
        category: "animal",
        motion: "static",
        colorCount: 11,
        description:
            "도시에서 살아가는 집비둘기를 로즈토프와 모브 계열로 표현한 정적 일러스트입니다.",
        source: "직접 제작",
        previewType: "svg",
        previewPath:
            "./assets/illustrations/static/pigeon/pigeon.svg",
        svgPath:
            "./assets/illustrations/static/pigeon/pigeon.svg",
        htmlPath: "",
        editableColors: [
            {
                key: "--pigeon-body",
                label: "몸통",
                defaultValue: "#C2B9B6"
            },
            {
                key: "--pigeon-neck-light",
                label: "목 밝은색",
                defaultValue: "#9B8582"
            },
            {
                key: "--pigeon-neck-dark",
                label: "목 짙은색",
                defaultValue: "#76545C"
            },
            {
                key: "--pigeon-wing-main",
                label: "큰 날개",
                defaultValue: "#B99C94"
            },
            {
                key: "--pigeon-wing-upper",
                label: "날개 윗부분",
                defaultValue: "#96746F"
            },
            {
                key: "--pigeon-wing-secondary",
                label: "날개 중간",
                defaultValue: "#C8ADA5"
            },
            {
                key: "--pigeon-wing-tip",
                label: "날개 끝",
                defaultValue: "#E7E1DA"
            },
            {
                key: "--pigeon-tail",
                label: "꼬리",
                defaultValue: "#EEE9E2"
            },
            {
                key: "--pigeon-feet",
                label: "발",
                defaultValue: "#B96874"
            },
            {
                key: "--pigeon-beak",
                label: "부리",
                defaultValue: "#51494A"
            },
            {
                key: "--pigeon-eye",
                label: "눈",
                defaultValue: "#A95F36"
            }
        ]
    },
    {
        id: "illustration-placeholder-5",
        title: "임시 일러스트 5",
        category: "animal",
        motion: "animated",
        colorCount: 2,
        description:
            "동물보호 동적 일러스트가 들어갈 임시 카드입니다.",
        source: "아직 등록된 출처가 없습니다.",
        previewType: "placeholder",
        previewPath: "",
        svgPath: "",
        htmlPath: "",
        editableColors: [
            {
                key: "--placeholder-color",
                label: "일러스트",
                defaultValue: "#64748B"
            }
        ]
    }
];
