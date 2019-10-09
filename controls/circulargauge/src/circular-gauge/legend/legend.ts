import { CircularGauge } from '../circular-gauge';
import { appendPath, textElement, PathOption, TextOption, calculateShapes, textTrim, removeElement } from '../utils/helper';
import { Rect, Size, GaugeLocation, stringToNumber, measureText, RectOption, getElement, showTooltip } from '../utils/helper';
import { Property, Complex, ChildProperty, isNullOrUndefined } from '@syncfusion/ej2-base';
import { BorderModel, FontModel, MarginModel } from '../model/base-model';
import { Font, Border, Margin } from '../model/base';
import { LegendPosition, Alignment, GaugeShape } from '../utils/enum';
import { Theme } from '../model/theme';
import { Axis } from '../axes/axis';
import { ILegendRenderEventArgs } from '../model/interface';
import { LegendSettingsModel } from './legend-model';
import { LocationModel } from './legend-model';
import { ILegendRegions } from '../model/interface';
import { RangeModel } from '../axes/axis-model';
import { Range } from '../axes/axis';

/**
 * Configures the location for the legend.
 */
export class Location extends ChildProperty<Location>  {
    /**
     * X coordinate of the legend in pixels.
     * @default 0
     */
    @Property(0)
    public x: number;

    /**
     * Y coordinate of the legend in pixels.
     * @default 0
     */
    @Property(0)
    public y: number;
}
/**
 * Configures the legends in charts.
 */
export class LegendSettings extends ChildProperty<LegendSettings> {

    /**
     * If set to true, legend will be visible.
     * @default false
     */
    @Property(false)
    public visible: boolean;
    /**
     * If set to true, series' visibility collapses based on the legend visibility.
     * @default true
     */
    @Property(true)
    public toggleVisibility: boolean;
    /**
     * Legend in chart can be aligned as follows:
     * * Near: Aligns the legend to the left of the chart.
     * * Center: Aligns the legend to the center of the chart.
     * * Far: Aligns the legend to the right of the chart.
     * @default 'Center'
     */
    @Property('Center')
    public alignment: Alignment;
    /**
     * Options to customize the border of the legend.
     */
    @Complex<BorderModel>({}, Border)
    public border: BorderModel;

    /**
     * Options to customize the border of the legend.
     */
    @Complex<BorderModel>({}, Border)
    public shapeBorder: BorderModel;
    /**
     * Option to customize the padding between legend items.
     * @default 8
     */
    @Property(8)
    public padding: number;
    /**
     * Opacity of the legend.
     * @default 1
     */
    @Property(1)
    public opacity: number;
    /**
     * Position of the legend in the circular gauge are,
     * * Auto: Displays the legend based on the avail space of the circular this.gauge.
     * * Top: Displays the legend at the top of the circular this.gauge.
     * * Left: Displays the legend at the left of the circular this.gauge.
     * * Bottom: Displays the legend at the bottom of the circular this.gauge.
     * * Right: Displays the legend at the right of the circular this.gauge.
     * @default 'Auto'
     */
    @Property('Auto')
    public position: LegendPosition;
    /**
     * Customize the legend shape of the maps.
     * @default Circle
     */
    @Property('Circle')
    public shape: GaugeShape;
    /**
     * The height of the legend in pixels.
     * @default null
     */
    @Property(null)
    public height: string;
    /**
     * The width of the legend in pixels.
     * @default null
     */
    @Property(null)
    public width: string;
    /**
     * Options to customize the legend text.
     */
    @Complex<FontModel>(Theme.legendLabelFont, Font)
    public textStyle: FontModel;
    /**
     * Height of the shape
     * @default 10
     */
    @Property(10)
    public shapeHeight: number;
    /**
     * Width of the shape
     * @default 10
     */
    @Property(10)
    public shapeWidth: number;
    /**
     * Padding for the shape
     * @default 5
     */
    @Property(5)
    public shapePadding: number;
    /**
     * Specifies the location of the legend, relative to the chart.
     * If x is 20, legend moves by 20 pixels to the right of the chart. It requires the `position` to be `Custom`.
     * ```html
     * <div id='Gauge'></div>
     * ```
     * ```typescript
     * let gauge: CircularGauge = new CircularGauge({
     * ...
     *   legendSettings: {
     *     visible: true,
     *     position: 'Custom',
     *     location: { x: 100, y: 150 },
     *   },
     * ...
     * });
     * this.gauge.appendTo('#Gauge');
     * ```
     */
    @Complex<LocationModel>({ x: 0, y: 0 }, Location)
    public location: LocationModel;
    /**
     * Options to customize the legend background
     * @default 'transparent'
     */
    @Property('transparent')
    public background: string;
    /**
     * Options to customize the legend margin
     */
    @Complex<MarginModel>({ left: 0, right: 0, top: 0, bottom: 0 }, Margin)
    public margin: MarginModel;
}

