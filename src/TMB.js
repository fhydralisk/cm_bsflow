import Map, {Layer, Source} from "react-map-gl";

const geo = {
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [102.29, 37.99]
        },
        properties: {
            name: 'test',
        }
    }],
};


export const TMB = () => {
    return (
        <Map
            initialViewState={{
                longitude: 102.29,
                latitude: 37.99,
                zoom: 2.5
            }}
            style={{width: "100%", height: 500}}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken="pk.eyJ1IjoiZmh5ZHJhbGlzayIsImEiOiJja3VzMWc5NXkwb3RnMm5sbnVvd3IydGY0In0.FrwFkYIMpLbU83K9rHSe8w"
            interactiveLayerIds={["station"]}
            onClick={(obj) => { console.log(obj); }}
        >
            <Source id="ts" type="geojson" data={geo}>
                <Layer id="station" type="circle" paint={{
                    'circle-color': '#4264fb',
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }}
                />

            </Source>
        </Map>
    )

}