module.exports = {
    darkMode: 'class',
    plugins: [
        require('tailwindcss-neumorphism'), // Re-enabled after CSS stabilization
        require('@tailwindcss/line-clamp') // For text truncation in quest cards
    ],
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './layouts/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './ui/**/*.{js,ts,jsx,tsx}',
        './utils/**/*.{js,ts,jsx,tsx}',
        './styles/**/*.{css,scss}',
        // For the best performance and to avoid false positives,
        // be as specific as possible with your content configuration.
    ],
    safelist: [
        // Quest System Critical Classes - Never Purge
        'border-blue-200',
        'border-blue-100', 
        'border-blue-300',
        'border-blue-500',
        'bg-blue-50',
        'bg-blue-100',
        'bg-green-50',
        'bg-green-100',
        'bg-yellow-50',
        'bg-yellow-100',
        'bg-purple-50',
        'bg-purple-100',
        'bg-orange-50',
        'bg-orange-100',
        'border-green-200',
        'border-yellow-200',
        'border-purple-200',
        'border-orange-200',
        'border-gray-200',
        'border-red-200',
        'text-blue-800',
        'text-green-800',
        'text-yellow-800',
        'text-purple-800',
        'text-orange-800',
        'text-gray-800',
        'text-red-800',
        // Quest Animation Classes
        'transform',
        'scale-105',
        'scale-95',
        '-translate-y-1',
        'shadow-md',
        'shadow-lg',
        // Responsive and State Classes
        {
          pattern: /quest-(card|button|hover-effect|skeleton|loading-shimmer)/,
          variants: ['hover', 'active', 'focus', 'completed', 'in-progress', 'locked']
        },
        {
          pattern: /(difficulty|status)-(easy|medium|hard|legendary|available|in-progress|completed|locked|expired)/
        }
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
            graylight: '#C6C6C7',
            blue: '#19B5F3',
            bluedark: '#1E293B',
            yellow: '#FDC322',
            red: '#FD228C'
          }
        },
        boxShadow: {
          'citizens-btn':'inset 0px 1px 0px 0px #FFFFFF1A, inset 0px -1px 0px 0px #FFFFFF0D',
          'citizens-img':'16px 12px 32px 0px #0C0D0F, -12px -8px 32px 0px #24262B',
          'citizens-input':'inset 0px 2px 2px 0px rgba(0,0,0,0.25), inset 0px -2px 2px 0px rgba(255,255,255,0.05)',
          'flat-soft':'-2.81481px -2.81481px 6.6296px #FFFFFF, 2.81481px 2.81481px 6.6296px #D3D9E6',
          'flat-soft-dark':'-2.81481px -2.81481px 6.6296px #24262B, 2.81481px 2.81481px 6.6296px #0C0D0F',
          'flat-medium':'-5.81481px -5.81481px 12.6296px #FFFFFF, 5.81481px 5.81481px 12.6296px #D3D9E6',
          'flat-medium-dark':'-5.81481px -5.81481px 12.6296px #24262B, 5.81481px 5.81481px 12.6296px #0C0D0F',
          'flat-hard':'-8.78261px -8.78261px 17.5652px #FFFFFF, 8.78261px 8.78261px 17.5652px #D3D9E6',
          'flat-hard-dark':'-8.78261px -8.78261px 17.5652px #24262B, 8.78261px 8.78261px 17.5652px #0C0D0F',
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