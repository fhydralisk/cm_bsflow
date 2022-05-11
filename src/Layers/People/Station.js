export class StationLayer
{
    id = 'station-point'
    type = 'symbol'
    minzoom = 10
    layout = {
        // Size circle radius by zoom level
        'icon-image': 'station',
        'icon-size': 0.25,
    }

    constructor(id, image='station', size = 0.25) {
        if (id) {
            this.id = id;
        }
        if (image) {
            this.layout['icon-image'] = image;
        }
        this.layout['icon-size'] = size;
    }
}
