module.exports = {
  content: [
    './_drafts/**/*.html',
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './blog/index.html',
    './*.md',
    './*.html',
  ],
  safelist: [
    'text-github',
    'text-linkedin',
    'text-rss'
  ],
  theme: {
    extend: {
      colors: {
        'github': '#1B1F22',
        'linkedin': '#0072b1',
        'rss': '#f66a0a'
      },
      typography: {
        DEFAULT: {
          css:{
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            }
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}