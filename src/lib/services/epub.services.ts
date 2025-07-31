// src/lib/services/epub.services.ts
import type { EpubBook } from '$lib/types';
import JSZip from 'jszip';

class EpubService {
	private readonly STORAGE_KEY = 'epub_books';

	async parseEpubFile(file: File): Promise<{ title: string; author: string; content: string }> {
		try {
			const zip = new JSZip();
			const zipContent = await zip.loadAsync(file);

			// Read container.xml to find the OPF file
			const containerXml = await zipContent.file('META-INF/container.xml')?.async('text');
			if (!containerXml) {
				throw new Error('Invalid EPUB: Missing container.xml');
			}

			const opfPath = this.extractOpfPath(containerXml);
			const opfContent = await zipContent.file(opfPath)?.async('text');
			if (!opfContent) {
				throw new Error('Invalid EPUB: Missing OPF file');
			}

			// Parse OPF file for metadata and spine
			const opfData = this.parseOpf(opfContent);
			const basePath = opfPath.split('/').slice(0, -1).join('/');

			// Read and combine all chapter content
			let combinedContent = '';
			for (const spineItem of opfData.spine) {
				const chapterPath = basePath ? `${basePath}/${spineItem.href}` : spineItem.href;
				const chapterContent = await zipContent.file(chapterPath)?.async('text');
				if (chapterContent) {
					const cleanContent = this.cleanHtmlContent(chapterContent);
					combinedContent += `\n\n${cleanContent}`;
				}
			}

			return {
				title: opfData.metadata.title || file.name.replace('.epub', ''),
				author: opfData.metadata.author || 'Unknown Author',
				content: combinedContent.trim()
			};
		} catch (error) {
			console.error('Error parsing EPUB:', error);
			throw new Error(
				`Failed to parse EPUB file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private extractOpfPath(containerXml: string): string {
		const parser = new DOMParser();
		const doc = parser.parseFromString(containerXml, 'text/xml');
		const rootfile = doc.querySelector('rootfile');
		const fullPath = rootfile?.getAttribute('full-path');
		if (!fullPath) {
			throw new Error('Invalid container.xml: Missing rootfile path');
		}
		return fullPath;
	}

	private parseOpf(opfContent: string) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(opfContent, 'text/xml');

		// Extract metadata
		const metadata = {
			title: doc.querySelector('dc\\:title, title')?.textContent || '',
			author: doc.querySelector('dc\\:creator, creator')?.textContent || ''
		};

		// Create manifest map
		const manifest = new Map();
		doc.querySelectorAll('manifest item').forEach((item) => {
			const id = item.getAttribute('id');
			const href = item.getAttribute('href');
			if (id && href) {
				manifest.set(id, { href, mediaType: item.getAttribute('media-type') });
			}
		});

		// Extract spine (reading order)
		const spine: Array<{ id: string; href: string }> = [];
		doc.querySelectorAll('spine itemref').forEach((itemref) => {
			const idref = itemref.getAttribute('idref');
			if (idref && manifest.has(idref)) {
				const manifestItem = manifest.get(idref);
				spine.push({
					id: idref,
					href: manifestItem.href
				});
			}
		});

		return { metadata, spine };
	}

	private cleanHtmlContent(htmlContent: string): string {
		// Remove HTML tags and keep only text content
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');

		// Remove script and style elements
		doc.querySelectorAll('script, style').forEach((el) => el.remove());

		// Get text content and clean up whitespace
		return doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
	}

	private generateId(): string {
		return `epub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	saveEpubBook(title: string, author: string, content: string): EpubBook {
		const book: EpubBook = {
			id: this.generateId(),
			title,
			author,
			content,
			fileType: 'epub',
			savedAt: new Date().toISOString()
		};

		const savedBooks = this.getSavedEpubBooks();
		savedBooks.push(book);
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedBooks));

		return book;
	}

	getSavedEpubBooks(): EpubBook[] {
		try {
			const saved = localStorage.getItem(this.STORAGE_KEY);
			return saved ? JSON.parse(saved) : [];
		} catch (error) {
			console.error('Error loading saved EPUB books:', error);
			return [];
		}
	}

	removeEpubBook(bookId: string): void {
		const savedBooks = this.getSavedEpubBooks();
		const filteredBooks = savedBooks.filter((book) => book.id !== bookId);
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBooks));
	}

	getEpubBook(bookId: string): EpubBook | null {
		const savedBooks = this.getSavedEpubBooks();
		return savedBooks.find((book) => book.id === bookId) || null;
	}
}

export const epubService = new EpubService();
