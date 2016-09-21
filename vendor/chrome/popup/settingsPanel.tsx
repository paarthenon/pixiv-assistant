import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Bootstrap from 'react-bootstrap'
import * as log4js from 'log4js'

import {getUserSettings, getSetting, setSetting} from '../userSettings'
import SettingKeys from '../../../src/settingKeys'
import ConfigKeys from '../../../src/configKeys'
import {Config, DictionaryService} from './services'

let logger = log4js.getLogger('ActionPanel');

class IndividualPanel extends React.Component<{header:string}, void> {
	public render() {
		return <p>
			<h5>{this.props.header}</h5>
			<blockquote style={{'font-size':'1.2em'}}>
				{this.props.children}
			</blockquote>
		</p>;
	}
}

export class SettingsPanel extends React.Component<void,{userSettings: {[id:string]:boolean}}> {
	public render() {
		return (
			<Bootstrap.Panel style={{'overflow-y':'auto', 'margin-bottom': 0}}>
					<IndividualPanel header="Dictionary Status">
						<DictUpdaterContainer/>
					</IndividualPanel>
					<IndividualPanel header="Server">
						<TextSettingContainer label="Server Url" settingKey={ConfigKeys.server_url} />
						<SettingContainer 
							settingKey={SettingKeys.general.disableServerConnectionAlert} 
							label={'Disable server connection alert'}/>
					</IndividualPanel>
					<IndividualPanel header="Illustration Page">
						<SettingContainer 
							settingKey={SettingKeys.pages.illust.inject.openFolder} 
							label={'Inject open folder button'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.illust.autoOpen} 
							label={'Automatically zoom into image'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.illust.boxImage} 
							label={'Limit image size to the window (illustration)'}/>
					</IndividualPanel>
					<IndividualPanel header="Manga Page">
						<SettingContainer 
							settingKey={SettingKeys.pages.manga.inject.previousButton} 
							label={'Inject previous page button'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.manga.loadFullSize} 
							label={'Load full size versions of manga images'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.manga.fitImage} 
							label={'Fit image to window'}/>
					</IndividualPanel>
					<IndividualPanel header="Works Page">
						<SettingContainer 
							settingKey={SettingKeys.pages.works.inject.openFolder} 
							label={'Inject open folder button'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.works.inject.openInTabs} 
							label={'Inject open in tabs button'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.works.inject.pagingButtons} 
							label={'Inject paging buttons'}/>

						<SettingContainer 
							settingKey={SettingKeys.pages.works.autoDarken} 
							label={'Fade out downloaded images'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.works.directToManga} 
							label={'Link directly to manga'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.works.openTabsImagesOnly} 
							label={'Open in tabs uses the direct image files instead of the pages'}/>
					</IndividualPanel>
					<IndividualPanel header="Bookmark Illustration Page">
						<SettingContainer 
							settingKey={SettingKeys.pages.bookmarkIllustration.inject.viewAll} 
							label={'Inject view all button'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.bookmarkIllustration.fadeDownloaded} 
							label={'Fade out downloaded images'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.bookmarkIllustration.fadeBookmarked} 
							label={'Fade out images from bookmarked artists'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.bookmarkIllustration.skipToDetail} 
							label={'Skip to bookmark detail page'}/>
					</IndividualPanel>
					<IndividualPanel header="Artist's Bookmarks Page">
						<SettingContainer 
							settingKey={SettingKeys.pages.artistBookmarks.inject.openFolder} 
							label={'Inject open folder button'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.artistBookmarks.inject.pagingButtons} 
							label={'Inject paging buttons'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.artistBookmarks.directToManga} 
							label={'Link directly to manga'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.artistBookmarks.fadeDownloaded} 
							label={'Fade out downloaded images'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.artistBookmarks.fadeBookmarked} 
							label={'Fade out images from bookmarked artists'}/>
					</IndividualPanel>
					<IndividualPanel header="Search Page">
						<SettingContainer 
							settingKey={SettingKeys.pages.search.directToManga} 
							label={'Link directly to manga'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.search.fadeDownloaded} 
							label={'Fade out downloaded images'}/>
						<SettingContainer 
							settingKey={SettingKeys.pages.search.fadeBookmarked} 
							label={'Fade out images from bookmarked artists'}/>
					</IndividualPanel>
			</Bootstrap.Panel>
		);
	}
}



interface GlobalDictUpdaterProps {
	updateAvailable :boolean
	updateAction :Function
}

enum GlobalDictUpdateState {
	LOADING,
	AVAILABLE,
	UPTODATE,
	DOWNLOADING
}

class DictUpdaterContainer extends React.Component<void, {mode: GlobalDictUpdateState, dupeLocalKeys:string[]}> {
	state = {mode: GlobalDictUpdateState.LOADING, dupeLocalKeys: undefined as string[]};

	componentDidMount() {
		this.updateStatus();
	}

