import { BulletChart } from '../bullet-chart';
import { isNullOrUndefined, compile as templateComplier } from '@syncfusion/ej2-base';
import { BulletLabelStyleModel } from '../model/bullet-base-model';
import { stringToNumber } from '../../chart/index';
import { IBulletTooltipContent, IBulletchartTooltipEventArgs } from '../model/bullet-interface';
import { tooltipRender } from '../../common/model/constants';
import { BulletChartTheme } from '../utils/theme';


/**
 * `BulletTooltip` module is used to render the tooltip for bullet chart.
 */
export class BulletTooltip {
    private elementId: string;
    public toolTipInterval: number;
    private control: BulletChart;
    private templateFn: Function;

    /**
     * Constructor for tooltip module.
     * @private.
     */
    constructor(bullet: BulletChart) {
        this.control = bullet;
        this.elementId = bullet.element.id;
    }

    /**
     * To create tooltip div element
     */
    public _elementTooltip(e: PointerEvent, targetClass: string, targetId: string, mouseX: number, mouseY: number): void {
        let titleStyle: BulletLabelStyleModel = this.control.titleStyle;
        let tooltipDiv: HTMLDivElement = <HTMLDivElement>this.control.createElement('div');
        tooltipDiv.id = 'tooltip';
        tooltipDiv.className = 'tooltipDiv';
        let target: Element = e.target as Element;
        let pointer: PointerEvent = e;
        let pageX: number = mouseX + 20;
        let pageY: number = e.clientY;
        let str: string = '';
        let font : string = this.control.tooltip.textStyle.fontStyle ? this.control.tooltip.textStyle.fontStyle :
        BulletChartTheme.tooltipLabelFont.fontStyle;
        let color: string = BulletChartTheme.tooltipLabelFont.color || this.control.themeStyle.tooltipBoldLabel;
        let fontSize: string = BulletChartTheme.titleFont.size;
        let style: string = 'left:' + pageX + 'px;' + 'top:' + pageY + 'px;' +
        'display: block; position: absolute; "z-index": "13000",cursor: default;' +
        'font-family: Segoe UI;' + 'color:' + color + '; font-size: 13px; background-color:' +
        this.control.themeStyle.tooltipFill + '; border: 1px solid #707070;' + 'font-style:' + font + ';';
        // adding css prop to the div
        tooltipDiv.setAttribute('style', style);
        if (targetClass === this.control.svgObject.id + '_Caption') {
            str = target.textContent === this.control.title ? '' : this.control.title;
        } else if (targetClass === this.control.svgObject.id + '_SubTitle') {
            str = target.textContent === this.control.subtitle ? '' : this.control.subtitle;
        }
        if (str !== '') {
            tooltipDiv.innerHTML = '&nbsp' + str + '&nbsp';
            document.body.insertAdjacentElement('afterbegin', tooltipDiv);
        }
    }

