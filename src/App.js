import './App.css';
import Map, {Layer, Marker, Source} from 'react-map-gl';
import {PeopleLayer} from "./Layers/People/PeopleLayer";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import {drive} from "./core/driver";

import 'mapbox-gl/dist/mapbox-gl.css';
import {StationEcharts} from "./Components/ECharts";
import {HeatMapLayer, HeatMapSignalLayer} from "./Layers/People/HeatMap";
import {ControlPannel} from "./Components/ControlPannel";
import {message} from "antd";
import {StationLayer} from "./Layers/People/Station";
import {stationToGeoJson} from "./core/station_visualizer";

// 每步间隔，ms为单位，值越大速度越慢。
const interval = 500;
const maxSteps = 1440;
let playing = true;

const geoJsonObjInit = {
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": []
};

Number.prototype.toHHMM = function () {
    var sec_num = Math.floor(this); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    return hours+':'+minutes;
}


/**
 * 加载静态文件
 *
 * peopleTraj: 用户轨迹
 * stationInfo: 基站静态信息
 * stationStatistics: 基站动态信息
 *
 * 将文件放在public文件夹下，然后对应修改为"/文件名"即可。
 * @returns {Promise<{stationStatistics: any, station: any, people: any}>}
 */
async function load() {
    message.info("正在加载人流数据...");
    const people = (await axios.get('/0312_2/traj_comp_2000_a.json')).data;
    const peopleLow = (await axios.get('/0312_2/traj_comp_2000_l.json')).data;
    const peopleMedium = (await axios.get('/0312_2/traj_comp_2000_m.json')).data;
    const peopleHigh = (await axios.get('/0312_2/traj_comp_2000_h.json')).data;
    message.info("正在加载基站数据...");
    const stationInfo = (await axios.get('/0326/bs_locations.json')).data;
    const gtwInfo = (await axios.get('/0326/gtw.json')).data;
    const stationStatistics = (await axios.get('/0326/bs_status.json')).data;
    const stationRate = (await axios.get('/0326/bs_status_rate.json')).data;
    // const gatewayStatistics = (await axios.get('')).data;

    message.info("正在加载信号数据...");
    const signal = (await axios.get('/0326/bs_coverage_strength.json')).data;
    message.success("加载完成！");

    return {
        people,
        peopleLow,
        peopleMedium,
        peopleHigh,
        signal,
        station: stationInfo,
        gateway: gtwInfo,
        stationRate,
        stationStatistics: stationStatistics,
        // gatewayStatistics,
    }
}

function StationStateEchart({name, data, stepSize=60, stepSmooth=60, cur=0, unit="", op}) {
    const d = {
        x: [],
        y: [],
    };
    const stepLength = Math.floor(stepSize / 60);
    console.log(data);
    for (let i = 0; i < data.length; i+=(stepSmooth / stepLength)) {
        if (i <= (cur / stepLength) + (stepSmooth / stepLength)) {
            d.y.push(data[i]);
        }
        d.x.push((i * stepSize).toHHMM());
    }

    return <StationEcharts data={d} cur={Math.floor(cur / stepSmooth)} name={name} unit={unit} op={op}/>
}

const PeopleLayers = ({show}) => {
    const peopleLayerLowUsage = new PeopleLayer('people-low', 'rgb(0, 255, 0)');
    const peopleLayerMediumUsage = new PeopleLayer('people-medium', 'rgb(255, 255, 0)');
    const peopleLayerHighUsage = new PeopleLayer('people-high', 'rgb(255, 0, 0)');

    return (
        <>
            <Source id="peopleAll" type="geojson" data={geoJsonObjInit} >
                {show?<Layer {...HeatMapLayer} />:<></>}
            </Source>
            <Source id="peopleLow" type="geojson" data={geoJsonObjInit}>
                {show?<Layer {...peopleLayerLowUsage} />:<></>}
            </Source>
            <Source id="peopleMedium" type="geojson" data={geoJsonObjInit}>
                {show?<Layer {...peopleLayerMediumUsage} />:<></>}
            </Source>
            <Source id="peopleHigh" type="geojson" data={geoJsonObjInit}>
                {show?<Layer {...peopleLayerHighUsage} />:<></>}
            </Source>
        </>
    )
}

const StationsLayer = ({show, id, sourceId, imageId, imageSize}) => {
    const layer = new StationLayer(id, imageId, imageSize);

    return (
        <>
            <Source id={sourceId} type="geojson" data={geoJsonObjInit}>
                {show? <Layer {...layer} />: <></>}
            </Source>
        </>
    )
}


const SignalLayer = ({show}) => {
    return (
        <>
            <Source id="signal" type="geojson" data={geoJsonObjInit} >
                {show?<Layer {...HeatMapSignalLayer} />:<></>}
            </Source>
        </>
    )
}

