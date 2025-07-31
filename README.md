# Bibliopath

Bibliopath is a tool and a platform for Open reading & Open publishing.
<br />
We help authors publish **Books for the Open Web** and readers have control over their reading.

Imagine a Kindle like App + Goodreads over Nostr with Funding functionality for Authors that decide to publish in open-formats / licenses, to have direct contact and funding from their readers.

It all started from this badly written note: <https://primal.net/e/nevent1qqs2q6urpp9df4qt0xt85nd7ewqxw9u42duqmyqdrlgc04g5fny6m0s6wdrdm>

## Core functionalities

- **For Bibliopaths** (project Supporters)
  - Should be able to sync their books between devices using the PWA.
  - Ability to add your own books (from an local ePub upload to to git url -markdown).
  - Have access to audiobooks.
  - Store their books in their local reader (indexDB?) for offline reading.
  - Access a curated list of books (Published under Creative Common or Public books should be allowed to flourish).
  - Be able to share books and sync between devices offline (via Bluetooth or Wifi -- eg. Localshare)

- **For Readers/Users**
  - Read any markdown book hosted on git repositories, just by placing the book url.
  - Read anybook from Project Gutemberg just with the book url.
  - Highlight something on a public book and share it on Nostr.
  - Favorite their books (being a markdown book, a Gutemberg txt book, an ePub, of our curated books from authors).
  - Share a book (via Nostr) (if the book is Creative Commons).

- **For Authors:**
  - Should be able to publish a book (via Nostr), giving it better censorship resistant possibilities.
  - Should be able to receive funding (zaps) from their readers (on Books & Profil) (Also, if possible, recurring funding).
  - Should be able to enable/disable comments on their books.
  - Should see basic stats on how their book is doing.
  - Edit and tweak how the book looks.
  - Choose the open license for their books.
  - Have followers / and bibliopaths (supporters / mecenas) via Nostr.

  _**Are you an Author?** We will work closely with authors willing to publish their books on Bibliopath so they look great and to help setup their funding channels._

- **A bunch of principles**
  - Readers should be able run their our version of Bibliopath, with their own ePubs, or markdown books, locally.
  - Bibliopath will not promote piracy, instead it will create tools so authors prefer open-publishing options and readers funding capabilities.

**🚨 Disclaimer**: Project Bibliopath only hosts Public and Creative Common Books (we need to have a way to prove this).

Gutemberg Index by: <https://gutendex.com/books>
<br>
Gutemberg books: <https://www.gutenberg.org/>
<br>
Http Proxy: <https://api.allorigins.win> (we will build our own).

🚨 We do plan to self-host the index and Public/CC books at the [Futurewise](https://www.futurewise.lat/) platform.

⚡️ Consider zapping a coffee — [Here](https://njump.me/nprofile1qqs8wftkcz9achdy8ascqtnk0v3rrcevda2klm8wqyd6xrlk8skc22gekra89)

Have fun!

## Other ToDos

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

- Total books not correctly calculated at Header.svelte component (it is ok in saved route).
- Bug: Change theme is not working anymore (drak mode). Even when it is correctly stored.
- Bug: Fix the changeTheme function mess.
- Bug: Previous scroll position is remembered when reading a book, but it user switches from landscape to portrait then, position is messes up. Have a converter?
- Bug: On mobile pagination should be "Prev - Next" with the input switcher also.
- Bug: Font-size not working on mobile.
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
