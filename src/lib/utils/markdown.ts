function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
	const escaped = escapeHtml(text);
	return escaped
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/`(.+?)`/g, '<code class="bg-base-300 rounded px-1 text-sm">$1</code>')
		.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="link link-primary" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function mdToHtml(text: string): string {
	const lines = text.split('\n');
	const html: string[] = [];
	let inParagraph = false;

	function closeParagraph() {
		if (inParagraph) {
			html.push('</p>');
			inParagraph = false;
		}
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		const h1 = line.match(/^# (.+)/);
		const h2 = line.match(/^## (.+)/);
		const h3 = line.match(/^### (.+)/);

		if (h1) {
			closeParagraph();
			html.push(`<h1 class="text-3xl font-bold mt-8 mb-4">${renderInline(h1[1])}</h1>`);
		} else if (h2) {
			closeParagraph();
			html.push(`<h2 class="text-2xl font-bold mt-6 mb-3">${renderInline(h2[1])}</h2>`);
		} else if (h3) {
			closeParagraph();
			html.push(`<h3 class="text-xl font-bold mt-4 mb-2">${renderInline(h3[1])}</h3>`);
		} else if (line.trim() === '') {
			closeParagraph();
		} else {
			if (!inParagraph) {
				html.push('<p class="mb-4 leading-relaxed">');
				inParagraph = true;
			} else {
				html.push('<br />');
			}
			html.push(renderInline(line));
		}
	}

	closeParagraph();

	return html.join('\n');
}
