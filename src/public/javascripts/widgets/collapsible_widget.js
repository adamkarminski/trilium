import TabAwareWidget from "./tab_aware_widget.js";
import options from "../services/options.js";

const WIDGET_TPL = `
<div class="card widget">
    <div class="card-header">
        <div>           
            <button class="btn btn-sm widget-title" data-toggle="collapse" data-target="#[to be set]">
                Collapsible Group Item
            </button>
            
            <a class="widget-help external no-arrow bx bx-info-circle"></a>
        </div>
        
        <div class="widget-header-actions"></div>
    </div>

    <div id="[to be set]" class="collapse body-wrapper" style="transition: none; ">
        <div class="card-body"></div>
    </div>
</div>`;

export default class CollapsibleWidget extends TabAwareWidget {
    getWidgetTitle() { return "Untitled widget"; }

    getHeaderActions() { return []; }

    getHelp() { return {}; }

    doRender() {
        this.$widget = $(WIDGET_TPL);
        this.$widget.find('[data-target]').attr('data-target', "#" + this.componentId);

        this.$bodyWrapper = this.$widget.find('.body-wrapper');
        this.$bodyWrapper.attr('id', this.componentId); // for toggle to work we need id

        this.widgetName = this.constructor.name;

        if (!options.is(this.widgetName + 'Collapsed')) {
            this.$bodyWrapper.collapse("show");
        }

        // using immediate variants of the event so that the previous collapse is not caught
        this.$bodyWrapper.on('hide.bs.collapse', () => this.saveCollapsed(true));
        this.$bodyWrapper.on('show.bs.collapse', () => this.saveCollapsed(false));

        this.$body = this.$bodyWrapper.find('.card-body');

        this.$title = this.$widget.find('.widget-title');
        this.$title.text(this.getWidgetTitle());

        this.$help = this.$widget.find('.widget-help');
        const help = this.getHelp();

        if (help.title) {
            this.$help.attr("title", help.title);
            this.$help.attr("href", help.url || "javascript:");

            if (!help.url) {
                this.$help.addClass('no-link');
            }
        }
        else {
            this.$help.hide();
        }

        this.$headerActions = this.$widget.find('.widget-header-actions');
        this.$headerActions.append(...this.getHeaderActions());

        this.initialized = this.doRenderBody();

        this.decorateWidget();

        return this.$widget;
    }

    saveCollapsed(collapse) {
        options.save(this.widgetName + 'Collapsed', collapse.toString());

        this.triggerEvent(`widgetCollapsedStateChanged`, {widgetName: this.widgetName, collapse});
    }

    /**
     * This event is used to synchronize collapsed state of all the tab-cached widgets since they are all rendered
     * separately but should behave uniformly for the user.
     */
    widgetCollapsedStateChangedEvent({widgetName, collapse}) {
        if (widgetName === this.widgetName) {
            this.$bodyWrapper.toggleClass('show', !collapse);
        }
    }

    /** for overriding */
    decorateWidget() {}

    /** for overriding */
    async doRenderBody() {}

    isExpanded() {
        return this.$bodyWrapper.hasClass("show");
    }
}