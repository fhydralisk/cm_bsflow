import React, {Component} from 'react';
import mapboxgl from 'mapbox-gl';
import {ClickableMarker} from "./ClickableMarker";

mapboxgl.accessToken = 'pk.eyJ1IjoiZmh5ZHJhbGlzayIsImEiOiJja3VzMWc5NXkwb3RnMm5sbnVvd3IydGY0In0.FrwFkYIMpLbU83K9rHSe8w';

export interface MarkInfo {
    color?: string,
    coordinate: mapboxgl.LngLatLike,
    info: any,
    onClick?: (info: any, e: mapboxgl.MapMouseEvent) => void,
}

interface MapboxProps {
    lng: number,
    lat: number,
    zoom: number,
    pitch?: number,
    buildingLayer: boolean,
    externalLayers: any[],
    sources?: { name: string, data: any }[],
    markers?: MarkInfo[],
}

class Mapbox extends Component<MapboxProps> {

    mapContainer: React.RefObject<any>;
    map?: mapboxgl.Map;

    constructor(props: MapboxProps) {
        super(props);
        const {lng, lat, zoom, pitch} = props
        this.state = {
            lng: lng,
            lat: lat,
            zoom: zoom,
            pitch: pitch,
        };
        this.mapContainer = React.createRef();
    }

    async componentDidMount() {
        const { lng, lat, zoom, pitch } = this.props;
        // const center = this.spline.getPoint(0.01)
        // console.log(new mapboxgl.MercatorCoordinate(center.x, center.y).toLngLat())
        this.map = new mapboxgl.Map({
            container: this.mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom,
            pitch: pitch,
        });
        this.map.on('load', () => this.onMapLoad())
    }

    async onMapLoad () {
        console.log("map loaded.");
        if (this.props.buildingLayer)
            this.addBuildingLayer();
        if (this.props.sources) {
            this.props.sources.forEach(({name, data}) => this.map!.addSource(name, data));
        }
        if (this.props.markers) {
            this.props.markers.forEach(marker => {
                const m = new ClickableMarker({color: marker.color}).setLngLat(marker.coordinate);
                m.onClick((e) => {
                    if (marker.onClick)
                        marker.onClick(marker.info, e);
                });
                m.addTo(this.map!);
            })
        }
        this.props.externalLayers.forEach(layer => {
            this.map!.addLayer(layer, 'waterway-label')
        })
    }

    addBuildingLayer() {
        this.map!.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#fff',

                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['*', ['get', 'height'], 5]
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            },
            'waterway-label'
        );
    }

    render() {
        return (
            <div>
                <div ref={this.mapContainer} className="map-container" style={{height: 'calc(100vh - 136px)'}}/>
            </div>
        );
    }
}

export default Mapbox;
