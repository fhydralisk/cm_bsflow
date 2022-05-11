import mapboxgl from 'mapbox-gl';

const peopleGeoJsonSkeleton = {
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": Array<any>(),
};

// 将点（[Latitude, Longitude]）转换为Geojson的Feature
function pointToFeature(point: number[]) {
    return {
        type: "Feature",
        properties: {},
        geometry: {type: "Point", coordinates: point}
    }
}

type SignalElement = {
    position: number[],
    intensity: number,
}

function elementToSignal(element: SignalElement) {
    return {
        type: "Feature",
        properties: {intensity: element.intensity},
        geometry: {type: "Point", coordinates: element.position}
    }
}

function buildPeopleGeoJsonFromPoints(points: number[][]) {
    peopleGeoJsonSkeleton.features = points.map(point => pointToFeature(point));
    return peopleGeoJsonSkeleton;
}

function buildSignalGeoJsonFromElements(elements: SignalElement[]) {
    peopleGeoJsonSkeleton.features = elements.map(element => elementToSignal(element));
    return peopleGeoJsonSkeleton;
}

export function drive(step: number, data: any, map: mapboxgl.Map) {
    //@ts-ignore
    map.getSource('peopleAll').setData(buildPeopleGeoJsonFromPoints(data['people'][step]));
    //@ts-ignore
    map.getSource('peopleLow').setData(buildPeopleGeoJsonFromPoints(data['peopleLow'][step]));
    //@ts-ignore
    map.getSource('peopleMedium').setData(buildPeopleGeoJsonFromPoints(data['peopleMedium'][step]));
    //@ts-ignore
    map.getSource('peopleHigh').setData(buildPeopleGeoJsonFromPoints(data['peopleHigh'][step]));
    //@ts-ignore
    map.getSource('signal').setData(buildSignalGeoJsonFromElements(data['signal'][Math.floor(step / 10)]));

}