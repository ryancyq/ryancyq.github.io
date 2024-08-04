---
layout: post
title: "Building a Static Site with Jekyll and Tailwind CSS"
tags: [jekyll, tailwind, tailwind-css]
---

[Jekyll](https://jekyllrb.com/) is a great tool for building static sites, whether for your personal blog or a hobby project website. With [Tailwind CSS](https://tailwindcss.com/), it makes building your website easier and more visually appealing.

One major benefit of using Jekyll is gaining access to the free hosting offered by [GitHub Pages](https://docs.github.com/en/pages) for public repositories. If you're comfortable with this setup, GitHub Pages is a no-brainer choice.

See my post on [Deploy Jekyll to GitHub Pages with TailwindCSS](https://www.ryancyq.com/posts/2024/07/30/deploy-jekyll-with-tailwindcss-via-github-action) for more information on deploying a custom Jekyll build to GitHub Pages.

## Prerequisites

Make sure you have the required dependencies set up on your local machine.

## Step 1: Install Ruby and Jekyll

Install Ruby using `rbenv` and the Jekyll gem. Follow [this guide](https://github.com/rbenv/rbenv#installation) to install `rbenv`.

```sh
# Install rbenv and Ruby
rbenv install 3.3.1
rbenv global 3.3.1

# Install Jekyll gem
gem install jekyll bundler
```

## Step 2: Create a New Jekyll Site

Create a new Jekyll site with a blank state.
```sh
jekyll new my-personal-blog --blank
cd my-personal-blog
```

Optionally, create a `.ruby-version` file for the Ruby version you have installed.
```sh
echo "3.3.1" > .ruby-version
```

## Step 3: Install `jekyll-postcss` dependency for Ruby

Add `jekyll-postcss` to the Gemfile.
```sh
echo "gem 'jekyll-postcss', '~> 0.5.0'" >> Gemfile
bundle install
```

Configure `jekyll-postcss` by adding the following into your Jekyll `_config.yml`.
```yaml
# _config.yml
plugins:
  - jekyll-postcss

postcss:
  cache: false
```

## Step 4: Install Node and Tailwind CSS

Install Node.js using `nvm`. Follow [this guide](https://github.com/nvm-sh/nvm#installing-and-updating) to install `nvm`. 
```sh
# Install Node.js LTS version
nvm install --lts
```

Then install **Tailwind CSS**, **PostCSS**, **cssnano**, and **autoprefixer** as dev dependencies.
```sh
# Initialize npm and install dependencies
npm init -y
npm install --save-dev tailwindcss postcss cssnano autoprefixer
```

- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
- **[PostCSS](https://postcss.org/)**: A tool for transforming CSS with JavaScript plugins.
- **[cssnano](https://cssnano.co/)**: A PostCSS plugin to minify the final CSS output for better performance.
- **[autoprefixer](https://github.com/postcss/autoprefixer)**: A PostCSS plugin to add vendor prefixes to CSS rules for better browser support.

## Step 5: Create PostCSS Config

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    ...(process.env.JEKYLL_ENV == 'production'
      ? [require('cssnano')({ preset: 'default' })]
      : [])
  ]
}
```

## Step 6: Create Tailwind Config

Specify the content (in this case, Markdown and HTML files) for Tailwind CSS to detect the usage of CSS classes. Only the CSS classes that are used will be compiled into the output CSS file (`assets/css/main.css`).

```js
// tailwind.config.js
module.exports = {
  content: [
    './_drafts/**/*.html',
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './*.md',
    './*.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Step 7: Remove Jekyll SASS

Rename the default `scss` file provided by Jekyll at `assets/css/main.scss` to `assets/css/main.css`. Also change the content to the following:
```css
/* assets/css/main.css */
---
---

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Remove the `_sass` folder in the root directory as well to entirely get rid of the SASS setup.

## Step 8: Start the Jekyll Server

Start the Jekyll server with live reload enabled.

```sh
bundle exec jekyll serve --livereload
```

By following these steps, you'll have a Jekyll site styled with Tailwind CSS at [localhost:4000](http://localhost:4000).

With `--livereload`, you can head over to the root directory and create any `md` or `html` files and start using Tailwind CSS classes like `text-blue-500` to see the changes reflected in real-time.

Enjoy building your static site!