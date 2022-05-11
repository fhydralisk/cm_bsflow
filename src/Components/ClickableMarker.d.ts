import mapboxgl, {MapMouseEvent} from "mapbox-gl";

export class ClickableMarker extends mapboxgl.Marker {
    // new method onClick, sets _handleClick to a function you pass in

    onClick(handleClick: (e: MapMouseEvent) => void) : ClickableMarker;
}