import { ThemeConfig } from "@futureverse/auth-ui";
import { DefaultTheme } from "@futureverse/auth-ui";

export const CUSTOM_THEME_CONFIG: ThemeConfig = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        page: '', // The whole page background color
        surface: '#000000',
        muted: 'rgba(1, 1, 1, 1)',
    },
    borderRadius: {
        ...DefaultTheme.borderRadius,
        default: 10,
    },
    showCloseButton: true,
};

export const CLIENT_ID = '_I8ed6ePWVvtBg-Hu6yeW';