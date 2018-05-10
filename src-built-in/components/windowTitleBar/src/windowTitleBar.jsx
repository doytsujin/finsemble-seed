
/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
// const Test from './test';

import * as storeExports from "./stores/windowTitleBarStore";
let HeaderData, HeaderActions, windowTitleBarStore;

import HoverDetector from "./components/HoverDetector.jsx";

//Parts that make up the windowTitleBar.
//Left side
import Linker from "./components/left/LinkerButton";
import Sharer from "./components/left/ShareButton.jsx";
//Right side
import Minimize from "./components/right/MinimizeButton.jsx";
import DockingButton from "./components/right/DockingButton.jsx";
import Maximize from "./components/right/MaximizeButton.jsx";
import Close from "./components/right/CloseButton.jsx";
import BringSuiteToFront from "./components/right/BringSuiteToFront.jsx";
import Tab from './tab.jsx'
import "../../assets/css/finsemble.css";

/**
 * This is the main window manager component. It's the custom window frame that we add to each window that has useFSBLHeader set to true in its windowDescriptor.
 */
class WindowTitleBar extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		windowTitleBarStore.getValue({ field: "Maximize.hide" });
		this.state = {
			windowTitle: windowTitleBarStore.getValue({ field: "Main.windowTitle" }),
			minButton: !windowTitleBarStore.getValue({ field: "Minimize.hide" }),
			maxButton: !windowTitleBarStore.getValue({ field: "Maximize.hide" }),
			closeButton: !windowTitleBarStore.getValue({ field: "Close.hide" }),
			showLinkerButton: windowTitleBarStore.getValue({ field: "Linker.showLinkerButton" }),
			isTopRight: windowTitleBarStore.getValue({ field: "isTopRight" }),
			titleBarIsHoveredOver: windowTitleBarStore.getValue({ field: "titleBarIsHoveredOver" }),
			dragEnded: false
		};
	}
	/**
     * This is necessary to make sure that the `this` inside of the callback is correct.
     *
     * @memberof WindowTitleBar
     */
	bindCorrectContext() {
		this.onTitleChange = this.onTitleChange.bind(this);
		this.onShowDockingToolTip = this.onShowDockingToolTip.bind(this);
		this.onToggleDockingIcon = this.onToggleDockingIcon.bind(this);
		this.onDocking = this.onDocking.bind(this);
		this.showLinkerButton = this.showLinkerButton.bind(this);
		this.isTopRight = this.isTopRight.bind(this);
		this.toggleDrag = this.toggleDrag.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.drop = this.drop.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
		this.cancelTabbing = this.cancelTabbing.bind(this);
	}
	componentWillMount() {
		windowTitleBarStore.addListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight },
		]);
	}

	componentWillUnmount() {
		// window.removeEventListener('keyup', this.pressedKey, false);
		windowTitleBarStore.removeListeners([
			{ field: "Main.windowTitle", listener: this.onTitleChange },
			{ field: "Main.showDockingTooltip", listener: this.onShowDockingToolTip },
			{ field: "Main.dockingIcon", listener: this.onToggleDockingIcon },
			{ field: "Main.dockingEnabled", listener: this.onDocking },
			{ field: "Linker.showLinkerButton", listener: this.showLinkerButton },
			{ field: "isTopRight", listener: this.isTopRight },
		]);
	}

	componentDidMount() {
		let header = document.getElementsByClassName("fsbl-header")[0];
		let headerHeight = window.getComputedStyle(header, null).getPropertyValue("height");
		document.body.style.marginTop = headerHeight;
		// window.addEventListener('keydown', this.pressedKey, false);
	}

	showLinkerButton(err, response) {
		//console.log("showLinkerButton--", response)
		this.setState({ showLinkerButton: response.value });
	}

	isTopRight(err, response) {
		this.setState({ isTopRight: response.value });
	}

	onTitleChange(err, response) {
		this.setState({ windowTitle: response.value });
	}

	onShowDockingToolTip(err, response) {
		this.setState({ showDockingTooltip: response.value });
	}

	onToggleDockingIcon(err, response) {
		// console.log("ws docking icon change")
		this.setState({
			dockingIcon: response.value
		});
	}

	onDocking(err, response) {
		this.setState({ dockingEnabled: response.value });
	}
	onStoreChanged(newState) {
		this.setState(newState);
	}

	/**
	 * Handles mouseover of title bar. This turns the regular title to a tab on windows that aren't already tabbing.
	 * This function is used as a prop on HoverDetector
	 *
	 * @param isHovered A string containing a boolean value (this is how HoverDetector chooses to send these values)
	 * @memberof windowTitleBar
	 */
	toggleDrag(isHovered) {
		// var clonedTab = document.getElementsByClassName('header-title')[0].cloneNode(true);
		// isHovered is a string so a boolean check doesn't work
		if(isHovered=="true"){
			this.setState({
				titleBarIsHoveredOver: true
			});
			// document.getElementsByClassName('fsbl-header-center')[0].parentElement.insertAfter(clonedTab, null);
		} else if(isHovered=="false") {
			this.setState({
				titleBarIsHoveredOver: false
			});
			// clonedTab.remove();
		}
	}

	/**
	 * Function that's called when this component fires the onDragStart event, this will start the tiling or tabbing process
	 *
	 * @param e The SyntheticEvent created by React when the startdrag event is called
	 * @memberof windowTitleBar
	 */
	startDrag(e) {
		console.log("starting the drag");
		FSBL.Clients.WindowClient.startTilingOrTabbing({windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier()});
	}

	/**
	 * Function to catch the drop event. This is called (along with dragEnd when the esc key is pressed)
	 * 
	 * @param {Object} e The SyntheticEvent created by React when the drop event is called 
	 */
	drop(e) {
		e.preventDefault();
		this.setState({
			dragEnded: true
		});
	}

	/**
	 * Called when the react component detects a drop (or stop drag, which is equivalent)
	 *
	 * @param e The SyntheticEvent created by React when the stopdrag event is called
	 * @memberof windowTitleBar
	 */
	stopDrag(e) {
		if (this.state.dragEnded != true) {
			//Esc was pressed
			this.setState({
				dragEnded: false
			}, () => {
				FSBL.Clients.WindowClient.cancelTilingOrTabbing();
			})
		}
		var timeout=setTimeout(this.cancelTiling, 6000);
		FSBL.Clients.RouterClient.transmit('tabbingDragEnd', {windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier(), timeout: timeout});
	}

	/**
	 * Set to a timeout. An event is sent to the RouterClient which will be handled by the drop handler on the window.
	 * In the event that a drop handler never fires to stop tiling or tabbing, this will take care of it.
	 *
	 * @memberof windowTitleBar
	 */
	cancelTabbing() {
		FSBL.Clients.WindowClient.stopTilingOrTabbing();
	}

	render() {
		var self = this;

		let showDockingIcon = !self.state.dockingEnabled ? false : self.state.dockingIcon;
		let isGrouped = (self.state.dockingIcon == "ejector");
		let showMinimizeIcon = (isGrouped && self.state.isTopRight) || !isGrouped; //If not in a group or if topright in a group
		return (
			<div className="fsbl-header">
				<HoverDetector hoverAction={this.toggleDrag} />
				<div className="fsbl-header-left">
					{self.state.showLinkerButton ? <Linker /> : null}
					<Sharer />
				</div>
				<div className="fsbl-header-center cq-drag"><div className={this.state.titleBarIsHoveredOver ? "header-title hidden" : "header-title"}>{self.state.windowTitle}</div></div>
				<div className="tab-area" draggable={true} onMouseDown={this.startDrag} onDragEnd={this.stopDrag} onDrop={this.drop}>
					<Tab title={self.state.windowTitle} showTabs={self.state.titleBarIsHoveredOver} />
				</div>
				<div className="fsbl-header-right">
					<BringSuiteToFront />
					{this.state.minButton && showMinimizeIcon ? <Minimize /> : null}
					{showDockingIcon ? <DockingButton /> : null}
					{this.state.maxButton ? <Maximize /> : null}
					{this.state.closeButton ? <Close /> : null}
				</div>
			</div>
		);
	}
}

FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTitleBar />, document.getElementById("FSBLHeader"));
	});
});
