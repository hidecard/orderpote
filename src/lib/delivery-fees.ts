import { MYANMAR_REGIONS, TOWNSHIPS_BY_REGION } from './myanmar-data';

export type DeliveryFeeMap = Record<string, number>;

export function getDeliveryFeeKey(regionId: string, township: string): string {
  return `${regionId}:${township}`;
}

export function getDefaultDeliveryFee(regionId: string): number {
  if (regionId === 'yangon') return 3000;
  if (regionId === 'mandalay') return 3500;
  return 5000;
}

export function createDefaultDeliveryFees(): DeliveryFeeMap {
  const fees: DeliveryFeeMap = {};

  MYANMAR_REGIONS.forEach((region) => {
    const townships = TOWNSHIPS_BY_REGION[region.id] || [];
    townships.forEach((township) => {
      fees[getDeliveryFeeKey(region.id, township)] = getDefaultDeliveryFee(region.id);
    });
  });

  return fees;
}

export function parseDeliveryFees(value?: string | null): DeliveryFeeMap {
  if (!value) return createDefaultDeliveryFees();

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return createDefaultDeliveryFees();
    }

    return {
      ...createDefaultDeliveryFees(),
      ...Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
          .filter(([, fee]) => Number.isFinite(Number(fee)))
          .map(([key, fee]) => [key, Number(fee)])
      ),
    };
  } catch {
    return createDefaultDeliveryFees();
  }
}

export function getDeliveryFeeForTownship(
  fees: DeliveryFeeMap,
  regionId: string,
  township: string
): number {
  if (!regionId || !township) return 0;
  return fees[getDeliveryFeeKey(regionId, township)] ?? getDefaultDeliveryFee(regionId);
}

