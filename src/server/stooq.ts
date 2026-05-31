// Deprecated: the old Stooq-only simulator data fetcher was replaced by the investment API research cockpit.
// Kept as a no-op compatibility module so old imports do not break during cleanup.
export interface LegacyStooqNotice {
  deprecated: true;
  replacement: "src/shared/research.ts";
}

export const legacyStooqNotice: LegacyStooqNotice = {
  deprecated: true,
  replacement: "src/shared/research.ts"
};
