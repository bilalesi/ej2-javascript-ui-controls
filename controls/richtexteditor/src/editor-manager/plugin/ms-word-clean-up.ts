import { EditorManager } from '../base/editor-manager';
import * as EVENTS from '../../common/constant';
import { NotifyArgs } from '../../rich-text-editor/base/interface';
import { createElement, isNullOrUndefined as isNOU, detach } from '@syncfusion/ej2-base';
/**
 * PasteCleanup for MsWord content
 * @hidden
 */
export class MsWordPaste {
    private parent: EditorManager;
    constructor(parent?: EditorManager) {
        this.parent = parent;
        this.addEventListener();
    }

    private olData: string[] = [
        'decimal',
        'lower-alpha',
        'lower-roman',
        'upper-alpha',
        'upper-roman',
        'lower-greek'
    ];
    private ulData: string[] = [
        'disc',
        'square',
        'circle',
        'disc',
        'square',
        'circle'
    ];
    private ignorableNodes: string[] = ['A', 'APPLET', 'B', 'BLOCKQUOTE', 'BR',
        'BUTTON', 'CENTER', 'CODE', 'COL', 'COLGROUP', 'DD', 'DEL', 'DFN', 'DIR', 'DIV',
        'DL', 'DT', 'EM', 'FIELDSET', 'FONT', 'FORM', 'FRAME', 'FRAMESET', 'H1', 'H2',
        'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'IMG', 'IFRAME', 'INPUT', 'INS', 'LABEL',
        'LI', 'OL', 'OPTION', 'P', 'PARAM', 'PRE', 'Q', 'S', 'SELECT', 'SPAN', 'STRIKE',
        'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TEXTAREA', 'TFOOT', 'TH',
        'THEAD', 'TITLE', 'TR', 'TT', 'U', 'UL'];
    private blockNode: string[] = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'address', 'blockquote', 'button', 'center', 'dd', 'dir', 'dl', 'dt', 'fieldset',
        'frameset', 'hr', 'iframe', 'isindex', 'li', 'map', 'menu', 'noframes', 'noscript',
        'object', 'ol', 'pre', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
        'header', 'article', 'nav', 'footer', 'section', 'aside', 'main', 'figure', 'figcaption'];
    private removableElements: string[] = ['o:p', 'style'];
    private listContents: string[] = [];
    private addEventListener(): void {
        this.parent.observer.on(EVENTS.MS_WORD_CLEANUP_PLUGIN, this.wordCleanup, this);
    }

    private wordCleanup(e: NotifyArgs): void {
        let wordPasteStyleConfig: string[] = e.allowedStylePropertiesArray;
        let listNodes: Element[] = [];
        let tempHTMLContent: string = (e.args as ClipboardEvent).clipboardData.getData('text/HTML');
        let rtfData: string = (e.args as ClipboardEvent).clipboardData.getData('text/rtf');
        let elm: HTMLElement = createElement('p') as HTMLElement;
        elm.setAttribute('id', 'MSWord-Content');
        elm.innerHTML = tempHTMLContent;
        let patern: RegExp = /class='?Mso|style='[^ ]*\bmso-/i;
        let patern2: RegExp = /class="?Mso|style="[^ ]*\bmso-/i;
        if (patern.test(tempHTMLContent) || patern2.test(tempHTMLContent)) {
            this.imageConversion(elm, rtfData);
            tempHTMLContent = tempHTMLContent.replace(/<img[^>]+>/i, '');
            listNodes = this.cleanUp(elm, listNodes);
            this.listConverter(listNodes);
            this.styleCorrection(elm, wordPasteStyleConfig);
            this.removingComments(elm);
            this.removeUnwantedElements(elm);
            this.removeEmptyElements(elm);
            this.breakLineAddition(elm);
            this.removeClassName(elm);
            e.callBack(elm.innerHTML);
        } else {
            e.callBack(elm.innerHTML);
        }
    }

    private imageConversion(elm: HTMLElement, rtfData: string): void {
        let imgElem: NodeListOf<HTMLImageElement> = elm.querySelectorAll('img');
        let imgSrc: string[] = [];
        let base64Src: string[] = [];
        let imgName: string[] = [];
        if (imgElem.length > 0) {
            for (let i: number = 0; i < imgElem.length; i++) {
                imgSrc.push(imgElem[i].getAttribute('src'));
                imgName.push(imgElem[i].getAttribute('src').split('/')[imgElem[i].getAttribute('src').split('/').length - 1].split('.')[0]);
            }
            let hexValue: { [key: string]: string; }[] = this.hexConversion(rtfData);
            for (let i: number = 0; i < hexValue.length; i++) {
                base64Src.push(this.convertToBase64(hexValue[i]));
            }
            for (let i: number = 0; i < imgElem.length; i++) {
                imgElem[i].setAttribute('src', base64Src[i]);
                imgElem[i].setAttribute('id', 'msWordImg-' + imgName[i]);
            }
        }
    }

    private convertToBase64(hexValue: { [key: string]: string }): string {
        let base64: string;
        let byteArr: number[] = this.conHexStringToBytes(hexValue.hex);
        let base64String: string = this.conBytesToBase64(byteArr);
        base64 = hexValue.type ? 'data:' + hexValue.type + ';base64,' + base64String : null;
        return base64;
    }

    private conBytesToBase64(byteArr: number[]): string {
        let base64Str: string = '';
        let base64Char: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let byteArrLen: number = byteArr.length;
        for (let i: number = 0; i < byteArrLen; i += 3 ) {
            let array3: number[] = byteArr.slice( i, i + 3 );
            let array3length: number = array3.length;
            let array4: number[] = [];
            if ( array3length < 3 ) {
                for (let j: number = array3length; j < 3; j++ ) {
                    array3[ j ] = 0;
                }
            }
            array4[0] = (array3[0] & 0xFC) >> 2;
            array4[1] = ((array3[0] & 0x03) << 4) | (array3[1] >> 4 );
            array4[2] = ((array3[1] & 0x0F) << 2) | ((array3[2] & 0xC0 ) >> 6 );
            array4[3] = array3[2] & 0x3F;
            for (let j: number = 0; j < 4; j++ ) {
                if (j <= array3length) {
                    base64Str += base64Char.charAt(array4[j]);
                } else {
                    base64Str += '=';
                }
            }
        }
        return base64Str;
    }

    private conHexStringToBytes(hex: string): number[] {
        let byteArr: number[] = [];
        let byteArrLen: number = hex.length / 2;
        for (let i: number = 0; i < byteArrLen; i++) {
            byteArr.push( parseInt( hex.substr( i * 2, 2 ), 16 ) );
        }
        return byteArr;
    }

    private hexConversion(rtfData: string): { [key: string]: string; }[] {
        let picHead: RegExp = /\{\\pict[\s\S]+?\\bliptag\-?\d+(\\blipupi\-?\d+)?(\{\\\*\\blipuid\s?[\da-fA-F]+)?[\s\}]*?/;
        let pic: RegExp = new RegExp( '(?:(' + picHead.source + '))([\\da-fA-F\\s]+)\\}', 'g' );
        let fullImg: RegExpMatchArray = rtfData.match(pic);
        let imgType: string;
        let result: { [key: string]: string }[] = [];
        for (let i: number = 0; i < fullImg.length; i++) {
            if (picHead.test(fullImg[i])) {
                if (fullImg[i].indexOf( '\\pngblip' ) !== -1 ) {
                    imgType = 'image/png';
                } else if (fullImg[i].indexOf( '\\jpegblip' ) !== -1 ) {
                    imgType = 'image/jpeg';
                } else {
                    continue;
                }
                result.push({
                    hex: imgType ? fullImg[i].replace(picHead, '').replace(/[^\da-fA-F]/g, '') : null,
                    type: imgType
                });
            }
        }
        return result;
    }

    private removeClassName(elm: HTMLElement): void {
        let elmWithClass: NodeListOf<Element> = elm.querySelectorAll('*[class]');
        for (let i: number = 0; i < elmWithClass.length; i++) {
            elmWithClass[i].removeAttribute('class');
        }
    }

    private breakLineAddition(elm: HTMLElement): void {
        let allElements: NodeListOf<Element> = elm.querySelectorAll('*');
        for (let i: number = 0; i < allElements.length; i++) {
            if (allElements[i].children.length === 0 && allElements[i].innerHTML === '&nbsp;') {
                let detachableElement: HTMLElement = this.findDetachElem(allElements[i]);
                let brElement: HTMLElement = createElement('br') as HTMLElement;
                if (!isNOU(detachableElement.parentElement)) {
                    detachableElement.parentElement.insertBefore(brElement, detachableElement);
                    detach(detachableElement);
                }
            }
        }
    }
    private findDetachElem(element: Element): HTMLElement {
        let removableElement: HTMLElement;
        if (!isNOU(element.parentElement) &&
        element.parentElement.textContent.trim() === '' && element.parentElement.tagName !== 'TD') {
            removableElement = this.findDetachElem(element.parentElement);
        } else {
            removableElement = element as HTMLElement;
        }
        return removableElement;
    }

    private removeUnwantedElements(elm: HTMLElement): void {
        let innerElement: string = elm.innerHTML;
        for (let i: number = 0; i < this.removableElements.length; i++) {
            let regExpStartElem: RegExp = new RegExp('<' + this.removableElements[i] + '>', 'g');
            let regExpEndElem: RegExp = new RegExp('</' + this.removableElements[i] + '>', 'g');
            innerElement = innerElement.replace(regExpStartElem, '');
            innerElement = innerElement.replace(regExpEndElem, '');
        }
        elm.innerHTML = innerElement;
        elm.querySelectorAll(':empty');
    }


    private findDetachEmptyElem(element: Element): HTMLElement {
        let removableElement: HTMLElement;
        if (!isNOU(element.parentElement)) {
            if (element.parentElement.textContent.trim() === '' &&
            element.parentElement.getAttribute('id') !== 'MSWord-Content' &&
            isNOU(element.parentElement.querySelector('img'))) {
                removableElement = this.findDetachEmptyElem(element.parentElement);
            } else {
                removableElement = element as HTMLElement;
            }
        } else {
            removableElement = null;
        }
        return removableElement;
    }
    private removeEmptyElements(element: HTMLElement): void {
        let emptyElements: NodeListOf<Element> = element.querySelectorAll(':empty');
        for (let i: number = 0; i < emptyElements.length; i++) {
            if (emptyElements[i].tagName !== 'IMG' && emptyElements[i].tagName !== 'BR') {
                let detachableElement: HTMLElement = this.findDetachEmptyElem(emptyElements[i]);
                if (!isNOU(detachableElement)) {
                    detach(detachableElement);
                }
            }
        }
    }

    private styleCorrection(elm: HTMLElement, wordPasteStyleConfig: string[]): void {
        let styleElement: NodeListOf<HTMLStyleElement> = elm.querySelectorAll('style');
        if (styleElement.length > 0) {
            let styles: string[] = styleElement[0].innerHTML.match(/[\S ]+\s+{[\s\S]+?}/gi);
            let styleClassObject: { [key: string]: string } = !isNOU(styles) ? this.findStyleObject(styles) : null;
            let keys: string[] = Object.keys(styleClassObject);
            let values: string[] = keys.map((key: string) => { return styleClassObject[key]; });
            values = this.removeUnwantedStyle(values, wordPasteStyleConfig);
            this.filterStyles(elm, wordPasteStyleConfig);
            let resultElem: HTMLCollectionOf<Element> | NodeListOf<Element>;
            for (let i: number = 0; i < keys.length; i++) {
                if (keys[i].split('.')[0] === '') {
                    resultElem = elm.getElementsByClassName(keys[i].split('.')[1]);
                } else if (keys[i].split('.').length === 1 && keys[i].split('.')[0].indexOf('@') >= 0) {
                    continue;
                } else if (keys[i].split('.').length === 1 && keys[i].split('.')[0].indexOf('@') < 0) {
                    resultElem = elm.getElementsByTagName(keys[i]);
                } else {
                    resultElem = elm.querySelectorAll(keys[i]);
                }
                for (let j: number = 0; j < resultElem.length; j++) {
                    let styleProperty: string = resultElem[j].getAttribute('style');
                    if (!isNOU(styleProperty) && styleProperty.trim() !== '') {
                        let valueSplit: string[] = values[i].split(';');
                        for (let k: number = 0; k < valueSplit.length; k++) {
                            if (styleProperty.indexOf(valueSplit[k].split(':')[0]) >= 0) {
                                valueSplit.splice(k, 1);
                                k--;
                            }
                        }
                        values[i] = valueSplit.join(';') + ';';
                        let changedValue: string = values[i] + styleProperty;
                        resultElem[j].setAttribute('style', changedValue);
                    } else {
                        resultElem[j].setAttribute('style', values[i]);
                    }
                }
            }
        }
    }

    private filterStyles(elm: HTMLElement, wordPasteStyleConfig: string[]): void {
        let elmWithStyles:  NodeListOf<Element> = elm.querySelectorAll('*[style]');
        for (let i: number = 0; i < elmWithStyles.length; i++) {
            let elemStyleProperty: string[] = elmWithStyles[i].getAttribute('style').split(';');
            let styleValue: string = '';
            for (let j: number = 0; j < elemStyleProperty.length; j++) {
                if (wordPasteStyleConfig.indexOf(elemStyleProperty[j].split(':')[0].trim()) >= 0 ) {
                    styleValue += elemStyleProperty[j] + ';';
                }
            }
            elmWithStyles[i].setAttribute('style', styleValue);
        }
    }

    private removeUnwantedStyle(values: string[], wordPasteStyleConfig: string[]): string[] {
        for (let i: number = 0; i < values.length; i++) {
            let styleValues: string[] = values[i].split(';');
            values[i] = '';
            for (let j: number = 0; j < styleValues.length; j++) {
                if (wordPasteStyleConfig.indexOf(styleValues[j].split(':')[0]) >= 0) {
                    values[i] += styleValues[j] + ';';
                }
            }
        }
        return values;
    }

    private findStyleObject(styles: string[]): { [key: string]: string } {
        let styleClassObject: { [key: string]: string } = {};
        for (let i: number = 0; i < styles.length; i++) {
            let tempStyle: string = styles[i];
            let classNameCollection: string = tempStyle.replace(/([\S ]+\s+){[\s\S]+?}/gi, '$1');
            let stylesCollection: string = tempStyle.replace(/[\S ]+\s+{([\s\S]+?)}/gi, '$1');
            classNameCollection = classNameCollection.replace(/^[\s]|[\s]$/gm, '');
            stylesCollection = stylesCollection.replace(/^[\s]|[\s]$/gm, '');
            classNameCollection = classNameCollection.replace(/\n|\r|\n\r/g, '');
            stylesCollection = stylesCollection.replace(/\n|\r|\n\r/g, '');
            for (let classNames: string[] = classNameCollection.split(', '), j: number = 0; j < classNames.length; j++) {
                styleClassObject[classNames[j]] = stylesCollection;
            }
        }
        return styleClassObject;
    }

    private removingComments(elm: HTMLElement): void {
        let innerElement: string = elm.innerHTML;
        innerElement = innerElement.replace(/<!--[\s\S]*?-->/g, '');
        elm.innerHTML = innerElement;
    }

    private cleanUp(node: HTMLElement, listNodes: Element[]): Element[] {
        let temp: string = '';
        let tempCleaner: Element[] = [];
        let prevflagState: boolean;
        let allNodes: NodeListOf<Element> = node.querySelectorAll('*');
        for (let index: number = 0; index < allNodes.length; index++) {
            if (this.ignorableNodes.indexOf(allNodes[index].nodeName) === -1 ||
                (allNodes[index].nodeType === 3 && allNodes[index].textContent.trim() === '')) {
                tempCleaner.push(allNodes[index] as Element);
                continue;
            } else if ((allNodes[index] as Element).className &&
                (allNodes[index] as Element).className.toLowerCase().indexOf('msolistparagraph') !== -1) {
                listNodes.push(allNodes[index] as Element);
            }
            if (prevflagState && (this.blockNode.indexOf(allNodes[index].nodeName.toLowerCase()) !== -1) &&
                !((allNodes[index] as Element).className &&
                    (allNodes[index] as Element).className.toLowerCase().indexOf('msolistparagraph') !== -1)) {
                listNodes.push(null);
            }
            if (this.blockNode.indexOf(allNodes[index].nodeName.toLowerCase()) !== -1) {
                if ((allNodes[index] as Element).className &&
                    (allNodes[index] as Element).className.toLowerCase().indexOf('msolistparagraph') !== -1) {
                    prevflagState = true;
                } else {
                    prevflagState = false;
                }
            }
        }
        if (listNodes.length && (listNodes[listNodes.length - 1] !== null)) {
            listNodes.push(null);
        }
        return listNodes;
    }

    private listConverter(listNodes: Element[]): void {
        let level: number;
        let data: { content: HTMLElement, node: Element }[] = [];
        let collection: { listType: string, content: string[], nestedLevel: number }[] = [];
        let content: string = '';
        let stNode: Element;
        for (let i: number = 0; i < listNodes.length; i++) {
            if (listNodes[i] === null) {
                data.push({ content: this.makeConversion(collection), node: listNodes[i - 1] });
                collection = [];
                continue;
            }
            content = listNodes[i].getAttribute('style');
            if (content && content.indexOf('level') !== -1) {
                level = parseInt(content.charAt(content.indexOf('level') + 5), null);
            } else {
                level = 1;
            }
            this.listContents = [];
            this.getListContent(listNodes[i]);
            let type: string;
            if (!isNOU(this.listContents[0])) {
                type = this.listContents[0].trim().length > 1 ? 'ol' : 'ul';
                let tempNode: string[] = [];
                for (let j: number = 1; j < this.listContents.length; j++) {
                    tempNode.push(this.listContents[j]);
                }
                collection.push({ listType: type, content: tempNode, nestedLevel: level });
            }
        }
        stNode = listNodes.shift();
        while (stNode) {
            let elemColl: Element[] = [];
            for (let temp1: number = 0; temp1 < data.length; temp1++) {
                if (data[temp1].node === stNode) {
                    for (let index: number = 0; index < data[temp1].content.childNodes.length; index++) {
                        elemColl.push(data[temp1].content.childNodes[index] as HTMLElement);
                    }
                    for (let index: number = 0; index < elemColl.length; index++) {
                        stNode.parentElement.insertBefore(elemColl[index], stNode);
                    }
                    break;
                }
            }
            stNode.remove();
            stNode = listNodes.shift();
            if (!stNode) {
                stNode = listNodes.shift();
            }
        }
    }

    private makeConversion(collection: { listType: string, content: string[], nestedLevel: number }[]): HTMLElement {
        let root: HTMLElement = createElement('div');
        let temp: HTMLElement;
        let pLevel: number = 1;
        let prevList: HTMLElement;
        let listCount: number = 0;
        let elem: HTMLElement;
        for (let index: number = 0; index < collection.length; index++) {
            let pElement: Element = createElement('p');
            pElement.innerHTML = collection[index].content.join(' ');
            if ((collection[index].nestedLevel === 1) && listCount === 0 && collection[index].content) {
                root.appendChild(temp = createElement(collection[index].listType));
                prevList = createElement('li');
                prevList.appendChild(pElement);
                temp.appendChild(prevList);
                temp.setAttribute('level', collection[index].nestedLevel.toString());
                temp.style.listStyle = this.getListStyle(collection[index].listType, collection[index].nestedLevel);
            } else if (collection[index].nestedLevel === pLevel) {
                if (prevList.parentElement.tagName.toLowerCase() === collection[index].listType) {
                    prevList.parentElement.appendChild(prevList = createElement('li'));
                    prevList.appendChild(pElement);
                } else {
                    temp = createElement(collection[index].listType);
                    prevList.parentElement.parentElement.appendChild(temp);
                    prevList = createElement('li');
                    prevList.appendChild(pElement);
                    temp.appendChild(prevList);
                    temp.setAttribute('level', collection[index].nestedLevel.toString());
                }
            } else if (collection[index].nestedLevel > pLevel) {
                for (let j: number = 0; j < collection[index].nestedLevel - pLevel; j++) {
                    prevList.appendChild(temp = createElement(collection[index].listType));
                    prevList = createElement('li', { styles: 'list-style-type: none;' });
                    temp.appendChild(prevList);
                }
                prevList.appendChild(pElement);
                temp.setAttribute('level', collection[index].nestedLevel.toString());
                temp.style.listStyle = this.getListStyle(collection[index].listType, collection[index].nestedLevel);
                (temp.childNodes[0] as HTMLElement).style.listStyle =
                    this.getListStyle(collection[index].listType, collection[index].nestedLevel);
            } else if (collection[index].nestedLevel === 1) {
                if ((root.lastChild as HTMLElement).tagName.toLowerCase() === collection[index].listType) {
                    temp = root.lastChild as HTMLElement;
                } else {
                    root.appendChild(temp = createElement(collection[index].listType));
                }
                prevList = createElement('li');
                prevList.appendChild(pElement);
                temp.appendChild(prevList);
                temp.setAttribute('level', collection[index].nestedLevel.toString());
                temp.style.listStyle = this.getListStyle(collection[index].listType, collection[index].nestedLevel);
            } else {
                elem = prevList;
                while (elem.parentElement) {
                    elem = elem.parentElement;
                    if (elem.attributes.getNamedItem('level')) {
                        if (parseInt(elem.attributes.getNamedItem('level').textContent, null) === collection[index].nestedLevel) {
                            prevList = createElement('li');
                            prevList.appendChild(pElement);
                            elem.appendChild(prevList);
                            break;
                        } else if (collection[index].nestedLevel > parseInt(elem.attributes.getNamedItem('level').textContent, null)) {
                            elem.appendChild(temp = createElement(collection[index].listType));
                            prevList = createElement('li');
                            prevList.appendChild(pElement);
                            temp.appendChild(prevList);
                            temp.setAttribute('level', collection[index].nestedLevel.toString());
                            temp.style.listStyle = this.getListStyle(collection[index].listType, collection[index].nestedLevel);
                            break;
                        }
                    }
                    continue;
                }
            }
            pLevel = collection[index].nestedLevel;
            listCount++;
        }
        return root;
    }

    private getListStyle(listType: string, nestedLevel: number): string {
        nestedLevel = (nestedLevel > 0) ? nestedLevel - 1 : nestedLevel;
        if (listType === 'ol') {
            return (nestedLevel < this.olData.length ? this.olData[nestedLevel] : this.olData[0]);
        } else {
            return (nestedLevel < this.ulData.length ? this.ulData[nestedLevel] : this.ulData[0]);
        }
    }

    private getListContent(elem: Element): void {
        this.listContents.push(elem.firstElementChild.textContent.trim());
        detach(elem.firstElementChild);
        this.listContents.push(elem.innerHTML);
    }
}