function StationVis() {
    const dataRef = useRef(null);
    const mapRef = useRef(null);
    const [cur, setCur] = useState(480);
    const [stationDetail, setStationDetail] = useState(null);
    const [gtwDetail, setGtwDetail] = useState(null);
    // const [zoomLevel, setZoomLevel] = useState(13);
    const [showPeople, setShowPeople] = useState(true);
    const [showStation, setShowStation] = useState(true);
    const [showSignal, setShowSignal] = useState(false);

    const loadImages = () => {
        const map = mapRef.current.getMap();
        map.loadImage('/station.png', (error, image) => {
            if (error) throw error;
            if (!map.hasImage('station')) map.addImage('station', image, { sdf: true });
        });
        map.loadImage('/gateway.png', (error, image) => {
            if (error) throw error;
            if (!map.hasImage('gateway')) map.addImage('gateway', image, { sdf: true });
        });
    }

    useEffect(() => {
        load().then(data => {
            dataRef.current = data;
            const stationGeoData = stationToGeoJson(data.station);
            const gatewayGeoData = stationToGeoJson(data.gateway);
            mapRef.current.getMap().getSource('bs').setData(stationGeoData);
            mapRef.current.getMap().getSource('gtw').setData(gatewayGeoData);

            console.log("Data loaded");
            setInterval(() => {
                let localCur;
                if (playing) {
                    setCur(curPrev => {
                        localCur = curPrev;
                        return curPrev >= maxSteps ? 0 : curPrev + 1
                    });
                    console.log(`step: ${localCur}`);
                    drive(localCur, data, mapRef.current.getMap());
                }
            }, interval);
        });
    }, []);

    const ECharts = stationDetail ? (<div style={{height: 400}}>
        <div style={{width: "50%", display: "inline-block", height: 400}}>
            <StationStateEchart
                name="基站接入用户数"
                data={dataRef.current.stationStatistics[stationDetail].client_count}
                cur={cur}
                stepSize={1800}
            />
        </div>
        <div style={{width: "50%", display: "inline-block", height: 400}}>
            <StationStateEchart
                name="归一化基站流量"
                data={dataRef.current.stationRate[stationDetail].rate}
                cur={cur}
                stepSize={3600}
            />
        </div>
    </div>) : <></>

    const GtwEcharts = gtwDetail ? (<div style={{height: 400}}>
        <div style={{width: "100%", display: "inline-block", height: 400}}>
            <StationStateEchart
                name="流量数"
                data={dataRef.current.gtwStatistics[gtwDetail].client_count}
                cur={cur}
            />
        </div>
    </div>) : <></>

    return (
        <div>
            {ECharts}
            {/*{GtwEcharts}*/}
            <Map
                mapboxAccessToken="pk.eyJ1IjoiZmh5ZHJhbGlzayIsImEiOiJja3VzMWc5NXkwb3RnMm5sbnVvd3IydGY0In0.FrwFkYIMpLbU83K9rHSe8w"
                ref={mapRef}
                initialViewState={{
                    longitude: 116.394056,
                    latitude: 39.961776,
                    zoom: 13
                }}
                style={{height: `calc(100vh - ${stationDetail?536:136}px)`}}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                onZoom={(event) => {
                    // setZoomLevel(event.viewState.zoom);
                }}
                onClick={(obj) => {
                    setStationDetail(null);
                    console.log(obj.features);
                    if (obj.features.length > 0) {
                        const clickOn = obj.features[0];
                        if (clickOn.layer.id === 'station') {
                            const id = clickOn.properties.id;
                            setStationDetail(id);
                        }
                    }
                    console.log(obj);
                }}
                onLoad={() => loadImages()}
                interactiveLayerIds={["station"]}
            >

                <PeopleLayers show={showPeople} />
                <StationsLayer show={showStation} id="station" sourceId="bs" imageId="station" imageSize={0.25}/>
                <StationsLayer show={showStation} id="gateway" sourceId="gtw" imageId="gateway" imageSize={0.6}/>

                {/*{showStation ? Object.entries(stations).map(([key, data]) => {*/}
                {/*    return (*/}
                {/*        <Marker*/}
                {/*            longitude={data.position[0]}*/}
                {/*            latitude={data.position[1]}*/}
                {/*            key={key}*/}
                {/*            onClick={() => {*/}
                {/*                setStationDetail(key);*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            <img src="/station.png" width={Math.pow(zoomLevel, 3) / 150}/>*/}
                {/*        </Marker>*/}
                {/*    )*/}
                {/*}) : <></>}*/}

                <SignalLayer show={showSignal} />

                <ControlPannel
                    onPeopleShowChanged={show => {setShowPeople(show)}}
                    onStationShowChanged={show => {setShowStation(show)}}
                    onSignalShowChanged={show => {setShowSignal(show)}}
                    showPeople={showPeople}
                    showSignal={showSignal}
                    showStation={showStation}
                    time={(cur * 60).toHHMM()}
                    step={cur}
                    onChangeStep={value => {setCur(value)}}
                    onTogglePlayPause={() => {
                        playing = !playing;
                    }}
                    onHideCharts={() => {
                        setStationDetail(null);
                        setGtwDetail(null);
                    }}
                />

            </Map>
        </div>
    );
}

function App() {
    return <StationVis />
}

export default App;
