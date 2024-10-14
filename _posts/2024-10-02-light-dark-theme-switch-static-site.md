---
layout: post
title: A Light/Dark Theme Switcher for Static Sites with Tailwind CSS
tags: [html, css, theme, dark-mode, tailwind-css]
---

[Tailwind CSS] provides light/dark styling out of the box through its intuitive dark mode modifiers. By default, 
[Tailwind CSS Dark Mode] uses the `prefers-color-scheme` CSS media feature from the browser, which serves as a good starting point for supporting light/dark themes on our static site.

However, to further improve our readers' experience, users should be able to indicate their preference for light/dark mode across their favorite sites. As a user, I always welcome utilities to customize my reading experience for different site domains.

In this post, I'm going to share my experience of adding a light/dark theme switcher to a static site with minimal JavaScript involved.

### Simple Light/Dark Theme Switcher

Let's look at a simple light/dark theme switcher styled with [Tailwind CSS]. Similar to the [JavaScript-free Responsive Navigation Menu guide], we'll be using HTML `<label>` and `<input>` elements to keep track of the light/dark theme state.

**Demo**
<div class="not-prose group/demo">
  <nav class="flex justify-between items-center bg-gray-100 group-[.dark]/demo:bg-gray-800 p-4 border border-2 rounded-lg border-gray-200 dark:border-gray-700">
    <a href="#" class="text-gray-800 group-[.dark]/demo:text-gray-200">Playground</a>
    <input id="theme-trigger" type="checkbox" class="hidden" />
    <label for="theme-trigger" class="rounded p-2 hover:bg-gray-200 group-[.dark]/demo:hover:bg-gray-700">
      <span class="sr-only">Switch to light / dark theme</span>
      <!-- Moon Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="size-6 group-[.dark]/demo:hidden">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" class="fill-gray-500"/>
      </svg>
      <!-- Sun Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="size-6 hidden group-[.dark]/demo:block">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          fill-rule="evenodd"
          clip-rule="evenodd"
          class="fill-gray-400"
        />
      </svg>
    </label>
  </nav>
  <script>
    const trigger = document.getElementById('theme-trigger');
    const demo = trigger.closest('.not-prose')
    function triggerTheme(event) {
      const forceDark = event.target instanceof HTMLInputElement ? event.target.checked : !!event
      demo.classList.toggle('dark', forceDark)
    }
    trigger.addEventListener('change', triggerTheme)
    trigger.checked = demo.classList.contains('dark')
  </script>
</div>

**HTML**
```html
<nav class="flex justify-between items-center bg-gray-100 dark:bg-gray-800">
  <a href="#" class="text-gray-800 dark:text-gray-200">Playground</a>
  <input id="theme-trigger" type="checkbox" class="hidden" />
  <label for="theme-trigger" class="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
    <span class="sr-only">Switch to light / dark theme</span>
    <!-- Moon Icon -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="size-6 dark:hidden">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" class="fill-gray-500"/>
    </svg>
    <!-- Sun Icon -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="size-6 hidden dark:block">
      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        fill-rule="evenodd"
        clip-rule="evenodd"
        class="fill-gray-400"
      />
    </svg>
  </label>
</nav>
```

### Store Theme Switcher State

Next, let's use the [localStorage API] to keep track of the state when a user toggles between light and dark themes.

**Javascript**
```js
const opted = 'color-theme' in localStorage
const optedDark = localStorage.getItem('color-theme') === 'dark'
const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const shouldBeDark = optedDark || (!opted && preferDark)

function toggleTheme(forceDark) {
  document.documentElement.classList.toggle('dark', forceDark)
  localStorage.setItem('color-theme', forceDark ? 'dark' : 'light')
}

toggleTheme(shouldBeDark)
```

To avoid theme switching happening after DOM rendering, we could place the script in the HTML head section instead.

**HTML**
```html
<head>
  <meta charset="utf-8">
  <!-- more metadata -->

  <script type="text/javascript">
    // .. toggle theme script
  </script>
</head>
```

### Register User Interaction with Theme Switcher

Once the default or user-selected theme has been initialized, we can register an event handler to the theme switcher and allow users to toggle the theme freely.

**Javascript**

```js
const trigger = document.getElementById('theme-trigger');
trigger.checked = document.documentElement.classList.contains('dark') // assign initial state to the trigger element
trigger.addEventListener('change', toggleTheme)
```

We'll also need to modify the `toggleTheme` function to handle the `change` event.

```js
function toggleTheme(event) {
  const forceDark = event.target instanceof HTMLInputElement ? event.target.checked : !!event
  document.documentElement.classList.toggle('dark', forceDark)
  localStorage.setItem('color-theme', forceDark ? 'dark' : 'light')
}
```

The event handler registration should only be executed once (e.g., when the HTML document is loaded/ready). An easy way to achieve this is to append a `<script>` tag at the end of the document's `<body>` tag.

**HTML**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <script type="text/javascript">
      // toggle theme
    </script>
  </head>
  <body>
    <script type="text/javascript">
      // register event handler
    </script>
  </body>
</html>
```

And that's all you need to create a light/dark theme switcher for your static site.

[JavaScript-free Responsive Navigation Menu guide]: {% post_url 2024-08-10-collapsible-navigation-menu-without-js %}
[Tailwind CSS]: https://tailwindcss.com
[Tailwind CSS Dark Mode]: https://tailwindcss.com/docs/dark-mode
[localStorage API]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage