# Bibliopath

Bibliopath is a Nostr powered tool and a platform for Open reading & Open publishing.

For more info about the spirit of this project, please visit the [about page](https://bibliopath.vercel.app/p/about).
<br />
We help authors publish **Books for the Open Web** and readers have control over their reading.

## Current ToDos

- epubs:
  - epub books are different type than offline books, when they should not (they are converted to text books and stored on IndexDB).
  - When converted to text the chapters are not created as we expect in the reader.
- Create a model book with audio capabilities as showcase.
- Better homepage hero and menus, with config switcher (also on homepage).
- Create a http proxy on our Futurewise API to handle the fetch, rate limiting, etc and substitute this <https://api.allorigins.win/raw?url=https://www.gutenberg.org/files/11/11-0.txt>
- Create a store for theme state, use it in all routes.
- Once a book is downloaded offer to save it in indexDB and bookmark it.
- Search should change the query parameter.
- Nostr login
- Allow for github/nostrgit books written in markdown
  - Create a selection of curated books, with audio books.
- Disclaimer (only Creative Commons work)
- Info button to get book and author data.
- Centralize types at src/lib & componentize the thing.
- Multi-lingual support via paraglidejs.
- Shortcuts: CMD + K, etc.
- Footer: Add version & better github link.
- Add favicons (considering the PWA).
- Book downloading progress bar.
- Make Bibliopath an open-repository hosted at the Futurewise org.
- Create e-pub support (and consider moving from txt Gutemberg format to this, for better indexes and metadata).
- Pre-render authors at the hompage.
- Add more Nostr capabilities.
  - An author should be able to upload his own books (which will be hosted at Nostr).
  - Authors with no Nostr account it should be created on the fly.
- Add changelog from git commits.
- AI: Enable read a chapter using something like ElevenLabs (paid).
- Create a DockerFile + docker-compose so people can easily create instances.

## Bugs

- Bug: Change theme is not working anymore (drak mode). Even when it is correctly stored.
- Bug: Fix the changeTheme function mess.
- Bug: Previous scroll position is remembered when reading a book, but it user switches from landscape to portrait then, position is messes up. Have a converter?
- Bug: On mobile pagination should be "Prev - Next" with the input switcher also.
- Bug: No error message when downloading fails... no retry button.

- Download Progress bar:

```javascript
<progress id="progress" value="0" max="100"></progress>
<pre id="output"></pre>

<script>
async function downloadWithProgress(url) {
 const response = await fetch(url);
 const contentLength = response.headers.get('Content-Length');

 if (!response.ok) throw new Error('Network error');
 if (!contentLength) console.warn('No content length — progress may be inaccurate');

 const total = parseInt(contentLength, 10) || 0;
 const reader = response.body.getReader();
 const decoder = new TextDecoder();
 let received = 0;
 let result = '';

 while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  received += value.length;
  result += decoder.decode(value, { stream: true });

  // Update progress bar
  if (total) {
   document.getElementById('progress').value = (received / total) * 100;
  }
 }

 // Final decode
 result += decoder.decode();
 document.getElementById('output').textContent = result;
}

downloadWithProgress('https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md');
</script>
🧠 Notes
Content-Length header is essential for accurate progress; if the server doesn’t provide it, you can still show indeterminate progress (e.g. spinner).

Works for any streamable text, including .txt, .md, .csv, etc.

If you want to download and save the file with progress, use [Streams API + File System API] or blobs + URL.createObjectURL.
```

##

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
