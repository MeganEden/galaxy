import * as d3 from "d3";
import jqplot from 'jqplot-exported/jqplot';
import { LineRenderer } from 'jqplot-exported/LineRenderer';
import { BarRenderer } from 'jqplot-exported/plugins/BarRenderer';
import { EnhancedLegendRenderer } from 'jqplot-exported/plugins/EnhancedLegendRenderer';

var Series = window.bundleEntries.chartUtilities.Series;
var Datasets = window.bundleEntries.chartUtilities.Datasets;
var Jobs = window.bundleEntries.chartUtilities.Jobs;

var CommonWrapper = Backbone.View.extend({
    initialize: function( options ) {
        this.options = options;
        var self = this;
        options.render = function( canvas_id, groups ) {
            return self.render( canvas_id, groups )
        };
        Datasets.requestPanels( options );
    },

    /** Draw all data into a single canvas */
    render: function( canvas_id, groups ) {
        var chart = this.options.chart;
        var makeCategories = this.options.makeCategories;
        var makeSeries = this.options.makeSeries;
        var makeSeriesLabels = this.options.makeSeriesLabels;
        var makeConfig = this.options.makeConfig;
        var plot_config = this._makeConfig( chart );
        var plot_data = [];
        try {
            this._makeAxes( groups, plot_config, chart.settings );
            if ( makeSeriesLabels ) {
                plot_config.series = makeSeriesLabels( groups, plot_config );
            } else {
                plot_config.series = this._makeSeriesLabels( groups );
            }
            if ( makeSeries ) {
                plot_data = makeSeries( groups, plot_config );
            } else {
                plot_data = Series.makeSeries( groups );
            }
            if ( makeConfig ) {
                makeConfig( groups, plot_config );
            }
            if ( chart.get( 'state' ) == 'failed' ) {
                return false;
            }

            // draw graph with default options, overwriting with passed options
            function drawGraph ( opts ) {
                var canvas = $( '#' + canvas_id );
                if ( canvas.length == 0 ) {
                    return;
                }
                canvas.empty();
                var plot_cnf = _.extend( _.clone( plot_config ), opts || {} );
                return plot = jqplot( canvas_id, plot_data, plot_cnf );
            }

            // draw plot
            var plot = drawGraph();
            $( window ).on( 'resize', function () { drawGraph() } );
            return true;
        } catch ( err ) {
            this._handleError( chart, err );
            return false;
        }
    },

    /** Make series labels */
    _makeSeriesLabels: function( groups, plot_config ) {
        var series = [];
        for ( var group_index in groups ) {
            series.push( { label: groups[ group_index ].key } );
        }
        return series;
    },

    /** Create axes formatting */
    _makeAxes: function( groups, plot_config, settings ) {
        var makeCategories = this.options.makeCategories;
        var categories = makeCategories ? makeCategories( groups ) : Series.makeCategories( groups, [ 'x', 'y' ] );
        function makeAxis (id) {
            Series.makeTickFormat({
                categories  : categories.array[ id ],
                type        : settings.get( id + '_axis_type|type' ),
                precision   : settings.get( id + '_axis_type|precision' ),
                formatter   : function( formatter ) {
                    if ( formatter ) {
                        plot_config.axes[ id + 'axis' ].tickOptions.formatter = function( format, value ) {
                            return formatter( value );
                        };
                    }
                }
            });
        };
        makeAxis( 'x' );
        makeAxis( 'y' );
    },

    _makeConfig: function( chart ) {
        // get chart settings
        var settings = chart.settings;
        var plot_config = {
            enablePlugins: true,
            seriesColors: d3.scaleOrdinal(d3.schemeCategory20).range(),
            seriesDefaults: {
                renderer                : LineRenderer,
                lineWidth               : 1,                    // width of the line in pixels.
                shadow                  : false,                // show shadow or not.
                showLine                : true,                 // whether to render the line segments or not.
                rendererOptions: {
                    shadowDepth         : 0,
                    barWidth            : 3,
                    barPadding          : 3
                },
                markerOptions: {
                    show                : false,                // wether to show data point markers.
                    style               : 'filledCircle',       // circle, diamond, square, filledCircle.
                                                                // filledDiamond or filledSquare.
                    lineWidth           : 0,                    // width of the stroke drawing the marker.
                    size                : 10,                   // size (diameter, edge length, etc.) of the marker.
                    shadow              : false,                // wether to draw shadow on marker or not.
                    shadowAngle         : 45,                   // angle of the shadow.  Clockwise from x axis.
                    shadowOffset        : 1,                    // offset from the line of the shadow,
                    shadowDepth         : 3,                    // number of strokes to make when drawing shadow.  Each stroke
                                                                // offset by shadowOffset from the last.
                    shadowAlpha         : 0.07                  // opacity of the shadow
                }
            },
            axesDefaults: {
                labelOptions: {
                    fontSize            : '12pt',
                    textColor           : '#000000'
                },
                tickOptions: {
                    fontSize            : '12pt',
                    textColor           : '#000000'
                }
            },
            axes: {
                xaxis: {
                    label               : chart.settings.get( 'x_axis_label' ),
                    tickOptions: {
                        angle           : chart.settings.get( '__use_panels' ) === 'true' ? 0 : -30,
                        showGridline    : chart.settings.get( 'x_axis_grid' ) === 'true'
                    },
                    pad                 : 0
                },
                yaxis: {
                    label               : chart.settings.get( 'y_axis_label' ),
                    tickOptions         : {
                        showGridline    : chart.settings.get( 'y_axis_grid' ) === 'true'
                    },
                    pad                 : 0
                }
            },
            grid: {
                background              : '#FFFFFF',
                borderWidth             : 0,
                shadow                  : false
            },
            cursor: {
                show                    : true,
                zoom                    : true,
                showTooltip             : false,
                style                   : 'pointer'
            },
            highlighter: {
                show                    : true,
                showMarker              : false,
                tooltipAxes             : 'xy'
            },
            series: []
        };
        // show the legend and put it outside the grid
        if ( chart.settings.get( 'show_legend' ) == 'true' ) {
            plot_config.legend = {
                renderer                : EnhancedLegendRenderer,
                show                    : true,
                placement               : 'outsideGrid',
                location                : 'n',
                rendererOptions: {
                    textColor           : '#000000',
                    fontSize            : '12pt',
                    border              : 'none',
                    shadowAlpha         : 1,
                    background          : 'rgba(255, 255, 255, 0.9)',
                    fontFamily          : 'Arial',
                    numberRows          : 1
                }
            };
        }
        return plot_config;
    },

    /** Handle error */
    _handleError: function( chart, err ) {
        chart.state( 'failed', err );
    }
});

