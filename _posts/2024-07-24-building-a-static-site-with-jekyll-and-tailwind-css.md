---
layout: post
title: "Building a Static Site with Jekyll and Tailwind CSS"
tags: [jekyll, tailwind-css]
---

[Jekyll](https://jekyllrb.com/) is an awesome tool for building static sites, whether it's for your personal blog or a hobby project. Adding [Tailwind CSS](https://tailwindcss.com/) into the mix makes creating your site even easier and way more visually appealing.

One huge advantage of using Jekyll is the free hosting you get with [GitHub Pages](https://docs.github.com/en/pages) for public repositories. If you're cool with this setup, GitHub Pages is a no-brainer.

Check out my post on [Deploy Jekyll to GitHub Pages with TailwindCSS] for more details on deploying a custom Jekyll build to GitHub Pages.

## Prerequisites

Make sure you have the necessary dependencies installed on your local machine.

## Step 1: Install Ruby and Jekyll

First things first, you need to install Ruby using `rbenv` and then get the Jekyll gem. Follow [this guide](https://github.com/rbenv/rbenv#installation) to install `rbenv`.

```sh
# Install rbenv and Ruby
rbenv install 3.3.1
rbenv global 3.3.1

# Install Jekyll gem
gem install jekyll bundler
```

## Step 2: Create a New Jekyll Site

Now, let's create a new Jekyll site from scratch.
```sh
jekyll new my-personal-blog --blank
cd my-personal-blog
```

Optionally, you can create a `.ruby-version` file for the Ruby version you have installed.
```sh
echo "3.3.1" > .ruby-version
```

## Step 3: Install `jekyll-postcss` dependency for Ruby

Add `jekyll-postcss` to your Gemfile.
```sh
echo "gem 'jekyll-postcss', '~> 0.5.0', group: :jekyll_plugins" >> Gemfile
bundle install
```

Then configure `jekyll-postcss` by adding the following to your Jekyll `_config.yml`.
```yaml
# _config.yml
plugins:
  - jekyll-postcss

postcss:
  cache: false # disable cache in favor of Tailwind CSS JIT engine
```

Tailwind CSS 3.X has the Just-In-Time (JIT) engine enabled by default. For more details, refer to the [Tailwind CSS upgrade guide](https://tailwindcss.com/docs/upgrade-guide#migrating-to-the-jit-engine).

## Step 4: Install Node and Tailwind CSS

Next, install Node.js using `nvm`. Follow [this guide](https://github.com/nvm-sh/nvm#installing-and-updating) to get `nvm` installed. 
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

Now, create a `postcss.config.js` file with the following content:
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

Specify the content (Markdown and HTML files) for Tailwind CSS to detect the usage of CSS classes. Only the CSS classes that are used will be compiled into the output CSS file (`assets/css/main.css`).

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

Rename the default `scss` file provided by Jekyll at `assets/css/main.scss` to `assets/css/main.css`. Also, change the content to the following:
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

Finally, start the Jekyll server with live reload enabled.

```sh
bundle exec jekyll serve --livereload
```

By following these steps, you'll have a Jekyll site styled with Tailwind CSS at [localhost:4000](http://localhost:4000).

With `--livereload`, you can head over to the root directory and create any `md` or `html` files and start using Tailwind CSS classes like `text-blue-500` to see the changes reflected in real-time.

Enjoy building your static site!

[Deploy Jekyll to GitHub Pages with TailwindCSS]: {% post_url 2024-07-30-deploy-jekyll-with-tailwindcss-via-github-action %}