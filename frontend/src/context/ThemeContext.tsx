import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
            root.style.setProperty('--bg-primary', '#0f172a'); // Slate 900
            root.style.setProperty('--text-primary', '#f8fafc'); // Slate 50
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
            root.style.setProperty('--bg-primary', '#f8fafc'); // Slate 50
            root.style.setProperty('--text-primary', '#0f172a'); // Slate 900
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
