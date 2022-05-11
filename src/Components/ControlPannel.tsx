import {Button, Col, Row, Slider, Switch} from "antd";

interface ControlPannelPropsType {
    onPeopleShowChanged: (show: boolean) => void;
    onStationShowChanged: (show: boolean) => void;
    onSignalShowChanged: (show: boolean) => void;
    onChangeStep: (step: number) => void;
    onTogglePlayPause: () => void;
    onHideCharts: () => void;
    showPeople: boolean,
    showSignal: boolean,
    showStation: boolean,
    time: string,
    step: number,
}

export const ControlPannel = (props: ControlPannelPropsType) => {
    return (
        <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            width: 200,
            height: 160,
            backgroundColor: "lightblue",
        }}>
            <Row justify="space-around">
                <Col span={16}>
                    当前时间：{props.time}
                </Col>
            </Row>
            <Row justify="space-around">
                <Col span={16}>
                    人流图层：<Switch onChange={(checked) => {props.onPeopleShowChanged(checked)}} checkedChildren={"人流"} checked={props.showPeople}/>
                </Col>
            </Row>
            <Row justify="space-around">
                <Col span={16}>
                    信号图层：<Switch onChange={(checked) => {props.onSignalShowChanged(checked)}} checkedChildren={"信号"} checked={props.showSignal}/>
                </Col>
            </Row>
            <Row justify="space-around">
                <Col span={16}>
                    基站图层：<Switch onChange={(checked) => {props.onStationShowChanged(checked)}} checkedChildren={"基站"} checked={props.showStation}/>
                </Col>
            </Row>
            <Row justify="space-around">
                <Col span={4}>
                    0:00
                </Col>
                <Col span={15}>
                    <Slider value={props.step} onChange={value => {props.onChangeStep(value)}} min={0} max={1439} />
                </Col>
                <Col span={4}>
                    23:59
                </Col>
            </Row>
            <Row justify="space-around">
                <Col>
                    <Button onClick={() => {props.onTogglePlayPause()}}>播放暂停</Button>
                    <Button onClick={() => {props.onHideCharts()}}>x</Button>
                </Col>

            </Row >
        </div>
    )
}