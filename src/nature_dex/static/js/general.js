/* global jQuery */
(function ( scope, $ ) {
    'use strict';

    // TODO: Sacar la configuración incil de aquí...
    window.conf = {

    }

    var _count = 0;
    var _menuData = {};

    $( document ).on( 'pagecontainershow', generalFunctionality);

    function generalFunctionality () {

        _count++;

        console.log('general pagecontainershow:', _count); // jshint ignore:line

        // WIDGETS

        /**
         *  Search panel functionality
         * */
        var $panelSearch = $( '.panelsearch' );

        $panelSearch
        .addClass( 'eventattached' )
        .find('a.panelsearch-link').off( 'click' ).on( 'click', function (event) {
            event.preventDefault();
            console.log( 'Searching...' );
        });

        /**
         *  Menu panel functionality
         * */
        var $panelMenu = $( '.panelmenu' ).panel({
            beforeopen: function () {
                $('.btn-panelmenu').addClass( 'selected' );
            },
            close: function () {
                $('.btn-panelmenu').removeClass( 'selected' );
            }
        });

        $panelMenu
        .addClass( 'eventattached' )
        .find('a.panelmenu-link').off( 'click' ).on( 'click', panelMenuLinkClick);
    }

    function panelMenuLinkClick ( event ) {
        event.preventDefault();
        var kingdom = $(event.target).data('kingdom');
        var group = $(event.target).data('group') !== '' ? $(event.target).data('group') : undefined;
        SeeAll.seeall(group, kingdom);
    }

    function pageChange () {

        console.log( 'general pagechange!' );

        $( document )
        .off( 'pagecontainershow', generalFunctionality)
        .on( 'pagecontainershow', generalFunctionality);
    }

})( window, jQuery )
