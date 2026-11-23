export type LotRow = {
  id: string;
  lot_no: string;
  business_date: string;
  shipper_name: string;
  species: string;
  unit: string;
  qty_received: number | null;
  status: string;
  available_qty: number;
};

export type LotListResponse = { date: string; lots: LotRow[] };

// Fixed choices instead of free typing at the dock (customer concern: fewer keystrokes).
// Values are fictional sample master data (sample data); a real system reads them from the master.
export const SAMPLE_SHIPPERS = ["サンプル第一丸", "サンプル第二丸", "サンプル漁協A"];
export const SAMPLE_SPECIES = ["サンプル真鯛", "サンプル真鯵", "サンプル真鯖", "サンプル鰤", "サンプル鰹", "サンプルするめいか"];

// Badge color per lot status (labels: LOT_STATUS_LABELS in lot-and-trade-schemas).
export const LOT_STATUS_TONES: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  PROVISIONAL: "warning", RECEIVED: "neutral", INSPECTED: "info", PUBLISHED: "success", SOLD_OUT: "neutral", DELIVERED: "neutral",
};
