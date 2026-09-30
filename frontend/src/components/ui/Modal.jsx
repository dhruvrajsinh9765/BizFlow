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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div
                className={`w-full ${sizes[size]} rounded-xl border border-slate-800 bg-slate-900 shadow-xl`}
            >
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

