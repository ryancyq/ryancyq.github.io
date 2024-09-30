---
layout: post
title: A JavaScript-free Responsive Navigation Menu with Tailwind CSS
tags: [html, css, responsive, tailwind-css]
---

If you are building a static website using [Tailwind CSS] and looking for a responsive, collapsible navigation menu that is JavaScript-free, I might have something for you.

To create responsive navigation menus, it often involves using a "hamburger" menu for small screen widths and a regular navbar for larger screens. The conventional way of achieving a collapsible navigation menu is by attaching a JavaScript event handler to the `hamburger` menu to toggle the menu's visibility on the `click` event.

However, we can achieve the same behavior by leveraging native HTML.

### Simple Navigation Menu

Let's look at a simple navigation menu styled with [Tailwind CSS].

**Demo**
<div class="not-prose p-4 border border-2 rounded-lg border-gray-200 dark:border-gray-700">
  <nav class="flex justify-between">
    <a href="#">Playground</a>
    <ul class="inline-flex gap-x-2">
      <li><a href="#" class="hover:underline">Home</a></li>
      <li><a href="#" class="hover:underline">About</a></li>
      <li><a href="#" class="hover:underline">Contact</a></li>
    </ul>
  </nav>
</div>

**HTML**
```html
<nav class="flex justify-between">
  <a href="#">Playground</a>
  <ul class="inline-flex gap-x-2">
    <li><a href="#" class="hover:underline">Home</a></li>
    <li><a href="#" class="hover:underline">About</a></li>
    <li><a href="#" class="hover:underline">Contact</a></li>
  </ul>
</nav>
```

### Responsive Navigation Menu

Next, let's add the hamburger menu for screens smaller than `md` using an HTML `<button>`.

**Demo**
<div class="not-prose p-4 border border-2 rounded-lg border-gray-200 dark:border-gray-700">
  <nav class="flex items-center justify-between">
    <a href="#">Playground</a>
    <div class="inline-flex gap-x-2 items-center">
      <button>
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
      </button>
      <ul class="flex-col gap-y-2 hidden">
        <li><a href="#" class="hover:underline">Home</a></li>
        <li><a href="#" class="hover:underline">About</a></li>
        <li><a href="#" class="hover:underline">Contact</a></li>
      </ul>
    </div>
  </nav>
</div>

**HTML**
```html
<nav class="flex items-center justify-between">
  <a href="#">Playground</a>
  <div class="inline-flex gap-x-2 items-center">
    <button class="md:hidden">
      <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
      </svg>
    </button>
    <ul class="flex-col gap-y-2 hidden md:inline-flex md:flex-row md:gap-x-2">
      <li><a href="#" class="hover:underline">Home</a></li>
      <li><a href="#" class="hover:underline">About</a></li>
      <li><a href="#" class="hover:underline">Contact</a></li>
    </ul>
  </div>
</nav>
```

Usually, handling the button `click` event to toggle menu visibility requires JavaScript. Here, we are going to use HTML `<label>` and `<input>` elements to replace the `<button>`. According to [HTML label element] definition, the `<label>` element is designed to pass user interaction events to the associated `<input>` element via a matching `id`. We can utilize this design principle by placing the `<input>` tag anywhere in the HTML body.

**Demo**
<div class="not-prose p-4 border border-2 rounded-lg border-gray-200 dark:border-gray-700">
  <nav class="flex items-center justify-between">
    <a href="#">Playground</a>
    <input id="navbar-trigger-1" type="checkbox"/>
    <label for="navbar-trigger-1">
      <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
      </svg>
    </label>
    <ul class="flex-col gap-y-2 hidden">
      <li><a href="#" class="hover:underline">Home</a></li>
      <li><a href="#" class="hover:underline">About</a></li>
      <li><a href="#" class="hover:underline">Contact</a></li>
    </ul>
  </nav>
</div>

**HTML**
```html
<nav class="flex items-center justify-between">
  <a href="#">Playground</a>
  <input id="navbar-trigger" type="checkbox"/>
  <label for="navbar-trigger" class="md:hidden">
    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
    </svg>
  </label>
  <ul class="flex-col gap-y-2 hidden md:inline-flex md:flex-row md:gap-x-2">
    <li><a href="#" class="hover:underline">Home</a></li>
    <li><a href="#" class="hover:underline">About</a></li>
    <li><a href="#" class="hover:underline">Contact</a></li>
  </ul>
</nav>
```

### Tailwind CSS Peer Modifier

Next, we are going to use a [CSS attribute selector] on siblings to toggle menu visibility. This is where [Tailwind CSS peer-{modifier}] comes in handy.

This is the reason behind placing the `<input>` outside of the `<label>` to achieve the following hierarchy:
```html
<input id="navbar-trigger"/>
<label for="navbar-trigger"></label>
<ul>
  <li>Home</li>
  <li>About</li>
  <li>Contact</li>
</ul>
```

Using `peer-{modifiers}`, we can now hide the `<input>` and add the `peer/hamburger` CSS class to allow the sibling `<ul>` CSS classes to bind with the `<input>` using `peer-checked/hamburger:inline-flex`.

**Demo**
<div class="not-prose p-4 border border-2 rounded-lg border-gray-200 dark:border-gray-700">
  <nav class="flex flex-wrap items-center justify-between">
    <a href="#">Playground</a>
    <input id="navbar-trigger" type="checkbox" checked class="hidden peer/hamburger"/>
    <div class="inline-flex items-center gap-x-4">
      <div class="inline-flex items-center font-semibold text-blue-700 dark:text-sky-500">
        Click Me
        <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
      </div>
      <label for="navbar-trigger">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
      </label>
    </div>
    <ul class="flex-col gap-y-2 mt-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 w-full hidden peer-checked/hamburger:inline-flex">
      <li><a href="#" class="hover:underline">Home</a></li>
      <li><a href="#" class="hover:underline">About</a></li>
      <li><a href="#" class="hover:underline">Contact</a></li>
    </ul>
  </nav>
</div>

**HTML**
```html
<!-- adding flex-wrap to ensure expanded menu will be wrapped -->
<nav class="flex flex-wrap items-center justify-between">
  <a href="#">Playground</a>
  <input id="navbar-trigger" type="checkbox" class="hidden peer/hamburger"/>
  <label for="navbar-trigger" class="md:hidden">
    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
    </svg>
  </label>
  <!-- There are 2 styles for the <ul> -->
  <!-- Full width with border menu (< md): -->
  <!-- flex-col gap-y-2 mt-2 px-4 py-2 rounded-lg bg-gray-200 w-full hidden peer-checked/hamburger:inline-flex -->
  <!-- Auto-sized and borderless menu (>= md): -->
  <!-- md:w-auto md:inline-flex md:flex-row md:gap-x-2 md:mt-0 md:p-0 md:rounded-none md:bg-transparent -->
  <ul class="flex-col gap-y-2 mt-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 w-full hidden peer-checked/hamburger:inline-flex md:w-auto md:inline-flex md:flex-row md:gap-x-2 md:mt-0 md:p-0 md:rounded-none md:bg-transparent">
    <li><a href="#" class="hover:underline">Home</a></li>
    <li><a href="#" class="hover:underline">About</a></li>
    <li><a href="#" class="hover:underline">Contact</a></li>
  </ul>
</nav>
```

And with that, you've created a fully functional, responsive navigation menu using [Tailwind CSS], completely free of JavaScript, making it an ideal solution for lightweight, static websites.

[HTML label element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
[CSS attribute selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
[Tailwind CSS]: https://tailwindcss.com
[Tailwind CSS peer-{modifier}]: https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-sibling-state