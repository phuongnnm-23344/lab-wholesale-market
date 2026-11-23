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
// Values are fictional sample master data (mock M01); a real system reads them from SC-10-07.
export const SAMPLE_SHIPPERS = ["サンプル第一丸", "サンプル第二丸", "サンプル漁協A"];
export const SAMPLE_SPECIES = ["サンプル真鯛", "サンプル真鯵", "サンプル真鯖", "サンプル鰤", "サンプル鰹", "サンプルするめいか"];
