import { climateIcons } from "./icons/climate-icons.js";
import { animalIcons } from "./icons/animal-icons.js";
import { oceanIcons } from "./icons/ocean-icons.js";
import { animatedIcons } from "./icons/animated-icons.js";

const allIcons = [
    ...climateIcons,
    ...animalIcons,
    ...oceanIcons,
    ...animatedIcons
];

const completedIcons = allIcons.filter(
    function (icon) {
        return icon.previewType !== "placeholder";
    }
);

const placeholderIcons = allIcons.filter(
    function (icon) {
        return icon.previewType === "placeholder";
    }
);

export const icons = [
    ...completedIcons,
    ...placeholderIcons
];