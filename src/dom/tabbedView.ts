import {Component, AbstractComponent, renderComponent} from './component'

export class Tab {
	protected self = $('<div class="pa-tab-content"></div>');
	constructor(public label:string, public content:Component) {
		this.self.hide();
	}
	public show() {
		this.self.show();
	}
	public hide() {
		this.self.hide();
	}

	public get children() {
		return [this.content];
	}
	public render():JQuery {
		return this.self;
	}
}

export class TabbedView extends AbstractComponent {
	protected tabs: { [label: string]: Tab };
	protected selectedTab: Tab;
	constructor(tabs: Tab[]) {
		super();
		this.tabs = {};
		tabs.forEach(tab => { this.tabs[tab.label] = tab });
		this.selectTab(tabs[0].label);
	}

	public selectTab(tabName:string) {
		if (tabName in this.tabs) {
			if (this.selectedTab) {
				this.selectedTab.hide();
			}
			this.selectedTab = this.tabs[tabName];
			this.selectedTab.show();
		}
	}

	public get children() {
		return Object.keys(this.tabs).map(tabKey => this.tabs[tabKey]);
	}

	public render():JQuery {
		let tabs = Object.keys(this.tabs).map(tabLabel => $(`<li>${tabLabel}</li>`).on('click',() => this.selectTab(tabLabel)));
		let tabBar = $('<ul></ul>');
		tabBar.append(tabs);
		return $('<div class="pa-tabbed-view"></div>').append(tabBar);
	}
}