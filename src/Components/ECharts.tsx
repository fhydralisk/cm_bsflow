import ReactECharts from 'echarts-for-react';
import {useEffect, useRef} from "react";

type StationEchartsDataType = {
    x: string[],
    y: number[],
}

interface StationEchartsPropsType {
    data: StationEchartsDataType;
    name: string,
    cur: number,
    unit: string,
    op?: (value: number) => number,
}

function curToMarkArea(cur: number, data: StationEchartsDataType): any {
    if (cur >=0 && cur < data.x.length) {
        return [
            {
                name: '当前',
                xAxis: data.x[cur]
            },
            {
                xAxis: data.x[cur + 1]
            }
        ]
    } else {
        return []
    }
}

export const StationEcharts = ({data, name, cur, unit, op}: StationEchartsPropsType) => {
    const option = {
        title: {
            text: name,
            // subtext: 'Fake Data'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            // prettier-ignore
            data: data.x
            // data: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45']
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: `{value} ${unit}`
            },
            axisPointer: {
                snap: true
            }
        },
        series: [
            {
                name: name,
                type: 'line',
                smooth: true,
                // prettier-ignore
                data: data.y,
                markArea: {
                    itemStyle: {
                        color: 'rgba(255, 173, 177, 0.4)'
                    },
                    data: Array<any>(),
                }
            }
        ]
    };
    const optionRef = useRef(option);
    // const optionsString = JSON.stringify(option);

    const refEcharts = useRef<ReactECharts>(null);

    useEffect(() => {
        const markerArea = curToMarkArea(cur, data);
        if (markerArea.length > 0) {
            optionRef.current.series[0].markArea.data = [markerArea];
        }
        optionRef.current.xAxis.data = data.x;
        optionRef.current.series[0].data = op? data.y.map(v => op(v)): data.y;
        refEcharts.current!.getEchartsInstance().setOption(optionRef.current);
    }, [data, cur]);

    return (<ReactECharts option={option} ref={refEcharts} style={{height: "100%"}}/>)
}