	protected updateMode(mode: GlobalDictUpdateState) {
		this.setState({mode, dupeLocalKeys: this.state.dupeLocalKeys});
	}
	protected updateStatus(){
		DictionaryService.globalUpdateAvailable.then(isAvailable => {
			if (isAvailable) {
				this.updateMode(GlobalDictUpdateState.AVAILABLE);
			} else {
				this.updateMode(GlobalDictUpdateState.UPTODATE);
			}
		});
		DictionaryService.getLocalDuplicates().then(dupeLocalKeys => {
			this.setState({mode: this.state.mode, dupeLocalKeys});
		});
	}
	public updateDictionary(){
		this.updateMode(GlobalDictUpdateState.DOWNLOADING);
		DictionaryService.updateGlobalDictionary().then(() => this.updateStatus());
	}
	public removeDuplicates(){
		DictionaryService.deleteLocalDuplicates().then(() => this.updateStatus());
	}
	public render() {
		return <div>
			<GlobalDictUpdater mode={this.state.mode} updateAction={this.updateDictionary.bind(this)} />
			<DupeKeyReporter dupes={this.state.dupeLocalKeys} removeAction={this.removeDuplicates.bind(this)} />
		</div>
	}
}

class GlobalDictUpdater extends React.Component<{mode: GlobalDictUpdateState, updateAction:Function}, void> {
	public render(){
		switch (this.props.mode) {
			case GlobalDictUpdateState.LOADING:
				return <div>Waiting on dictionary details</div>
			case GlobalDictUpdateState.UPTODATE:
				return <div>Dictionary is up to date</div>
			case GlobalDictUpdateState.AVAILABLE:
				return <div>Update available. <Bootstrap.Button onClick={() => this.props.updateAction}>Update Dictionary</Bootstrap.Button></div>
			case GlobalDictUpdateState.DOWNLOADING:
				return <div>Downloading an update.</div>
		}
	}
}

class DupeKeyReporter extends React.Component<{dupes: string[], removeAction:Function}, void> {
	public render() {
		return (this.props.dupes === undefined) ? null :
			<div> 
				Found <strong>{this.props.dupes.length}</strong> duplicate entries. 
				<Bootstrap.Button onClick={() => this.props.removeAction}>Revert Duplicates</Bootstrap.Button>
			</div>
	}
}

interface SettingContainerProps {
	settingKey:string
	label:string
}
class SettingContainer extends React.Component<SettingContainerProps, {currentValue:boolean}> {
	state = { currentValue: false };

	componentDidMount() {
		this.state = { currentValue: undefined };
		getSetting(this.props.settingKey)
			.then(currentValue => this.setState({currentValue}))
			.catch(() => this.setState({currentValue: false}))
	}

	public handleUpdate(value:boolean){
		setSetting(this.props.settingKey, value);
	}

	public render() {
		if(this.state.currentValue !== undefined) {
			return <BooleanSetting label={this.props.label} onToggle={this.handleUpdate.bind(this)} checked={this.state.currentValue}/>
		} else {
			return <div>Loading</div>
		}
	}
}
class BooleanSetting extends React.Component<{label:string, onToggle:(value:boolean) => any, checked:boolean}, void> {
	private inputElement : HTMLInputElement;
	
	handleExecute() {
		this.props.onToggle(this.inputElement.checked);
	}

	initializeElement(ref:HTMLInputElement){
		if(ref) {
			ref.checked = this.props.checked;
			this.inputElement = ref;
		}
	}

	public render() {
		return <div>
				<Bootstrap.Checkbox inputRef={this.initializeElement.bind(this)} onClick={this.handleExecute.bind(this)}>
						{this.props.label}
				</Bootstrap.Checkbox>
			</div>;
	}
}

class TextSettingContainer extends React.Component<{label:string, settingKey:string}, {currentValue:string}> {
	state = { currentValue: undefined as string };
	componentDidMount() {
		Config.get(this.props.settingKey)
			.then(settingValue => this.setState({currentValue: settingValue as string}))
			.catch(() => this.setState({currentValue: ''}))
	}
	public handleUpdate(value:string){
		Config.set(this.props.settingKey, value);
	}
	public render() {
		if(this.state.currentValue !== undefined) {
			return <TextSetting label={this.props.label} text={this.state.currentValue} onUpdate={this.handleUpdate.bind(this)}/>
		} else {
			return <div>Loading</div>
		}
	}
}
class TextSetting extends React.Component<{label:string, text:string, onUpdate:(val:string)=>any},{editOpen:boolean}> {
	state = { editOpen: false };
	public handleUpdate() {
		let translationInput :any = ReactDOM.findDOMNode(this.refs['translation']);
		this.props.onUpdate(translationInput.value);
	}
	public render() {
		return (
			<tr>
				<label> {this.props.label} </label>
				<input defaultValue={this.props.text} ref="translation"></input>
				<Bootstrap.Button bsSize="xsmall" onClick={this.handleUpdate.bind(this)}>update</Bootstrap.Button>
			</tr>
		);
	}
}
