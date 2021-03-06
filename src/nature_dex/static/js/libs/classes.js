/* global Klass, jQuery, console */
(function ( scope, $ ) {
    'use strict';

    var _position = {};
    // var group = '';
    // var kingdom = '';

    var Services = new Klass();
    Services.extend({
        loadedList: null,
        loadedFile: null,
        loadedView: null,
        getLoadedList: function () {
            return Services.loadedList;
        },
        getLoadedFile: function () {
            return Services.loadedFile;
        },
        getLoadedView: function () {
            return Services.loadedView;
        },
        getLocation: function () {
            return window.location.protocol + '//' + window.location.host + '/';
        }
    });

    var Position = new Klass();
    Position.extend({
        whereami: function ( callback ) {
            if ( !('navigator' in window) ) {
                console.log( 'Your browser not support geolocation features' );
                return;
            }

            // Showing loader

            navigator.geolocation.getCurrentPosition( function ( position ) {
                _position = {
                    //lat: position.coords.latitude,
                    //lon: position.coords.longitude
                    lat: '40.4360407',
                    lon: '-3.6713546'
                };

                //$( 'button.btn-whereami' ).hide();
                $('img').attr('src', 'http://maps.googleapis.com/maps/api/staticmap?zoom=16&size=600x200&maptype=terrain&markers=color:red%7C' + _position.lat + ',' + _position.lon + '&sensor=false');

                callback();
            });
        }
    });

    var SeeAll = new Klass();
    SeeAll.extend({
        lastData: {},
        seeall: function ( group, kingdom ) {

            // Showing loader

            var promise = Specimenes.getSpecimenes(_position.lon, _position.lat, group, kingdom);
            promise.done(function ( specimenes ) {

                SeeAll.lastData = specimenes;

                var _label;

                if ( typeof group !== 'undefined' ) {
                    _label = group;
                }
                else if ( typeof kingdom !== 'undefined' ) {
                    if ( kingdom === 'Animalia') {
                        _label = 'Fauna';
                    }
                    else if ( kingdom === 'Plantae') {
                        _label = 'Flora';
                    }
                }
                else {
                    _label = 'Ver todo';
                }

                Services.loadedList = {
                    label: _label,
                    specimenes: specimenes
                };

                // Navigation

                $.mobile.changePage( Services.getLocation() + 'listview/?rand=' + Math.random() * 1000 , {
                    type: 'get'
                });
            });
        },
        getFirstResults: function ( callback ) {

            if ( _position.hasOwnProperty( 'lat' ) && _position.hasOwnProperty( 'lon' ) ) {
                var promise = Specimenes.getSpecimenes(_position.lon, _position.lat);
                promise.done(function ( specimenes ) {

                    callback( specimenes );
                });
            }
            else {
                var result = {
                    results: []
                }

                var client = new $.RestClient('/api/');
                client.add( 'specimenes' );

                // Recogemos el primer resultado
                var promise = client.specimenes.read( 478802 );
                promise.done(function ( data ) {

                    result.results.push( data );

                    var secondPromise = client.specimenes.read( 311392 );
                    secondPromise.done( function ( data ) {

                        result.results.push( data );

                        callback( result );
                    });
                });
            }
        },
        next: function ( callback ) {


            if ( SeeAll.lastData.hasOwnProperty('next') ) {
                if (SeeAll.lastData.next === null ) {
                    callback( false );
                    return;
                }
            }

            var promise = $.get( SeeAll.lastData.next );
            promise.done(function ( data ) {

                console.log( 'SeeAll::next: ', data );

                SeeAll.lastData = data;

                Services.loadedList = {
                    label: 'Ver todo',
                    specimenes: data
                };

                callback( data );
            });
        },
        prev: function ( callback ) {

            if ( SeeAll.lastData.hasOwnProperty('previous') ) {
                if ( SeeAll.lastData.previous === null ) {
                    callback( false );
                    return;
                }
            }

            var promise = $.get( SeeAll.lastData.previous );
            promise.done(function ( data ) {

                console.log( 'SeeAll::previous: ', data );

                SeeAll.lastData = data;

                Services.loadedList = {
                    label: 'Ver todo',
                    specimenes: data
                };

                callback( data );
            });
        }
    });

    var Specimenes = new Klass();
    Specimenes.extend({
        data: {},
        getSpecimenes: function (lon, lat, group, kingdom) {
            var client = new $.RestClient('/api/');
            client.add('specimenes');
            return client.specimenes.read({
                lon: lon,
                lat: lat,
                group: group,
                kingdom: kingdom
            });
        }
    });

    var SpecimenById = new Klass();
    SpecimenById.extend({
        getSpecimenById: function (specimenId) {
            var client = new $.RestClient('/api/');
            client.add('specimenes');
            client.specimenes.read(specimenId).done(function ( data ) {

                Services.loadedFile = {
                    label: 'Ver ficha',
                    specimen: data
                };

                // Navigation

                $.mobile.changePage( Services.getLocation() + 'file/' , {
                    type: 'get'
                });
            });
        }
    });

    if ( !('Position' in scope) )
        scope.Position = Position;
    if ( !('SeeAll' in scope) )
        scope.SeeAll = SeeAll;
    if ( !('Specimenes' in scope) )
        scope.Specimenes = Specimenes;
    if ( !('SpecimenById' in scope) )
        scope.SpecimenById = SpecimenById;
    if ( !('Services' in scope) )
        scope.Services = Services;

})( window, jQuery );
