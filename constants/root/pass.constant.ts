import { Environment } from "@futureverse/auth-react/auth";
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

export const CLIENT_ID = 'ebbK31YxjfhaQ5-IUp5iw' as string;

export const ENVIRONMENT = 'staging' as Environment;