// Simple constant object — that's it.
export const HTTP_STATUS_TEXT: Record<number, string> = {
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout'
};

export interface BookmarkEntry {
	id: number;
	chapterIndex: number;
	timestamp: string;
	preview: string;
}

export interface Chapter {
	title: string;
	level: number; // 0 for no specific level, 1 for h1, 2 for h2, 3 for h3
	paragraphs: string[];
}

export type BookFileType = 'markdown' | 'text' | 'epub';

export interface SavedBook {
	id: string;
	title: string;
	author: string;
	url: string;
	fileType: BookFileType;
	savedAt: string;
	lastRead?: string;
}

export interface EpubBook {
	id: string;
	title: string;
	author: string;
	content: string; // Combined content from all chapters
	savedAt: string;
	lastRead?: string;
	fileType: 'epub';
}

export interface OfflineBook {
	id: string; // URL-based key
	title: string;
	author: string;
	url: string;
	fileType: BookFileType;
	content: string;
	downloadedAt: number;
	lastAccessed: number;
}

// Combined book type for unified display
export interface DisplayBook {
	id: string;
	title: string;
	author: string;
	url: string;
	fileType: BookFileType;
	savedAt?: string;
	lastRead?: string;
	isOffline: boolean;
	isEpub?: boolean;
	downloadedAt?: number;
	lastAccessed?: number;
	contentSize?: number;
}
