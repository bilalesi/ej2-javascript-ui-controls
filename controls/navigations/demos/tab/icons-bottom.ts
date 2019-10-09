/**
 *  Tab default Sample
 */
import { Tab } from '../../src/tab/index';

let tabObj: Tab = new Tab({
    overflowMode: 'Popup',
    items: [
        {
            header: { 'text':'bold', 'iconCss': 'e-bold', 'iconPosition': 'bottom' },
            content: 'Bold, bold face, or bold font is any text that is darkened to help emphasize a remark or comment. For example, this is bold text. If your browser supports bold text, the previous words "bold text" should have been in bold lettering.'
        },
        {
            header: { 'text': 'Cut', 'iconCss': 'e-cut', 'iconPosition': 'bottom' },
            content: 'In the case of items inside a file, Cut deletes the content from the screen, but keeps it in memory'
        },
        {
            header: { 'text': 'Copy', 'iconCss': 'e-copy', 'iconPosition': 'bottom' },
            content: 'Makes a duplicate of the original file, which can be moved or edited without altering the original.'
        },
        {
            header: { 'text': 'Paste', 'iconCss': 'e-paste', 'iconPosition': 'bottom'},
            content: 'Used to make a cut or copied item appear again at a specific location.'
        },
        {
            header: { 'text': 'underline', 'iconCss': 'e-underline-icon', 'iconPosition': 'bottom' },
            content: 'underline'
        },
        {
            header: { 'text': 'alignleft', 'iconCss': 'e-alignleft-icon', 'iconPosition': 'bottom' },
            content: 'alignleft'
        },
        {
            header: { 'text': 'alignright', 'iconCss': 'e-alignright-icon', 'iconPosition': 'bottom' },
            content: 'alignright'
        },
        {
            header: { 'text': 'aligncenter', 'iconCss': 'e-aligncenter-icon', 'iconPosition': 'bottom' },
            content: 'aligncenter'
        },
        {
            header: { 'text': 'alignjustify', 'iconCss': 'e-alignjustify-icon', 'iconPosition': 'bottom' },
            content: 'alignjustify'
        },
        {
            header: { 'text': 'upload', 'iconCss': 'e-upload-icon', 'iconPosition': 'bottom' },
            content: 'upload'
        },
        {
            header: { 'text': 'download', 'iconCss': 'e-download-icon', 'iconPosition': 'bottom' },
            content: 'download'
        },
        {
            header: { 'text': 'indent', 'iconCss': 'e-indent-icon', 'iconPosition': 'bottom' },
            content: 'indent'
        },
        {
            header: { 'text': 'outdent', 'iconCss': 'e-outdent-icon', 'iconPosition': 'bottom' },
            content: 'outdent'
        },
        {
            header: { 'text': 'clear', 'iconCss': 'e-clear-icon', 'iconPosition': 'bottom' },
            content: 'clear'
        },
        {
            header: { 'text': 'reload', 'iconCss': 'e-reload-icon', 'iconPosition': 'bottom' },
            content: 'reload'
        },
        {
            header: { 'text': 'export', 'iconCss': 'e-export-icon', 'iconPosition': 'bottom' },
            content: 'export'
        },
        {
            header: { 'text': 'italic', 'iconCss': 'e-italic-icon', 'iconPosition': 'bottom' },
            content: 'italic'
        },
        {
            header: { 'text': 'bullets', 'iconCss': 'e-bullets-icon', 'iconPosition': 'bottom' },
            content: 'bullets'
        },
        {
            header: { 'text': 'numbering', 'iconCss': 'e-numbering-icon', 'iconPosition': 'bottom' },
            content: 'numbering'
        }
    ]
});
tabObj.appendTo('#ej2Tab');
document.getElementById('btn_touch').onclick = (e : Event) => {
    (<HTMLElement>document.getElementsByTagName('body')[0]).classList.add('e-bigger');
};
document.getElementById('btn_mouse').onclick = (e : Event) => {
    (<HTMLElement>document.getElementsByClassName('e-bigger')[0]).classList.remove('e-bigger');
};
document.getElementById('btn_high').onclick = (e : Event) => {
    document.getElementsByTagName('link')[0].href = './theme-files/highcontrast.css';
};
document.getElementById('btn_boot').onclick = (e : Event) => {
    document.getElementsByTagName('link')[0].href = './theme-files/bootstrap.css';
};
document.getElementById('btn_fabric').onclick = (e : Event) => {
    document.getElementsByTagName('link')[0].href = './theme-files/fabric.css';
};
document.getElementById('btn_material').onclick = (e : Event) => {
    document.getElementsByTagName('link')[0].href = './theme-files/material.css';
};
document.getElementById('btn_closeButton').onclick = (e : Event) => {
    if(tabObj.showCloseButton) {
        tabObj.showCloseButton = false;
    } else {
        tabObj.showCloseButton = true;
    }
    tabObj.dataBind();
};
document.getElementById('btn_enableRtl').onclick = (e : Event) => {
    if(tabObj.enableRtl) {
        tabObj.enableRtl = false;
    } else {
        tabObj.enableRtl = true;
    }
    tabObj.dataBind();
};
document.getElementById('btn_orientation').onclick = (e : Event) => {
    if(tabObj.headerPlacement == 'Top') {
        tabObj.headerPlacement = 'Bottom';
    } else {
        tabObj.headerPlacement = 'Top';
    }
    tabObj.dataBind();
};
document.getElementById('btn_overflowModes').onclick = (e : Event) => {
    if(tabObj.overflowMode === 'Scrollable') {
        tabObj.overflowMode = 'Popup';
    } else {
        tabObj.overflowMode = 'Scrollable';
    }
    tabObj.dataBind();
};
document.getElementById('btn_default').onclick = (e : Event) => {
    removeClass();
};
document.getElementById('btn_fill').onclick = (e : Event) => {
    removeClass();
    (<HTMLElement>document.getElementsByClassName('e-tab')[0]).classList.add('e-fill');
};
document.getElementById('btn_bg').onclick = (e : Event) => {
    removeClass();
    (<HTMLElement>document.getElementsByClassName('e-tab')[0]).classList.add('e-background');
};
document.getElementById('btn_accent').onclick = (e : Event) => {
    removeClass();
    (<HTMLElement>document.getElementsByClassName('e-tab')[0]).classList.add('e-background');
    (<HTMLElement>document.getElementsByClassName('e-tab')[0]).classList.add('e-accent');
};
function removeClass() {
    let ele: HTMLElement = (<HTMLElement>document.getElementsByClassName('e-tab')[0]);
    ele.classList.remove('e-fill');
    ele.classList.remove('e-background');
    ele.classList.remove('e-accent');
}