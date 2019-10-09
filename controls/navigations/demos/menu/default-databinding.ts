/**
 * Context Menu default sample
 */
import { Browser } from '@syncfusion/ej2-base';
import { ChangeEventArgs, CheckBox } from '@syncfusion/ej2-buttons';
import { Menu } from './../../src/menu/index';

let menuObj: Menu = new Menu(null, '#syncfusionProducts');

if (Browser.isDevice) {
    document.body.classList.add('e-bigger');
}

let checkBoxObj: CheckBox = new CheckBox({ label: 'Enable Touch Mode', checked: false, change: onChange });
    checkBoxObj.appendTo('#touchMode');

document.getElementById('material').onclick = (e : Event) => {
    document.body.classList.remove('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/material.css');
};
document.getElementById('fabric').onclick = (e : Event) => {
    document.body.classList.remove('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/fabric.css');
};
document.getElementById('bootstrap').onclick = (e : Event) => {
    document.body.classList.remove('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/bootstrap.css');
};
document.getElementById('highcontrast').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/highcontrast.css');
};
document.getElementById('materialdark').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/material-dark.css');
};
document.getElementById('bootstrapdark').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/bootstrap-dark.css');
};
document.getElementById('fabricdark').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    document.getElementById('theme').setAttribute('href', './theme-files/fabric-dark.css');
};

 // function to handle the CheckBox change event
 function onChange(args: ChangeEventArgs): void {
    let hasClassName: boolean = menuObj.element.parentElement.classList.contains('e-bigger');
    if (hasClassName) {
        menuObj.element.parentElement.classList.remove('e-bigger');
    } else {
        menuObj.element.parentElement.classList.add('e-bigger');
    }
}
