import { createPortal } from "react-dom";

export function PortalModal({ isOpen, onClose, children, className }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  if (!isOpen) return null;

  return createPortal(
    <div className={"fixed inset-0 flex items-center justify-center bg-black/50 z-50 " + className}>
      <div className="bg-white p-8 rounded shadow-lg relative">
        {/* Close button in the top-right corner */}
        <span onClick={onClose} className="absolute top-2 right-2 text-black mouse-pointer">
          X
        </span>
        {children}
      </div>
    </div>,
    document.body
  );
}
