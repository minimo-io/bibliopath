import { browser } from '$app/environment';

// place files you want to import through the `$lib` alias in this folder.
export function changeTheme(newTheme: string, save = true) {
	if (browser) {
		document.documentElement.setAttribute('data-theme', newTheme);
		if (save) {
			localStorage.setItem('bibliopath-theme', newTheme);
		}
	}
	return newTheme;
}

export async function shareCurrentUrl() {
	if (navigator.share) {
		try {
			await navigator.share({
				title: document.title, // Or a custom title
				url: window.location.href // The current URL
			});
			console.log('Content shared successfully');
		} catch (error) {
			console.error('Error sharing:', error);
		}
	} else {
		// Fallback for browsers that don't support the Web Share API
		// You could offer to copy the URL to the clipboard,
		// open a new window with common sharing links, etc.
		alert(
			'Web Share API is not supported in this browser. You can manually copy the URL: ' +
				window.location.href
		);
		console.log('Web Share API not supported.');
	}
}
