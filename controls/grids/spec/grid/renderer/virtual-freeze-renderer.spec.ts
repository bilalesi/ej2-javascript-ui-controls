/**
 * Virtual freeze renderer spec
 */
import { Grid } from '../../../src/grid/base/grid';
import { Freeze } from '../../../src/grid/actions/freeze';
import { VirtualScroll } from '../../../src/grid/actions/virtual-scroll';
import { createGrid, destroy } from '../base/specutil.spec';
import { getTransformValues } from '../../../src/grid/base/util';
import { NotifyArgs, IGrid } from '../../../src/grid/base/interface';
import { Row } from '../../../src/grid/models/row';
import { Column } from '../../../src/grid/models/column';
import { EmitType, createElement, extend } from '@syncfusion/ej2-base';
import { GridModel } from '../../../src/grid/base/grid-model';

Grid.Inject(Freeze, VirtualScroll);

let ctr: number = 0;
let count500: string[] = Array.apply(null, Array(5)).map(() => 'Column' + ++ctr + '');
let count5000: string[] = Array.apply(null, Array(500)).map(() => 'Column' + ++ctr + '');
let data1: Object[] = (() => {
    let arr: Object[] = [];
    for (let i: number = 0, o: Object = {}, j: number = 0; i < 1000; i++ , j++ , o = {}) {
        count500.forEach((lt: string) => o[lt] = 'Column' + lt + 'Row' + i);
        arr[j] = o;
    }
    return arr;
})();

let data2: Object[] = (() => {
    let arr: Object[] = [];
    for (let i: number = 0, o: Object = {}, j: number = 0; i < 1000; i++ , j++ , o = {}) {
        count5000.forEach((lt: string) => o[lt] = 'Column' + lt + 'Row' + i);
        arr[j] = o;
    }
    return arr;
})();

let createGrid1: Function = (options: GridModel, done: Function): Grid => {
    let grid: Grid;
    let div: HTMLElement = createElement('div', { id: 'Grid' });
    document.body.appendChild(div);
    grid = new Grid(
        extend(
            {}, {
                
            },
            options
        ),
    );
    grid.appendTo(div);
    return grid;
};

let destroy1: EmitType<Object> = (grid: Grid) => {
    if (grid) {
        grid.destroy();
        document.getElementById('Grid').remove();
    }
};

