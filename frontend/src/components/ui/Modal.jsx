import { X } from "lucide-react";

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
}) => {
    if (!isOpen) {
        return null;
    }

    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 px-4 py-6 backdrop-blur-sm sm:py-8"
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={`w-full ${sizes[size] || sizes.md} max-h-[calc(100vh-48px)] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/40`}
            >
                <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-900/95 px-5 py-4">
                    <h2
                        id="modal-title"
                        className="font-['Space_Grotesk'] text-lg font-semibold tracking-[-0.01em] text-slate-100"
                    >
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                    >
                        <X size={19} strokeWidth={2} />
                    </button>
                </div>

                <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;