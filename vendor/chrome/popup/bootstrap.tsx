import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Bootstrap from 'react-bootstrap'

import {PopupWindowFrame, PopupContentFrame} from 'vendor/chrome/popup/popupFrame'
import {PopupNavbar} from 'vendor/chrome/popup/navBar'
import {DictContainer} from 'vendor/chrome/popup/dict'
import {DictionaryService} from 'vendor/chrome/popup/services'

ReactDOM.render(
	<PopupWindowFrame>
		<PopupNavbar />
		<PopupContentFrame>
			<DictContainer dictService={DictionaryService} />
		</PopupContentFrame>
	</PopupWindowFrame>
	, document.getElementById('content'));