    /**
     * To display the bullet chart tooltip
     */
    public _displayTooltip(e: PointerEvent, targetClass: string, targetId: string, mouseX: number, mouseY: number): void {
        if (targetClass !== 'undefined' && this.control.tooltip.enable && (targetClass === this.control.svgObject.id + '_FeatureMeasure' ||
            targetClass === this.control.svgObject.id + '_ComparativeMeasure')) {
            let locale: string = this.control.locale;
            let localizedText: boolean = locale && this.control.enableGroupSeparator;
            let data: IBulletTooltipContent;
            let measureId: string;
            let currentVal: number;
            let targetVal: number[] = [];
            let categoryVal: number;
            let tooltipdiv: HTMLDivElement;
            let pointer: PointerEvent = e;
            measureId = targetId.substring(targetId.lastIndexOf('_') + 1);
            currentVal = this.control.dataSource[measureId][this.control.valueField];
            targetVal = targetVal.concat(this.control.dataSource[measureId][this.control.targetField]);
            categoryVal = this.control.dataSource[measureId][this.control.categoryField];
            if (localizedText) {
                data = {
                    value: currentVal.toLocaleString(locale), target: targetVal.map((x: number) => { return x.toLocaleString(locale); }),
                    category: (!isNullOrUndefined(categoryVal) ? categoryVal.toLocaleString(locale) : categoryVal)
                };
            } else {
                data = { value: currentVal, target: targetVal, category: categoryVal };
            }
            let style: string = 'position: absolute; z-index: 13000; display: block;';
            if (document.getElementsByClassName('tooltipDiv' + this.control.element.id).length === 0) {
                tooltipdiv = <HTMLDivElement>this.control.createElement('div');
                tooltipdiv.id = 'tooltipDiv' + this.control.element.id;
                tooltipdiv.setAttribute('style', style);
                document.getElementById(this.control.element.id + '_Secondary_Element').appendChild(tooltipdiv);
            }
            let argsData: IBulletchartTooltipEventArgs = {
                value: data.value, target: data.target, name: tooltipRender
            };
            if (this.control.tooltip.template !== '' && this.control.tooltip.template != null) {
                this.updateTemplateFn();
                let templateElement: HTMLCollection = this.templateFn(data);
                let elem: Element = this.control.createElement('div', { id: this.control.element.id + 'parent_template' });
                while (templateElement && templateElement.length > 0) {
                    elem.appendChild(templateElement[0]);
                }
                argsData.template = elem.innerHTML;
                this.control.trigger(tooltipRender, argsData);
                elem.innerHTML = argsData.template;
                tooltipdiv.appendChild(elem);
            } else {
                let argsText: string = 'Value : ' + argsData.value;
                for (let i: number = 0; i < argsData.target.length; i++) {
                    argsText += '<br/> Target' + (i === 0 ? '' : '_' + i) + ' : ' + argsData.target[i];
                }
                argsData.text = argsText;
                this.control.trigger(tooltipRender, argsData);
                tooltipdiv.innerHTML = argsData.text;
                tooltipdiv.style.font = this.control.tooltip.textStyle.fontStyle ? this.control.tooltip.textStyle.fontStyle :
                    BulletChartTheme.tooltipLabelFont.fontStyle;
                tooltipdiv.style.color = BulletChartTheme.tooltipLabelFont.color || this.control.themeStyle.tooltipBoldLabel;
                tooltipdiv.style.fontSize = BulletChartTheme.titleFont.size;
            }
            let xPos: number = mouseX;
            let yPos: number = mouseY;
            xPos = ((xPos + stringToNumber(tooltipdiv.getAttribute('width'), this.control.containerWidth) < window.innerWidth) ?
                (xPos) : stringToNumber(tooltipdiv.getAttribute('width'), this.control.containerWidth));
            yPos = ((yPos + stringToNumber(tooltipdiv.getAttribute('height'), this.control.containerHeight) < window.innerHeight) ?
                (yPos) : stringToNumber(tooltipdiv.getAttribute('height'), this.control.containerHeight));
            if (xPos === undefined || xPos === null) {
                xPos = mouseX;
            }
            if (yPos === undefined || yPos === null) {
                yPos = e.clientY;
            }
            if (this.control.tooltip.template !== '' && this.control.tooltip.template != null) {
                tooltipdiv.setAttribute('style', 'position: absolute;left:' + (xPos + 20) + 'px;' + 'top:' + (yPos + 20) + 'px;');
            } else {
                let divStyle: string = style + 'left:' + (xPos + 20) + 'px;' + 'top:' + (yPos + 20) + 'px;' +
                    '-webkit-border-radius: 5px 5px 5px 5px; -moz-border-radius: 5px 5px 5px 5px;-o-border-radius: 5px 5px 5px 5px;' +
                    'border-radius: 5px 5px 5px 5px;' + 'background-color:' + this.control.themeStyle.tooltipFill + ';' + 'color:' +
                    tooltipdiv.style.color + '; border: 1px Solid Black;' +
                    'padding-bottom: 7px;' + 'font-style:' + BulletChartTheme.tooltipLabelFont.fontStyle +
                    '; padding-left: 10px; font-family: Segoe UI; padding-right: 10px; padding-top: 7px';
                tooltipdiv.setAttribute('style', divStyle);
                if ((targetClass === this.control.svgObject.id + '_FeatureMeasure') ||
                    (targetClass === this.control.svgObject.id + '_ComparativeMeasure')) {
                    document.getElementById(targetId).setAttribute('opacity', '0.6');
                }
            }
        }
    }

    /**
     * To update template values in the tooltip
     */
    public updateTemplateFn(): void {
        if (this.control.tooltip.template) {
            let e: Object;
            try {
                if (document.querySelectorAll(this.control.tooltip.template).length) {
                    this.templateFn = templateComplier(document.querySelector(this.control.tooltip.template).innerHTML.trim());
                }
            } catch (e) {
                this.templateFn = templateComplier(this.control.tooltip.template);
            }
        }
    }
    /**
     * Get module name.
     */
    protected getModuleName(): string {
        return 'BulletTooltip';
    }
    /**
     * To destroy the tooltip.
     * @return {void}
     * @private
     */
    public destroy(chart: BulletChart): void {
        // Destroy method called here
    }
}