/*
 * Legend module is used to render legend for the Circular Gauge
 */
export class Legend {
    /* tslint:disable:no-string-literal */
    public legendCollection: LegendOptions[];
    public legendRenderingCollections: Object[];
    protected legendRegions: ILegendRegions[] = [];
    public titleRect: Rect;
    private totalRowCount: number;
    private maxColumnWidth: number;
    protected maxItemHeight: number;
    protected isPaging: boolean;
    protected isVertical: boolean;
    private rowCount: number = 0; // legend row counts per page
    private pageButtonSize: number = 8;
    protected pageXCollections: number[] = []; // pages of x locations
    protected maxColumns: number = 0;
    public maxWidth: number = 0;
    private clipRect: Element;
    private legendTranslateGroup: Element;
    protected currentPage: number = 1;
    private gauge: CircularGauge;
    private totalPages: number;
    private legend: LegendSettings;
    private legendID: string;
    protected pagingRegions: Rect[] = [];
    private clipPathHeight: number;
    private toggledIndexes: Index[];
    /**
     * Gets the legend bounds in chart.
     * @private
     */
    public legendBounds: Rect;
    /**  @private */
    public position: LegendPosition = 'Auto';
    constructor(gauge: CircularGauge) {
        this.gauge = gauge;
        this.toggledIndexes = [];
        this.legend = this.gauge.legendSettings as LegendSettings;
        this.legendID = this.gauge.element.id + '_gauge_legend';
        this.addEventListener();
    }
    /**
     * Binding events for legend module.
     */
    private addEventListener(): void {
        if (this.gauge.isDestroyed) { return; }
        //   this.gauge.on(Browser.touchMoveEvent, this.mouseMove, this);
        this.gauge.on('click', this.click, this);
        // this.gauge.on(Browser.touchEndEvent, this.mouseEnd, this);
    }
    /**
     * UnBinding events for legend module.
     */
    private removeEventListener(): void {
        if (this.gauge.isDestroyed) { return; }
        //  this.gauge.off(Browser.touchMoveEvent, this.mouseMove);
        this.gauge.off('click', this.click);
        //  this.gauge.off(Browser.touchEndEvent, this.mouseEnd);
    }
    /**
     * Get the legend options.
     * @return {void}
     * @private
     */
    public getLegendOptions(axes: Axis[]): void {
        this.legendCollection = [];
        let range: RangeModel;
        let text: string = '';
        for (let i: number = 0; i < axes.length; i++) {
            for (let j: number = 0; j < axes[i].ranges.length; j++) {
                range = axes[i].ranges[j] as RangeModel;
                if (!isNullOrUndefined(range.start) && !isNullOrUndefined(range.end) && (range.start !== range.end)) {
                    text = range.legendText ? range.legendText : range.start + ' - ' + range.end;
                    this.legendCollection.push(new LegendOptions(
                        text, text, range.color, this.legend.shape,
                        this.legend.visible, this.legend.border as Border, this.legend.shapeBorder as Border,
                        this.legend.shapeWidth, this.legend.shapeHeight, j, i
                    ));
                }
            }
        }
    }
    /* tslint:disable-next-line:max-func-body-length */
    public calculateLegendBounds(rect: Rect, availableSize: Size): void {
        let legend: LegendSettingsModel = this.legend;
        this.position = (legend.position !== 'Auto') ? legend.position :
            (availableSize.width > availableSize.height ? 'Right' : 'Bottom');
        this.legendBounds = new Rect(rect.x, rect.y, 0, 0);
        this.isVertical = (this.position === 'Left' || this.position === 'Right');
        if (this.isVertical) {
            this.legendBounds.height = stringToNumber(
                legend.height, availableSize.height - (rect.y - this.gauge.margin.top)) || rect.height;
            this.legendBounds.width = stringToNumber(legend.width || '20%', availableSize.width);
        } else {
            this.legendBounds.width = stringToNumber(legend.width, availableSize.width) || rect.width;
            this.legendBounds.height = stringToNumber(legend.height || '20%', availableSize.height);
        }
        this.getLegendBounds(availableSize, this.legendBounds, legend);
        this.getLocation(this.position, legend.alignment, this.legendBounds, rect, availableSize);
    }
    /**
     * To find legend alignment for chart and accumulation chart
     */
    private alignLegend(start: number, size: number, legendSize: number, alignment: Alignment): number {
        switch (alignment) {
            case 'Far':
                start = (size - legendSize) - start;
                break;
            case 'Center':
                start = ((size - legendSize) / 2);
                break;
        }
        return start;
    }
    /**
     * To find legend location based on position, alignment for chart and accumulation chart
     */
    private getLocation(position: LegendPosition, alignment: Alignment, legendBounds: Rect, rect: Rect, availableSize: Size): void {
        let padding: number = this.legend.border.width;
        let legendHeight: number = legendBounds.height + padding + this.legend.margin.top + this.legend.margin.bottom;
        let legendWidth: number = legendBounds.width + padding + this.legend.margin.left + this.legend.margin.right;
        let marginBottom: number = this.gauge.margin.bottom;
        if (position === 'Bottom') {
            legendBounds.x = this.alignLegend(legendBounds.x, availableSize.width, legendBounds.width, alignment);
            legendBounds.y = rect.y + (rect.height - legendHeight) + padding + this.legend.margin.top;
            this.subtractThickness(rect, 0, 0, 0, legendHeight);
        } else if (position === 'Top') {
            legendBounds.x = this.alignLegend(legendBounds.x, availableSize.width, legendBounds.width, alignment);
            legendBounds.y = rect.y + padding + this.legend.margin.top;
            this.subtractThickness(rect, 0, 0, legendHeight, 0);
        } else if (position === 'Right') {
            legendBounds.x = rect.x + (rect.width - legendBounds.width) + this.legend.margin.right;
            legendBounds.y = rect.y + this.alignLegend(
                0, availableSize.height - (rect.y + marginBottom), legendBounds.height, alignment
            );
            this.subtractThickness(rect, 0, legendWidth, 0, 0);
        } else {
            legendBounds.x = legendBounds.x + this.legend.margin.left;
            legendBounds.y = rect.y + this.alignLegend(
                0, availableSize.height - (rect.y + marginBottom), legendBounds.height, alignment
            );
            this.subtractThickness(rect, legendWidth, 0, 0, 0);
        }
    }
    /**
     * Renders the legend.
     * @return {void}
     * @private
     */
    public renderLegend(legend: LegendSettingsModel, legendBounds: Rect, redraw?: boolean
    ): void {
        let firstLegend: number = this.findFirstLegendPosition(this.legendCollection);
        let padding: number = legend.padding;
        this.legendRegions = [];
        this.maxItemHeight = Math.max(this.legendCollection[0].textSize.height, legend.shapeHeight);
        let legendGroup: Element = this.gauge.renderer.createGroup({ id: this.legendID + '_g' });
        let legendTranslateGroup: Element = this.createLegendElements(legendBounds, legendGroup, legend, this.legendID, redraw);
        if (firstLegend !== this.legendCollection.length) {
            this.totalPages = 0;
            let legendAxisGroup: Element; // legendItem group for each series group element
            let start: GaugeLocation; // starting shape center x,y position && to resolve lint error used new line for declaration
            start = new GaugeLocation(
                legendBounds.x + padding + (legend.shapeWidth / 2), legendBounds.y + padding + this.maxItemHeight / 2
            );
            let textOptions: TextOption = new TextOption('', start.x, start.y, 'start');
            let textPadding: number = (2 * legend.shapePadding) + (2 * padding) + legend.shapeWidth;
            let count: number = 0;
            this.pageXCollections = [];
            this.legendCollection[firstLegend].location = start;
            let previousLegend: LegendOptions = this.legendCollection[firstLegend];
            for (let legendOption of this.legendCollection) {
                if (legendOption.render && legendOption.text !== '') {
                    legendAxisGroup = this.gauge.renderer.createGroup({
                        id: this.legendID + '_g_' + count
                    });
                    this.getRenderPoint(legendOption, start, textPadding, previousLegend, legendBounds, count, firstLegend);

                    this.renderSymbol(legendOption, legendAxisGroup, legendOption.axisIndex, legendOption.rangeIndex);

                    this.renderText(legendOption, legendAxisGroup, textOptions, legendOption.axisIndex, legendOption.rangeIndex);

                    if (legendAxisGroup) {
                        legendAxisGroup.setAttribute(
                            'style', 'cursor: ' + ((!legend.toggleVisibility) ? 'auto' : 'pointer'));
                    }

                    if (legendTranslateGroup) {
                        legendTranslateGroup.appendChild(legendAxisGroup);
                    }
                    previousLegend = legendOption;
                }
                count++;
            }
            if (this.isPaging) {
                this.renderPagingElements(legendBounds, textOptions, legendGroup);
            } else {
                this.totalPages = 1;
            }
        }
        this.appendChildElement(this.gauge.svgObject, legendGroup, redraw);
        this.setStyles(this.toggledIndexes);
    }
    /**
     * To render legend paging elements for chart and accumulation chart
     */
    private renderPagingElements(bounds: Rect, textOption: TextOption, legendGroup: Element): void {
        let paginggroup: Element = this.gauge.renderer.createGroup({ id: this.legendID + '_navigation' });
        this.pagingRegions = [];
        legendGroup.appendChild(paginggroup);
        let grayColor: string = '#545454';
        let legend: LegendSettingsModel = this.gauge.legendSettings; // to solve parameter lint error, legend declaration is here
        let padding: number = 8; // const padding for paging elements
        if (!this.isVertical) {
            this.totalPages = Math.ceil(this.totalPages / Math.max(1, this.rowCount - 1));
        } else {
            this.totalPages = Math.ceil(this.totalPages / this.maxColumns);
        }
        let symbolOption: PathOption = new PathOption(this.legendID + '_pageup', 'transparent', 5, grayColor, 1, '', '');
        let iconSize: number = this.pageButtonSize;
        if (paginggroup) {
            paginggroup.setAttribute('style', 'cursor: pointer');
        }
        // Page left arrow drawing calculation started here
        this.clipPathHeight = (this.rowCount - 1) * (this.maxItemHeight + legend.padding);
        this.clipRect.setAttribute('height', this.clipPathHeight.toString());
        let x: number = bounds.x + iconSize / 2;
        let y: number = bounds.y + this.clipPathHeight + ((bounds.height - this.clipPathHeight) / 2);
        let size: Size = measureText(this.totalPages + '/' + this.totalPages, legend.textStyle);
        appendPath(
            calculateShapes(
                { x: x, y: y }, 'LeftArrow', new Size(iconSize, iconSize),
                '', symbolOption
            ),
            paginggroup, this.gauge, 'Path'
        );
        this.pagingRegions.push(new Rect(
            x + bounds.width - (2 * (iconSize + padding) + padding + size.width) - iconSize * 0.5,
            y - iconSize * 0.5, iconSize, iconSize)
        );
        // Page numbering rendering calculation started here
        textOption.x = x + (iconSize / 2) + padding;
        textOption.y = y + (size.height / 4);
        textOption.id = this.legendID + '_pagenumber';
        textOption.text = '1/' + this.totalPages;
        let pageTextElement: Element =
            textElement(textOption, legend.textStyle, legend.textStyle.color || this.gauge.themeStyle.labelColor, paginggroup);
        x = (textOption.x + padding + (iconSize / 2) + size.width);
        symbolOption.id = this.legendID + '_pagedown';
        appendPath(
            calculateShapes(
                { x: x, y: y }, 'RightArrow', new Size(iconSize, iconSize),
                '', symbolOption
            ),
            paginggroup, this.gauge, 'Path'
        );
        this.pagingRegions.push(new Rect(
            x + (bounds.width - (2 * (iconSize + padding) + padding + size.width) - iconSize * 0.5),
            y - iconSize * 0.5, iconSize, iconSize
        ));
        //placing the navigation buttons and page numbering in legend right corner
        paginggroup.setAttribute('transform', 'translate(' + (bounds.width - (2 * (iconSize + padding) +
            padding + size.width)) + ', ' + 0 + ')');
        this.translatePage(pageTextElement, this.currentPage - 1, this.currentPage);
    }
    /**
     * To translate legend pages for chart and accumulation chart
     */
    protected translatePage(pagingText: Element, page: number, pageNumber: number): number {
        let size: number = (this.clipPathHeight) * page;
        let translate: string = 'translate(0,-' + size + ')';
        if (this.isVertical) {
            let pageLength: number = page * this.maxColumns;
            size = this.pageXCollections[page * this.maxColumns] - this.legendBounds.x;
            size = size < 0 ? 0 : size; // to avoid small pixel variation
            translate = 'translate(-' + size + ',0)';
        }
        this.legendTranslateGroup.setAttribute('transform', translate);
        pagingText.textContent = (pageNumber) + '/' + this.totalPages;
        this.currentPage = pageNumber;
        return size;
    }
    /**
     * To render legend text for chart and accumulation chart
     */
    protected renderText(
        legendOption: LegendOptions, group: Element, textOptions: TextOption,
        axisIndex: number, rangeIndex: number
    ): void {
        let legend: LegendSettingsModel = this.gauge.legendSettings;
        let hiddenColor: string = '#D3D3D3';
        textOptions.id = this.legendID + '_Axis_' + axisIndex + '_text_' + rangeIndex;
        let fontcolor: string = legendOption.visible ? legend.textStyle.color || this.gauge.themeStyle.labelColor : hiddenColor;
        textOptions.text = legendOption.text;
        textOptions.x = legendOption.location.x + (legend.shapeWidth / 2) + legend.shapePadding;
        textOptions.y = legendOption.location.y + this.maxItemHeight / 4;
        let element: Element =
            textElement(textOptions, legend.textStyle, fontcolor, group, '');
    }
    /**
     * To render legend symbols for chart and accumulation chart
     */
    protected renderSymbol(legendOption: LegendOptions, group: Element, axisIndex: number, rangeIndex: number): void {
        legendOption.fill = legendOption.fill ? legendOption.fill : (this.gauge.axes[axisIndex].ranges[rangeIndex] as Range).rangeColor;
        appendPath(
            calculateShapes(
                legendOption.location, legendOption.shape, new Size(legendOption.shapeWidth, legendOption.shapeHeight),
                '', new PathOption(
                    this.legendID + '_Axis_' + axisIndex + '_Shape_' + rangeIndex, legendOption.fill,
                    legendOption.shapeBorder.width, legendOption.shapeBorder.color, null, '0', '', ''
                )
            ),
            group, this.gauge,
            legendOption.shape === 'Circle' ? 'Ellipse' : 'Path');
    }
    /**
     * To find legend rendering locations from legend options.
     * @private
     */
    public getRenderPoint(
        legendOption: LegendOptions, start: GaugeLocation, textPadding: number, prevLegend: LegendOptions,
        rect: Rect, count: number, firstLegend: number
    ): void {
        let padding: number = this.legend.padding;
        if (this.isVertical) {
            if (count === firstLegend || (prevLegend.location.y + (this.maxItemHeight * 1.5) + (padding * 2) > rect.y + rect.height)) {
                legendOption.location.x = prevLegend.location.x + ((count === firstLegend) ? 0 : this.maxColumnWidth);
                legendOption.location.y = start.y;
                this.pageXCollections.push(legendOption.location.x - (this.legend.shapeWidth / 2) - padding);
                this.totalPages++;
            } else {
                legendOption.location.x = prevLegend.location.x;
                legendOption.location.y = prevLegend.location.y + this.maxItemHeight + padding;
            }
        } else {
            let previousBound: number = (prevLegend.location.x + textPadding + prevLegend.textSize.width);
            if ((previousBound + (legendOption.textSize.width + textPadding)) > (rect.x + rect.width + this.legend.shapeWidth / 2)) {
                legendOption.location.y = (count === firstLegend) ? prevLegend.location.y :
                    prevLegend.location.y + this.maxItemHeight + padding;
                legendOption.location.x = start.x;
            } else {
                legendOption.location.y = prevLegend.location.y;
                legendOption.location.x = (count === firstLegend) ? prevLegend.location.x : previousBound;
            }
            this.totalPages = this.totalRowCount;
        }
        let availablewidth: number = this.getAvailWidth(legendOption.location.x, this.legendBounds.width, this.legendBounds.x);
        legendOption.text = textTrim(+availablewidth.toFixed(4), legendOption.text, this.legend.textStyle);
    }
    /**
     * To show or hide the legend on clicking the legend.
     * @return {void}
     */
    public click(event: Event): void {
        let targetId: string = (<HTMLElement>event.target).id;
        let legendItemsId: string[] = ['_text_', '_Shape_'];
        let index: Index;
        let toggledIndex: number = -1;
        if (targetId.indexOf(this.legendID) > -1) {
            for (let id of legendItemsId) {
                if (targetId.indexOf(id) > -1) {
                    let axisIndex: number = parseInt(targetId.split(this.legendID + '_Axis_')[1].split(id)[0], 10);
                    let rangeIndex: number = parseInt(targetId.split(this.legendID + '_Axis_')[1].split(id)[1], 10);
                    if (this.gauge.legendSettings.toggleVisibility && !isNaN(rangeIndex)) {
                        let legendOption: LegendOptions = this.legendByIndex(axisIndex, rangeIndex, this.legendCollection);
                        index = new Index(axisIndex, rangeIndex, !legendOption.render);
                        if (this.toggledIndexes.length === 0) {
                            this.toggledIndexes.push(index);
                        } else {
                            for (let i: number = 0; i < this.toggledIndexes.length; i++) {
                                if (this.toggledIndexes[i].axisIndex === index.axisIndex &&
                                    this.toggledIndexes[i].rangeIndex === index.rangeIndex) {
                                    toggledIndex = i;
                                    break;
                                } else {
                                    toggledIndex = -1;
                                }
                            }
                            if (toggledIndex === -1) {
                                this.toggledIndexes.push(index);
                            } else {
                                this.toggledIndexes[toggledIndex].isToggled = !this.toggledIndexes[toggledIndex].isToggled;
                            }
                        }
                        this.setStyles(this.toggledIndexes);
                    }
                }
            }
        }
        if (targetId.indexOf(this.legendID + '_pageup') > -1) {
            this.changePage(event, true);
        } else if (targetId.indexOf(this.legendID + '_pagedown') > -1) {
            this.changePage(event, false);
        }
    }
    /**
     * Set toggled legend styles.
     */
    private setStyles(toggledIndexes: Index[]): void {
        for (let i: number = 0; i < toggledIndexes.length; i++) {
            let rangeID: string = this.gauge.element.id + '_Axis_' + toggledIndexes[i].axisIndex + '_Range_' + toggledIndexes[i].rangeIndex;
            let shapeID: string = this.legendID + '_Axis_' + toggledIndexes[i].axisIndex + '_Shape_' + toggledIndexes[i].rangeIndex;
            let textID: string = this.legendID + '_Axis_' + toggledIndexes[i].axisIndex + '_text_' + toggledIndexes[i].rangeIndex;
            let rangeElement: HTMLElement = this.gauge.svgObject.querySelector('#' + rangeID);
            let shapeElement: HTMLElement = this.gauge.svgObject.querySelector('#' + shapeID);
            let textElement: HTMLElement = this.gauge.svgObject.querySelector('#' + textID);
            if (toggledIndexes[i].isToggled) {
                rangeElement.style.visibility = 'visible';
                shapeElement.setAttribute('fill', this.legendCollection[toggledIndexes[i].rangeIndex].fill);
                textElement.setAttribute('fill', this.legend.textStyle.color || this.gauge.themeStyle.labelColor);
            } else {
                let hiddenColor: string = '#D3D3D3';
                rangeElement.style.visibility = 'hidden';
                shapeElement.setAttribute('fill', hiddenColor);
                textElement.setAttribute('fill', hiddenColor);
            }
        }
    }
    /**
     * To get legend by index
     */
    private legendByIndex(axisIndex: number, rangeIndex: number, legendCollections: LegendOptions[]): LegendOptions {
        for (let legend of legendCollections) {
            if (legend.axisIndex === axisIndex && legend.rangeIndex === rangeIndex) {
                return legend;
            }
        }
        return null;
    }
    /**
     * To change legend pages for chart and accumulation chart
     */
    protected changePage(event: Event, pageUp: boolean): void {
        let pageText: Element = document.getElementById(this.legendID + '_pagenumber');
        let page: number = parseInt(pageText.textContent.split('/')[0], 10);
        if (pageUp && page > 1) {
            this.translatePage(pageText, (page - 2), (page - 1));
        } else if (!pageUp && page < this.totalPages) {
            this.translatePage(pageText, page, (page + 1));
        }
    }
    /**
     * To find available width from legend x position.
     */
    private getAvailWidth(tx: number, width: number, legendX: number): number {
        if (this.isVertical) {
            width = this.maxWidth;
        }
        return width - ((this.legend.padding * 2) + this.legend.shapeWidth + this.legend.shapePadding);
    }
    /**
     * To create legend rendering elements for chart and accumulation chart
     */
    private createLegendElements(
        legendBounds: Rect, legendGroup: Element, legend: LegendSettingsModel,
        id: string, redraw?: boolean
    ): Element {
        let padding: number = legend.padding;
        let options: RectOption = new RectOption(id + '_element', legend.background, legend.border, legend.opacity, legendBounds);
        options.width = this.isVertical ? this.maxWidth : legendBounds.width;
        legendGroup ? legendGroup.appendChild(this.gauge.renderer.drawRectangle(options)) : this.gauge.renderer.drawRectangle(options);
        let legendItemsGroup: Element = this.gauge.renderer.createGroup({ id: id + '_collections' });
        legendGroup.appendChild(legendItemsGroup);
        this.legendTranslateGroup = this.gauge.renderer.createGroup({ id: id + '_translate_g' });
        legendItemsGroup.appendChild(this.legendTranslateGroup);
        let clippath: Element = this.gauge.renderer.createClipPath({ id: id + '_clipPath' });
        options.id += '_clipPath_rect';
        options.width = this.isVertical ? options.width - padding : options.width;
        this.clipRect = this.gauge.renderer.drawRectangle(options);
        clippath.appendChild(this.clipRect);
        this.appendChildElement(this.gauge.svgObject, clippath, redraw);
        legendItemsGroup.setAttribute('style', 'clip-path:url(#' + clippath.id + ')');
        return this.legendTranslateGroup;
    }
    /**
     * Method to append child element
     */
    private appendChildElement(
        parent: Element | HTMLElement, childElement: Element | HTMLElement,
        redraw?: boolean, isAnimate: boolean = false, x: string = 'x', y: string = 'y',
        start?: GaugeLocation, direction?: string, forceAnimate: boolean = false,
        isRect: boolean = false, previousRect: Rect = null, animateDuration?: number
    ): void {
        let existChild: HTMLElement = parent.querySelector('#' + childElement.id);
        let element: HTMLElement = <HTMLElement>(existChild || getElement(childElement.id));
        let child: HTMLElement = <HTMLElement>childElement;
        let duration: number = animateDuration ? animateDuration : 300;
        if (existChild) {
            parent.replaceChild(child, element);
        } else {
            parent.appendChild(child);
        }
    }
    /**
     * To find first valid legend text index for chart and accumulation chart
     */
    private findFirstLegendPosition(legendCollection: LegendOptions[]): number {
        let count: number = 0;
        for (let legend of legendCollection) {
            if (legend.render && legend.text !== '') {
                break;
            }
            count++;
        }
        return count;
    }
    /**
     * To find legend bounds for accumulation chart.
     * @private
     */
    public getLegendBounds(availableSize: Size, legendBounds: Rect, legend: LegendSettingsModel): void {
        let extraWidth: number = 0;
        let extraHeight: number = 0;
        let padding: number = legend.padding;
        if (!this.isVertical) {
            extraHeight = !legend.height ? ((availableSize.height / 100) * 5) : 0;
        } else {
            extraWidth = !legend.width ? ((availableSize.width / 100) * 5) : 0;
        }
        legendBounds.width += extraWidth;
        legendBounds.height += extraHeight;
        let maximumWidth: number = 0;
        let rowWidth: number = 0;
        let rowCount: number = 0;
        let columnWidth: number[] = [];
        let columnHeight: number = 0;
        let legendWidth: number = 0;
        this.maxItemHeight = Math.max(measureText('MeasureText', legend.textStyle).height, legend.shapeHeight);
        let legendEventArgs: ILegendRenderEventArgs;
        let render: boolean = false;
        for (let legendOption of this.legendCollection) {
            legendEventArgs = {
                fill: legendOption.fill, text: legendOption.text, shape: legendOption.shape,
                name: 'legendRender', cancel: false
            };
            this.gauge.trigger('legendRender', legendEventArgs);
            legendOption.render = !legendEventArgs.cancel;
            legendOption.text = legendEventArgs.text;
            legendOption.fill = legendEventArgs.fill;
            legendOption.shape = legendEventArgs.shape;
            legendOption.textSize = measureText(legendOption.text, legend.textStyle);
            if (legendOption.render && legendOption.text !== '') {
                render = true;
                legendWidth = legend.shapeWidth + (2 * legend.shapePadding) + legendOption.textSize.width + (2 * padding);
                if (this.isVertical) {
                    ++rowCount;
                    columnHeight = (rowCount * (this.maxItemHeight + padding)) + padding;
                    if ((rowCount * (this.maxItemHeight + padding)) + padding > legendBounds.height) {
                        columnHeight = Math.max(columnHeight, (rowCount * (this.maxItemHeight + padding)) + padding);
                        rowWidth = rowWidth + maximumWidth;
                        columnWidth.push(maximumWidth);
                        this.totalPages = Math.max(rowCount, this.totalPages || 1);
                        maximumWidth = 0;
                        rowCount = 1;
                    }
                    maximumWidth = Math.max(legendWidth, maximumWidth);
                } else {
                    rowWidth = rowWidth + legendWidth;
                    if (legendBounds.width < (padding + rowWidth)) {
                        maximumWidth = Math.max(maximumWidth, (rowWidth + padding - legendWidth));
                        if (rowCount === 0 && (legendWidth !== rowWidth)) {
                            rowCount = 1;
                        }
                        rowWidth = legendWidth;
                        rowCount++;
                        columnHeight = (rowCount * (this.maxItemHeight + padding)) + padding;
                    }
                }
            }
        }
        if (this.isVertical) {
            rowWidth = rowWidth + maximumWidth;
            this.isPaging = legendBounds.width < (rowWidth + padding);
            columnHeight = Math.max(columnHeight, ((this.totalPages || 1) * (this.maxItemHeight + padding)) + padding);
            this.isPaging = this.isPaging && (this.totalPages > 1);
            if (columnWidth[columnWidth.length - 1] !== maximumWidth) {
                columnWidth.push(maximumWidth);
            }
        } else {
            this.isPaging = legendBounds.height < columnHeight;
            this.totalPages = this.totalRowCount = rowCount;
            columnHeight = Math.max(columnHeight, (this.maxItemHeight + padding) + padding);
        }
        this.maxColumns = 0; // initialization for max columns
        let width: number = this.isVertical ? this.getMaxColumn(columnWidth, legendBounds.width, padding, rowWidth + padding) :
            Math.max(rowWidth + padding, maximumWidth);
        if (render) { // if any legends not skipped in event check
            this.setBounds(width, columnHeight, legend, legendBounds);
        } else {
            this.setBounds(0, 0, legend, legendBounds);
        }
    }
    /** @private */
    private subtractThickness(rect: Rect, left: number, right: number, top: number, bottom: number): Rect {
        rect.x += left;
        rect.y += top;
        rect.width -= left + right;
        rect.height -= top + bottom;
        return rect;
    }
    /**
     * To set bounds for chart and accumulation chart
     */
    protected setBounds(computedWidth: number, computedHeight: number, legend: LegendSettingsModel, legendBounds: Rect): void {
        computedWidth = computedWidth < legendBounds.width ? computedWidth : legendBounds.width;
        computedHeight = computedHeight < legendBounds.height ? computedHeight : legendBounds.height;
        legendBounds.width = !legend.width ? computedWidth : legendBounds.width;
        legendBounds.height = !legend.height ? computedHeight : legendBounds.height;
        this.rowCount = Math.max(1, Math.ceil((legendBounds.height - legend.padding) / (this.maxItemHeight + legend.padding)));
    }
    /**
     * To find maximum column size for legend
     */
    private getMaxColumn(columns: number[], width: number, padding: number, rowWidth: number): number {
        let maxPageColumn: number = padding;
        this.maxColumnWidth = Math.max.apply(null, columns);
        for (let column of columns) {
            maxPageColumn += this.maxColumnWidth;
            this.maxColumns++;
            if (maxPageColumn + padding > width) {
                maxPageColumn -= this.maxColumnWidth;
                this.maxColumns--;
                break;
            }
        }
        this.isPaging = (maxPageColumn < rowWidth) && (this.totalPages > 1);
        if (maxPageColumn === padding) {
            maxPageColumn = width;
        }
        this.maxColumns = Math.max(1, this.maxColumns);
        this.maxWidth = maxPageColumn;
        return maxPageColumn;
    }
    /**
     * To show or hide trimmed text tooltip for legend.
     * @return {void}
     * @private
     */
    public move(event: Event): void {
        let x: number = this.gauge.mouseX;
        let y: number = this.gauge.mouseY;
        let targetId: string = (<HTMLElement>event.target).id;
        if ((<HTMLElement>event.target).textContent.indexOf('...') > -1 && targetId.indexOf('_gauge_legend_') > -1) {
            let axisIndex: number = parseInt(targetId.split(this.gauge.element.id + '_gauge_legend_Axis_')[1].split('_text_')[0], 10);
            let rangeIndex: number = parseInt(targetId.split(this.gauge.element.id + '_gauge_legend_Axis_')[1].split('_text_')[1], 10);
            let text: string = '';
            for ( let legends of this.legendCollection) {
                 if (legends.rangeIndex === rangeIndex && legends.axisIndex === axisIndex) {
                    text = legends.originalText;
                 }
            }
            showTooltip(
                text, x, y, this.gauge.element.offsetWidth, this.gauge.element.id + '_EJ2_Legend_Tooltip',
                getElement(this.gauge.element.id + '_Secondary_Element')
            );
        } else {
            removeElement(this.gauge.element.id + '_EJ2_Legend_Tooltip');
        }
    }
    /**
     * Get module name.
     */
    protected getModuleName(): string {
        return 'Legend';
    }

