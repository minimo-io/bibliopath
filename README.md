# Bibliopath

It all started from this badly written note: https://primal.net/e/nevent1qqs2q6urpp9df4qt0xt85nd7ewqxw9u42duqmyqdrlgc04g5fny6m0s6wdrdm

Powered by Sveltekit.

Index by: https://gutendex.com/books
<br>
Gutemberg books: https://www.gutenberg.org/
<br>
Middleman API: https://api.allorigins.win

🚨 We do plan to self-host the index and books at the [Futurewise](https://www.futurewise.lat/) platform.

⚡️ Consider zapping a coffee — [Here](https://njump.me/nprofile1qqs8wftkcz9achdy8ascqtnk0v3rrcevda2klm8wqyd6xrlk8skc22gekra89)

Have fun!

## To Do

- Create a http proxy on our Futurewise API to handle the fetch, rate limiting, etc.
- Create a store for theme state, use it in all routes.
- Once a book is downloaded offer to save it in indexDB and bookmark it.
- Search should change the query parameter.
- Nostr login
- Allow for github/nostrgit books written in markdown
  - Create a selection of curated books, with audio books.

- Allow users to store their own books in the reader (indexDB?)
- Info button to get book and author data.
- Centralize types at src/lib & componentize the thing.
- Multi-lingual support via paraglidejs.
- Shortcuts: CMD + K, etc.
- Better homepage hero and menus, with config switcher.
- Footer: Add version & better github link.
- Add favicons (considering the PWA future).
- Book downloading progress bar.
- Make Bibliopath an open-repository hosted at the Futurewise org.
- Create e-pub support (and consider moving from txt Gutemberg format to this, for better indexes and metadata).
- Pre-render authors at the hompage.
- Add more Nostr capabilities.
- AI
  - Enable read a chapter using something like ElevenLabs (paid).

- Bug: Fix the changeTheme function mess.
- Bug: On mobile pagination should be "Prev - Next" with the input switcher also.
- Bug: Book title on mobile gets too short.
- Bug: Font-size not working on mobile.
- Bug: No error message when downloading fails... no retry button.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