describe('Virtual-freeze-renderer --- row virtualization', () => {
    describe('Freeze Column', () => {
        let gridObj: any;
        let fCont: HTMLElement;
        let mCont: HTMLElement;
        let mHdr: HTMLElement;
        let fHdr: HTMLElement;
        let mRowBeforeScroll: Element;
        let fRowBeforeScroll: Element;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    frozenColumns: 2,
                    enableVirtualization: true,
                    height: 400,
                    columns: count5000
                }, done);
        });

        it('Collect html elements', () => {
            fCont = gridObj.getContent().querySelector('.e-frozencontent');
            mCont = gridObj.getContent().querySelector('.e-movablecontent');
            mHdr = gridObj.getHeaderContent().querySelector('.e-movableheader');
            fHdr = gridObj.getHeaderContent().querySelector('.e-movableheader');
            fRowBeforeScroll = fCont.querySelector('.e-row');
            mRowBeforeScroll = mCont.querySelector('.e-row');
        });

        it('Frozen column testing', () => {
            expect(fCont.querySelector('.e-row').children.length).toBe(gridObj.frozenColumns);
            let colsLength: number = gridObj.getColumns().length;
            expect(mCont.querySelector('.e-row').children.length).toBe(colsLength - gridObj.frozenColumns);
        });

        it('Ensure tables, virtualtracks and its count', () => {
            expect(fCont.querySelectorAll('.e-virtualtable').length).toBe(1);
            expect(mCont.querySelectorAll('.e-virtualtable').length).toBe(1);
            expect(mHdr.querySelector('.e-virtualtable')).toBeNull();
            expect(fHdr.querySelector('.e-virtualtable')).toBeNull();
            expect(fCont.querySelectorAll('.e-virtualtrack').length).toBe(1);
            expect(mCont.querySelectorAll('.e-virtualtrack').length).toBe(1);
            expect(mHdr.querySelector('.e-virtualtrack')).toBeNull();
            expect(fHdr.querySelector('.e-virtualtrack')).toBeNull();
        });

        it('Ensure rows and its count', () => {
            expect(fCont.querySelectorAll('.e-row').length).toBe(mCont.querySelectorAll('.e-row').length);
            expect(fCont.querySelector('.e-row')).not.toBe(mCont.querySelector('.e-row'));
        });

        it('Ensure transform values before scroll', () => {
            let mVTblTrans: { width: number, height: number } = getTransformValues(mCont.firstElementChild);
            let fVTblTrans: { width: number, height: number } = getTransformValues(fCont.firstElementChild);
            expect(mVTblTrans.height).toBe(0);
            expect(fVTblTrans.height).toBe(0);
        });

        it('Ensure position absolute', () => {
            expect((mCont.firstElementChild as HTMLElement).style.position).toBe("");
            expect((fCont.firstElementChild as HTMLElement).style.position).toBe("");
        });

        it('Perform scrolling', (done: Function) => {
            gridObj.dataBound = function () {
                let fcnt: Element = gridObj.getContent().querySelector('.e-frozencontent');
                expect(fcnt.querySelectorAll('.e-row').length).toBe(mCont.querySelectorAll('.e-row').length);
                expect(fRowBeforeScroll).not.toBe(fcnt.querySelector('.e-row'));
                expect(mRowBeforeScroll).not.toBe(mCont.querySelector('.e-row'));
                expect(fcnt.querySelector('.e-row')).not.toBe(mCont.querySelector('.e-row'));
                gridObj.dataBound = null;
                done();
            },
                mCont.scrollTop = 300;
        });

        it('Ensure transform values before scroll', (done: Function) => {
            gridObj.dataBound = function () {
                let fcnt: Element = gridObj.getContent().querySelector('.e-frozencontent');
                let mcnt: Element = gridObj.getContent().querySelector('.e-movablecontent');
                let mVTblTrans: { width: number, height: number } = getTransformValues(mcnt.firstElementChild);
                let fVTblTrans: { width: number, height: number } = getTransformValues(fcnt.firstElementChild);
                expect(mVTblTrans.height).not.toBe(0);
                expect(fVTblTrans.height).not.toBe(0);
                expect(fVTblTrans.height).toBe(mVTblTrans.height);
                expect(fVTblTrans.width).toBe(0);
                expect(mVTblTrans.width).toBe(0);
                gridObj.dataBound = null;
                done();
            }
            mCont.scrollTop = 800;
        });

        it('Go to first page', (done: Function) => {
            gridObj.dataBound = function () {
                let fcnt: Element = gridObj.getContent().querySelector('.e-frozencontent');
                let mcnt: Element = gridObj.getContent().querySelector('.e-movablecontent');
                let mVTblTrans: { width: number, height: number } = getTransformValues(mcnt.firstElementChild);
                let fVTblTrans: { width: number, height: number } = getTransformValues(fcnt.firstElementChild);
                expect(mVTblTrans.height).not.toBe(0);
                expect(fVTblTrans.height).not.toBe(0);
                gridObj.dataBound = null;
                done();
            }
            mCont.scrollTop = 0;
        });

        afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('Freeze Row and Column', () => {
        let gridObj: any;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    frozenColumns: 2,
                    frozenRows: 2,
                    enableVirtualization: true,
                    height: 400,
                    columns: count5000
                }, done);
        });

        it('Change dynamically', () => {
            gridObj.dataBound = function (done: Function) {
                let fcnt: Element = gridObj.getContent().querySelector('.e-frozencontent');
                let mcnt: Element = gridObj.getContent().querySelector('.e-movablecontent');
                expect(fcnt.querySelector('.e-row').children.length).toBe(gridObj.frozenColumns);
                let colsLength: number = gridObj.getColumns().length;
                expect(mcnt.querySelector('.e-row').children.length).toBe(colsLength - gridObj.frozenColumns);
                let fHdr: Element = gridObj.getHeaderContent().querySelector('.e-frozenheader');
                let mHdr: Element = gridObj.getHeaderContent().querySelector('.e-movableheader');
                expect(fHdr.querySelectorAll('.e-row').length).toBe(gridObj.frozenRows);
                expect(mHdr.querySelectorAll('.e-row').length).toBe(gridObj.frozenRows);
                let mVTblTrans: { width: number, height: number } = getTransformValues(mcnt.firstElementChild);
                let fVTblTrans: { width: number, height: number } = getTransformValues(fcnt.firstElementChild);
                expect(mVTblTrans.height).not.toBe(0);
                expect(fVTblTrans.height).not.toBe(0);
                done();
            },
            gridObj.frozenColumns = 4;
            gridObj.frozenRows = 4;
        });

        afterAll(() => {
            destroy(gridObj);
        });
    });
    describe('Ensure new methods', () => {
        let gridObj: any;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    frozenColumns: 2,
                    frozenRows: 2,
                    enableVirtualization: true,
                    height: 400,
                    columns: count5000
                }, done);
        });

        it('Ensure getRowByIndex and getMovableRowByIndex methods', () => {
            let fcnt: Element = gridObj.getContent().querySelector('.e-frozencontent');
            let mcnt: Element = gridObj.getContent().querySelector('.e-movablecontent');
            let mRow1: Element = gridObj.contentModule.getMovableRowByIndex(gridObj.frozenRows);
            let mRow2: Element = mcnt.querySelectorAll('.e-row')[0];
            expect(mRow1).toBe(mRow2);
            let fRow1: Element = gridObj.contentModule.getRowByIndex(gridObj.frozenRows);
            let fRow2: Element = fcnt.querySelectorAll('.e-row')[0];
            expect(fRow1).toBe(fRow2);
            expect((gridObj as IGrid).getFrozenVirtualContent()).not.toBeNull();
            expect((gridObj as IGrid).getMovableVirtualContent()).not.toBeNull();
        });

        it('Ensure generateRows method', () => {
            let notifyArgs: NotifyArgs = {
                focusElement: document.body, requestType: 'virtualscroll',
                virtualInfo: {
                    block: 1,
                    blockIndexes: [2, 3, 4],
                    columnIndexes: [],
                    direction: 'down', event: 'model-changed', loadNext: true, loadSelf: false, nextInfo: { page: 2 },
                    offsets: { top: 400, left: 0 },
                    page: 1,
                    sentinelInfo: { axis: 'Y', entered: true }
                }
            };
            let pageData: object = gridObj.dataSource.slice(0, 20);
            let len: number = Object.keys(gridObj.dataSource[0]).length;
            let rowObject: Row<Column>[] = gridObj.contentModule.generateRows(pageData, notifyArgs);
            expect(rowObject[0].cells.length).toBe(2);
            rowObject = gridObj.contentModule.generateRows(pageData, notifyArgs);
            expect(rowObject[0].cells.length).toBe(len - gridObj.frozenColumns);
        });

        it('Ensure new methods', () => {
            expect((gridObj as IGrid).getFrozenVirtualHeader()).not.toBeNull();
            expect((gridObj as IGrid).getMovableVirtualHeader()).not.toBeNull();
            expect(gridObj.contentModule.virtualRenderer.vgenerator.getRows()).not.toBeNull();
            expect(gridObj.contentModule.getMovableRows()).not.toBeNull();
            expect(gridObj.contentModule.getRows()).not.toBeNull();
        });

        afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('Column virtualization - before scroll', () => {
        let gridObj: any;
        let fCont: HTMLElement;
        let mCont: HTMLElement;
        let mHdr: HTMLElement;
        let fHdr: HTMLElement;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    columns: count5000,
                    frozenColumns: 2,
                    enableVirtualization: true,
                    enableColumnVirtualization: true,
                    height: 400
                },
                () => {
                    setTimeout(done, 100);
                }
            );
        });

        it('Collect html elements', () => {
            fCont = gridObj.getContent().querySelector('.e-frozencontent');
            mCont = gridObj.getContent().querySelector('.e-movablecontent');
            mHdr = gridObj.getHeaderContent().querySelector('.e-movableheader');
            fHdr = gridObj.getHeaderContent().querySelector('.e-movableheader');
        });

        it('Ensure tables, virtual tracks, cells and its count', () => {
            expect(fCont.querySelectorAll('.e-virtualtable').length).toBe(1);
            expect(mCont.querySelectorAll('.e-virtualtable').length).toBe(1);
            expect(mHdr.querySelectorAll('.e-virtualtable').length).toBe(1);
            expect(fHdr.querySelectorAll('.e-virtualtable').length).toBe(1);
            expect(fCont.querySelectorAll('.e-virtualtrack').length).toBe(1);
            expect(mCont.querySelectorAll('.e-virtualtrack').length).toBe(1);
            expect(mHdr.querySelectorAll('.e-virtualtrack').length).toBe(1);
            expect(fHdr.querySelectorAll('.e-virtualtrack').length).toBe(1);

            expect(fCont.querySelector('.e-row').children.length).toBe(gridObj.frozenColumns);
            let len: number = Object.keys(gridObj.dataSource[0]).length;
            expect(mCont.querySelector('.e-row').children.length).not.toBe(len);
        });

        it('Ensure transform value before scrolling', () => {
            let mVTblTrans: { width: number, height: number } = getTransformValues(mCont.firstElementChild);
            let fVTblTrans: { width: number, height: number } = getTransformValues(fCont.firstElementChild);
            expect(mVTblTrans.width).toBe(0);
            expect(fVTblTrans.width).toBe(0);
            expect(mVTblTrans.height).toBe(0);
            expect(fVTblTrans.height).toBe(0);
            expect(mCont.scrollLeft).toBe(0);
            expect(mCont.scrollTop).toBe(0);

        });        

        afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('Column virtualization - after scroll', () => {
        let gridObj: any;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    columns: count5000,
                    frozenColumns: 2,
                    enableColumnVirtualization: true,
                    enableVirtualization: true,
                    height: 400
                },
                () => {
                    gridObj.getContent().querySelector('.e-movablecontent').scrollLeft = 400;
                    setTimeout(done, 100);
                }
            );
        });

        it('Ensure tables transform value', () => {
            let fcnt: Element = gridObj.getContent().querySelector('.e-frozencontent');
            let mcnt: Element = gridObj.getContent().querySelector('.e-movablecontent');
            let mVTblTrans: { width: number, height: number } = getTransformValues(mcnt.firstElementChild);
            let fVTblTrans: { width: number, height: number } = getTransformValues(fcnt.firstElementChild);
            expect(fVTblTrans.height).toBe(0);
            expect(mVTblTrans.height).toBe(0);
            expect(fVTblTrans.width).toBe(0);
            expect(mVTblTrans.width).not.toBe(0);
        });
        
        it('Ensure frozen content after scrolled the content to x-axis - to resolve the coverage issue', function (done) {
            gridObj.dataBound = function(){
                expect(gridObj.pageSettings.currentPage).not.toBe(1);
                done();
            };
            gridObj.getContent().querySelector('.e-movablecontent').scrollTop = 800;
        });

        afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('Column virtualization - dynamically enable the isFrozen in Grid column', () => {
        let gridObj: any;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    columns: count5000,
                    enableColumnVirtualization: true,
                    enableVirtualization: true,
                    height: 400
                }, done);
        });

        it('Ensure isFrozen', () => {
            (gridObj.columns[1] as Column).isFrozen = true;
            gridObj.dataBound = function() {
                expect((gridObj as IGrid).getMovableVirtualContent()).not.toBeNull();
            };
        });
        afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('Frozen Rows and Columns with column vitualization', () => {
        let gridObj: any;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data2,
                    columns: count5000,
                    frozenColumns: 2,
                    frozenRows: 2,
                    enableColumnVirtualization: true,
                    enableVirtualization: true,
                    height: 400
                },
                () => {
                    gridObj.getContent().querySelector('.e-movablecontent').scrollLeft = 800;
                    setTimeout(done, 100);
                }
            );
        });

        it('Ensure Header row', function (done) {
            gridObj.dataBound = function () {
                let transform: { width: number, height: number } = getTransformValues(gridObj.getMovableVirtualContent().firstElementChild);
                expect(transform.height).not.toBe(0);
                expect(transform.width).not.toBe(0);
                done();
            };
            gridObj.getContent().querySelector('.e-movablecontent').scrollTop = 800;
        });
        afterAll(() => {
            destroy(gridObj);
        });
    });
});
