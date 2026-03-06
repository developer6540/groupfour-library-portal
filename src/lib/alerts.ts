import { toast } from "sonner";

// Define the attractive base style once to keep code DRY
const baseStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    padding: '16px',
    border: 'none',
};

export const alerts = {
    success: (message: string, description?: string, duration?:number) => {
        toast.success(message, {
            description,
            duration: duration,
            style: {
                ...baseStyle,
                border: '5px solid green',
            },
        });
    },

    error: (message: string, description?: string, duration?:number) => {
        toast.error(message, {
            description,
            duration: duration,
            style: {
                ...baseStyle,
                border: '5px solid red',
            },
        });
    },

    info: (message: string, description?: string, duration?:number) => {
        toast.info(message, {
            description,
            duration: duration,
            style: {
                ...baseStyle,
                border: '5px solid blue',
            },
        });
    },

    warning: (message: string, description?: string, duration?:number) => {
        toast.warning(message, {
            description,
            duration: duration,
            style: {
                ...baseStyle,
                border: '5px solid yellow',
            },
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            style: baseStyle
        });
    },
};