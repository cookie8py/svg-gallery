import {
    climateIllustrations
} from "./illustrations/climate-illustrations.js";

import {
    animalIllustrations
} from "./illustrations/animal-illustrations.js";

import {
    oceanIllustrations
} from "./illustrations/ocean-illustrations.js";

const allIllustrations = [
    ...climateIllustrations,
    ...animalIllustrations,
    ...oceanIllustrations
];

const completedIllustrations =
    allIllustrations.filter(
        function (illustration) {
            return (
                illustration.previewType !==
                "placeholder"
            );
        }
    );

const placeholderIllustrations =
    allIllustrations.filter(
        function (illustration) {
            return (
                illustration.previewType ===
                "placeholder"
            );
        }
    );

export const illustrations = [
    ...completedIllustrations,
    ...placeholderIllustrations
];