_.extend(window.bundleEntries || {}, {
    jqplot_bar: function(options) {
        options.makeConfig = function( groups, plot_config ){
            $.extend( true, plot_config, {
                seriesDefaults: {
                    renderer : BarRenderer
                },
                axes: {
                    xaxis: {
                        min  : -1
                    },
                    yaxis: {
                        pad  : 1.2
                    }
                }
            });
        };
        new CommonWrapper( options );
    },
    jqplot_box: function(options) {
        Jobs.request( options.chart, Jobs.requestCharts( options.chart, 'boxplot' ), function( dataset ) {
            var chart = options.chart;
            var dataset_groups = new Backbone.Collection();
            chart.groups.each( function( group, index ) {
                dataset_groups.add({
                    __data_columns: { x: { is_numeric: true } },
                    x     : index,
                    key   : group.get( 'key' )
                });
            });
            var plot = new Plot( {
                process             : options.process,
                chart               : options.chart,
                dataset_id          : dataset.id,
                dataset_groups      : dataset_groups,
                targets             : options.targets,
                makeConfig          : function( groups, plot_config ){
                    var boundary = Utilities.getDomains( groups, 'x' );
                    $.extend( true, plot_config, {
                        seriesDefaults: {
                            renderer: $.jqplot.OHLCRenderer,
                            rendererOptions : {
                                candleStick     : true,
                                fillUpBody      : true,
                                fillDownBody    : true
                            }
                        },
                        axes : {
                            xaxis: {
                                min: -1,
                                max: groups.length + 0.01
                            },
                            yaxis: {
                                min: boundary.x.min,
                                max: boundary.x.max
                            }
                        }
                    });
                },
                makeCategories: function( groups ) {
                    var x_labels = [];
                    for ( var group_index in groups ) {
                        x_labels.push( groups[ group_index ].key );
                    }
                    Utilities.mapCategories ( groups, x_labels );
                    return {
                        array: {
                            x : x_labels
                        }
                    }
                },
                makeSeriesLabels : function ( groups, plot_config ) {
                    return [ { label : 'Boxplot values' } ];
                },
                makeSeries: function ( groups ) {
                    /*/ example data
                    var catOHLC = [
                        [0, 138.7, 139.68, 135.18, 135.4],
                        [1, 143.46, 144.66, 139.79, 140.02],
                        [2, 140.67, 143.56, 132.88, 142.44],
                        [3, 136.01, 139.5, 134.53, 139.48]
                    ];
                    return [catOHLC];*/
                    
                    // plot data
                    var plot_data = [];
                    
                    // check group length
                    if ( groups.length == 0 || groups[0].values.length < 5 ) {
                        chart.state( 'failed', 'Boxplot data could not be found.' );
                        return [ plot_data ];
                    }
                    
                    // loop through data groups
                    var indeces = [ 2, 4, 0, 1 ];
                    for ( var group_index in groups ) {
                        var group = groups[ group_index ];
                        var point = [];
                        point.push( parseInt( group_index ) );
                        for ( var key in indeces ) {
                            point.push( group.values[ indeces[ key ] ].x );
                        }
                        plot_data.push( point );
                    }
                    
                    // HACK: the boxplot renderer has an issue with single elements
                    var point = [];
                    point[ 0 ] = plot_data.length;
                    for ( var key in indeces ) {
                        point.push( 0 );
                    }
                    plot_data.push ( point );
                    return [ plot_data ];
                }
            });
        }, function() { options.process.reject() } );
    },
    jqplot_histogram: function(options) {
        Jobs.request( options.chart, Jobs.requestCharts( options.chart, 'histogramdiscrete' ), function( dataset ) {
            var dataset_groups = new Backbone.Collection();
            options.chart.groups.each( function( group, index ) {
                dataset_groups.add({
                    __data_columns: { x: { is_label: true }, y: { is_numeric: true } },
                    x     : 0,
                    y     : index + 1,
                    key   : group.get( 'key' )
                });
            });
            options.dataset_id = dataset.id;
            options.dataset_groups = dataset_groups;
            options.makeConfig = function( groups, plot_config ){
                $.extend( true, plot_config, {
                    seriesDefaults: { renderer: $.jqplot.BarRenderer },
                    axes: { xaxis: { min : -1 }, yaxis: { pad : 1.2 } }
                });
            };
            new Plot( options );
        });
    },
    jqplot_line: function(options) {
        new CommonWrapper( options );
    },
    jqplot_scatter: function(options) {
        options.makeConfig = function( groups, plot_config ) {
            $.extend( true, plot_config, {
                seriesDefaults: {
                    renderer: LineRenderer,
                    showLine: false,
                    markerOptions : {
                        show    : true
                    }
                }
            });
        };
        new CommonWrapper( options );
    }
});
