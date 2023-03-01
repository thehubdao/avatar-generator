module.exports = {
    plugins: [require('tailwindcss-neumorphism')],
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        // For the best performance and to avoid false positives,
        // be as specific as possible with your content configuration.
    ],
    theme: {
      extend: {
        fontFamily: {
          'work': ['var(--work-font)', 'sans-serif'],
          'humane': ['var(--humane-font)', 'sans-serif']
        },
        colors: {
          gray: {
            light: '#A3AFBD',
            normal: '#54575C',
            dark: '#111111'
          },
          bg: '#F5F7FF',
          purple: '#7f3eae',
          orange: '#d85b00',
          blue: '#006cad',
          light: 'rgba(255,255,255,0.4)'
        },
        boxShadow: {
          'flat-soft': '2px 2px 4px #E9ECF6, -2px -2px 4px #ffffff',
          'flat-medium': '4px 4px 8px #E9ECF6, -4px -4px 8px #ffffff',
          'flat-hard': '6px 6px 12px #E9ECF6, -6px -6px 12px #ffffff',
          'inset-soft': 'inset 2px 2px 4px #E9ECF6, inset -2px -2px 4px #ffffff',
          'inset-medium': 'inset 4px 4px 8px #E9ECF6, inset -4px -4px 8px #ffffff',
          'inset-hard': 'inset 6px 6px 12px #E9ECF6, inset -6px -6px 12px #ffffff',
          'flat-inset-soft': '2px 2px 4px #E9ECF6, -2px -2px 4px #ffffff, inset 2px 2px 4px #E9ECF6, inset -2px -2px 4px #ffffff',
          'flat-inset-medium': '4px 4px 8px #E9ECF6, -4px -4px 8px #ffffff, inset 4px 4px 8px #E9ECF6, inset -4px -4px 8px #ffffff',
          'flat-inset-hard': '6px 6px 12px #E9ECF6, -6px -6px 12px #ffffff, inset 6px 6px 12px #E9ECF6, inset -6px -6px 12px #ffffff'
        }
      },
    }
};