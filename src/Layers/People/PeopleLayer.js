export class PeopleLayer
{
    id = 'people-point'
    type = 'circle'
    minzoom = 12
    paint = {
        // Size circle radius by zoom level
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            2,
            16,
            5
        ],
        // Color circle by earthquake magnitude
        'circle-color': 'rgb(178,24,43)',
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        // Transition from heatmap to circle layer by zoom level
        'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            0,
            13,
            1
        ]
    }

    constructor(id, color) {
        if (id) {
            this.id = id;
        }
        if (color) {
            this.paint["circle-color"] = color;
        }
    }
}
