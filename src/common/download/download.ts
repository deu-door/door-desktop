import door from '../door';

export async function isDownloadable(url: string): Promise<boolean> {
	const response = await door.axios.head(url);

	if (response.headers['content-disposition']?.startsWith('attachment' || !response.headers['content-type']?.startsWith('text/'))) {
		return true;
	}
	return false;
}
