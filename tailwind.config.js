module.exports = {
    plugins: [require('tailwindcss-neumorphism')],
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './layouts/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './ui/**/*.{js,ts,jsx,tsx}',
        './utils/**/*.{js,ts,jsx,tsx}',
        // For the best performance and to avoid false positives,
        // be as specific as possible with your content configuration.
    ],
    theme: {
      extend: {
        fontFamily: {
          'work': ['var(--work-font)', 'sans-serif'],
          'humane': ['var(--humane-font)', 'sans-serif'],
          'monument': ['var(--monument-font)', 'sans-serif'],
          'poppins': ['var(--poppins-font)', 'sans-serif'],
          'featuresIcons': ['var(--features-icons-font)', 'sans-serif'],
        },
        colors: {
          gray: {
            extralight: '#E4E7EB',
            light: '#A3AFBD',
            normal: '#54575C',
            dark: '#111111'
          },
          bg: '#F1F5F9',
          accent: '#19D8F3',
          purple: '#7f3eae',
          orange: '#F38630',
          blue: '#006cad',
          red: '#fa5953',
          light: 'rgba(255,255,255,0.4)',
          client: {
            primary: '#FFCBDE',
          },
          citizens: {
            dark: '#1b1b1d',
            gray: '#E6E6E6',
            blue: '#19B5F3',
            bluedark: '#1E293B' 
          }
        },
        boxShadow: {
          'citizens-btn':'inset 0px 1px 0px 0px #FFFFFF1A, inset 0px -1px 0px 0px #FFFFFF0D',
          'citizens-img':'16px 12px 32px 0px #0C0D0F, -12px -8px 32px 0px #24262B',
          'citizens-input':'inset 0px 2px 2px 0px rgba(0,0,0,0.25), inset 0px -2px 2px 0px rgba(255,255,255,0.05)',
          'flat-soft':'-2.81481px -2.81481px 6.6296px #FFFFFF, 2.81481px 2.81481px 6.6296px #D3D9E6',
          'flat-medium':'-5.81481px -5.81481px 12.6296px #FFFFFF, 5.81481px 5.81481px 12.6296px #D3D9E6',
          'flat-hard':'-8.78261px -8.78261px 17.5652px #FFFFFF, 8.78261px 8.78261px 17.5652px #D3D9E6',
          'inset-soft':'inset 1.3913px 1.3913px 2.78261px rgba(0,0,0,0.15), inset -1.3913px -1.3913px 2.78261px rgba(255,255,255,0.7)',
          'inset-medium':'inset 2.3913px 2.3913px 5.78261px rgba(0,0,0,0.15), inset -2.3913px -2.3913px 5.78261px rgba(255,255,255,0.7)',
          'inset-hard':'inset 4.3913px 4.3913px 8.78261px rgba(0,0,0,0.15), inset -4.3913px -4.3913px 8.78261px rgba(255,255,255,0.7)',
          'flat---inset-soft': '2px 2px 4px #E9ECF6, -2px -2px 4px #ffffff, inset 2px 2px 4px #E9ECF6, inset -2px -2px 4px #ffffff',
          'flat---inset-medium': '4px 4px 8px #E9ECF6, -4px -4px 8px #ffffff, inset 4px 4px 8px #E9ECF6, inset -4px -4px 8px #ffffff',
          'flat---inset-hard': '6px 6px 12px #E9ECF6, -6px -6px 12px #ffffff, inset 6px 6px 12px #E9ECF6, inset -6px -6px 12px #ffffff'
        },
        transitionProperty: {
          'size': 'width, height',
        }
      },
    }
};