    /**
     * To destroy the legend.
     * @return {void}
     * @private
     */
    public destroy(circulargauge: CircularGauge): void {
        /**
         * Destroy method performed here
         */
        this.removeEventListener();
    }
}
/**
 * @private
 */
export class Index {
    public axisIndex: number;
    public rangeIndex: number;
    public isToggled: boolean;
    constructor(axisIndex: number, rangeIndex?: number, isToggled?: boolean) {
        this.axisIndex = axisIndex;
        this.rangeIndex = rangeIndex;
        this.isToggled = isToggled;
    }
}
/**
 * Class for legend options
 * @private
 */
export class LegendOptions {
    public render: boolean;
    public text: string;
    public originalText: string;
    public fill: string;
    public shape: GaugeShape;
    public visible: boolean;
    public textSize: Size;
    public location: GaugeLocation = { x: 0, y: 0 };
    public border: Border;
    public shapeBorder: Border;
    public shapeWidth: number;
    public shapeHeight: number;
    public rangeIndex?: number;
    public axisIndex?: number;
    constructor(
        text: string, originalText: string, fill: string, shape: GaugeShape, visible: boolean, border: Border, shapeBorder: Border,
        shapeWidth: number, shapeHeight: number, rangeIndex?: number, axisIndex?: number
    ) {
        this.text = text;
        this.originalText = originalText;
        this.fill = fill;
        this.shape = shape;
        this.visible = visible;
        this.border = border;
        this.shapeBorder = shapeBorder;
        this.shapeWidth = shapeWidth;
        this.shapeHeight = shapeHeight;
        this.rangeIndex = rangeIndex;
        this.axisIndex = axisIndex;
    }
}