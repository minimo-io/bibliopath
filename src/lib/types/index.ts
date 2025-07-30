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

export interface SavedBook {
	id: string;
	title: string;
	author: string;
	url: string;
	fileType: 'markdown' | 'text';
	savedAt: string;
	lastRead?: string;
}
