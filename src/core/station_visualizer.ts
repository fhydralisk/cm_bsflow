const stationGeoJsonSkeleton = {
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": Array<any>(),
};

// 将点（[Latitude, Longitude]）转换为Geojson的Feature
function pointToFeature(point: number[], id: string) {
    return {
        type: "Feature",
        properties: {id},
        geometry: {type: "Point", coordinates: point}
    }
}

export function stationToGeoJson(data: {[id: string]: { position: number[] }}) {
    const geojson = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        features: Array<any>(),
    }

    for (const dataKey in data) {
        geojson.features.push(pointToFeature(data[dataKey].position, dataKey));
    }

    return geojson
}

