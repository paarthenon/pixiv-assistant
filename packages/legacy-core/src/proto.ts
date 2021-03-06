export const Features = {
	OpenToRepo: 'openRepo',
	OpenToArtist: 'openArtist',
	OpenToImage: 'openImageFolder',
	DownloadImage: 'downloadImage',
	DownloadManga: 'downloadManga',
	DownloadAnimation: 'downloadAnimation',
	ImageExists: 'imageExists',
	ImagesExist: 'imagesExist', // query multiple images
	ListArtists: 'listArtists'
}

export module Model {
	export interface Artist {
		id: number
		name: string
	}
	export interface Image {
		id: number
		page?: number
		ext?: string
		animation?: boolean
	}
}

export module Messages {
	export interface Response {
		success :boolean
	}
	export interface PositiveResponse<T> extends Response {
		data :T
	}
	export interface NegativeResponse extends Response {
		errors: string[]
	}

	export function isPositiveResponse<T>(resp:Response): resp is PositiveResponse<T> {
		return resp.success;
	}
	export function isNegativeResponse(resp:Response): resp is NegativeResponse {
		return !resp.success;
	}

	export interface ImageRequest {
		image :Model.Image
	}
	export interface ArtistRequest {
		artist: Model.Artist
	}
	export interface UrlRequest {
		url: string
	}
	export type ArtistImageRequest = ArtistRequest & ImageRequest
	export type ArtistUrlRequest = ArtistRequest & UrlRequest
	export interface BulkRequest<T> {
		items: T[]
	}

}
