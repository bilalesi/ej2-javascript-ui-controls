import { Property, ChildProperty } from '@syncfusion/ej2-base';import { SelectionMode, CellSelectionMode, SelectionType, CheckboxSelectionType } from '@syncfusion/ej2-grids';

/**
 * Interface for a class SelectionSettings
 */
export interface SelectionSettingsModel {

    /**
     * TreeGrid supports row, cell, and both (row and cell) selection mode. 
     * @default Syncfusion.EJ2.Grids.SelectionMode.Row
     * @isEnumeration true
     * @aspType Syncfusion.EJ2.Grids.SelectionMode
     * @blazorType Syncfusion.EJ2.Blazor.Grids.SelectionMode
     */
    mode?: SelectionMode;

    /**
     * The cell selection modes are flow and box. It requires the selection 
     * [`mode`](#mode) to be either cell or both.
     * * `Flow`: Selects the range of cells between start index and end index that also includes the other cells of the selected rows.
     * * `Box`: Selects the range of cells within the start and end column indexes that includes in between cells of rows within the range.
     * @default Syncfusion.EJ2.Grids.CellSelectionMode.Flow
     * @isEnumeration true
     * @aspType Syncfusion.EJ2.Grids.CellSelectionMode
     * @blazorType Syncfusion.EJ2.Blazor.Grids.CellSelectionMode
     */
    cellSelectionMode?: CellSelectionMode;

    /**
     * Defines options for selection type. They are
     * * `Single`: Allows selection of only a row or a cell.
     * * `Multiple`: Allows selection of multiple rows or cells.
     * @default Syncfusion.EJ2.Grids.SelectionType.Single
     * @isEnumeration true
     * @aspType Syncfusion.EJ2.Grids.SelectionType
     * @blazorType Syncfusion.EJ2.Blazor.Grids.SelectionType
     */
    type?: SelectionType;

    /**
     * If 'persistSelection' set to true, then the TreeGrid selection is persisted on all operations.
     * For persisting selection in the TreeGrid, any one of the column should be enabled as a primary key.
     * @default false
     */
    persistSelection?: boolean;

    /**
     * Defines options for checkbox selection Mode. They are 
     * * `Default`: This is the default value of the checkboxMode. In this mode, user can select multiple rows by clicking rows one by one.
     * * `ResetOnRowClick`: In ResetOnRowClick mode, on clicking a row it will reset previously selected row and also multiple
     *  rows can be selected by using CTRL or SHIFT key.
     * @default Default 
     */
    checkboxMode?: CheckboxSelectionType;

    /**
     * If 'checkboxOnly' set to true, then the TreeGrid selection is allowed only through checkbox.
     * 
     * > To enable checkboxOnly selection, should specify the column type as `checkbox`.
     * @default false 
     */
    checkboxOnly?: boolean;

}