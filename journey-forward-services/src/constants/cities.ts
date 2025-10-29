export const SERVICE_CITIES = [
    'Vancouver',
    'Burnaby',
    'New Westminster',
    'Richmond',
    'Surrey'
] as const;

export type ServiceCity = typeof SERVICE_CITIES[number];