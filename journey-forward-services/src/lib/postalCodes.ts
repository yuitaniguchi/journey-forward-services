export const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

const VANCOUVER_PREFIXES = [
    "V5K", "V5L", "V5M", "V5N", "V5P", "V5R", "V5S", "V5T", "V5V", "V5W", "V5X", "V5Y", "V5Z",
    "V6A", "V6B", "V6C", "V6E", "V6G", "V6H", "V6J", "V6K", "V6L", "V6M", "V6N", "V6P", "V6R",
    "V6S", "V6T", "V6Z", "V7X", "V7Y",
];

const BURNABY_PREFIXES = [
    "V3J", "V3N", "V5A", "V5B", "V5C", "V5E", "V5G", "V5H", "V5J",
];

const RICHMOND_PREFIXES = [
    "V6V", "V6W", "V6X", "V6Y", "V7A", "V7B", "V7C", "V7E",
];

const SURREY_PREFIXES = [
    "V3R", "V3S", "V3T", "V3V", "V3W", "V3X", "V3Z", "V4A", "V4N", "V4P",
];

export const SUPPORTED_POSTAL_PREFIXES = [
    ...VANCOUVER_PREFIXES,
    ...BURNABY_PREFIXES,
    ...RICHMOND_PREFIXES,
    ...SURREY_PREFIXES,
];

export function isSupportedPostalCode(postalRaw: string) {
    const code = postalRaw.replace(/\s+/g, "").toUpperCase();
    const fsa = code.slice(0, 3);
    return SUPPORTED_POSTAL_PREFIXES.includes(fsa);
}