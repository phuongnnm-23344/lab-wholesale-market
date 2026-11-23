// Traceability (rule 7): every screen shows its LAB-1 screen ID and the features / RFP IDs it covers.
export function ScreenIdFooter({ screenId, trace }: { screenId: string; trace: string }) {
  return (
    <footer className="screen-id-footer">
      {screenId} ・ {trace}
    </footer>
  );
}
