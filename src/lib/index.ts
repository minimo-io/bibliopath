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
