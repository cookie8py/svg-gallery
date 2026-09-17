export const animalIllustrations = [
    {
        id: "pigeon",
        title: "비둘기",
        category: "animal",
        motion: "static",
        colorCount: 10,
        description:
            "도시를 함께 살아가는 집비둘기를 로즈토프와 모브 계열로 표현한 정적 일러스트입니다.",
        source: "직접 제작",

        environmentalContext: {
            summary:
                "도시 비둘기는 인간과 오랜 역사를 공유해 온 동물입니다. 인간은 수천 년 동안 비둘기를 길들이고 통신과 전쟁 등에 이용했지만, 오늘날에는 이들을 도시의 골칫거리로 낙인찍고 배제하거나 죽이기도 합니다. 비둘기를 보호받아야 할 도시의 공동 거주자로 바라보고, 인간이 만든 위험을 줄이는 비살상 공존이 필요합니다.",
            points: [
                "인간은 수천 년 동안 비둘기의 귀소 능력을 이용해 소식을 전달했고, 전쟁에서도 수많은 비둘기를 위험한 통신 임무에 동원했습니다.",
                "도시의 비둘기는 버려진 실, 낚싯줄, 머리카락 같은 인공 폐기물이 발에 감기면서 발가락이 손상되거나 절단되는 고통을 겪습니다.",
                "비둘기를 해충으로 낙인찍어 사살하거나 포식동물을 동원하는 방식은 심각한 고통을 일으킵니다. 도시에서 발생하는 갈등은 살처분이 아니라 안전하고 비살상적인 공존 방식으로 해결해야 합니다."
            ],
            sources: [
                {
                    label: "Animal Aid",
                    url: "https://www.animalaid.org.uk/issues/wildlife-and-our-shared-planet/culling-humane-deterrents/"
                },
                {
                    label: "USDA National Agricultural Library",
                    url: "https://www.nal.usda.gov/collections/stories/human-relationship-pigeons-forgotten-war-heroes"
                },
                {
                    label: "Biological Conservation",
                    url: "https://doi.org/10.1016/j.biocon.2019.108241"
                }
            ]
        },

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
                label: "날개 넓은 면",
                defaultValue: "#B99C94"
            },
            {
                key: "--pigeon-wing-middle",
                label: "날개 중간",
                defaultValue: "#96746F"
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
