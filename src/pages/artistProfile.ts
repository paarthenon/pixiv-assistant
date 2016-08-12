import * as pathUtils from '../utils/path'
import {RegisteredAction, ExecuteOnLoad} from '../utils/actionDecorators'
import {RootPage} from './root'
import {injectUserRelationshipButton} from '../injectors/openFolderInjector'
import {Model} from '../../common/proto'

export class ArtistProfilePage extends RootPage {
	public get artistId():number {
		return pathUtils.getArtistId(this.path);
	}
	public get artistName():string {
		return this.jQuery('h1.user').text();
	}
	public get artist():Model.Artist {
		return { id: this.artistId, name: this.artistName };
	}

	@ExecuteOnLoad
	public injectPageElements() {
		injectUserRelationshipButton(this.jQuery, this.artist);
	}
}