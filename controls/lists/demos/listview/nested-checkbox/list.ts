/**
 * ListView Checkbox Sample
 */
import { ListView, SelectedItem } from '../../../src/list-view/index';

let dataSource: { [key: string]: Object }[] = [
    {
        id: '01', text: 'Music', icon: 'folder',
        child: [
            { id: '01-01', text: 'Gouttes.mp3', icon: 'file' }
        ]
    },
    {
        id: '02', text: 'Videos', icon: 'folder',
        child: [
            { id: '02-01', text: 'Naturals.mp4', icon: 'file' },
            { id: '02-02', text: 'Wild.mpeg', icon: 'file' },
        ]
    },
    {
        id: '03', text: 'Documents', icon: 'folder',
        child: [
            { id: '03-01', text: 'Environment Pollution.docx', icon: 'file' },
            { id: '03-02', text: 'Global Water, Sanitation, & Hygiene.docx', icon: 'file' },
            { id: '03-03', text: 'Global Warming.ppt', icon: 'file' },
            { id: '03-04', text: 'Social Network.pdf', icon: 'file' },
            { id: '03-05', text: 'Youth Empowerment.pdf', icon: 'file' },
        ]
    },
    {
        id: '04', text: 'Pictures', icon: 'folder',
        child: [
            {
                id: '04-01', text: 'Camera Roll', icon: 'folder',
                child: [
                    { id: '04-01-01', text: 'WIN_20160726_094117.JPG', icon: 'file' },
                    { id: '04-01-02', text: 'WIN_20160726_094118.JPG', icon: 'file' },
                    { id: '04-01-03', text: 'WIN_20160726_094119.JPG', icon: 'file' }
                ]
            },
            {
                id: '04-02', text: 'Wind.jpg', icon: 'file'
            },
            {
                id: '04-02', text: 'Stone.jpg', icon: 'file'
            },
            {
                id: '04-02', text: 'Home.jpg', icon: 'file'
            },
            {
                id: '04-02', text: 'Bridge.png', icon: 'file'
            }
        ]
    },
    {
        id: '05', text: 'Downloads', icon: 'folder',
        child: [
            { id: '05-01', text: 'UI-Guide.pdf', icon: 'file' },
            { id: '05-02', text: 'Tutorials.zip', icon: 'file' },
            { id: '05-03', text: 'Game.exe', icon: 'file' },
            { id: '05-04', text: 'TypeScript.7z', icon: 'file' },
        ]
    },
];

let listObj: ListView = new ListView({
    dataSource: dataSource,
    fields: { iconCss: 'icon', tooltip: 'text' },
    showIcon: true,
    headerTitle: 'Folders',
    showHeader: true,
    animation: { duration: 0 },
    //Set defined data to dataSource property, enable checkbox and map the checked in the fields.
     showCheckBox: true
});

listObj.appendTo('#nested-checkbox');

document.getElementById('nested_check').onclick = function () {
    listObj.checkAllItems();
};
document.getElementById('nested_uncheck').onclick = function () {
    listObj.uncheckAllItems();
};
document.getElementById('material').onclick = (e: Event) => {
    document.getElementById("theme").setAttribute('href', '../../../styles/material.css');
    document.getElementById("check").setAttribute('href', '../../../node_modules/@syncfusion/ej2-buttons/styles/material.css');    
};
document.getElementById('fabric').onclick = (e: Event) => {
    document.getElementById("theme").setAttribute('href', '../../../styles/fabric.css');
    document.getElementById("check").setAttribute('href', '../../../node_modules/@syncfusion/ej2-buttons/styles/fabric.css');    
};
document.getElementById('bootstrap').onclick = (e: Event) => {
    document.getElementById("theme").setAttribute('href', '../../../styles/bootstrap.css');
    document.getElementById("check").setAttribute('href', '../../../node_modules/@syncfusion/ej2-buttons/styles/bootstrap.css');   
};
document.getElementById('rtl').onclick = (e: Event) => {
    listObj.enableRtl = true;
};