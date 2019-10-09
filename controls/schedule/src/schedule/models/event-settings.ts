import { Property, ChildProperty, Complex } from '@syncfusion/ej2-base';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { Field } from './fields';
import { FieldModel } from './fields-model';

/**  
 * Holds the configuration of event related options and dataSource binding to Schedule.
 */
export class EventSettings extends ChildProperty<EventSettings> {
    /** 
     * It accepts either the string or HTMLElement as template design content and parse it appropriately before displaying
     *  it onto the event background. All the event fields mapped to Schedule from dataSource can be accessed within this template code.
     * {% codeBlock src="schedule/event-template-api/index.ts" %}{% endcodeBlock %}
     * @default null
     */
    @Property()
    public template: string;

    /**    
     * With this property, the event data will be bound to Schedule.
     * The event data can be passed either as an array of JavaScript objects, 
     * or else can create an instance of [`DataManager`](http://ej2.syncfusion.com/documentation/data/api-dataManager.html)
     * in case of processing remote data and can be assigned to the `dataSource` property. 
     * With the remote data assigned to dataSource, check the available
     *  [adaptors](http://ej2.syncfusion.com/documentation/data/adaptors.html) to customize the data processing. 
     * @default []
     * @isGenericType true
     */
    @Property([])
    public dataSource: Object[] | DataManager;

    /**    
     * Defines the external [`query`](http://ej2.syncfusion.com/documentation/data/api-query.html) 
     * that will be executed along with the data processing.    
     * @default null    
     */
    @Property()
    public query: Query;

    /**    
     * Defines the collection of default event fields to be bind to the Schedule. 
     * @default null    
     */
    @Complex<FieldModel>({}, Field)
    public fields: FieldModel;

    /**
     * When set to `true` will display the normal tooltip over the events with its subject, location, start and end time.
     * @default false
     */
    @Property(false)
    public enableTooltip: boolean;

    /**
     * It accepts either the string or HTMLElement as template design content and parse it appropriately before displaying it onto tooltip.
     *  All the event fields mapped with Schedule dataSource can be accessed within this template code.
     * {% codeBlock src="schedule/tooltip-template-api/index.ts" %}{% endcodeBlock %}
     * @default null
     */
    @Property()
    public tooltipTemplate: string;

    /**
     * Defines the resource name, to decides the color of which particular resource level is to be applied on appointments, when
     *  grouping is enabled on scheduler.
     * {% codeBlock src="schedule/resource-color-field-api/index.ts" %}{% endcodeBlock %}
     * @default null
     */
    @Property()
    public resourceColorField: string;

    /**
     * When set to `true` will edit the future events only instead of editing entire series.
     * @default false
     */
    @Property(false)
    public editFollowingEvents: boolean;

    /**
     * When set to `false` the add action will be restricted.
     * @default true
     */
    @Property(true)
    public allowAdding: boolean;

    /**
     * When set to `false` the edit action will be restricted.
     * @default true
     */
    @Property(true)
    public allowEditing: boolean;

    /**
     * When set to `false` the delete action will be restricted.
     * @default true
     */
    @Property(true)
    public allowDeleting: boolean;

}