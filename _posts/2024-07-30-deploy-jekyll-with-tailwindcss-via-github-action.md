---
layout: post
title: "Deploy Jekyll to GitHub Pages with TailwindCSS"
tags: [jekyll, github-pages, github-action, tailwind, tailwind-css]
---

the process of setting up a custom deployment workflow using GitHub Actions to host your Jekyll site with TailwindCSS on GitHub Pages

For personal blogs, most people deploy from the `main` branch with the `root` folder, while project websites might opt to deploy from a separate branch like `gh-pages` with a `doc` folder in the `root`. [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

![Deploy from branch](/assets/screenshots/2024-07-30/deploy-from-branch.png)

Once we settle on the basic setup, we might start looking for useful 3rd party libraries to improve our website. As GitHub Pages is built with Jekyll under the hood and has a safelist of supported Ruby gems, see [GitHub Pages supported versions](https://pages.github.com/versions/).

However, at the time of writing, GitHub Pages supports only up to Jekyll 3.x, and there are benefits to adopting Jekyll 4.x. On the other hand, there are also many potentials to improve the website through 3rd party libraries that are not safelisted.

## Deploy Custom Jekyll Build Pipeline
To address this limitation, we can set up a GitHub Action workflow to bypass the default build pipeline offered by GitHub Pages.

If we look at the [Jekyll official documentation on GitHub Actions](https://jekyllrb.com/docs/continuous-integration/github-actions/), it explains the added benefits of using a GitHub Action workflow.

With that, we can introduce additional dependencies freely. For example, adding **TailwindCSS**, a popular utility-first CSS framework that emphasizes declarative styling in HTML, to make the website even more beautiful.

### Prerequisite

Set up a working `jekyll` + `tailwindcss` on your local machine. See my post on [Jekyll and TailwindCSS setup guide](https://www.ryancyq.com/posts/2024/07/24/building-a-static-site-with-jekyll-and-tailwind-css).

### Step 1: Ensure `Gemfile.lock` Supports the OS on GitHub Action

Most of the time, we use the `ubuntu` OS image in GitHub Action. To ensure `bundler` can install the dependencies with `ubuntu`, make sure your `Gemfile.lock` has `x86_64-linux` under `PLATFORMS`. 

Otherwise, you can run the following command to add it:
```sh
  bundle lock --add-platform x86_64-linux
```

### Step 2: Select Page Deployment Approach

Following the steps in the [Jekyll documentation on GitHub Actions](https://jekyllrb.com/docs/continuous-integration/github-actions/), the configuration would look something like this:

![Deploy with GitHub Actions](/assets/screenshots/2024-07-30/deploy-with-gha.png)
![Configure GitHub Actions workflow](/assets/screenshots/2024-07-30/deploy-with-gha-configure-template.png)

### Step 3: Create GitHub Action Workflow

When prompted about workflow creation, we need to make some changes to the default template:
```yaml
jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1 # replaced with major version to get latest updates
        with:
          ruby-version: 3.3.1 # or create a .ruby-version
          bundler-cache: true

        ### CHANGES TO BE INSERTED HERE ###
      
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v5
      - name: Build with Jekyll
        run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
```

### Step 4: Add Node.js Setup for TailwindCSS

We need to include Node.js setup and JavaScript dependencies installation with:
```yaml
  - name: Setup Node
    uses: actions/setup-node@v4
    with:
      node-version: 20 # any node version would do, preferably an LTS version
  - name: Install TailwindCSS dependencies
    run: npm install
```

### Step 5: Push and Deploy

With all the steps above, you should see a successful build like this:
![Deployment Successful](/assets/screenshots/2024-07-30/deployment-successful.png)