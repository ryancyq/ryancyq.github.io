module.exports = {
  content: [
    './_drafts/**/*.html',
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
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
      }
    },
  },
  plugins: []
}