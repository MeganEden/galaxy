define(["utils/utils","mvc/ui/ui-button-check"],function(a,b){var c=Backbone.View.extend({optionsDefault:{id:a.uid(),cls:"ui-select",error_text:"No data available",empty_text:"No selection",visible:!0,wait:!1,multiple:!1,searchable:!0,optional:!1},initialize:function(c){var d=this;this.options=a.merge(c,this.optionsDefault),this.setElement(this._template(this.options)),this.$select=this.$el.find(".select"),this.$icon=this.$el.find(".icon"),this.$button=this.$el.find(".button"),this.options.multiple&&(this.options.searchable&&(this.all_button=new b({onclick:function(){var a=[];0!==d.all_button.value()&&(a=d._availableOptions()),d.value(a),d.trigger("change")}}),this.$el.prepend(this.all_button.$el)),this.$el.addClass("ui-select-multiple"),this.$select.prop("multiple",!0),this.$button.remove()),this.update(this.options.data),void 0!==this.options.value&&this.value(this.options.value),this.options.visible||this.hide(),this.options.wait?this.wait():this.show(),this.$select.on("change",function(){d.trigger("change")}),this.on("change",function(){d.options.onchange&&d.options.onchange(this.value())})},value:function(a){void 0!==a&&(null===a&&(a="__null__"),(this.exists(a)||this.options.multiple)&&(this.$select.val(a),this.$select.select2&&this.$select.select2("val",a)));var b=this._getValue();return this.all_button&&this.all_button.value($.isArray(b)&&b.length||0,this._size()),b},first:function(){var a=this.$select.find("option").first();return a.length>0?a.val():null},text:function(){return this.$select.find("option:selected").text()},show:function(){this.unwait(),this.$select.show(),this.$el.show()},hide:function(){this.$el.hide()},wait:function(){this.$icon.removeClass(),this.$icon.addClass("fa fa-spinner fa-spin")},unwait:function(){this.$icon.removeClass(),this.$icon.addClass("fa fa-caret-down")},disabled:function(){return this.$select.is(":disabled")},enable:function(){this.$select.prop("disabled",!1)},disable:function(){this.$select.prop("disabled",!0)},update:function(a){var b=this._getValue();this.$select.find("option").remove(),!this.options.multiple&&this.options.optional&&this.$select.append(this._templateOption({value:"__null__",label:this.options.empty_text}));for(var c in a)this.$select.append(this._templateOption(a[c]));0==this._size()?(this.disable(),this.$select.append(this._templateOption({value:"__null__",label:this.options.error_text}))):this.enable(),this.options.searchable&&(this.$select.select2("destroy"),this.$select.select2(),this.$(".select2-container .select2-search input").off("blur")),this.value(b),null!==this._getValue()||this.options.multiple&&this.options.optional||this.value(this.first())},setOnChange:function(a){this.options.onchange=a},exists:function(a){return this.$select.find('option[value="'+a+'"]').length>0},_getValue:function(){var b=this.$select.val();return a.validate(b)?b:null},_availableOptions:function(){var a=[];return this.$select.find("option").each(function(b,c){a.push($(c).attr("value"))}),a},_size:function(){return this.$select.find("option").length},_templateOption:function(a){return'<option value="'+a.value+'">'+_.escape(a.label)+"</option>"},_template:function(a){return'<div id="'+a.id+'" class="'+a.cls+'"><select id="'+a.id+'_select" class="select"/><div class="button"><i class="icon"/></div></div>'}});return{View:c}});
//# sourceMappingURL=../../../maps/mvc/ui/ui-select-default.js.map